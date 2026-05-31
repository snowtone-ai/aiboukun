"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VoiceInputButton } from "./VoiceInputButton";

type CommandInputProps = {
  onSend: (message: string) => Promise<void> | void;
  disabled?: boolean;
};

export function CommandInput({ onSend, disabled }: CommandInputProps) {
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = message.trim();

    if (!trimmed || disabled) {
      return;
    }

    setMessage("");
    await onSend(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 rounded-2xl border bg-card p-2 shadow-sm">
      <Textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="アイボウくんに依頼する"
        className="min-h-12 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
        rows={1}
      />
      <VoiceInputButton onText={(text) => setMessage((current) => [current, text].filter(Boolean).join(" "))} />
      <Button type="submit" size="icon" className="shrink-0 rounded-full" disabled={disabled || !message.trim()} aria-label="送信">
        <Send className="size-4" />
      </Button>
    </form>
  );
}
