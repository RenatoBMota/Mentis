-- PsiFlow — Row-Level Security (PRD 5.5)
--
-- Segunda camada de defesa de isolamento multi-tenant, independente da lógica
-- de aplicação. Aplicar via migração manual (`prisma migrate dev --create-only`
-- + colar este conteúdo) após a migração inicial do schema.
--
-- A aplicação deve setar o tenant da sessão em cada conexão/transação com:
--   SET LOCAL app.current_tenant_id = '<tenant-uuid>';
-- (ex.: em um middleware do Prisma que envolve cada request em uma transação).

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_patients ON patients
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_tags ON tags
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_audit_logs ON audit_logs
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_subscriptions ON subscriptions
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- Tabelas relacionadas por FK (appointments, session_records, medical_records,
-- financial_transactions, notifications, invoices, attachments,
-- medical_record_tags) não têm tenant_id direto; herdam o isolamento via join
-- com patients/users nas políticas de aplicação. Se o modelo evoluir para
-- exigir RLS direto nessas tabelas, adicionar tenant_id desnormalizado + policy
-- análoga às acima.
