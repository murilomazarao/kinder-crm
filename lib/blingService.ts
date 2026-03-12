import { supabase } from '../supabaseClient';
import { isValidCPF, isValidCEP } from '../utils/validation';

const CLIENT_ID = import.meta.env.VITE_BLING_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_BLING_CLIENT_SECRET;
const REDIRECT_URI = import.meta.env.VITE_BLING_REDIRECT_URI;

// Proxy paths defined in vite.config.ts
const BLING_AUTH_URL = '/bling-auth/Api/v3';
const BLING_DATA_URL = '/bling-api/Api/v3';

export interface BlingTokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in?: number;
    token_type?: string;
    scope?: string;
}

export const blingService = {
    /**
     * Gera a URL para redirecionar o usuário ao Bling para autorização
     */
    getAuthUrl: (state: string) => {
        const scopes = [
            'produtos',
            'contatos',
            'vendas',
            'logisticas',
            'notas_fiscais',
            'caixas_e_bancos'
        ].join(' ');

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            state: state,
            scope: scopes
        });

        return `https://www.bling.com.br/Api/v3/oauth/authorize?${params.toString()}`;
    },

    /**
     * Gera os tokens iniciais a partir do código de autorização
     */
    getToken: async (code: string) => {
        try {
            const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);

            // Importante: O Bling exige que o body seja URLSearchParams para o token
            const body = new URLSearchParams();
            body.append("grant_type", "authorization_code");
            body.append("code", code);
            body.append("redirect_uri", REDIRECT_URI);

            const response = await fetch(`${BLING_AUTH_URL}/oauth/token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "application/json",
                    "Authorization": `Basic ${credentials}`,
                },
                body: body.toString(),
            });

            const data = await response.json();

            if (!data.access_token || !data.refresh_token) {
                console.error("DEBUG - Resposta completa do Bling:", JSON.stringify(data, null, 2));
                return { status: "error", message: data.error_description || data.error || "Erro ao gerar o token" };
            }

            const expiresAt = new Date();
            expiresAt.setSeconds(expiresAt.getSeconds() + (data.expires_in || 3600));

            const { error } = await supabase
                .from('bling_config')
                .upsert({
                    client_id: CLIENT_ID,
                    access_token: data.access_token,
                    refresh_token: data.refresh_token,
                    expires_at: expiresAt.toISOString(),
                    updated_at: new Date().toISOString()
                }, { onConflict: 'client_id' });

            if (error) throw error;

            return { status: "success", message: "Token gerado com sucesso!" };
        } catch (error: any) {
            console.error("Erro no getToken:", error);
            return { status: "error", message: error.message };
        }
    },

    /**
     * Atualiza o access_token usando o refresh_token
     */
    refreshToken: async () => {
        try {
            const { data: config, error: fetchError } = await supabase
                .from('bling_config')
                .select('*')
                .eq('client_id', CLIENT_ID)
                .single();

            if (fetchError || !config) throw new Error("Configuração do Bling não encontrada");

            const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
            const body = new URLSearchParams();
            body.append("grant_type", "refresh_token");
            body.append("refresh_token", config.refresh_token);

            const response = await fetch(`${BLING_AUTH_URL}/oauth/token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "application/json",
                    "Authorization": `Basic ${credentials}`,
                },
                body: body.toString(),
            });

            const data = await response.json();

            if (!data.access_token) throw new Error("Falha ao renovar token");

            const expiresAt = new Date();
            expiresAt.setSeconds(expiresAt.getSeconds() + (data.expires_in || 3600));

            await supabase
                .from('bling_config')
                .update({
                    access_token: data.access_token,
                    refresh_token: data.refresh_token || config.refresh_token,
                    expires_at: expiresAt.toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq('client_id', CLIENT_ID);

            return data.access_token;
        } catch (error: any) {
            console.error("Erro ao atualizar token:", error.message);
            throw error;
        }
    },

    /**
     * Obtém um token válido (faz refresh se necessário)
     */
    getValidToken: async (): Promise<string | null> => {
        const { data: config } = await supabase
            .from('bling_config')
            .select('*')
            .eq('client_id', CLIENT_ID)
            .single();

        if (!config || !config.refresh_token) return null;

        const now = new Date();
        const expiresAt = new Date(config.expires_at || 0);

        if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
            return await blingService.refreshToken();
        }

        return config.access_token;
    },

    /**
     * Cria uma Nota Fiscal (NFSe)
     */
    createNote: async (dados_cliente: any, platform: string, payment_id: string) => {
        try {
            if (!isValidCPF(dados_cliente.contato.numeroDocumento) || !isValidCEP(dados_cliente.contato.endereco.cep)) {
                await supabase
                    .from('invoices')
                    .update({ status: "exterior", message: "Dados de CPF/CEP inválidos", platform })
                    .eq('payment_id', payment_id);
                return { error: "Dados inválidos", status: "estrangeiro" };
            }

            const access_token = await blingService.getValidToken();
            if (!access_token) throw new Error("Bling não está conectado");

            const response = await fetch(`${BLING_DATA_URL}/nfse`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${access_token}`,
                },
                body: JSON.stringify(dados_cliente),
            });

            const data = await response.json();

            if (data.error) {
                const errorMessage = data?.error?.description || "Erro ao criar nota fiscal.";
                await supabase
                    .from('invoices')
                    .update({ message: errorMessage, platform, status: "error" })
                    .eq('payment_id', payment_id);
                return { error: errorMessage, status: "error" };
            }

            const { numeroRPS, id: invoice_id } = data.data;
            await supabase
                .from('invoices')
                .update({
                    status: "success",
                    payment_id,
                    platform,
                    message: "Nota criada com sucesso",
                    bling_rps: numeroRPS,
                    invoice_id,
                    send_data: new Date().toISOString(),
                })
                .eq('payment_id', payment_id);

            return data;
        } catch (error: any) {
            console.error("Erro ao criar nota:", error.message);
            return { error: error.message, status: "error" };
        }
    },

    /**
     * Busca todos os produtos do Bling
     */
    fetchAllProducts: async () => {
        const token = await blingService.getValidToken();
        if (!token) throw new Error('Bling não conectado');

        let allProducts: any[] = [];
        let page = 1;

        while (page <= 50) {
            const response = await fetch(`${BLING_DATA_URL}/produtos?pagina=${page}&limite=100`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const { data } = await response.json();
            if (data && data.length > 0) {
                allProducts = [...allProducts, ...data];
                page++;
            } else break;
        }
        return allProducts;
    },

    /**
     * Mapeia um produto do Bling para o formato do CRM (RESTAURADO)
     */
    mapBlingProductToCRM: (blingProduct: any) => {
        return {
            id: crypto.randomUUID(),
            name: blingProduct.nome,
            sku: blingProduct.codigo,
            price: blingProduct.preco || 0,
            purchasePrice: blingProduct.precoCusto || 0,
            salePrice: blingProduct.preco || 0,
            supplierPrice: blingProduct.precoCusto || 0,
            stock: (blingProduct.estoque?.saldoVirtual) || 0,
            category: blingProduct.categoria?.nome || 'Geral',
            images: blingProduct.midia?.imagens?.externas?.map((img: any) => img.link) || []
        };
    },

    /**
     * Busca as contas bancárias (RESTAURADO)
     */
    fetchBankAccounts: async () => {
        const token = await blingService.getValidToken();
        if (!token) return { data: [] };

        const response = await fetch(`${BLING_DATA_URL}/caixas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) return { data: [] };
        return await response.json();
    }
};
