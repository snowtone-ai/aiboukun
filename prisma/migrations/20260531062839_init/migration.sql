-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'STAFF', 'VIEWER');

-- CreateEnum
CREATE TYPE "Industry" AS ENUM ('RESTAURANT', 'BEAUTY_SALON', 'DENTAL', 'BEAUTY_CLINIC', 'BODY_CARE', 'HOTEL', 'RETAIL', 'OTHER');

-- CreateEnum
CREATE TYPE "StoreStatus" AS ENUM ('ACTIVE', 'PAUSED', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "Sentiment" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE');

-- CreateEnum
CREATE TYPE "ReplyStatus" AS ENUM ('UNREPLIED', 'DRAFTED', 'APPROVED', 'POSTED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('NORMAL', 'ATTENTION', 'URGENT', 'LEGAL', 'MEDICAL', 'PRIVACY', 'SAFETY');

-- CreateEnum
CREATE TYPE "DraftStatus" AS ENUM ('DRAFT', 'EDITED', 'APPROVED', 'POSTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('REVIEW_REPLY', 'RISK_RESPONSE', 'PROFILE_UPDATE', 'PHOTO_ADD', 'REVIEW_REQUEST', 'SERVICE_IMPROVEMENT', 'COMPETITOR_ACTION');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'DOING', 'DONE', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('WEEKLY', 'MONTHLY', 'HQ', 'STORE_MANAGER');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('UNREAD', 'READ', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AgentActionStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'starter',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Area" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "brandId" TEXT,
    "areaId" TEXT,
    "name" TEXT NOT NULL,
    "industry" "Industry" NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "status" "StoreStatus" NOT NULL DEFAULT 'ACTIVE',
    "nextSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleConnection" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'google',
    "accessTokenEnc" TEXT NOT NULL,
    "refreshTokenEnc" TEXT,
    "expiresAt" TIMESTAMP(3),
    "scopes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleBusinessProfile" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "googleAccountName" TEXT NOT NULL,
    "googleLocationName" TEXT NOT NULL,
    "placeId" TEXT,
    "title" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "raw" JSONB,

    CONSTRAINT "GoogleBusinessProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "googleReviewName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "authorName" TEXT,
    "text" TEXT,
    "postedAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "sentiment" "Sentiment",
    "topics" TEXT[],
    "attributes" TEXT[],
    "replyStatus" "ReplyStatus" NOT NULL DEFAULT 'UNREPLIED',
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'NORMAL',
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReplyDraft" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "aiInitialText" TEXT NOT NULL,
    "ownerFinalText" TEXT,
    "status" "DraftStatus" NOT NULL DEFAULT 'DRAFT',
    "riskLevel" "RiskLevel" NOT NULL,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT true,
    "generatedByActionId" TEXT,
    "approvedByUserId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReplyDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReplyRevision" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "beforeText" TEXT NOT NULL,
    "afterText" TEXT NOT NULL,
    "diffSummary" JSONB NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReplyRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewReply" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "googleReplyName" TEXT,
    "text" TEXT NOT NULL,
    "postedByUserId" TEXT,
    "postedAt" TIMESTAMP(3) NOT NULL,
    "raw" JSONB,

    CONSTRAINT "ReviewReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskFlag" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "level" "RiskLevel" NOT NULL,
    "reasons" TEXT[],
    "autoReplyAllowed" BOOLEAN NOT NULL,
    "approvalRequired" BOOLEAN NOT NULL,
    "recommendedAction" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiskFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competitor" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "placeId" TEXT,
    "mapUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Competitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitorSnapshot" (
    "id" TEXT NOT NULL,
    "competitorId" TEXT NOT NULL,
    "rating" DOUBLE PRECISION,
    "reviewCount" INTEGER,
    "recentReviewCount" INTEGER,
    "photoCount" INTEGER,
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetitorSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Insight" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "storeId" TEXT,
    "type" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "summary" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Insight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT,
    "type" "TaskType" NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "dueDate" TIMESTAMP(3),
    "assigneeUserId" TEXT,
    "sourceAgentActionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "storeId" TEXT,
    "type" "ReportType" NOT NULL,
    "title" TEXT NOT NULL,
    "markdown" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'UNREAD',
    "actionUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentAction" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "agent" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB,
    "status" "AgentActionStatus" NOT NULL,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIStyleMemory" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "storeId" TEXT,
    "scope" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIStyleMemory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndustryTemplate" (
    "id" TEXT NOT NULL,
    "industry" "Industry" NOT NULL,
    "name" TEXT NOT NULL,
    "replyRules" JSONB NOT NULL,
    "ngWords" TEXT[],
    "attributes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IndustryTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LLMUsageLog" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL,
    "outputTokens" INTEGER NOT NULL,
    "estimatedCostJpy" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LLMUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleApiCallLog" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "statusCode" INTEGER,
    "errorCode" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoogleApiCallLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_organizationId_userId_key" ON "OrganizationMember"("organizationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleBusinessProfile_storeId_key" ON "GoogleBusinessProfile"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleBusinessProfile_googleLocationName_key" ON "GoogleBusinessProfile"("googleLocationName");

-- CreateIndex
CREATE UNIQUE INDEX "Review_googleReviewName_key" ON "Review"("googleReviewName");

-- CreateIndex
CREATE UNIQUE INDEX "IndustryTemplate_industry_name_key" ON "IndustryTemplate"("industry", "name");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Area" ADD CONSTRAINT "Area_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoogleBusinessProfile" ADD CONSTRAINT "GoogleBusinessProfile_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplyDraft" ADD CONSTRAINT "ReplyDraft_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplyRevision" ADD CONSTRAINT "ReplyRevision_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ReplyDraft"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewReply" ADD CONSTRAINT "ReviewReply_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskFlag" ADD CONSTRAINT "RiskFlag_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competitor" ADD CONSTRAINT "Competitor_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitorSnapshot" ADD CONSTRAINT "CompetitorSnapshot_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "Competitor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
