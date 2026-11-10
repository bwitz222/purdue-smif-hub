import { createServerFn } from "@tanstack/react-start";
import { validateInquiry } from "@/lib/contact-validation";

// The contact form used to insert from the browser with the full supabase-js
// client (about 220 kB of auth, realtime and storage code on /contact for one
// row). It now posts here and the server writes the row with the service client.
// Validation is repeated on the server because the browser check is only for
// field-level messages; this one is the gate.
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
