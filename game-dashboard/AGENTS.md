# RTP Monitor - Guia para Agentes Iinteligencia Artificial

Este documento contém informações essenciais para agentes IA que trabalharão neste projeto de monitoramento de RTP.

## 🎯 Visão Geral do Projeto

Sistema de monitoramento em tempo real de RTP (Return to Player) de jogos de cassino, migrado de Flask para React com Supabase como backend.

## 🏗️ Arquitetura do Sistema

### Frontend (React + TypeScript)
```
src/
├── pages/
│   ├── Index.tsx          # Dashboard principal
│   ├── Auth.tsx           # Login/Registro
│   └── Admin.tsx          # Painel administrativo
├── components/
│   ├── GameCard.tsx       # Card de jogo individual
│   ├── GameModal.tsx      # Modal com detalhes do jogo
│   ├── FilterBar.tsx      # Barra de filtros
│   ├── AlertsPanel.tsx    # Painel de alertas
│   └── StatsCard.tsx      # Cards de estatísticas
├── hooks/
│   └── useAuth.tsx        # Hook de autenticação
└── integrations/supabase/
    ├── client.ts          # Cliente Supabase
    └── types.ts           # Tipos do banco (auto-gerado)
```

### Backend (Supabase Edge Functions)
```
supabase/functions/
├── fetch-games/index.ts   # API de jogos (consume CGG.bet)
├── fetch-winners/index.ts # API de vencedores
└── admin-api/index.ts     # API administrativa
```

## 🗄️ Schema do Banco de Dados

### Tabelas Principais
```sql
profiles          # Perfis de usuário (admin/user)
games            # Cache de jogos e RTPs
user_alerts      # Alertas personalizados
winners          # Histórico de vencedores
```

### Relações Importantes
- `profiles.user_id` → `auth.users.id`
- `user_alerts.user_id` → `auth.users.id`
- `games.id` ← `user_alerts.game_id`

## 🔧 APIs e Integrações

### Edge Functions
1. **fetch-games**: Consome API original da CGG.bet (protobuf)
2. **fetch-winners**: Últimos vencedores em tempo real
3. **admin-api**: CRUD de usuários (apenas admins)

### API Externa
- **CGG.bet**: `https://cgg.bet.br/casinogo/widgets/v2/live-rtp`
- **Formato**: Protobuf (dados binários)
- **Endpoints**: Diário (`data`) e Semanal (`data_weekly`)

## 🔐 Sistema de Autenticação

### Roles
- **admin**: Acesso total ao sistema + painel administrativo
- **user**: Acesso padrão ao monitoramento e alertas

### Fluxo de Auth
1. Usuário se registra via Supabase Auth
2. Trigger cria perfil automático na tabela `profiles`
3. Hook `useAuth` gerencia estado de autenticação
4. RLS controla acesso aos dados

## 🎮 Funcionalidades Principais

### Dashboard (Index.tsx)
- Monitoramento em tempo real de RTPs
- Filtros por categoria, provedor, faixa RTP
- Dois modos: "Tempo Real" e "Melhores"
- Sistema de alertas personalizados
- Estatísticas e métricas em tempo real

### Painel Admin (Admin.tsx)
- CRUD completo de usuários
- Controle de roles (admin/user)
- Estatísticas do sistema
- Interface protegida por autenticação

## 🚨 Pontos de Atenção para Agentes

### 1. Transformação de Dados
```typescript
// API retorna RTP em centésimos (9620 = 96.20%)
const rtpPercent = (apiGame.rtp / 100).toFixed(1);
```

### 2. Segurança RLS
- Sempre verificar políticas antes de modificar tabelas
- Usar `auth.uid()` para filtrar dados do usuário
- Admins têm políticas especiais para acesso total

### 3. Edge Functions
- Sempre incluir CORS headers
- Usar `SUPABASE_SERVICE_ROLE_KEY` para operações admin
- Implementar fallback para dados de demonstração

### 4. Tipos TypeScript
- `src/integrations/supabase/types.ts` é auto-gerado
- Não modificar manualmente - usar migrations
- Interfaces personalizadas em components quando necessário

## 🔄 Workflow de Desenvolvimento

### Para Novas Funcionalidades
1. **Database**: Criar migration se necessário
2. **Edge Function**: Implementar lógica backend
3. **Frontend**: Criar/atualizar componentes
4. **Auth**: Verificar permissões e RLS
5. **Teste**: Validar com usuário admin/comum

### Para Bugs
1. **Logs**: Verificar console do navegador
2. **Network**: Inspecionar requests às Edge Functions
3. **Database**: Verificar RLS e dados no Supabase
4. **Auth**: Confirmar estado de autenticação

## 📊 Dados de Demonstração

### Quando APIs Falham
- System usa fallback para dados de demonstração
- Dados estão nos components para referência
- Manter estrutura compatível com API real

### Estrutura de Jogo
```typescript
interface Game {
  id: string;
  name: string;
  imageUrl: string;
  rtp: number;          // Percentual (96.5)
  priority: 'low' | 'medium' | 'high';
  category: 'slots' | 'table' | 'live';
  provider: string;
  lastUpdated: string;
  isHot?: boolean;
  isNew?: boolean;
  variance: 'low' | 'medium' | 'high';
  maxWin: string;
}
```

## 🎯 Objetivos de Performance

- **Refresh**: 30 segundos automático
- **Cache**: Dados persistidos no banco
- **Responsive**: Design mobile-first
- **Real-time**: Atualizações em tempo real via polling

## 🚀 Deploy e Produção

- **Frontend**: Deploy automático via Lovable
- **Backend**: Edge Functions deploy automático
- **Database**: Migrações via SQL Editor do Supabase
- **Auth**: Configuração via Dashboard do Supabase

## 📞 Contatos e Recursos

- **Supabase Dashboard**: https://supabase.com/dashboard
- **API CGG.bet**: Documentação interna do projeto Flask original
- **Lovable Docs**: https://docs.lovable.dev