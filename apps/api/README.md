# @psiflow/api

Back-end NestJS do PsiFlow — implementa as Etapas 01–06 do roadmap técnico (PRD seção 5.1): banco de dados, autenticação, RBAC/multi-tenancy, financeiro, prontuário e API REST.

## Estrutura

```
prisma/
  schema.prisma      Modelo de dados completo (PRD seção 6)
  sql/rls_policies.sql  Row-Level Security de referência (PRD 5.5)
  seed.ts             Dados sintéticos de desenvolvimento
src/
  common/             Guards, decorators, tenant context, DTOs compartilhados
  prisma/             PrismaService/PrismaModule
  modules/
    auth/             RF-01, RF-02 — login, refresh, hashing Argon2id
    patients/         Cadastro e listagem de pacientes
    agenda/            RF-03, RF-04 — agenda semanal e recorrência
    medical-records/  RF-05, RF-06 — prontuário e exportação PDF (RBAC: Profissional)
    financial/        RF-08, RF-09, RF-10 — pagamentos, previsão, recorrência
    whatsapp/         RF-07 — cobrança via WhatsApp (gateway abstraído)
    reports/          RF-11 — relatório de comparecimento
    dashboard/         Métricas do dia (PRD 9.3)
    audit-logs/        Trilha de auditoria (RBAC: Profissional/Supervisor)
```

## Rodando localmente

```bash
pnpm install
cp ../../.env.example ../../.env   # ou configure DATABASE_URL/REDIS_URL/JWT_* localmente
docker compose -f ../../docker-compose.yml up -d

pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed   # cria tenant + usuário + paciente de exemplo

pnpm dev
```

## Pendências conhecidas deste scaffold inicial

- **RLS**: políticas em `prisma/sql/rls_policies.sql` precisam ser aplicadas manualmente após a primeira migração; o isolamento hoje depende apenas do filtro `tenant_id`/`userId` na camada de aplicação (`TenantContext`).
- **Filas (BullMQ/Redis)**: lembretes de cobrança em 48h (RF-07) e lançamentos recorrentes (RF-10) têm a lógica de domínio pronta, mas ainda não são agendados via job — TODOs marcados no código.
- **Exportação de PDF** (RF-06) e **geração de relatórios XLS** (RF-11) ainda não implementadas — endpoints registram a intenção/auditoria e retornam `501`.
- **Integração real com Evolution API/Z-API**: `EvolutionApiGateway` opera em modo dry-run sem `WHATSAPP_API_URL` configurada.
