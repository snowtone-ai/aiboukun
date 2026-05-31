import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ReportMarkdownViewer } from "@/components/reports/ReportMarkdownViewer";
import { auth } from "@/lib/auth";
import { formatDate } from "@/lib/formatters";
import { prisma } from "@/lib/prisma/client";

type ReportDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
  const [{ id }, session] = await Promise.all([params, auth()]);
  const report = session?.organizationId
    ? await prisma.report.findFirst({ where: { id, organizationId: session.organizationId } })
    : null;
  if (!report) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">{report.title}</h1>
        <p className="text-sm text-muted-foreground">
          {report.type}・{formatDate(report.periodStart)} - {formatDate(report.periodEnd)}
        </p>
      </div>
      <Card>
        <CardContent className="p-6">
          <ReportMarkdownViewer markdown={report.markdown} />
        </CardContent>
      </Card>
    </div>
  );
}
