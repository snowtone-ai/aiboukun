"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

type GoogleSignInButtonProps = {
  callbackUrl: string;
};

export function GoogleSignInButton({ callbackUrl }: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <button
      className="mt-6 w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-70"
      disabled={isLoading}
      onClick={() => {
        setIsLoading(true);
        void signIn("google", { redirectTo: callbackUrl });
      }}
      type="button"
    >
      {isLoading ? "Google認証へ移動中..." : "Googleでログイン"}
    </button>
  );
}
