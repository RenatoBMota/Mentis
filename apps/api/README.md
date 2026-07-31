# @mentis/api

Back-end NestJS do Mentis — implementa as Etapas 01–06 do roadmap técnico (PRD seção 5.1): banco de dados, autenticação, RBAC/multi-tenancy, financeiro, prontuário e API REST.

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
    sessions/          Marca sessão como realizada (gera SessionRecord) e lista histórico com status de pagamento
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
cp ../../.env.example ../../.env   # ou configure DATABASE_URL/REDIS_URL/JWT_*/ENCRYPTION_KEY localmente
docker compose -f ../../docker-compose.yml up -d

pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed   # cria tenant + usuário + paciente de exemplo

pnpm dev
```

Documentação interativa (Swagger/OpenAPI) em `http://localhost:3001/docs` — clique em "Authorize" e cole o `accessToken` retornado por `/v1/auth/login` para testar rotas protegidas.

## Pendências conhecidas deste scaffold inicial

- **RLS**: políticas em `prisma/sql/rls_policies.sql` validadas manualmente contra Postgres real, mas ainda precisam ser aplicadas via migração (hoje é um passo manual); o isolamento em produção depende do filtro `tenant_id`/`userId` na camada de aplicação (`TenantContext`) até essa etapa ser automatizada.
- **Geração de relatórios XLS** (RF-11) ainda não implementada.
- **Integração real com Evolution API/Z-API**: `EvolutionApiGateway` opera em modo dry-run sem `WHATSAPP_API_URL` configurada.
