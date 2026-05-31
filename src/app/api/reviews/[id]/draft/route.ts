import { prisma } from "@/lib/prisma/client";
import { NotFoundError } from "@/lib/api/errors";
import { createRouteHandler, withOrg, withValidation } from "@/lib/api/middleware";
import { routeParamsSchema } from "@/lib/validators/common";

export const POST = createRouteHandler(
  withOrg(
    withValidation(
      routeParamsSchema,
      async (_request, context) => {
        const review = await prisma.review.findFirst({
          where: { id: context.input.id, store: { organizationId: context.organizationId } },
          include: { store: true },
        });

        if (!review) {
          throw new NotFoundError("Review not found");
        }

        const requiresApproval =
          review.rating <= 3 || ["LEGAL", "MEDICAL", "PRIVACY", "SAFETY", "URGENT"].includes(review.riskLevel);
        const draft = await prisma.replyDraft.create({
          data: {
            reviewId: review.id,
            aiInitialText: buildFallbackReply(review),
            riskLevel: review.riskLevel,
            requiresApproval,
          },
        });

        await prisma.review.update({ where: { id: review.id }, data: { replyStatus: "DRAFTED" } });

        return draft;
      },
      "params",
    ),
  ),
);

function buildFallbackReply(review: { rating: number; authorName: string | null; text: string | null }) {
  const name = review.authorName ? `${review.authorName}様` : "お客様";
  if (review.rating <= 3) {
    return `${name}\nこのたびは貴重なご意見をいただき、ありがとうございます。ご期待に沿えなかった点を真摯に受け止め、内容を確認して改善に努めてまいります。`;
  }

  return `${name}\n温かい口コミをお寄せいただき、ありがとうございます。スタッフ一同励みになります。またのご来店を心よりお待ちしております。`;
}
