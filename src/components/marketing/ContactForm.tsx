"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function submit(formData: FormData) {
    startTransition(async () => {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });
      setSent(true);
    });
  }

  return (
    <form action={submit} className="mt-8 grid gap-4">
      <Input name="name" placeholder="名前" required />
      <Input name="email" type="email" placeholder="メール" required />
      <Input name="subject" placeholder="件名" required />
      <Textarea name="body" placeholder="本文" required className="min-h-40" />
      <Button disabled={isPending || sent}>
        <Send className="size-4" />
        {sent ? "送信済み" : "送信"}
      </Button>
    </form>
  );
}
