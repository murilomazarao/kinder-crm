# Plano de Implementação: Integração Bling API V3

Este plano descreve as etapas para conectar o CRM à API V3 do Bling, permitindo a sincronização de produtos e futuramente pedidos.

## 🛠️ Stack Técnica
- **Protocolo:** OAuth 2.0 (Authorization Code Flow)
- **Segurança:** Armazenamento de tokens no Supabase + Variáveis de ambiente
- **Frontend:** React + Zustand (para gerenciar estado da conexão)

---

## 📅 Fases do Projeto

### Fase 1: Infraestrutura de Dados (Banco de Dados)
- [ ] Criar tabela `bling_config` no Supabase para armazenar `access_token`, `refresh_token` e expiração.
- [ ] Criar script SQL para inicializar ou atualizar o esquema.

### Fase 2: Configuração de Ambiente
- [ ] Adicionar `VITE_BLING_CLIENT_ID` ao `.env.local`.
- [ ] Adicionar `VITE_BLING_CLIENT_SECRET` ao `.env.local`.
- [ ] Definir `VITE_BLING_REDIRECT_URI` (Sugestão: `http://localhost:5173/bling-callback`).

### Fase 3: Serviço de Autenticação (OAuth 2.0)
- [ ] Implementar `lib/blingService.ts`:
    - Funções para gerar URL de autorização.
    - Função para trocar `code` por tokens (Token Exchange).
    - Função para atualizar token expirado (Refresh Token).
    - Persistência dos tokens no Supabase.

### Fase 4: Interface de Conexão
- [ ] Adicionar aba "Integrações" no componente de Configurações.
- [ ] Criar botão "Conectar Bling" que inicia o fluxo.
- [ ] Criar a rota/componente `BlingCallback.tsx` para processar o retorno do Bling.

### Fase 5: Sincronização de Dados (MVP: Produtos)
- [ ] Criar função para listar produtos do Bling.
- [ ] Mapear dados do Bling para o esquema de `products` do CRM.
- [ ] Adicionar botão "Sincronizar com Bling" na lista de produtos.

---

## ⚖️ Considerações de Segurança
1. **Client Secret:** Idealmente, a troca de tokens deve ocorrer via Edge Function (Server-side). Para este MVP, implementaremos no front-end mas com alerta de segurança, preparando para migração.
2. **Scopes:** Utilizaremos escopos mínimos necessários (ex: `produtos`, `contatos`, `vendas`).

---

## ✅ Critérios de Aceite
- [ ] O usuário consegue autorizar o aplicativo via interface do CRM.
- [ ] Os tokens são salvos com sucesso no banco de dados.
- [ ] O sistema consegue renovar o token automaticamente antes de expirar.
- [ ] O usuário consegue importar pelo menos 1 produto do Bling.
