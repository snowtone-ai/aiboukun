import { prisma } from "@/lib/prisma/client";
import { createRouteHandler, withOrg, withValidation } from "@/lib/api/middleware";
import { reportGenerateSchema } from "@/lib/validators/workflows";

export const POST = createRouteHandler(
  withOrg(
    withValidation(reportGenerateSchema, async (_request, context) => {
      const periodEnd = context.input.periodEnd ?? new Date();
      const periodStart = context.input.periodStart ?? new Date(periodEnd.getTime() - 7 * 24 * 60 * 60 * 1_000);
      const reviews = await prisma.review.findMany({
        where: {
          store: { organizationId: context.organizationId },
          ...(context.input.storeId ? { storeId: context.input.storeId } : {}),
          postedAt: { gte: periodStart, lte: periodEnd },
        },
        include: { store: { select: { name: true } } },
        orderBy: { postedAt: "desc" },
      });
      const total = reviews.length;
      const average = total ? reviews.reduce((sum, review) => sum + review.rating, 0) / total : 0;
      const low = reviews.filter((review) => review.rating <= 3).length;
      const unreplied = reviews.filter((review) => review.replyStatus === "UNREPLIED").length;
      const title = `${context.input.type === "MONTHLY" ? "月次" : "週次"}口コミレポート`;
      const summary = total
        ? `対象期間の口コミは${total}件、平均評価は${average.toFixed(1)}です。低評価${low}件、未返信${unreplied}件を優先確認してください。`
        : "対象期間の口コミはまだありません。";
      const markdown = [
        `# ${title}`,
        "",
        "## 結論",
        summary,
        "",
        "## 数字",
        `- 口コミ数: ${total}`,
        `- 平均評価: ${average.toFixed(1)}`,
        `- 星3以下: ${low}`,
        `- 未返信: ${unreplied}`,
        "",
        "## やるべきこと",
        "1. 星3以下の口コミを事実確認する",
        "2. 未返信口コミの返信案を承認する",
        "3. 頻出トピックを店舗ミーティングで共有する",
      ].join("\n");

      return prisma.report.create({
        data: {
          organizationId: context.organizationId!,
          ...(context.input.storeId ? { storeId: context.input.storeId } : {}),
          type: context.input.type,
          title,
          summary,
          markdown,
          periodStart,
          periodEnd,
        },
      });
    }),
  ),
);
