import { cn } from "@/lib/utils";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm md:max-w-[68%]",
          isUser ? "bg-primary text-primary-foreground" : "bg-card text-foreground",
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
