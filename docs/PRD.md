# PsiFlow — Product Requirements Document

**Sistema Clínico de Gestão para Psicólogos**

| | |
|---|---|
| Versão | 2.0.0 |
| Status | Aprovado p/ Build |
| Classificação | Confidencial |
| Âmbito | SaaS Full-Stack |
| Público-alvo | Psicólogos autônomos, consultórios e clínicas multiprofissionais |
| Integração principal | WhatsApp Business API (Cobranças e Lembretes) |
| Data | Julho de 2026 · Product & Engineering |

> Fonte original: `PsiFlow_PRD_v2.0.docx` (neste mesmo diretório).

## Sumário

1. Sumário Executivo
2. Visão Geral do Produto & Objetivos
3. Personas & Público-Alvo
4. Análise Competitiva & Posicionamento
5. Arquitetura do Sistema
6. Modelo de Dados
7. Especificação de API
8. Requisitos Funcionais por Módulo
9. Especificação de Telas & Experiência do Usuário
10. Requisitos Não Funcionais
11. Segurança & Conformidade
12. Estratégia de QA & Testes
13. Roadmap de Entrega
14. Modelo de Monetização
15. Riscos & Mitigações
16. Premissas & Restrições
17. Instrumentação & Analytics
18. Glossário & Anexos

---

## 1. Sumário Executivo

O PsiFlow é uma plataforma SaaS vertical voltada à gestão clínica, agendamento e financeiro de psicólogos autônomos e pequenas clínicas. O produto resolve um problema operacional recorrente na categoria: profissionais da psicologia perdem tempo e receita gerenciando prontuários em papel, planilhas soltas e cobranças manuais via WhatsApp, o que gera inadimplência, retrabalho administrativo e risco de não conformidade com a LGPD e o Código de Ética do CFP.

A proposta de valor do PsiFlow é tripla: **eliminar o trabalho manual administrativo** por meio de automações; **reduzir a inadimplência** com cobrança automatizada em um clique via WhatsApp; e **garantir um prontuário eletrônico 100% digital**, seguro e auditável.

Indicadores-chave da visão de produto: 4 fases de entrega até GA · < 1s tempo de carregamento-alvo · 99,5% SLA de disponibilidade · AES-256 padrão de criptografia em repouso.

### 1.1. Como ler este documento

Organizado em camadas: visão de produto (seções 2–4) → arquitetura técnica (seções 5–7) → requisitos funcionais por módulo com critérios de aceite (seção 8) → especificação visual de cada tela (seção 9) → requisitos não funcionais e segurança (seções 10–11) → estratégia de qualidade (seção 12) → roadmap e monetização (seções 13–14) → riscos, premissas, instrumentação, glossário e anexos (seções 15–18). Engenharia: seções 5–9 como referência primária. Produto/stakeholders: seções 1–4 e 13.

## 2. Visão Geral do Produto & Objetivos

### 2.1. Problema

- Prontuários em papel ou documentos soltos, sem padronização, busca ou backup seguro — risco de perda de dados clínicos e não conformidade com o CFP.
- Agendamento via WhatsApp ou agendas físicas, sem visão consolidada de ocupação, recorrência ou taxa de comparecimento.
- Cobrança manual: o profissional precisa lembrar quem pagou, montar a mensagem e enviá-la individualmente — eleva a inadimplência.
- Ausência de visão financeira integrada entre receitas do consultório, despesas recorrentes e finanças pessoais.

### 2.2. Solução

O PsiFlow centraliza agenda, prontuário, cobrança e financeiro em uma única plataforma multi-tenant, com automações que eliminam etapas manuais — em especial o disparo de cobrança formatada via WhatsApp API a partir de um único clique sobre uma sessão pendente.

### 2.3. Proposta de Valor Principal

> Eliminar o trabalho manual administrativo, zerar a inadimplência com cobrança automatizada via WhatsApp em 1 clique, e garantir prontuário eletrônico 100% digital, seguro e em conformidade com o CFP e a LGPD.

### 2.4. Objetivos de Produto (2026)

| Objetivo | Métrica-alvo | Prazo |
|---|---|---|
| Reduzir a inadimplência de sessões | Queda de 40% na taxa de pagamentos em atraso vs. controle manual | 6 meses pós-GA |
| Eliminar prontuário em papel entre usuários ativos | ≥ 90% dos prontuários criados digitalmente | 3 meses pós-GA |
| Reduzir tempo administrativo semanal | De ~5h para < 1h por profissional/semana | 6 meses pós-GA |
| Ativação inicial | Onboarding completo (1º paciente + 1ª cobrança disparada) em < 15 min | Lançamento |
| Confiabilidade percebida | NPS ≥ 55 entre psicólogos ativos | 12 meses pós-GA |

### 2.5. Fora de Escopo (nesta versão)

- Prontuário eletrônico compartilhado entre múltiplos profissionais para o mesmo paciente (encaminhamento multiprofissional) — versão futura.
- Telemedicina/teleconsulta com vídeo embutido — campo "Modalidade Online" apenas identifica a sessão; a chamada ocorre em ferramenta externa.
- Emissão fiscal de NFS-e automatizada — integração futura, não bloqueante para o MVP.
- Aplicativo nativo mobile (iOS/Android) — MVP é web responsivo (PWA); apps nativos no roadmap de 2027.

## 3. Personas & Público-Alvo

Baixa tolerância a fricção tecnológica e alta sensibilidade a confiabilidade e sigilo profissional.

**Persona 1 — Dra. Mariana Souza, Psicóloga Clínica Autônoma**
CRP ativo, consultório próprio, 15–25 pacientes recorrentes/semana, sem equipe de apoio. Dores: organiza a agenda aos domingos; perde controle de inadimplência; sem tempo para relatórios. Objetivo: automatizar cobrança e ver faturamento do mês em < 5s ao abrir o sistema.

**Persona 2 — Consultório Compartilhado (2 a 6 profissionais)**
Sala compartilhada com recepcionista part-time (agenda + triagem). Dores: falta de padronização; recepcionista sem visibilidade granular de prontuários (não deveria ter). Objetivo: RBAC que separa o que a recepção vê (agenda, status de pagamento) do que só o profissional vê (evolução clínica).

**Persona 3 — Clínica Multiprofissional / Supervisor Clínico**
Administra múltiplos psicólogos; precisa de visão consolidada de ocupação e inadimplência por profissional. Dores: falta de relatórios gerenciais consolidados; dificuldade de auditar alterações em prontuários. Objetivo: papel de Supervisor com dashboards agregados e trilha de auditoria completa, sem acesso ao conteúdo clínico salvo permissão explícita.

## 4. Análise Competitiva & Posicionamento

Mercado brasileiro dominado por: (a) prontuário eletrônico genérico adaptado de outras áreas da saúde, (b) planilhas e agendas de papel, (c) soluções pontuais de cobrança via link de pagamento sem integração com a agenda. O PsiFlow une prontuário, agenda e cobrança automatizada via WhatsApp em um fluxo único, com Dark Mode pensado para uso diário.

| Dimensão | Prontuário genérico adaptado | Planilhas / Agenda física | PsiFlow |
|---|---|---|---|
| Cobrança automatizada via WhatsApp | Não | Não | Sim, 1 clique |
| Prontuário com criptografia dedicada e tags clínicas | Parcial | Não | Sim (AES-256 + tags TCC etc.) |
| Visão financeira consultório + pessoal | Não | Manual | Sim, integrada |
| Multi-tenant / múltiplos profissionais | Parcial | Não | Sim (RBAC) |
| Desenhado especificamente para psicologia | Não | N/A | Sim |

### 4.1. Diferenciais defensáveis

- **Automação de cobrança nativa**: mensagem formatada (valor, data, chave Pix) com um clique — ciclo de cobrança de minutos para segundos.
- **Modelo de dados desenhado para o vocabulário clínico da psicologia** (evolução, tags técnicas, recorrência semanal/quinzenal).
- **Experiência visual** (Dark Mode, alto contraste, KPIs no topo) para uso rápido entre sessões, não para retaguarda hospitalar.

## 5. Arquitetura do Sistema

### 5.1. Ordem de Desenvolvimento Recomendada

Arquitetura incremental, da fundação de dados até a camada de agentes de IA, garantindo que cada etapa entregue uma base testável para a próxima.

| # | Etapa | Entrega |
|---|---|---|
| 01 | Banco de Dados (Schema & Migrations) | Modelagem relacional das entidades principais e políticas de migração versionada |
| 02 | Autenticação (Auth Service) | Login seguro, tokens JWT, refresh tokens, hashing de senhas (Argon2id) |
| 03 | Permissões (RBAC & Multi-Tenancy) | Papéis: Profissional, Recepcionista, Supervisor; isolamento por tenant |
| 04 | Pipeline de Vendas & Financeiro | Sessões, honorários, previsão de recebíveis, despesas recorrentes |
| 05 | Histórico de Atividades & Prontuários | Evolução clínica segura, registros encadeados, geração de PDF |
| 06 | API RESTful / GraphQL | Endpoints documentados (OpenAPI 3.1) para consumo do front-end |
| 07 | Front-End (Dashboard & Interfaces) | Interface Dark Mode responsiva, foco em UX imediata |
| 08 | Workflows & Automações | Cobrança WhatsApp em 1 clique, lembretes, recorrências |
| 09 | Agentes de IA (Fase Futura) | Resumos de prontuário, transcrição de voz, insights contextuais |

### 5.2. Stack Tecnológica — Back-End

Node.js / NestJS · TypeScript · PostgreSQL · Prisma ORM · Redis (Filas) · Evolution API / Z-API

### 5.3. Stack Tecnológica — Front-End

React / Next.js · Tailwind CSS · Shadcn UI · Lucide Icons · TanStack Query · Recharts

### 5.4. Visão de Componentes

Arquitetura modular em camadas, com separação clara entre API, domínio e infraestrutura:

- **Camada de apresentação**: Next.js (SSR/SSG seletivo para páginas públicas de login) consumindo a API via TanStack Query, com cache otimista para ações críticas (ex.: marcar pagamento como recebido).
- **Camada de API**: NestJS expondo REST (recurso principal) com módulos por domínio (Auth, Patients, Agenda, MedicalRecords, Financial, WhatsApp, Reports), cada um com controller, service e repository isolados.
- **Camada de domínio**: regras de negócio (ex.: cálculo de previsão de recebíveis, geração de recorrência de sessões) isoladas em services puros, testáveis sem dependência de infraestrutura.
- **Camada de dados**: PostgreSQL como fonte de verdade via Prisma ORM; Redis para filas (BullMQ) de envio de WhatsApp e lembretes agendados, além de cache de sessão e rate limiting.
- **Integrações externas**: Evolution API ou Z-API como gateway para WhatsApp Business API; provedor de e-mail transacional para recuperação de senha e alertas administrativos.

### 5.5. Multi-Tenancy & Isolamento de Dados

Multi-tenant com isolamento lógico por coluna (`tenant_id` / `user_id`) em todas as tabelas sensíveis, reforçado por **Row-Level Security (RLS)** no PostgreSQL como segunda camada de defesa, independente da lógica de aplicação. Cada requisição autenticada carrega o tenant no contexto do JWT; todo acesso ao Prisma passa por um middleware que injeta o filtro de tenant automaticamente, prevenindo vazamento de dados entre contas mesmo em caso de erro de implementação em um endpoint específico.

### 5.6. RBAC — Papéis e Permissões

| Papel | Agenda | Financeiro | Prontuário Clínico | Configurações da Conta |
|---|---|---|---|---|
| Profissional (owner) | Leitura/Escrita | Leitura/Escrita | Leitura/Escrita | Leitura/Escrita |
| Recepcionista | Leitura/Escrita | Leitura (status de pagamento) | Sem acesso | Sem acesso |
| Supervisor Clínico | Leitura (agregada) | Leitura (agregada) | Sem acesso ao conteúdo, apenas metadados de auditoria | Sem acesso |

## 6. Modelo de Dados

Expande as entidades originais com tabelas de suporte para cobrança recorrente, notificações, planos de assinatura (o próprio PsiFlow como SaaS) e trilha de auditoria — requisito direto da LGPD e do Código de Ética do CFP.

### 6.1. Entidades Principais

| Entidade | Campos-chave | Regra de negócio |
|---|---|---|
| User / Psicólogo | id, name, email, password_hash, crp, phone, plan_type, tenant_id | Usuário principal da conta; guarda credenciais e registro profissional (CRP) |
| Patient (Paciente) | id, user_id, full_name, age, phone, recurrence_type, price_per_session, status | Recorrência: Semanal, Quinzenal, Avulsa. Status: Ativo, Em Avaliação, Inativo |
| Appointment (Agenda) | id, patient_id, date_time, modality, status, price | Status: Agendada, Confirmada, Realizada, Faltou, Cancelada |
| SessionRecord (Cobrança) | id, appointment_id, patient_id, payment_status, payment_method, date | Status: Pendente, Pago, Atrasado. Meios: Pix, Transferência, Cartão |
| MedicalRecord (Prontuário) | id, patient_id, session_number, evolution_text, tags, steps_text | Evolução terapêutica; busca por tags; exportação em PDF assinado digitalmente |
| FinancialTransaction | id, user_id, type, category, amount, due_date, status | Escopo: Consultório, Pessoal, Recorrente |

### 6.2. Entidades de Suporte (novas nesta especificação)

| Entidade | Campos-chave | Propósito |
|---|---|---|
| Subscription (Plano SaaS) | id, user_id, plan_tier, status, current_period_end | Controla o plano contratado do próprio PsiFlow (Starter/Pro/Clínica) |
| Notification | id, user_id, channel, type, payload, sent_at, status | Registro de lembretes e cobranças disparados (WhatsApp, e-mail, in-app) |
| AuditLog | id, actor_id, entity, entity_id, action, diff, created_at | Trilha imutável de alterações em prontuário e dados sensíveis (LGPD/CFP) |
| Tag | id, name, category, tenant_id | Vocabulário clínico reutilizável (ex.: TCC, Ansiedade, Reestruturação Cognitiva) |
| Attachment | id, medical_record_id, file_url, mime_type, checksum | Anexos ao prontuário (ex.: testes psicométricos digitalizados), com checksum de integridade |
| Invoice (Fatura SaaS) | id, subscription_id, amount, due_date, status | Cobrança do próprio PsiFlow ao psicólogo assinante, distinta da cobrança do paciente |

### 6.3. Relacionamentos-chave

- Um `User` (Profissional) possui muitos `Patients`; um `Patient` possui muitos `Appointments`; cada `Appointment` gera no máximo um `SessionRecord`.
- Um `Patient` acumula muitos `MedicalRecords`, ordenados por `session_number`, formando a linha do tempo de evolução.
- `Tags` têm relação N:N com `MedicalRecord` via tabela de junção, permitindo busca facetada por tema clínico.
- Toda escrita em `MedicalRecord` e `FinancialTransaction` gera um `AuditLog` correspondente, nunca sobrescrito nem deletado fisicamente (soft-delete + log append-only).

## 7. Especificação de API

REST versionado (prefixo `/v1`), autenticação via Bearer JWT, respostas em JSON com envelope padronizado (`{ data, meta, error }`) e paginação por cursor em listagens. Erros seguem RFC 7807 (Problem Details), com código de erro estável por caso de negócio (ex.: `PATIENT_NOT_FOUND`, `PAYMENT_ALREADY_SETTLED`).

### 7.1. Endpoints Principais

| Método | Rota | Descrição |
|---|---|---|
| POST | `/v1/auth/login` | Autenticação do usuário e emissão de JWT + refresh token |
| POST | `/v1/auth/refresh` | Renovação de token de acesso a partir do refresh token |
| GET | `/v1/dashboard/summary` | Métricas do dia: sessões hoje, faturamento do mês, pendências |
| GET | `/v1/patients` | Listagem de pacientes com busca, filtros por status e paginação |
| POST | `/v1/patients` | Cadastro de novo paciente |
| GET | `/v1/agenda/weekly` | Visualização semanal da agenda por slots de horário |
| POST | `/v1/agenda/appointments` | Criação de agendamento (click-to-create) |
| GET/POST | `/v1/medical-records/:patientId` | Leitura e registro de evolução clínica |
| POST | `/v1/medical-records/:patientId/export-pdf` | Geração e download do prontuário em PDF |
| GET | `/v1/financial/transactions` | Lançamentos de receitas, despesas e despesas automáticas do mês |
| POST | `/v1/whatsapp/send-charge-link` | Disparo de cobrança formatada via WhatsApp API |
| GET | `/v1/reports/attendance` | Relatório consolidado de comparecimento por período |
| GET | `/v1/audit-logs` | Consulta da trilha de auditoria (restrito a Profissional/Supervisor) |

### 7.2. Convenções

- **Autenticação**: header `Authorization: Bearer <token>`; access tokens expiram em 15 min, refresh tokens em 30 dias com rotação a cada uso.
- **Paginação**: parâmetros `cursor` e `limit` (máx. 100); resposta inclui `meta.next_cursor`.
- **Idempotência**: endpoints de disparo de cobrança aceitam header `Idempotency-Key` para evitar envio duplicado em retry de rede.
- **Rate limiting**: 120 req/min por usuário autenticado; 10/min para endpoints de disparo de WhatsApp.
- **Versionamento**: mudanças que quebram contrato exigem novo prefixo (`/v2`); campos novos não obrigatórios podem ser adicionados sem quebra.

### 7.3. Webhooks

O módulo de WhatsApp expõe `/v1/webhooks/whatsapp` para receber confirmações de entrega e leitura da Evolution API / Z-API, atualizando o status da `Notification` correspondente e exibindo, na tela de Sessões, se a cobrança foi entregue.

## 8. Requisitos Funcionais por Módulo

Cada requisito segue formato de história de usuário com critérios de aceite testáveis, com rastreabilidade direta para os planos de teste da seção 12.

### 8.1. Módulo de Autenticação & Onboarding

**RF-01 — Login seguro**
Como psicólogo cadastrado, quero entrar no sistema com e-mail e senha para acessar meus dados clínicos e financeiros com segurança.
- Senha armazenada com hashing Argon2id; nunca em texto plano ou logs.
- Após 5 tentativas inválidas em 10 minutos, a conta é bloqueada temporariamente por 15 minutos.
- Sessão expira automaticamente após 15 minutos de inatividade em telas com dados de prontuário.

**RF-02 — Onboarding guiado**
Como novo usuário, quero um fluxo guiado de configuração inicial (dados do CRP, chave Pix, primeiro paciente) para começar a usar o sistema em menos de 15 minutos.
- O onboarding não pode ser concluído sem validação do número de registro profissional (CRP) em formato válido.
- Ao final, o usuário é conduzido a cadastrar o primeiro paciente e ver o dashboard populado com dados de exemplo removíveis.

### 8.2. Módulo de Agenda

**RF-03 — Agendamento por clique na grade**
Como psicólogo, quero clicar em um horário livre da grade semanal para criar um agendamento em até 30 segundos.
- Formulário de criação abre em modal sem navegação de página, pré-preenchido com data/hora do slot clicado.
- Conflitos de horário para o mesmo profissional são bloqueados com mensagem clara antes do envio.

**RF-04 — Recorrência automática**
Como psicólogo, quero que sessões semanais ou quinzenais gerem automaticamente os próximos agendamentos, sem recriação manual.
- Recorrência gera agendamentos com até 8 semanas de antecedência, renovando conforme o horizonte se aproxima.
- Cancelar uma ocorrência não cancela a série; cancelar a série pede confirmação explícita.

### 8.3. Módulo de Prontuário Clínico

**RF-05 — Registro de evolução**
Como psicólogo, quero registrar a evolução de uma sessão com campos estruturados e tags técnicas para manter histórico clínico pesquisável.
- Campos obrigatórios: relato da evolução e número da sessão; observações, próximos passos e tags são opcionais.
- Cada evolução salva gera uma entrada imutável na linha do tempo — edições posteriores criam nova versão auditada, não sobrescrevem a original.

**RF-06 — Exportação de prontuário em PDF**
Como psicólogo, quero exportar o prontuário de um paciente em PDF para fins de compartilhamento autorizado ou arquivamento.
- PDF inclui marca d'água com nome do profissional, CRP e data/hora de geração, para rastreabilidade de cópias.
- Exportação registrada em `AuditLog` com motivo informado pelo usuário (campo obrigatório de justificativa).

### 8.4. Módulo de Cobrança & WhatsApp

**RF-07 — Disparo de cobrança em 1 clique**
Como psicólogo, quero clicar na tag "Pendente" de uma sessão para gerar e enviar automaticamente uma cobrança formatada via WhatsApp.
- Mensagem gerada inclui: nome do paciente, valor exato, data da sessão e chave Pix cadastrada, sem digitação manual.
- Após o disparo, status da sessão muda para "Cobrança Enviada" e um lembrete automático é agendado para 48h depois caso não haja confirmação de pagamento.

**RF-08 — Confirmação de pagamento**
Como psicólogo, quero marcar uma sessão como paga e registrar o meio de pagamento para manter o financeiro atualizado.
- Ao marcar como pago, o sistema oferece reconciliação automática sugerindo o valor exato da sessão, editável para casos de desconto.

### 8.5. Módulo Financeiro

**RF-09 — Previsão de recebíveis**
Como psicólogo, quero ver a projeção de receita do mês com base nas sessões agendadas e recorrentes, mesmo antes de acontecerem.
- Previsão recalculada em tempo real a cada novo agendamento, cancelamento ou alteração de valor por sessão.

**RF-10 — Lançamentos recorrentes**
Como psicólogo, quero cadastrar despesas fixas (aluguel da sala, supervisão clínica, assinatura do PsiFlow) para que sejam lançadas automaticamente todo mês.
- Lançamentos automáticos ocorrem no 1º dia do mês, com notificação in-app resumindo o que foi lançado.

### 8.6. Módulo de Relatórios

**RF-11 — Exportação de relatórios**
Como psicólogo ou supervisor, quero exportar relatórios de faturamento e comparecimento por período em PDF ou XLS para análise externa ou prestação de contas.
- Relatórios respeitam o RBAC: Supervisor exporta apenas dados agregados, sem conteúdo clínico individual.

## 9. Especificação de Telas & Experiência do Usuário

### 9.1. Sistema de Design

Paleta Dark Mode em tons de azul-marinho e slate, com acento ciano para estados interativos e dados positivos — reduz fadiga visual em uso prolongado, mantendo alto contraste para leitura rápida de números financeiros.

| Token | Valor | Uso |
|---|---|---|
| surface.base | `#0d1b2a` | Fundo principal da aplicação |
| surface.raised | `#1b263b` | Cards, modais, painéis |
| accent.primary | `#1b4965` | Botões primários, cabeçalhos de tabela |
| accent.highlight | `#62b6cb` | Estados ativos, links, indicadores positivos |
| status.success | `#2e7d32` | Pago, Confirmada, Realizada |
| status.warning | `#b7791f` | Pendente, Aguardando confirmação |
| status.danger | `#b3261e` | Atrasado, Faltou, Cancelada |

- **Tipografia**: fonte sem serifa de alta legibilidade (Inter ou similar), hierarquia clara entre KPI (peso 700, tamanho grande) e texto de apoio (peso 400).
- **Espaçamento**: grid de 8px como unidade base.
- **Performance percebida**: skeleton loaders em todas as telas de dados, nunca spinners de página inteira.

### 9.2. Tela de Autenticação (Login)

Card centralizado em glassmorphism sobre fundo azul-marinho profundo. Campo de login (e-mail ou usuário) e senha com alternador de visibilidade. Botão "Entrar no sistema" com estado de carregamento inline. Rodapé personalizável por tenant (ex.: "Dra. Mariana Souza • Psicóloga Clínica • CRP 06/123456"). Acessibilidade: labels associadas e erros anunciados para leitores de tela.

### 9.3. Dashboard Principal (Visão Geral)

KPI Cards no topo: Sessões Hoje, Faturamento do Mês, Despesas do Mês, Pacientes Ativos, Previsão de Recebíveis (cada um com variação % vs. período anterior). Abas globais: Consultório, Pessoal, Consolidado (persistidas por sessão). Tabela central de Previsão de Recebíveis por paciente. Seção de Recebíveis Pendentes com atalho direto para disparo de cobrança.

### 9.4. Gestão de Agenda Semanal

Grade de horários por dia útil (seg–sex, configurável p/ sábado), status visual por cores. Click-to-create em slots de 1h; drag-and-drop para reagendamento. Cards de atendimento com nome do paciente e modalidade (Presencial/Online). Painel "Próximas Sessões" para agendamento em até 30s.

### 9.5. Cadastro e Lista de Pacientes

Grid em cards com métricas de topo (Ativos, Em Avaliação, Ticket Médio, Total Geral). Filtros rápidos e busca com debounce de 300ms. Card individual: nome, idade, frequência, valor/sessão, ações rápidas (Editar, Prontuário, Excluir com confirmação obrigatória).

### 9.6. Prontuário Clínico & Evolução

Filosofia "Zero Papel": interface de leitura/digitação contínua, autosave a cada 10s de inatividade. Seletor de paciente + "Caderno de Anotações" pessoal. Botões "+ Nova Evolução" e "Exportar PDF" sempre visíveis. Timeline da evolução clínica navegável por rolagem ou tag. Campos estruturados: relato, observações, próximos passos, tags técnicas.

### 9.7. Histórico de Sessões & Cobrança WhatsApp

Funcionalidade-chave do produto. Tabela de sessões com métricas de comparecimento. Status visual de pagamento: Pago (verde), Pendente (âmbar), Atrasado (vermelho). Clicar na tag "Pendente" monta e envia a mensagem formatada no WhatsApp do paciente, sem etapas intermediárias.

### 9.8. Módulo Financeiro Integrado

Banner de balanço (Receitas, Despesas, Saldo). Filtros por tipo/ano/mês com URL sincronizada. Lançamentos automáticos no 1º dia do mês, editáveis antes da confirmação. Separação visual clara entre Consultório e Pessoal, nunca somados sem indicação explícita.

### 9.9. Relatórios e Exportação

Consolidação por paciente e período, com gráficos de faturamento e comparativos de presença. Exportação em 1 clique para PDF/XLS, geração assíncrona para relatórios grandes (> 12 meses) com notificação quando pronto.

## 10. Requisitos Não Funcionais

| Categoria | Requisito | Meta |
|---|---|---|
| Performance | Carregamento do dashboard e abertura do formulário de agendamento | < 1 segundo (p95) |
| Performance | Tempo de resposta da API para leituras simples | < 200ms (p95) |
| Disponibilidade | SLA de uptime da plataforma | 99,5% mensal |
| Escalabilidade | Suporte a crescimento de tenants sem degradação | Escala horizontal via réplicas stateless da API |
| Recuperação de Desastres | RPO (perda máxima de dados aceitável) | ≤ 15 minutos |
| Recuperação de Desastres | RTO (tempo máximo de restauração) | ≤ 4 horas |
| Backup | Frequência de backup do banco primário | Contínuo (WAL) + snapshot diário retido por 35 dias |
| Acessibilidade | Conformidade de interface | WCAG 2.1 nível AA nas telas críticas |
| Observabilidade | Rastreabilidade de erros em produção | Tracing distribuído + alertas com MTTD < 5 min |

### 10.1. Design System — Paleta de Referência

Layout responsivo em Dark Mode com a paleta Azul-Marinho/Slate (`#0d1b2a`, `#1b263b`, `#1b4965`, `#62b6cb`), consistente entre web e futuras superfícies mobile.

## 11. Segurança & Conformidade

> Dados de prontuário clínico são dados sensíveis por definição legal (LGPD, Art. 5º, II) e sujeitos ao sigilo profissional do Código de Ética do Psicólogo (CFP). Toda decisão de arquitetura neste módulo prioriza confidencialidade e auditabilidade sobre conveniência.

### 11.1. Criptografia

- Dados em repouso: AES-256 para `MedicalRecord.evolution_text`, `MedicalRecord.steps_text` e anexos armazenados.
- Dados em trânsito: TLS 1.3 obrigatório em toda comunicação cliente-servidor e servidor-servidor, com HSTS habilitado.
- Segredos de aplicação geridos via cofre de segredos dedicado, nunca em variáveis de ambiente versionadas.

### 11.2. Conformidade LGPD

- Base legal: consentimento explícito do paciente, coletado e registrado pelo profissional no cadastro.
- Direito de portabilidade e exclusão: fluxo de anonimização que preserva integridade estatística agregada sem reter dados identificáveis.
- RIPD mantido e revisado a cada mudança estrutural relevante no módulo de prontuário.
- Notificação de incidentes: processo formal com prazo de comunicação à ANPD e aos titulares conforme exigido por lei.

### 11.3. Conformidade com o CFP

- Trilha de auditoria imutável (`AuditLog`) para toda leitura e escrita em prontuário.
- Exportações de prontuário exigem justificativa registrada.
- Retenção mínima de prontuário conforme orientação do CFP, com bloqueio de exclusão definitiva antes do prazo mínimo aplicável.

### 11.4. Autenticação & Controle de Acesso

- MFA opcional na v1, obrigatória para o papel Profissional a partir da Fase 3.
- Revogação imediata de sessões ativas ao alterar senha ou remover colaborador.
- Princípio do menor privilégio aplicado ao RBAC (seção 5.6), revisado a cada novo módulo.

## 12. Estratégia de QA & Testes

| Camada | Ferramentas / Abordagem | Meta de cobertura |
|---|---|---|
| Testes unitários | Jest, isolando services de domínio | ≥ 80% em módulos de regras de negócio |
| Testes de integração | Testcontainers com PostgreSQL/Redis reais | Todos os fluxos críticos (cobrança, agenda, prontuário) |
| Testes de contrato de API | Validação automática contra OpenAPI 3.1 | 100% dos endpoints públicos |
| Testes end-to-end | Playwright cobrindo fluxos das personas | Onboarding, cobrança, prontuário |
| Testes de segurança | SAST no CI + pentest externo antes de cada GA de fase | Zero vulnerabilidades críticas/altas em produção |
| Testes de performance | k6 simulando picos de uso | p95 dentro das metas da seção 10 |

### 12.1. Ambientes

- **Desenvolvimento**: dados sintéticos apenas; nunca dados reais de pacientes fora de produção.
- **Homologação (staging)**: espelha produção em topologia, dados mascarados quando necessário.
- **Produção**: acesso restrito por RBAC de engenharia, trilha de auditoria própria para acessos administrativos de suporte.

## 13. Roadmap de Entrega

| Fase | Período | Escopo principal | Critério de saída |
|---|---|---|---|
| Fase 1 — Fundação | T3 2026 | Etapas 01–04: banco de dados, auth, RBAC, pipeline financeiro básico | Ambiente de staging estável com dados sintéticos |
| Fase 2 — Núcleo Clínico | T3–T4 2026 | Etapas 05–06: prontuário, API documentada, exportação de PDF | Fluxo completo de prontuário auditado em homologação |
| Fase 3 — Experiência & Automação | T4 2026 | Etapas 07–08: front-end completo, cobrança WhatsApp, lembretes | Beta fechado com 10–15 psicólogos reais |
| Fase 4 — GA & Hardening | T1 2027 | Pentest, MFA obrigatório, SLA de suporte, onboarding self-service | Disponibilidade Geral (GA) pública |
| Visão Futura | 2027+ | Etapa 09: agentes de IA — resumo automático de evolução, transcrição de voz, insights de atendimento | Piloto controlado com opt-in explícito do paciente |

## 14. Modelo de Monetização

Assinatura SaaS mensal, planos segmentados por porte de operação. A cobrança automatizada via WhatsApp está disponível a partir do plano intermediário, como principal alavanca de upgrade.

| Plano | Perfil-alvo | Principais limites/diferenciais |
|---|---|---|
| Starter | Profissional autônomo iniciando digitalização | Até 15 pacientes ativos; cobrança WhatsApp manual (sem automação de disparo) |
| Pro | Profissional autônomo estabelecido (persona 1) | Pacientes ilimitados; cobrança automatizada em 1 clique; relatórios exportáveis |
| Clínica | Consultório compartilhado / multiprofissional (personas 2 e 3) | Múltiplos usuários com RBAC; dashboards agregados; suporte prioritário |

## 15. Riscos & Mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Bloqueio ou instabilidade do provedor de WhatsApp (Evolution API/Z-API) | Alto — funcionalidade-chave indisponível | Abstração de gateway com suporte a provedor alternativo; fila com retry e alerta |
| Vazamento de dados de prontuário | Crítico — dano à confiança e exposição legal | Criptografia em repouso, RLS, auditoria imutável, pentest recorrente |
| Baixa adesão inicial (papel → digital) | Médio — atraso na meta de ativação | Onboarding guiado < 15 min e importação assistida de dados existentes |
| Custo variável de mensagens WhatsApp em escala | Médio — pressão de margem no plano Pro | Monitoramento de custo por tenant e fair use |
| Complexidade de conformidade regulatória entre estados/conselhos | Médio — retrabalho em regras de retenção | Modelo de retenção configurável por tenant, revisado com assessoria jurídica |

## 16. Premissas & Restrições

### 16.1. Premissas

- O psicólogo assinante possui número de WhatsApp Business próprio ou está disposto a configurar um dedicado ao consultório.
- O paciente já é usuário de WhatsApp.
- O profissional possui CRP ativo e válido, verificável em formato (sem integração direta com o conselho na v1).

### 16.2. Restrições

- A automação de cobrança depende de aprovação e limites de uso da API do WhatsApp Business.
- O MVP não contempla emissão fiscal automatizada.
- Dados de prontuário não podem ser processados por serviços de IA de terceiros sem anonimização prévia — restrição que molda o desenho da Fase 9 (Agentes de IA).

## 17. Instrumentação & Analytics

| Evento | Quando dispara | Métrica que alimenta |
|---|---|---|
| `onboarding_completed` | Usuário conclui cadastro + 1º paciente | Tempo de ativação (meta < 15 min) |
| `charge_sent` | Disparo de cobrança via WhatsApp | Volume de cobranças automatizadas |
| `payment_marked_paid` | Sessão marcada como paga | Taxa de inadimplência (meta -40%) |
| `medical_record_created` | Nova evolução clínica salva | % de prontuários digitais (meta ≥ 90%) |
| `report_exported` | Exportação de relatório PDF/XLS | Engajamento com módulo de relatórios |
| `session_admin_time` | Tempo em telas administrativas por sessão de uso | Tempo administrativo semanal (meta < 1h) |

## 18. Glossário & Anexos

### 18.1. Glossário

- **CRP** — Conselho Regional de Psicologia; número de registro profissional do psicólogo.
- **CFP** — Conselho Federal de Psicologia; entidade normativa do Código de Ética Profissional.
- **LGPD** — Lei Geral de Proteção de Dados Pessoais (Lei 13.709/2018).
- **RBAC** — Role-Based Access Control; controle de acesso baseado em papéis.
- **RTO / RPO** — Recovery Time Objective / Recovery Point Objective.
- **SLA** — Service Level Agreement.
- **Multi-tenancy** — Arquitetura em que uma única instância da aplicação atende múltiplos clientes (tenants) com isolamento lógico de dados.

### 18.2. Documentos de Referência

- Documento-fonte: PRD PsiFlow v1.0.0 — Especificação Completa de Arquitetura, Módulos Back-End e Telas Front-End.
- Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018).
- Código de Ética Profissional do Psicólogo, Conselho Federal de Psicologia.

### 18.3. Controle de Versão do Documento

| Versão | Data | Alterações |
|---|---|---|
| 1.0.0 | 2026 | Documento inicial: visão, back-end, telas e requisitos não funcionais essenciais |
| 2.0.0 | Julho de 2026 | Expansão completa: sumário executivo, personas, análise competitiva, requisitos funcionais com critérios de aceite, segurança/LGPD/CFP detalhados, QA, roadmap, monetização, riscos, instrumentação e glossário |
