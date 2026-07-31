# PsiFlow

Sistema clínico de gestão para psicólogos autônomos, consultórios e clínicas multiprofissionais — agenda, prontuário eletrônico, cobrança automatizada via WhatsApp e financeiro integrado, em uma plataforma SaaS multi-tenant.

> Especificação completa em `docs/PRD.md` (PRD v2.0.0).

## Proposta de valor

- **Zero papel**: prontuário eletrônico 100% digital, criptografado e auditável (LGPD + Código de Ética do CFP).
- **Cobrança em 1 clique**: geração e disparo automático de cobrança formatada via WhatsApp Business API.
- **Visão financeira integrada**: previsão de recebíveis, despesas recorrentes e separação consultório/pessoal.

## Arquitetura

Monorepo gerenciado com pnpm workspaces:

```
apps/
  api/   NestJS + TypeScript + Prisma (PostgreSQL) + BullMQ (Redis)
  web/   Next.js + Tailwind CSS + shadcn/ui + TanStack Query
```

Ordem de desenvolvimento recomendada (ver seção 5.1 do PRD):

| # | Etapa | Status |
|---|---|---|
| 01 | Banco de Dados (Schema & Migrations) | Em andamento |
| 02 | Autenticação (Auth Service) | Planejado |
| 03 | Permissões (RBAC & Multi-Tenancy) | Planejado |
| 04 | Pipeline de Vendas & Financeiro | Planejado |
| 05 | Histórico de Atividades & Prontuários | Planejado |
| 06 | API RESTful (OpenAPI 3.1) | Planejado |
| 07 | Front-End (Dashboard & Interfaces) | Planejado |
| 08 | Workflows & Automações (WhatsApp) | Planejado |
| 09 | Agentes de IA (Fase Futura) | Backlog |

### Multi-tenancy

Isolamento lógico por `tenant_id` em todas as tabelas sensíveis, reforçado por Row-Level Security (RLS) no PostgreSQL como segunda camada de defesa.

### RBAC

Três papéis: **Profissional** (owner, acesso total), **Recepcionista** (agenda + status de pagamento, sem prontuário), **Supervisor Clínico** (dashboards agregados e auditoria, sem conteúdo clínico).

## Stack

**Back-end**: Node.js, NestJS, TypeScript, PostgreSQL, Prisma ORM, Redis (BullMQ), Evolution API / Z-API.

**Front-end**: React, Next.js, Tailwind CSS, shadcn/ui, Lucide Icons, TanStack Query, Recharts.

## Getting started

```bash
pnpm install
cp .env.example .env

# sobe Postgres + Redis
docker compose up -d

# gera client Prisma e roda migrations
pnpm db:generate
pnpm db:migrate

# desenvolvimento
pnpm dev:api   # http://localhost:3001
pnpm dev:web   # http://localhost:3000
```

## Design system

Dark Mode em azul-marinho e slate, com acento ciano. Tokens em `apps/web/lib/design-tokens.ts` (ver seção 9.1 do PRD).

## Roadmap de entrega

| Fase | Período | Escopo |
|---|---|---|
| 1 — Fundação | T3 2026 | Banco de dados, auth, RBAC, financeiro básico |
| 2 — Núcleo Clínico | T3–T4 2026 | Prontuário, API documentada, exportação PDF |
| 3 — Experiência & Automação | T4 2026 | Front-end completo, cobrança WhatsApp, lembretes |
| 4 — GA & Hardening | T1 2027 | Pentest, MFA obrigatório, SLA, onboarding self-service |

## Segurança & Conformidade

Dados de prontuário são criptografados em repouso (AES-256), TLS 1.3 em trânsito, trilha de auditoria imutável (`AuditLog`) e conformidade com LGPD e Código de Ética do CFP. Ver seção 11 do PRD.
