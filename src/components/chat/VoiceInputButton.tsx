"use client";

import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { cn } from "@/lib/utils";

export function VoiceInputButton({ onText }: { onText: (text: string) => void }) {
  const { supported, listening, start } = useVoiceInput(onText);

  if (!supported) {
    return null;
  }

  return (
    <Button type="button" variant="ghost" size="icon" onClick={start} className={cn("rounded-full", listening && "animate-pulse text-danger")}>
      <Mic className="size-4" />
      <span className="sr-only">音声入力</span>
    </Button>
  );
}
