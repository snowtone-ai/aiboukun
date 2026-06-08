import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const formData = await request.formData();
  const requestedCallback = String(formData.get("callbackUrl") ?? "/app");
  const callbackUrl = requestedCallback.startsWith("/") ? requestedCallback : "/app";

  const user = await prisma.user.upsert({
    where: { email: "demo@aiboukun.local" },
    update: { name: "デモオーナー" },
    create: {
      email: "demo@aiboukun.local",
      name: "デモオーナー",
      emailVerified: new Date(),
    },
  });

  const membership = await ensureDemoWorkspace(user.id);
  const sessionToken = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

  await prisma.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expires,
    },
  });

  const response = NextResponse.redirect(new URL(callbackUrl, request.url));
  response.cookies.set("authjs.session-token", sessionToken, {
    expires,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  response.cookies.set("aiboukun-dev-org", membership.organizationId, {
    expires,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return response;
}

async function ensureDemoWorkspace(userId: string) {
  const existing = await prisma.organizationMember.findUnique({
    where: { userId },
  });

  if (existing) {
    await ensureDemoData(existing.organizationId);
    return existing;
  }

  const organization = await prisma.organization.create({
    data: {
      name: "アイボウくん デモ店舗",
      members: {
        create: {
          userId,
          role: "OWNER",
        },
      },
    },
    include: { members: true },
  });

  await ensureDemoData(organization.id);
  return organization.members[0];
}

async function ensureDemoData(organizationId: string) {
  const existingStore = await prisma.store.findFirst({
    where: { organizationId },
    select: { id: true },
  });

  if (existingStore) {
    return;
  }

  const store = await prisma.store.create({
    data: {
      organizationId,
      name: "喫茶アイボウ 渋谷店",
      industry: "RESTAURANT",
      address: "東京都渋谷区道玄坂 1-2-3",
      phone: "03-0000-0000",
    },
  });

  await prisma.review.createMany({
    data: [
      {
        storeId: store.id,
        googleReviewName: "demo/reviews/001",
        rating: 5,
        authorName: "佐藤 花子",
        text: "接客が丁寧で、ランチの提供も早かったです。また利用します。",
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        sentiment: "POSITIVE",
        topics: ["接客", "ランチ"],
        attributes: ["speed", "hospitality"],
        replyStatus: "DRAFTED",
        riskLevel: "NORMAL",
      },
      {
        storeId: store.id,
        googleReviewName: "demo/reviews/002",
        rating: 2,
        authorName: "田中 太郎",
        text: "予約したのに待ち時間が長く、案内も少し不安でした。",
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
        sentiment: "NEGATIVE",
        topics: ["待ち時間", "予約"],
        attributes: ["wait_time"],
        replyStatus: "UNREPLIED",
        riskLevel: "ATTENTION",
      },
      {
        storeId: store.id,
        googleReviewName: "demo/reviews/003",
        rating: 4,
        authorName: "山本 美咲",
        text: "雰囲気がよく、スタッフさんの声かけも自然でした。",
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        sentiment: "POSITIVE",
        topics: ["雰囲気", "接客"],
        attributes: ["atmosphere"],
        replyStatus: "POSTED",
        riskLevel: "NORMAL",
      },
    ],
  });

  const review = await prisma.review.findUniqueOrThrow({
    where: { googleReviewName: "demo/reviews/001" },
  });

  await prisma.replyDraft.create({
    data: {
      reviewId: review.id,
      aiInitialText:
        "佐藤様、このたびはご来店と温かい口コミをありがとうございます。接客と提供スピードを評価いただけて大変励みになります。またのご来店を心よりお待ちしております。",
      riskLevel: "NORMAL",
      requiresApproval: true,
    },
  });

  await prisma.task.createMany({
    data: [
      {
        storeId: store.id,
        title: "低評価口コミへの一次対応方針を確認",
        detail: "待ち時間に関する口コミへ、事実確認後に人が承認して返信します。",
        type: "RISK_RESPONSE",
        priority: "HIGH",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
      {
        storeId: store.id,
        title: "ランチ時間帯の案内文を見直す",
        type: "SERVICE_IMPROVEMENT",
        priority: "MEDIUM",
      },
    ],
  });

  await prisma.report.create({
    data: {
      organizationId,
      storeId: store.id,
      type: "WEEKLY",
      title: "今週の口コミ改善レポート",
      summary: "高評価は接客と雰囲気が中心。待ち時間への改善余地があります。",
      markdown:
        "## 今週の要点\n\n- 接客評価が安定しています。\n- 待ち時間に関する不満が1件あります。\n- 低評価口コミは人が確認してから返信してください。\n",
      periodStart: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      periodEnd: new Date(),
    },
  });
}
