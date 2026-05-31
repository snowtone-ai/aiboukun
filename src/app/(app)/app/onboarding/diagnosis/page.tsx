import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma/client";
import { DiagnosisReport } from "@/components/onboarding/DiagnosisReport";

export default async function DiagnosisPage() {
  const session = await auth();
  const organizationId = session?.organizationId;

  if (!organizationId) {
    return <DiagnosisReport unrepliedCount={0} lowRatingCount={0} averageRating={0} />;
  }

  const [unrepliedCount, lowRatingCount, average] = await Promise.all([
    prisma.review.count({ where: { replyStatus: "UNREPLIED", store: { organizationId } } }),
    prisma.review.count({ where: { rating: { lte: 3 }, store: { organizationId } } }),
    prisma.review.aggregate({ where: { store: { organizationId } }, _avg: { rating: true } }),
  ]);

  return <DiagnosisReport unrepliedCount={unrepliedCount} lowRatingCount={lowRatingCount} averageRating={average._avg.rating ?? 0} />;
}
