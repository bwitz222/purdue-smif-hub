import { createServerFn } from "@tanstack/react-start";
import { validateInquiry } from "@/lib/contact-validation";

// The contact form used to insert from the browser with the full supabase-js
// client (about 220 kB of auth, realtime and storage code on /contact for one
// row). It now posts here and the server writes the row with the service client.
// Validation is repeated on the server because the browser check is only for
// field-level messages; this one is the gate.
const MAX_PER_SENDER_PER_HOUR = 3;
const MAX_OVERALL_PER_10_MIN = 20;

export const submitInquiry = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    const d = (data ?? {}) as Record<string, unknown>;
    const parsed = validateInquiry({
      topic: d.topic,
      name: d.name,
      email: d.email,
      message: d.message,
    });
    if (!parsed.ok) throw new Error("Invalid inquiry");
    // Honeypot: a filled hidden field means a bot. Accept silently, store nothing.
    const honeypot = typeof d.company === "string" && d.company.trim().length > 0;
    return { inquiry: parsed.data, honeypot };
  })
  .handler(async ({ data }) => {
    if (data.honeypot) return { ok: true as const };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Flood guard. The endpoint is public and unauthenticated, and the honeypot
    // only stops naive bots, so one script could fill the table. Two cheap caps
    // read from the table itself (serverless instances share no memory, so an
    // in-process counter would not hold): a few messages per address per hour,
    // and a ceiling on all messages in ten minutes. A failed count never blocks
    // a real message.
    const since = (ms: number) => new Date(Date.now() - ms).toISOString();
    const [perSender, overall] = await Promise.all([
      supabaseAdmin
        .from("contact_inquiries")
        .select("id", { count: "exact", head: true })
        .eq("email", data.inquiry.email)
        .gte("created_at", since(60 * 60 * 1000)),
      supabaseAdmin
        .from("contact_inquiries")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since(10 * 60 * 1000)),
    ]);
    if (
      (perSender.count ?? 0) >= MAX_PER_SENDER_PER_HOUR ||
      (overall.count ?? 0) >= MAX_OVERALL_PER_10_MIN
    ) {
      console.warn("[contact] throttled:", perSender.count, overall.count);
      throw new Error("Too many messages");
    }

    const { error } = await supabaseAdmin.from("contact_inquiries").insert({
      topic: data.inquiry.topic,
      name: data.inquiry.name,
      email: data.inquiry.email,
      message: data.inquiry.message,
      company: null,
    });
    if (error) {
      console.error("[contact] insert failed:", error.message);
      throw new Error("Could not save inquiry");
    }
    return { ok: true as const };
  });
