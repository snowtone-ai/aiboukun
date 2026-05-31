import type { ChatMessage } from "./MessageBubble";
import { MessageBubble } from "./MessageBubble";

export function MessageList({ messages }: { messages: ChatMessage[] }) {
  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
}
