"use client";

import { useState } from "react";
import { CommandInput } from "./CommandInput";
import { MessageList } from "./MessageList";
import type { ChatMessage } from "./MessageBubble";

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content: "口コミ確認、返信案作成、レポート作成までここから依頼できます。",
  },
];

export function ChatContainer() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [sending, setSending] = useState(false);

  async function sendMessage(content: string) {
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content };
    setMessages((current) => [...current, userMessage]);
    setSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });
      const payload = await response.json();
      const reply = payload.ok ? payload.data.message : "処理に失敗しました。時間をおいてもう一度試してください。";

      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", content: reply }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl flex-col">
      <div className="flex-1 pb-6">
        <MessageList messages={messages} />
      </div>
      <div className="sticky bottom-20 bg-background pt-3 md:bottom-6">
        <CommandInput onSend={sendMessage} disabled={sending} />
      </div>
    </section>
  );
}
