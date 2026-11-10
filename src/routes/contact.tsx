import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Linkedin, Send } from "lucide-react";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { socialMeta, canonical, breadcrumbLd, OG_CONTACT } from "@/lib/seo";
import { submitInquiry } from "@/lib/contact.functions";
import { TOPICS, validateInquiry, type InquiryErrors } from "@/lib/contact-validation";
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

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({
    meta: [
      { title: "Contact Purdue SMIF: Student Managed Investment Fund" },
      {
        name: "description",
        content:
          "Get in touch with the Purdue Student Managed Investment Fund, prospective members, alumni, sponsors, and recruiters. We reply within two business days.",
      },
      ...socialMeta({
        title: "Contact Purdue SMIF",
        description:
          "Get in touch with the Purdue Student Managed Investment Fund, prospective members, alumni, sponsors, and recruiters. We reply within two business days.",
        url: canonical("/contact"),
        image: OG_CONTACT,
      }),
    ],
    links: [{ rel: "canonical", href: canonical("/contact") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "@id": `${canonical("/contact")}#contactpage`,
          url: canonical("/contact"),
          name: "Contact Purdue SMIF",
          // Ties the page to the Organization declared in the root graph so the
          // reply channel and address are attributed to the fund, not orphaned.
          mainEntity: {
            "@id": "https://www.purduesmif.org/#organization",
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "General inquiries",
              email: "smif26@purdue.edu",
              areaServed: "US",
              availableLanguage: "English",
            },
          },
        }),
      },
      breadcrumbLd("Contact", "/contact"),
    ],
  }),
});

type Notice = { kind: "success" | "error"; text: string } | null;

function Contact() {
  const [topic, setTopic] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [errors, setErrors] = useState<InquiryErrors>({});
  const [notice, setNotice] = useState<Notice>(null);
  const send = useServerFn(submitInquiry);
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

    setNotice(null);
    const parsed = validateInquiry({ topic, name, email, message });
    if (!parsed.ok) {
      setErrors(parsed.errors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      // The honeypot value rides along; the server drops the message if it is set.
      await send({ data: { ...parsed.data, company } });
      setNotice({ kind: "success", text: "Thanks! We'll reply within 2 business days." });
      resetForm();
    } catch (err) {
      console.error("[contact] send error:", err);
      setNotice({ kind: "error", text: "Couldn't send your message. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="border-b border-border bg-background">
        <div className="container-prose section-y">
          <div>
            <span className="rule-gold mb-6" />
            <h1 className="font-display max-w-3xl">Contact Purdue SMIF</h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Get in touch. Prospective members, alumni, sponsors, and recruiters: we'd love to hear
              from you.
            </p>
          </div>
        </div>
      </section>

      <section className="container-prose section-y">
        <div>
          <h2 className="font-display">Reach the Fund</h2>
        </div>
        <div className="mt-10 grid gap-10 md:grid-cols-3">
          <div className="flex gap-5">
            <Mail className="h-6 w-6 text-gold-deep flex-shrink-0 mt-1" />
            <div>
              <div className="text-xs text-muted-foreground">Email</div>
              <a
                href="mailto:smif26@purdue.edu"
                className="link-underline mt-1 inline-block font-display text-lg font-semibold hover:text-gold-deep"
              >
                smif26@purdue.edu
              </a>
            </div>
          </div>
          <div className="flex gap-5">
            <MapPin className="h-6 w-6 text-gold-deep flex-shrink-0 mt-1" />
            <div>
              <div className="text-xs text-muted-foreground">Address</div>
              <div className="mt-1 font-display text-lg font-semibold">
                Daniels School of Business
              </div>
              <div className="text-muted-foreground">
                403 Mitch Daniels Blvd
                <br />
                West Lafayette, IN 47907
              </div>
            </div>
          </div>
          <div className="flex gap-5">
            <Linkedin className="h-6 w-6 text-gold-deep flex-shrink-0 mt-1" />
            <div>
              <div className="text-xs text-muted-foreground">LinkedIn</div>
              <a
                href="https://www.linkedin.com/company/purdue-smif/"
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline mt-1 inline-block font-display text-lg font-semibold hover:text-gold-deep"
              >
                Purdue SMIF
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Send a note */}
      <section className="border-t border-border bg-background section-y">
        <div className="container-prose grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <span className="rule-gold mb-5 block" />
            <h2 className="font-display text-ink">Tell us why you're writing.</h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              The fastest path to a thoughtful reply. We read every message and respond within two
              business days.
            </p>
          </div>

          <div className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="bg-background border border-border p-8 lg:p-10 space-y-6"
            >
              <div>
                <Label htmlFor="topic" className="text-xs text-ink">
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
                {errors.topic && (
                  <p id="topic-error" role="alert" className="mt-1.5 text-xs text-destructive">
                    {errors.topic}
                  </p>
                )}
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name" className="text-xs text-ink">
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
                  {errors.name && (
                    <p id="name-error" role="alert" className="mt-1.5 text-xs text-destructive">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email" className="text-xs text-ink">
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
                  {errors.email && (
                    <p id="email-error" role="alert" className="mt-1.5 text-xs text-destructive">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="message" className="text-xs text-ink">
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
                  <span id="message-error" role="alert" className="text-destructive">
                    {errors.message ?? ""}
                  </span>
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

              {notice && (
                <p
                  role="status"
                  className={`border-l-4 pl-3 text-sm ${notice.kind === "success" ? "border-gold text-ink" : "border-ink font-bold text-ink"}`}
                >
                  {notice.text}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                aria-busy={submitting}
                className="press group inline-flex items-center gap-2.5 bg-ink px-7 py-3.5 text-sm font-semibold text-background hover:bg-ink/85 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Sending…" : "Send message"}
                <Send className="h-4 w-4 arrow-slide" />
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
