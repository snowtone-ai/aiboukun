import { FileText } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { GenerateReportButton } from "@/components/reports/GenerateReportButton";
import { ReportCard } from "@/components/reports/ReportCard";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma/client";

export default async function ReportsPage() {
  const session = await auth();
  const reports = session?.organizationId
    ? await prisma.report.findMany({
        where: { organizationId: session.organizationId },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
    : [];

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">レポート</h1>
          <p className="text-sm text-muted-foreground">口コミ状況を結論先のMarkdownでまとめます。</p>
        </div>
        <GenerateReportButton />
      </div>
      {reports.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      ) : (
        <EmptyState icon={FileText} title="レポートはまだありません" description="週次レポートを生成するとここに蓄積されます。" />
      )}
    </div>
  );
}
