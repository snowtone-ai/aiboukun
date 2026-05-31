import { prisma } from "@/lib/prisma/client";
import { GoogleBusinessProfileClient } from "@/lib/google/gbp-client";
import { googleRatingToNumber } from "@/lib/google/types";

const maxReviewSyncPages = 50;

type SyncOptions = {
  pageToken?: string;
  maxPages?: number;
};

export async function syncReviewsForStore(storeId: string, organizationId: string, options: SyncOptions = {}) {
  const store = await prisma.store.findFirst({
    where: { id: storeId, organizationId },
    include: { gbp: true },
  });

  if (!store?.gbp) {
    throw new Error("Google Business Profile location is not linked.");
  }

  const connection = await prisma.googleConnection.findFirst({
    where: { organizationId, scopes: { has: "https://www.googleapis.com/auth/business.manage" } },
    orderBy: { updatedAt: "desc" },
  });

  if (!connection) {
    throw new Error("Google connection is required.");
  }

  const client = new GoogleBusinessProfileClient({
    organizationId,
    accessTokenEnc: connection.accessTokenEnc,
  });

  let pageToken = options.pageToken;
  let imported = 0;
  let pagesFetched = 0;

  do {
    if (pagesFetched >= (options.maxPages ?? maxReviewSyncPages)) {
      break;
    }

    const page = await client.listReviews(store.gbp.googleLocationName, pageToken);
    pagesFetched += 1;

    for (const review of page.items) {
      const rating = googleRatingToNumber(review.starRating);
      if (!review.name || rating === 0) {
        continue;
      }

      await prisma.review.upsert({
        where: { googleReviewName: review.name },
        update: {
          rating,
          authorName: review.reviewer?.displayName,
          text: review.comment,
          updatedAt: review.updateTime ? new Date(review.updateTime) : undefined,
          raw: review as object,
        },
        create: {
          storeId,
          googleReviewName: review.name,
          rating,
          authorName: review.reviewer?.displayName,
          text: review.comment,
          postedAt: review.createTime ? new Date(review.createTime) : new Date(),
          updatedAt: review.updateTime ? new Date(review.updateTime) : undefined,
          replyStatus: review.reviewReply?.comment ? "POSTED" : "UNREPLIED",
          raw: review as object,
        },
      });
      imported += 1;
    }
    pageToken = page.nextPageToken;
  } while (pageToken);

  await prisma.store.update({
    where: { id: storeId },
    data: { nextSyncAt: new Date(Date.now() + 1000 * 60 * 60 * 6) },
  });

  return {
    storeId,
    imported,
    pagesFetched,
    truncated: Boolean(pageToken),
    nextPageToken: pageToken,
  };
}
