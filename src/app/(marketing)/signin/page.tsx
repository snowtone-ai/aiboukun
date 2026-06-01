import Link from "next/link";
import { redirect } from "next/navigation";

type SignInPageProps = {
  searchParams?: Promise<{ callbackUrl?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const callbackUrl = params?.callbackUrl && params.callbackUrl.startsWith("/") ? params.callbackUrl : "/app";
  const target = `/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  redirect(target);

  return (
    <main className="flex min-h-[70vh] items-center justify-center p-6">
      <Link href={target} className="rounded-full border px-6 py-3 text-sm font-medium">
        Googleでログイン
      </Link>
    </main>
  );
}
