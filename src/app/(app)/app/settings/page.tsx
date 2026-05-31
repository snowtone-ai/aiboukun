import { SettingsForm } from "@/components/settings/SettingsForm";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma/client";

export default async function SettingsPage() {
  const session = await auth();
  const organization = session?.organizationId
    ? await prisma.organization.findUnique({ where: { id: session.organizationId } })
    : null;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">設定</h1>
        <p className="text-sm text-muted-foreground">店舗運用、AI返信、通知の基本設定を管理します。</p>
      </div>
      <SettingsForm organizationName={organization?.name ?? ""} role={session?.role ?? "VIEWER"} />
    </div>
  );
}
