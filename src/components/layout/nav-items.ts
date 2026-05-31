import {
  BarChart3,
  Building2,
  ClipboardList,
  FileText,
  Home,
  MessageSquareText,
  Settings,
  Swords,
} from "lucide-react";

export const navItems = [
  { href: "/app", label: "ホーム", icon: Home },
  { href: "/app/reviews", label: "口コミ", icon: MessageSquareText },
  { href: "/app/analytics", label: "分析", icon: BarChart3 },
  { href: "/app/competitors", label: "競合", icon: Swords },
  { href: "/app/reports", label: "レポート", icon: FileText },
  { href: "/app/tasks", label: "タスク", icon: ClipboardList },
  { href: "/app/stores", label: "店舗", icon: Building2 },
  { href: "/app/settings", label: "設定", icon: Settings },
];
