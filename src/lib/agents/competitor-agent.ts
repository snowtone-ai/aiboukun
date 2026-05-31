import { prisma } from "@/lib/prisma/client";

type CompareInput = {
  organizationId: string;
  storeId?: string;
};

export class CompetitorAgent {
  async compare(input: CompareInput) {
    const competitors = await prisma.competitor.findMany({
      where: {
        store: { organizationId: input.organizationId },
        ...(input.storeId ? { storeId: input.storeId } : {}),
      },
      include: {
        store: { select: { id: true, name: true } },
        snapshots: { orderBy: { capturedAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    const wins: string[] = [];
    const losses: string[] = [];
    const recommendedTasks: string[] = [];

    for (const competitor of competitors) {
      const latest = competitor.snapshots[0];
      if (!latest) {
        recommendedTasks.push(`${competitor.name}の最新評価を記録する`);
        continue;
      }
      if ((latest.rating ?? 0) >= 4.3) {
        losses.push(`${competitor.name}は評価${latest.rating?.toFixed(1)}で強い状態です`);
      }
      for (const weakness of latest.weaknesses.slice(0, 2)) {
        wins.push(`${competitor.name}の弱み: ${weakness}`);
      }
      for (const strength of latest.strengths.slice(0, 2)) {
        recommendedTasks.push(`${strength}への対抗施策を検討する`);
      }
    }

    return {
      summary: competitors.length
        ? `競合${competitors.length}件を比較しました。強みは口コミ返信と店舗改善タスクに分解して進めます。`
        : "競合はまだ登録されていません。",
      wins: wins.slice(0, 6),
      losses: losses.slice(0, 6),
      recommendedTasks: recommendedTasks.slice(0, 5),
      competitors,
    };
  }
}
