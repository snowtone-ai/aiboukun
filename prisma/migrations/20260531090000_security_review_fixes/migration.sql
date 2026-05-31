-- Add reply posting lock state.
ALTER TYPE "DraftStatus" ADD VALUE IF NOT EXISTS 'POSTING' BEFORE 'POSTED';

-- Prevent duplicate auto-created memberships and duplicate stored Google connections.
CREATE UNIQUE INDEX "OrganizationMember_userId_key" ON "OrganizationMember"("userId");
CREATE UNIQUE INDEX "GoogleConnection_organizationId_userId_provider_key"
  ON "GoogleConnection"("organizationId", "userId", "provider");

-- Keep only the current reply style memory per store and make stale memory expirable.
ALTER TABLE "AIStyleMemory" ADD COLUMN "expiresAt" TIMESTAMP(3);
CREATE UNIQUE INDEX "AIStyleMemory_organizationId_storeId_scope_key_key"
  ON "AIStyleMemory"("organizationId", "storeId", "scope", "key");

-- Defense-in-depth RLS policies for tenant-owned data.
CREATE OR REPLACE FUNCTION current_app_organization_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT NULLIF(current_setting('app.organization_id', true), '')
$$;

ALTER TABLE "Store" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "Store";
CREATE POLICY "tenant_isolation" ON "Store"
  USING ("organizationId" = current_app_organization_id())
  WITH CHECK ("organizationId" = current_app_organization_id());

ALTER TABLE "GoogleConnection" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "GoogleConnection";
CREATE POLICY "tenant_isolation" ON "GoogleConnection"
  USING ("organizationId" = current_app_organization_id())
  WITH CHECK ("organizationId" = current_app_organization_id());

ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "AuditLog";
CREATE POLICY "tenant_isolation" ON "AuditLog"
  USING ("organizationId" = current_app_organization_id())
  WITH CHECK ("organizationId" = current_app_organization_id());

ALTER TABLE "AIStyleMemory" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "AIStyleMemory";
CREATE POLICY "tenant_isolation" ON "AIStyleMemory"
  USING ("organizationId" = current_app_organization_id())
  WITH CHECK ("organizationId" = current_app_organization_id());

ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "Review";
CREATE POLICY "tenant_isolation" ON "Review"
  USING (
    EXISTS (
      SELECT 1 FROM "Store"
      WHERE "Store"."id" = "Review"."storeId"
        AND "Store"."organizationId" = current_app_organization_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Store"
      WHERE "Store"."id" = "Review"."storeId"
        AND "Store"."organizationId" = current_app_organization_id()
    )
  );

ALTER TABLE "ReplyDraft" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "ReplyDraft";
CREATE POLICY "tenant_isolation" ON "ReplyDraft"
  USING (
    EXISTS (
      SELECT 1 FROM "Review"
      JOIN "Store" ON "Store"."id" = "Review"."storeId"
      WHERE "Review"."id" = "ReplyDraft"."reviewId"
        AND "Store"."organizationId" = current_app_organization_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Review"
      JOIN "Store" ON "Store"."id" = "Review"."storeId"
      WHERE "Review"."id" = "ReplyDraft"."reviewId"
        AND "Store"."organizationId" = current_app_organization_id()
    )
  );

ALTER TABLE "GoogleBusinessProfile" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "GoogleBusinessProfile";
CREATE POLICY "tenant_isolation" ON "GoogleBusinessProfile"
  USING (
    EXISTS (
      SELECT 1 FROM "Store"
      WHERE "Store"."id" = "GoogleBusinessProfile"."storeId"
        AND "Store"."organizationId" = current_app_organization_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Store"
      WHERE "Store"."id" = "GoogleBusinessProfile"."storeId"
        AND "Store"."organizationId" = current_app_organization_id()
    )
  );

ALTER TABLE "ReviewReply" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "ReviewReply";
CREATE POLICY "tenant_isolation" ON "ReviewReply"
  USING (
    EXISTS (
      SELECT 1 FROM "Review"
      JOIN "Store" ON "Store"."id" = "Review"."storeId"
      WHERE "Review"."id" = "ReviewReply"."reviewId"
        AND "Store"."organizationId" = current_app_organization_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Review"
      JOIN "Store" ON "Store"."id" = "Review"."storeId"
      WHERE "Review"."id" = "ReviewReply"."reviewId"
        AND "Store"."organizationId" = current_app_organization_id()
    )
  );

ALTER TABLE "RiskFlag" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "RiskFlag";
CREATE POLICY "tenant_isolation" ON "RiskFlag"
  USING (
    EXISTS (
      SELECT 1 FROM "Review"
      JOIN "Store" ON "Store"."id" = "Review"."storeId"
      WHERE "Review"."id" = "RiskFlag"."reviewId"
        AND "Store"."organizationId" = current_app_organization_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Review"
      JOIN "Store" ON "Store"."id" = "Review"."storeId"
      WHERE "Review"."id" = "RiskFlag"."reviewId"
        AND "Store"."organizationId" = current_app_organization_id()
    )
  );
