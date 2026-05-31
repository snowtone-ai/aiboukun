import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

type AibouAvatarStatus = "normal" | "good" | "attention" | "danger" | "thinking";

const statusClassName: Record<AibouAvatarStatus, string> = {
  normal: "bg-accent text-white",
  good: "bg-success text-white",
  attention: "bg-warning text-white",
  danger: "bg-danger text-white",
  thinking: "bg-accent-light text-primary",
};

export function AibouAvatar({ status = "normal" }: { status?: AibouAvatarStatus }) {
  return (
    <div
      className={cn(
        "relative flex size-16 shrink-0 items-center justify-center rounded-full shadow-sm",
        statusClassName[status],
      )}
      aria-label="アイボウくん"
    >
      {status === "thinking" ? <span className="absolute size-16 animate-ping rounded-full bg-accent-light/60" /> : null}
      <Bot className="relative size-8" />
    </div>
  );
}
