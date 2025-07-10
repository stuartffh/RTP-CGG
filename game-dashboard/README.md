# RTP Monitor - Sistema de Monitoramento em Tempo Real

Sistema completo de monitoramento de RTP (Return to Player) de jogos de cassino em tempo real, migrado de Flask para React com Supabase.

## 🚀 Funcionalidades

### Frontend (React + TypeScript)
- **Dashboard em tempo real** com atualizações automáticas dos RTPs
- **Sistema de filtros avançado** por categoria, provedor, faixa de RTP
- **Alertas personalizados** para jogos específicos
- **Análise de tendências** e estatísticas detalhadas
- **Interface responsiva** com design gaming profissional
- **Autenticação completa** com perfis de usuário

### Backend (Supabase Edge Functions)
- **API de jogos** que consome dados originais da CGG.bet
- **Sistema de cache** para otimização de performance  
- **API administrativa** para gerenciamento de usuários
- **Autenticação JWT** com roles (admin/user)
- **Banco de dados** PostgreSQL com RLS

## 🏗️ Arquitetura

```
├── Frontend (React/Vite)
│   ├── Páginas: Index, Auth, Admin
│   ├── Componentes: GameCard, FilterBar, AlertsPanel
│   └── Hooks: useAuth
├── Backend (Supabase)
│   ├── Edge Functions: fetch-games, fetch-winners, admin-api
│   ├── Database: profiles, games, user_alerts, winners
│   └── Auth: JWT com Row Level Security
```

## 🛠️ Tecnologias

- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Supabase (PostgreSQL, Edge Functions, Auth)
- **APIs**: CGG.bet protobuf integration
- **Deploy**: Lovable (frontend), Supabase (backend)

## ⚡ Quick Start

1. **Clone e Configure**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   npm install
   npm run dev
   ```

2. **Supabase Setup**
   - Projeto já configurado com ID: `pzcipopufvmixwqbjymt`
   - Edge Functions deployadas automaticamente
   - Database com todas as tabelas criadas

3. **Usuário Admin Padrão**
   - Registre-se normalmente no sistema
   - Execute no SQL Editor do Supabase:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'seu@email.com';
   ```

4. **URLs Importantes**
   - **App**: https://lovable.dev/projects/7fd61d26-f235-4106-bd02-6b44aafe321e
   - **Supabase**: https://supabase.com/dashboard/project/pzcipopufvmixwqbjymt
   - **Deploy**: Click Share → Publish no Lovable

## 📊 Funcionalidades Principais

### Para Usuários
- Monitoramento de RTPs em tempo real
- Criação de alertas personalizados
- Análise de tendências e estatísticas
- Interface intuitiva e responsiva

### Para Administradores
- Painel administrativo completo
- CRUD de usuários (criar, editar, excluir)
- Controle de permissões e roles
- Visualização de estatísticas do sistema

## 🔧 Edge Functions

### `/fetch-games`
- Consome API original da CGG.bet
- Decodifica dados protobuf
- Cache no banco de dados
- Suporte a modo "tempo real" e "melhores"

### `/fetch-winners`
- Últimos vencedores em tempo real
- Cache otimizado (últimos 50)
- Fallback para dados de demonstração

### `/admin-api`
- CRUD completo de usuários
- Verificação de permissões admin
- Integração com Supabase Auth

## 🗃️ Banco de Dados

### Tabelas Principais
- `profiles`: Dados dos usuários e roles
- `games`: Cache dos jogos e RTPs
- `user_alerts`: Alertas personalizados
- `winners`: Histórico de vencedores

### Segurança
- Row Level Security (RLS) em todas as tabelas
- Políticas específicas por role (admin/user)
- Triggers automáticos para timestamps

## 🚨 Migração do Sistema Legado

### Funcionalidades Migradas
✅ **Monitoramento RTP** - Sistema completo de tempo real  
✅ **API Games** - Edge function com cache otimizado  
✅ **Autenticação** - Sistema JWT com roles  
✅ **Painel Admin** - CRUD completo de usuários  
✅ **Alertas** - Sistema personalizado por usuário  
✅ **Winners** - Últimos vencedores em tempo real  
✅ **Cache de Imagens** - Otimização automática  
✅ **Filtros Avançados** - Busca e categorização  

### Melhorias Implementadas
- Interface moderna e responsiva
- Performance otimizada com cache
- Segurança aprimorada com RLS
- Escalabilidade com Supabase
- Tipagem TypeScript completa

## 🔐 Autenticação e Segurança

### Sistema de Roles
```typescript
// Tipos de usuário
type UserRole = 'admin' | 'user';

// Políticas RLS automáticas
// - Users só veem seus próprios dados
// - Admins têm acesso total
// - Triggers automáticos para novos usuários
```

### Fluxo de Autenticação
1. Registro via Supabase Auth
2. Trigger cria perfil automático
3. Hook useAuth gerencia estado
4. Redirecionamentos automáticos

## 📈 Performance e Otimização

- **Auto-refresh**: 30 segundos
- **Cache inteligente**: Dados persistidos no banco
- **Lazy loading**: Componentes otimizados
- **Responsivo**: Mobile-first design
- **Error handling**: Fallbacks para dados demo

## 🚀 Deploy

### Ambiente de Produção
- **Frontend**: Deploy automático via Lovable
- **Backend**: Edge Functions sempre atualizadas
- **Database**: Migrations via Supabase Dashboard
- **Monitoring**: Logs em tempo real no Supabase

### Domínio Customizado
1. Acesse Project → Settings → Domains
2. Clique em "Connect Domain"
3. Configure DNS conforme instruções

## 📞 Suporte e Documentação

- **Supabase Dashboard**: [Ver projeto](https://supabase.com/dashboard/project/pzcipopufvmixwqbjymt)
- **Edge Functions**: [Ver logs](https://supabase.com/dashboard/project/pzcipopufvmixwqbjymt/functions)
- **Lovable Docs**: [Documentação](https://docs.lovable.dev)
- **Guia Técnico**: Ver `AGENTS.md` para detalhes de desenvolvimento

## 📝 Licença

MIT License - Sistema RTP Monitor migrado para arquitetura moderna React + Supabase