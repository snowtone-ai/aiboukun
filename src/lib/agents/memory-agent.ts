import { prisma } from "@/lib/prisma/client";

const memoryTtlDays = 180;
const maxPhraseLength = 50;

export async function learnReplyStyle(input: {
  draftId: string;
  organizationId: string;
  userId: string;
}) {
  const draft = await prisma.replyDraft.findFirst({
    where: { id: input.draftId, review: { store: { organizationId: input.organizationId } } },
    include: { review: true },
  });

  if (!draft?.ownerFinalText || draft.ownerFinalText === draft.aiInitialText) {
    return null;
  }

  const diffSummary = summarizeDiff(draft.aiInitialText, draft.ownerFinalText);
  const revision = await prisma.replyRevision.create({
    data: {
      draftId: draft.id,
      beforeText: draft.aiInitialText,
      afterText: draft.ownerFinalText,
      diffSummary,
      createdByUserId: input.userId,
    },
  });

  await prisma.aIStyleMemory.deleteMany({
    where: {
      organizationId: input.organizationId,
      expiresAt: { lte: new Date() },
    },
  });

  const existing = await findStoreStyleMemory(input.organizationId, draft.review.storeId);
  const confidence = Math.min(1, (existing?.confidence ?? 0.5) + 0.08);
  const value = {
    tone: diffSummary.tone,
    lengthPreference: diffSummary.lengthPreference,
    preferredPhrases: diffSummary.preferredPhrases,
    ngWords: diffSummary.removedPhrases,
    learnedAt: new Date().toISOString(),
  };
  const expiresAt = new Date(Date.now() + memoryTtlDays * 24 * 60 * 60 * 1000);

  const memory = await prisma.aIStyleMemory.upsert({
    where: {
      organizationId_storeId_scope_key: {
        organizationId: input.organizationId,
        storeId: draft.review.storeId,
        scope: "STORE",
        key: "reply-style",
      },
    },
    update: { value, confidence, expiresAt },
    create: {
      organizationId: input.organizationId,
      storeId: draft.review.storeId,
      scope: "STORE",
      key: "reply-style",
      value,
      confidence,
      expiresAt,
    },
  });

  return { revision, memory };
}

function findStoreStyleMemory(organizationId: string, storeId: string) {
  return prisma.aIStyleMemory.findUnique({
    where: {
      organizationId_storeId_scope_key: {
        organizationId,
        storeId,
        scope: "STORE",
        key: "reply-style",
      },
    },
  });
}

function summarizeDiff(before: string, after: string) {
  const beforeParts = splitJapanesePhrases(before);
  const afterParts = splitJapanesePhrases(after);
  const preferredPhrases = afterParts.filter((phrase) => !beforeParts.includes(phrase)).slice(0, 8);
  const removedPhrases = beforeParts.filter((phrase) => !afterParts.includes(phrase)).slice(0, 8);

  return {
    lengthPreference: after.length > before.length * 1.15 ? "longer" : after.length < before.length * 0.85 ? "shorter" : "similar",
    tone: after.includes("申し訳") || after.includes("お詫び") ? "apologetic" : after.includes("ありがとう") ? "warm" : "polite",
    preferredPhrases,
    removedPhrases,
  };
}

function splitJapanesePhrases(text: string) {
  return text
    .split(/[。、\n]/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 3)
    .filter((item) => item.length <= maxPhraseLength)
    .filter((item) => !containsPersonalData(item));
}

function containsPersonalData(value: string) {
  return [emailPattern, phonePattern, postalCodePattern, namedCustomerPattern].some((pattern) => pattern.test(value));
}

const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const phonePattern = /(?:\+81[-\s]?)?0\d{1,4}[-\s]?\d{1,4}[-\s]?\d{3,4}/;
const postalCodePattern = /\d{3}[-\s]?\d{4}/;
const namedCustomerPattern = /(?:[一-龠ぁ-んァ-ヶA-Za-z]{1,20})(?:様|さん|さま)/;
