import type { z } from "zod";
import type {
  AgentAction,
  AIStyleMemory,
  Area,
  AuditLog,
  Brand,
  Competitor,
  CompetitorSnapshot,
  GoogleApiCallLog,
  GoogleBusinessProfile,
  GoogleConnection,
  IndustryTemplate,
  Insight,
  LLMUsageLog,
  Notification,
  Organization,
  OrganizationMember,
  ReplyDraft,
  ReplyRevision,
  Report,
  Review,
  ReviewReply,
  RiskFlag,
  Store,
  Task,
  User,
} from "../../prisma/generated/client/client";
import type { chatMessageSchema } from "@/lib/validators/chat";

export type {
  AgentAction,
  AIStyleMemory,
  Area,
  AuditLog,
  Brand,
  Competitor,
  CompetitorSnapshot,
  GoogleApiCallLog,
  GoogleBusinessProfile,
  GoogleConnection,
  IndustryTemplate,
  Insight,
  LLMUsageLog,
  Notification,
  Organization,
  OrganizationMember,
  ReplyDraft,
  ReplyRevision,
  Report,
  Review,
  ReviewReply,
  RiskFlag,
  Store,
  Task,
  User,
};
export type { Industry, Priority, ReplyStatus, RiskLevel, Role, Sentiment } from "../../prisma/generated/client/client";

export type ChatIntent =
  | "show_reviews"
  | "filter_reviews"
  | "generate_reply_drafts"
  | "approve_reply"
  | "generate_report"
  | "compare_competitors"
  | "show_tasks"
  | "create_task"
  | "navigate"
  | "unknown";

export type ParsedCommand = {
  intent: ChatIntent;
  storeId?: string;
  ratings?: number[];
  period?: {
    from?: Date;
    to?: Date;
  };
  action?: string;
  route?: string;
  filters?: Record<string, string | number | boolean | string[] | number[]>;
};

export type RiskClassification = {
  level: "NORMAL" | "ATTENTION" | "URGENT" | "LEGAL" | "MEDICAL" | "PRIVACY" | "SAFETY";
  reasons: string[];
  requiresApproval: boolean;
  confidence: number;
};

export type ReplyDiffSummary = {
  changedTone?: string;
  addedPhrases: string[];
  removedPhrases: string[];
  lengthDelta: number;
};

export type AgentRunInput = {
  organizationId: string;
  storeId?: string;
  userId?: string;
  message?: string;
  payload?: unknown;
};

export type AgentRunResult<TData = unknown> = {
  ok: boolean;
  message: string;
  data?: TData;
  actions?: AgentAction[];
};

export type AibouPersona = {
  name: "アイボウくん";
  role: "google_maps_marketing_partner";
  tone: "practical" | "friendly" | "calm";
};

export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: ApiError };

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
