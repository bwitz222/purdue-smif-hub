import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Linkedin, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({
    meta: [
      { title: "Contact — Purdue SMIF" },
      { name: "description", content: "Get in touch with the Purdue Student Managed Investment Fund." },
    ],
  }),
});

const schema = z.object({
  first_name: z.string().trim().min(1, "Required").max(100),
  last_name: z.string().trim().min(1, "Required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  subject: z.string().trim().min(1, "Required").max(200),
  message: z.string().trim().min(10, "Please write at least 10 characters").max(5000),
});

type FormData = z.infer<typeof schema>;
type Errors = Partial<Record<keyof FormData, string>>;

const emptyForm: FormData = { first_name: "", last_name: "", email: "", subject: "", message: "" };

function Contact() {
  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const update = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormData;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    const { error } = await supabase.from("contact_submissions").insert(parsed.data);
    if (error) {
      setStatus("error");
      setErrorMsg("Could not send your message. Please try again or email us directly.");
      return;
    }
    setStatus("success");
    setForm(emptyForm);
  };

  const inputCls = (k: keyof FormData) =>
    `w-full border bg-background px-4 py-3 text-sm focus:outline-none focus:border-gold ${
      errors[k] ? "border-destructive" : "border-border"
    }`;

  return (
    <>
      <section className="border-b border-border bg-secondary/40">
        <div className="container-prose py-24">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">Contact</span>
          <h1 className="mt-4 font-display text-5xl font-bold md:text-6xl max-w-3xl">Get in touch.</h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Prospective members, alumni, sponsors, and recruiters — we'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="container-prose py-24 grid gap-16 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl font-bold">Reach the Fund</h2>
          <div className="mt-10 space-y-8">
            <div className="flex gap-5">
              <Mail className="h-6 w-6 text-gold-deep flex-shrink-0 mt-1" />
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Email</div>
                <a href="mailto:smif26@purdue.edu" className="mt-1 block font-display text-lg font-semibold hover:text-gold-deep">
                  smif26@purdue.edu
                </a>
              </div>
            </div>
            <div className="flex gap-5">
              <MapPin className="h-6 w-6 text-gold-deep flex-shrink-0 mt-1" />
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Address</div>
                <div className="mt-1 font-display text-lg font-semibold">Daniels School of Business</div>
                <div className="text-muted-foreground">403 W State Street<br />West Lafayette, IN 47907</div>
              </div>
            </div>
            <div className="flex gap-5">
              <Linkedin className="h-6 w-6 text-gold-deep flex-shrink-0 mt-1" />
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">LinkedIn</div>
                <a
                  href="https://www.linkedin.com/company/purdue-smif/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block font-display text-lg font-semibold hover:text-gold-deep"
                >
                  Purdue SMIF
                </a>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} noValidate className="border border-border bg-card p-10 space-y-5">
          <h2 className="font-display text-2xl font-bold">Send us a message</h2>

          {status === "success" && (
            <div className="flex items-start gap-3 border border-gold/40 bg-gold/10 p-4 text-sm">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-gold-deep mt-0.5" />
              <div>
                <div className="font-semibold text-foreground">Message sent</div>
                <div className="text-muted-foreground">Thanks for reaching out — we'll get back to you soon.</div>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-start gap-3 border border-destructive/40 bg-destructive/10 p-4 text-sm">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive mt-0.5" />
              <div className="text-foreground">{errorMsg}</div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <input className={inputCls("first_name")} placeholder="First name" value={form.first_name} onChange={update("first_name")} />
              {errors.first_name && <p className="mt-1 text-xs text-destructive">{errors.first_name}</p>}
            </div>
            <div>
              <input className={inputCls("last_name")} placeholder="Last name" value={form.last_name} onChange={update("last_name")} />
              {errors.last_name && <p className="mt-1 text-xs text-destructive">{errors.last_name}</p>}
            </div>
          </div>
          <div>
            <input type="email" className={inputCls("email")} placeholder="Email" value={form.email} onChange={update("email")} />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
          </div>
          <div>
            <input className={inputCls("subject")} placeholder="Subject" value={form.subject} onChange={update("subject")} />
            {errors.subject && <p className="mt-1 text-xs text-destructive">{errors.subject}</p>}
          </div>
          <div>
            <textarea rows={5} className={inputCls("message")} placeholder="Message" value={form.message} onChange={update("message")} />
            {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex w-full items-center justify-center gap-2 bg-ink py-3.5 text-sm font-semibold text-background transition hover:bg-ink/90 disabled:opacity-60"
          >
            {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
            {status === "loading" ? "Sending…" : "Send Message"}
          </button>
        </form>
      </section>
    </>
  );
}
