
# Agendify SaaS - Plataforma Multi-tenant de Agendamento

Este é um sistema robusto de agendamento para múltiplos nichos, construído com Next.js 14, TypeScript e Prisma.

## Arquitetura de Software

### Decisões Técnicas
- **Multi-tenancy**: Implementado via `tenantId` em todas as tabelas. O isolamento de dados é garantido na camada de query (Prisma middlewares ou guards nas rotas).
- **Backend**: Next.js Route Handlers para uma integração seamless com o frontend, aproveitando a tipagem ponta a ponta.
- **Campos Dinâmicos**: Utiliza uma tabela `DynamicField` e coluna `Json` em `Appointment` para permitir que nichos diferentes coletem dados específicos (ex: Nome do Pet para Petshop).

### Estrutura de Pastas
- `app/`: Rotas do Next.js (Admin, Master, Público).
- `components/`: Componentes UI reutilizáveis.
- `lib/`: Lógica de negócio (algoritmo de slots, auth, db).
- `prisma/`: Schema e migrations.
- `types/`: Definições globais de TypeScript.

## Plano de Execução

### Etapa 1: MVP (Foco em Agendamento Core)
- Auth com NextAuth (RBAC).
- CRUD de Tenants e Usuários.
- Algoritmo básico de slots.
- Página pública de agendamento simples.

### Etapa 2: V1 (Personalização e Nichos)
- Sistema de temas por nicho.
- Campos dinâmicos no formulário.
- Landing page configurável pelo tenant.
- Integração com Stripe para planos da plataforma.

### Etapa 3: V2 (Engajamento e Escala)
- Notificações WhatsApp/Email via Resend.
- Dashboard avançado com métricas MRR/Churn para o Master Admin.
- App Mobile-first PWA.

## Como Rodar Localmente

1. **Instalar dependências**: `npm install`
2. **Configurar Variáveis de Ambiente**:
   - `DATABASE_URL`: URL do seu Postgres.
   - `NEXTAUTH_SECRET`: Segredo para o Auth.
   - `STRIPE_API_KEY`: Para pagamentos.
3. **Migrar o Banco**: `npx prisma migrate dev`
4. **Rodar o App**: `npm run dev`

## Fluxo de Teste Sugerido
1. Crie uma conta de `MASTER_ADMIN`.
2. Cadastre um novo `TENANT` (ex: "Clínica Saúde" do nicho `CLINIC`).
3. Logue como `TENANT_ADMIN` daquela empresa.
4. Cadastre serviços e horários de funcionamento.
5. Acesse a URL pública `/[slug]` e realize um agendamento.
6. Verifique o agendamento no dashboard administrativo.

## Checklist de QA
- [ ] O isolamento de dados por `tenantId` está funcionando?
- [ ] O algoritmo de slots respeita os horários de intervalo (break)?
- [ ] A landing page muda visualmente ao trocar o nicho?
- [ ] Mobile view: o seletor de horários é amigável no touch?
- [ ] Stripe Webhooks: as assinaturas são ativadas automaticamente após o pagamento?
