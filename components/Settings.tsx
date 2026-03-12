import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Badge, cn } from './ui/primitives';
import { blingService } from '../lib/blingService';
import { supabase } from '../supabaseClient';
import {
    Layout,
    Link as LinkIcon,
    RefreshCcw,
    CheckCircle2,
    AlertCircle,
    Package,
    ArrowRightLeft
} from 'lucide-react';

export const Settings: React.FC = () => {
    const [isBlingConnected, setIsBlingConnected] = useState(false);
    const [blingConfig, setBlingConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkBling = async () => {
            const { data, error } = await supabase
                .from('bling_config')
                .select('*')
                .single();

            if (data && data.access_token) {
                setIsBlingConnected(true);
                setBlingConfig(data);
            }
            setLoading(false);
        };
        checkBling();
    }, []);

    const handleConnectBling = () => {
        const authUrl = blingService.getAuthUrl('state123');
        window.location.href = authUrl;
    };

    const handleDisconnect = async () => {
        if (!window.confirm('Tem certeza que deseja desconectar o Bling?')) return;

        const { error } = await supabase
            .from('bling_config')
            .delete()
            .match({ client_id: blingConfig.client_id });

        if (!error) {
            setIsBlingConnected(false);
            setBlingConfig(null);
            alert('Bling desconectado com sucesso.');
        } else {
            alert('Erro ao desconectar: ' + error.message);
        }
    };

    const handleSync = async () => {
        setLoading(true);
        try {
            await blingService.getValidToken(); // Força renovação se necessário
            alert('Sincronização forçada com sucesso! Os dados agora estão atualizados.');
            // Recarrega config local
            const { data } = await supabase.from('bling_config').select('*').single();
            setBlingConfig(data);
        } catch (err: any) {
            alert('Erro na sincronização: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-12">
            <header className="space-y-2">
                <h1 className="text-4xl font-black text-white tracking-tight">Configurações do Sistema</h1>
                <p className="text-muted-foreground text-lg">Gerencie integrações, dados e preferências da plataforma.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Section: Integrations */}
                <div className="md:col-span-1 space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-widest text-primary/60 flex items-center gap-2">
                        <ArrowRightLeft className="h-4 w-4" />
                        Integrações Externas
                    </h2>
                    <p className="text-xs text-muted-foreground/60 leading-relaxed">
                        Conecte o seu CRM a plataformas externas para sincronizar dados financeiros e de estoque automaticamente.
                    </p>
                </div>

                <div className="md:col-span-2">
                    <Card className="p-8 space-y-8 bg-black/40 border-white/5 backdrop-blur-3xl rounded-[2.5rem]">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-6">
                                <div className="h-20 w-20 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center p-4">
                                    <img src="https://www.bling.com.br/vue-src/apps/menu/assets/images/Logo.svg" className="h-full w-full object-contain brightness-200" alt="Bling" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-white">Bling! ERP</h3>
                                    <p className="text-sm text-muted-foreground">Sincronização de Caixas, Bancos e Movimentações Financeiras.</p>
                                </div>
                            </div>
                            {isBlingConnected ? (
                                <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/20 px-4 py-1.5 rounded-full flex items-center gap-2">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Conectado
                                </Badge>
                            ) : (
                                <Badge className="bg-white/5 text-muted-foreground border-white/10 px-4 py-1.5 rounded-full flex items-center gap-2">
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    Pendente
                                </Badge>
                            )}
                        </div>

                        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-white/60">Status da API V3</span>
                                <span className="text-xs font-mono text-primary">Operacional</span>
                            </div>
                            {isBlingConnected && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-white/60">Última Sincronização</span>
                                    <span className="text-xs font-mono text-muted-foreground">
                                        {blingConfig?.updated_at ? new Date(blingConfig.updated_at).toLocaleString() : 'Nunca'}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4">
                            {!isBlingConnected ? (
                                <Button className="flex-1 h-14 rounded-2xl shadow-glow text-base" onClick={handleConnectBling} disabled={loading}>
                                    <LinkIcon className="mr-2 h-5 w-5" /> Conectar Bling
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-14 rounded-2xl border-white/10 hover:bg-white/5 text-base"
                                        onClick={handleSync}
                                        disabled={loading}
                                    >
                                        <RefreshCcw className={cn("mr-2 h-5 w-5", loading && "animate-spin")} />
                                        {loading ? 'Sincronizando...' : 'Forçar Sincronização'}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="h-14 w-14 rounded-2xl text-destructive hover:bg-destructive/10"
                                        title="Desconectar"
                                        onClick={handleDisconnect}
                                        disabled={loading}
                                    >
                                        <AlertCircle className="h-5 w-5" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Other sections can be added here */}
        </div>
    );
};
