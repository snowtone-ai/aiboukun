export function formatDate(value?: Date | string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(value?: Date | string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatNumber(value: number, digits = 0) {
  return new Intl.NumberFormat("ja-JP", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

export const replyStatusLabel: Record<string, string> = {
  UNREPLIED: "未返信",
  DRAFTED: "下書き",
  APPROVED: "承認済み",
  POSTED: "投稿済み",
  SKIPPED: "対応不要",
};

export const riskLevelLabel: Record<string, string> = {
  NORMAL: "通常",
  ATTENTION: "注意",
  URGENT: "至急",
  LEGAL: "法務",
  MEDICAL: "医療",
  PRIVACY: "個人情報",
  SAFETY: "安全",
};

export const priorityLabel: Record<string, string> = {
  LOW: "低",
  MEDIUM: "中",
  HIGH: "高",
  URGENT: "至急",
};

export const taskStatusLabel: Record<string, string> = {
  TODO: "未着手",
  DOING: "進行中",
  DONE: "完了",
  DISMISSED: "不要",
};
