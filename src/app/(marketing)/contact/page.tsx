import { ContactForm } from "@/components/marketing/ContactForm";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">問い合わせ</h1>
      <p className="mt-3 text-sm text-muted-foreground">導入相談、契約、Google連携の不明点はこちらから送信できます。</p>
      <ContactForm />
    </main>
  );
}
