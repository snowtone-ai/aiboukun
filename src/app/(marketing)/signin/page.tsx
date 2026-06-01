import Link from "next/link";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

type SignInPageProps = {
  searchParams?: Promise<{ callbackUrl?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const callbackUrl = params?.callbackUrl && params.callbackUrl.startsWith("/") ? params.callbackUrl : "/app";

  return (
    <main className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border bg-card p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-primary">アイボウくんにログイン</p>
        <h1 className="mt-3 text-2xl font-semibold">Google アカウントで続行</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Google Business Profile 連携に必要な権限を確認してから、アプリへ戻ります。
        </p>
        <GoogleSignInButton callbackUrl={callbackUrl} />
        <Link href="/" className="mt-5 inline-block text-sm text-muted-foreground underline-offset-4 hover:underline">
          トップへ戻る
        </Link>
      </div>
    </main>
  );
}
