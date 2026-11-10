// One validator for the contact form, used by the browser (to show field errors
// before sending) and by the server function (the check that actually counts).
// It replaces a zod schema: zod was the only reason 52 kB of schema library sat
// in the entry chunk shipped to every page.
export const TOPICS = [
  "Prospective member",
  "Alumni",
  "Sponsor / Recruiter",
  "Press",
  "Other",
] as const;

export type InquiryField = "topic" | "name" | "email" | "message";

export type Inquiry = {
  topic: (typeof TOPICS)[number];
  name: string;
  email: string;
  message: string;
};

export type InquiryErrors = Partial<Record<InquiryField, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateInquiry(
  input: Record<InquiryField, unknown>,
): { ok: true; data: Inquiry } | { ok: false; errors: InquiryErrors } {
  const errors: InquiryErrors = {};
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const topic = str(input.topic);
  const name = str(input.name);
  const email = str(input.email);
  const message = str(input.message);

  if (!(TOPICS as readonly string[]).includes(topic)) errors.topic = "Please choose a topic";
  if (name.length < 1) errors.name = "Name is required";
  else if (name.length > 120) errors.name = "Name must be under 120 characters";
  if (email.length > 255 || !EMAIL.test(email)) errors.email = "Enter a valid email";
  if (message.length < 20) errors.message = "Message must be at least 20 characters";
  else if (message.length > 4000) errors.message = "Message must be under 4000 characters";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { topic: topic as Inquiry["topic"], name, email, message } };
}
