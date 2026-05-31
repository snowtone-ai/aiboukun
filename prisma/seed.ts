import { PrismaPg } from "@prisma/adapter-pg";
import { Industry, PrismaClient } from "./generated/client/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const templates = [
  {
    industry: Industry.RESTAURANT,
    name: "飲食店",
    replyRules: {
      tone: "warm",
      apologyDepth: "balanced",
      inviteReturnVisit: true,
    },
    ngWords: ["絶対", "必ず改善", "返金します"],
    attributes: ["味", "接客", "清潔感", "提供速度", "価格"],
  },
  {
    industry: Industry.BEAUTY_SALON,
    name: "美容室",
    replyRules: {
      tone: "polite",
      apologyDepth: "careful",
      inviteReturnVisit: true,
    },
    ngWords: ["失敗", "治します", "保証します"],
    attributes: ["技術", "接客", "仕上がり", "待ち時間", "雰囲気"],
  },
  {
    industry: Industry.BODY_CARE,
    name: "整体",
    replyRules: {
      tone: "calm",
      apologyDepth: "careful",
      inviteReturnVisit: false,
    },
    ngWords: ["治療", "治る", "医学的に"],
    attributes: ["施術", "説明", "清潔感", "予約", "接客"],
  },
  {
    industry: Industry.RETAIL,
    name: "小売",
    replyRules: {
      tone: "friendly",
      apologyDepth: "balanced",
      inviteReturnVisit: true,
    },
    ngWords: ["最安", "必ず在庫", "永久保証"],
    attributes: ["品揃え", "接客", "価格", "在庫", "店舗環境"],
  },
];

async function main() {
  for (const template of templates) {
    await prisma.industryTemplate.upsert({
      where: {
        industry_name: {
          industry: template.industry,
          name: template.name,
        },
      },
      update: {
        replyRules: template.replyRules,
        ngWords: template.ngWords,
        attributes: template.attributes,
      },
      create: template,
    });
  }
}

main()
  .catch(async (error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
