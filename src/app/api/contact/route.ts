import { z } from "zod";
import { createRouteHandler, withValidation } from "@/lib/api/middleware";
import { sendEmail } from "@/lib/notifications/email-service";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.email(),
  subject: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(2_000),
});

export const POST = createRouteHandler(
  withValidation(contactSchema, async (_request, context) => {
    await sendEmail({
      to: process.env.CONTACT_TO ?? "support@aiboukun.local",
      subject: `問い合わせ: ${context.input.subject}`,
      text: `名前: ${context.input.name}\nメール: ${context.input.email}\n\n${context.input.body}`,
    });

    return { received: true };
  }),
);
