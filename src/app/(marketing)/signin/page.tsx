import Link from "next/link";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

type SignInPageProps = {
  searchParams?: Promise<{ callbackUrl?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const callbackUrl = params?.callbackUrl && params.callbackUrl.startsWith("/") ? params.callbackUrl : "/app";
  const showDevLogin = process.env.NODE_ENV !== "production";

  return (
    <main className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border bg-card p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-primary">アイボウくんにログイン</p>
        <h1 className="mt-3 text-2xl font-semibold">Google アカウントで続行</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Google Business Profile 連携に必要な権限を確認してから、アプリへ戻ります。
        </p>
        <GoogleSignInButton callbackUrl={callbackUrl} />
        {showDevLogin ? (
          <form action="/api/dev/login" method="post" className="mt-3">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <button
              type="submit"
              className="w-full rounded-full border border-dashed border-primary/40 px-4 py-3 text-sm font-medium text-primary transition hover:bg-primary/5"
            >
              開発用デモログイン
            </button>
            <p className="mt-2 text-xs text-muted-foreground">ローカル確認専用。Google認証を使わずデモデータで入ります。</p>
          </form>
        ) : null}
        <Link href="/" className="mt-5 inline-block text-sm text-muted-foreground underline-offset-4 hover:underline">
          トップへ戻る
        </Link>
      </div>
    </main>
  );
}
