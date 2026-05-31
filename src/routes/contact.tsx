import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Linkedin, Send } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { socialMeta, canonical, SITE_URL } from "@/lib/seo";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({
    meta: [
      { title: "Contact — Purdue SMIF" },
      { name: "description", content: "Reach the Purdue Student Managed Investment Fund — for prospective members, alumni, sponsors, and recruiters." },
      ...socialMeta({
        title: "Contact Purdue SMIF",
        description: "Reach the Purdue Student Managed Investment Fund — for prospective members, alumni, sponsors, and recruiters.",
        url: canonical("/contact"),
      }),
    ],
    links: [{ rel: "canonical", href: canonical("/contact") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Purdue Student Managed Investment Fund",
          email: "smif26@purdue.edu",
          url: `${SITE_URL}/contact`,
          address: {
            "@type": "PostalAddress",
            streetAddress: "403 Mitch Daniels Blvd",
            addressLocality: "West Lafayette",
            addressRegion: "IN",
            postalCode: "47907",
            addressCountry: "US",
          },
          sameAs: ["https://www.linkedin.com/company/purdue-smif/"],
        }),
      },
    ],
  }),
});

const TOPICS = [
  "Prospective member",
  "Alumni",
  "Sponsor / Recruiter",
  "Press",
  "Other",
] as const;

const inquirySchema = z.object({
  topic: z.enum(TOPICS, { errorMap: () => ({ message: "Please choose a topic" }) }),
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email").max(255),
  message: z
    .string()
    .trim()
    .min(20, "Message must be at least 20 characters")
    .max(4000, "Message must be under 4000 characters"),
  company: z.string().max(255).optional(),
});

type FormErrors = Partial<Record<keyof z.infer<typeof inquirySchema>, string>>;

function Contact() {
  const [topic, setTopic] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setTopic("");
    setName("");
    setEmail("");
    setMessage("");
    setCompany("");
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot — silently succeed
    if (company.trim().length > 0) {
      toast.success("Thanks — we'll reply within 2 business days.");
      resetForm();
      return;
    }

    const parsed = inquirySchema.safeParse({ topic, name, email, message, company });
    if (!parsed.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormErrors;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const { error } = await supabase.from("contact_inquiries").insert({
        topic: parsed.data.topic,
        name: parsed.data.name,
        email: parsed.data.email,
        message: parsed.data.message,
        company: null,
      });
      if (error) throw error;
      toast.success("Thanks — we'll reply within 2 business days.");
      resetForm();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(`Couldn't send your message: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

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

      <section className="container-prose py-24">
        <h2 className="font-display text-3xl font-bold">Reach the Fund</h2>
        <div className="mt-10 grid gap-10 md:grid-cols-3">
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
              <div className="text-muted-foreground">403 Mitch Daniels Blvd<br />West Lafayette, IN 47907</div>
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
      </section>

      {/* Send a note */}
      <section className="border-t border-border bg-secondary/30 py-24">
        <div className="container-prose grid gap-12 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <span className="rule-gold mb-5 block" />
            <span className="text-xs font-semibold uppercase tracking-[0.32em] text-gold-deep block mb-4">
              Send a note
            </span>
            <h2 className="font-display text-4xl font-bold text-ink leading-tight">
              Tell us why<br />you're writing.
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              The fastest path to a thoughtful reply. We read every message and respond within two business days.
            </p>
          </Reveal>

          <Reveal className="lg:col-span-3" delay={0.1}>
            <form
              onSubmit={handleSubmit}
              noValidate
              className="bg-background border border-border p-8 lg:p-10 space-y-6"
            >
              <div>
                <Label htmlFor="topic" className="text-xs uppercase tracking-[0.16em] text-ink">
                  Topic
                </Label>
                <Select value={topic} onValueChange={setTopic}>
                  <SelectTrigger
                    id="topic"
                    aria-invalid={!!errors.topic}
                    aria-describedby={errors.topic ? "topic-error" : undefined}
                    className="mt-2 rounded-none border-input"
                  >
                    <SelectValue placeholder="Choose a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {TOPICS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.topic && <p id="topic-error" role="alert" className="mt-1.5 text-xs text-destructive">{errors.topic}</p>}
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name" className="text-xs uppercase tracking-[0.16em] text-ink">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={120}
                    autoComplete="name"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    className="mt-2 rounded-none"
                  />
                  {errors.name && <p id="name-error" role="alert" className="mt-1.5 text-xs text-destructive">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="email" className="text-xs uppercase tracking-[0.16em] text-ink">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={255}
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className="mt-2 rounded-none"
                  />
                  {errors.email && <p id="email-error" role="alert" className="mt-1.5 text-xs text-destructive">{errors.email}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="message" className="text-xs uppercase tracking-[0.16em] text-ink">
                  Message
                </Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  minLength={20}
                  maxLength={4000}
                  rows={6}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? "message-error" : undefined}
                  className="mt-2 rounded-none"
                />
                <div className="mt-1.5 flex justify-between text-xs">
                  <span id="message-error" role="alert" className="text-destructive">{errors.message ?? ""}</span>
                  <span className="text-muted-foreground font-mono">{message.length}/4000</span>
                </div>
              </div>

              {/* Honeypot — hidden from real users */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="company">Company</label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                aria-busy={submitting}
                className="group inline-flex items-center gap-2.5 bg-ink px-7 py-3.5 text-sm font-semibold text-background hover:bg-ink/85 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Sending…" : "Send message"}
                <Send className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            </form>
          </Reveal>
        </div>
      </section>
    </>
  );
}
