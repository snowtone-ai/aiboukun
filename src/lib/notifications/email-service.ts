import { googleErrorTemplate } from "@/lib/notifications/templates/google-error";
import { lowRatingAlertTemplate } from "@/lib/notifications/templates/low-rating-alert";
import { reportReadyTemplate } from "@/lib/notifications/templates/report-ready";

export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
};

export async function sendEmail(input: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "noreply@aiboukun.local";

  if (!apiKey) {
    console.info("[email:dev]", { to: input.to, subject: input.subject, text: input.text });
    return { mode: "console" as const };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: input.to, subject: input.subject, text: input.text }),
  });

  if (!response.ok) {
    throw new Error(`Email provider error: ${response.status}`);
  }

  return { mode: "resend" as const, response: await response.json() };
}

export function buildLowRatingEmail(input: { storeName: string; rating: number; reviewText?: string }) {
  return lowRatingAlertTemplate(input);
}

export function buildReportReadyEmail(input: { title: string; url?: string }) {
  return reportReadyTemplate(input);
}

export function buildGoogleErrorEmail(input: { storeName?: string; message: string }) {
  return googleErrorTemplate(input);
}
