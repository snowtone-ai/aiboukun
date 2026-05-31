import Link from "next/link";
import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/formatters";

type ReportCardProps = {
  report: {
    id: string;
    title: string;
    summary: string;
    type: string;
    createdAt: Date;
  };
};

export function ReportCard({ report }: ReportCardProps) {
  return (
    <Link href={`/app/reports/${report.id}`}>
      <Card className="transition hover:border-primary/40 hover:shadow-sm">
        <CardContent className="flex gap-3 p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <FileText className="size-5" />
          </span>
          <div className="min-w-0 space-y-1">
            <p className="font-medium">{report.title}</p>
            <p className="text-xs text-muted-foreground">
              {report.type}・{formatDate(report.createdAt)}
            </p>
            <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{report.summary}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
