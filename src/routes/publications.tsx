import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { FileText, Upload, Download, Trash2, Loader2, ExternalLink, Rss } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SUBSTACK_URL = "https://purduesmif.substack.com";

export const Route = createFileRoute("/publications")({
  component: Publications,
  head: () => ({
    meta: [
      { title: "Publications & Reports — Purdue SMIF" },
      { name: "description", content: "Equity research reports, semester reports, and annual reports from the Purdue Student Managed Investment Fund." },
      { property: "og:title", content: "Equity Research & Reports — Purdue SMIF" },
      { property: "og:description", content: "Read SMIF's equity research pitches, semester performance reviews, and annual reports." },
      { property: "og:url", content: "/publications" },
    ],
  }),
});

type Category = "equity_research" | "semester" | "annual";

interface Publication {
  id: string;
  category: Category;
  title: string;
  description: string | null;
  file_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
}

const CATEGORIES: { value: Category; label: string; description: string }[] = [
  { value: "equity_research", label: "Equity Research", description: "Single-name pitches and deep-dive analyst reports." },
  { value: "semester", label: "Semester Reports", description: "End-of-semester performance and attribution reviews." },
  { value: "annual", label: "Annual Reports", description: "Comprehensive yearly reports to the Daniels School and stakeholders." },
];

function formatBytes(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Publications() {
  const [pubs, setPubs] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("publications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setPubs((data as Publication[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <>
      <section className="border-b border-border bg-secondary/40">
        <div className="container-prose py-24">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">Publications</span>
          <h1 className="mt-4 font-display text-5xl font-bold md:text-6xl max-w-3xl">Reports & research from the fund.</h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Browse equity research, semester performance reviews, and annual reports authored by SMIF members.
          </p>
          <a
            href={SUBSTACK_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-2 border border-ink bg-ink px-5 py-2.5 text-sm font-semibold text-background transition hover:bg-ink/90"
          >
            <Rss className="h-4 w-4" /> Read us on Substack
            <ExternalLink className="h-3.5 w-3.5 opacity-70" />
          </a>
        </div>
      </section>

      <section className="container-prose py-16">
        <Tabs defaultValue="equity_research" className="w-full">
          <TabsList className="h-auto flex-wrap gap-1 bg-secondary/60 p-1">
            {CATEGORIES.map((c) => (
              <TabsTrigger key={c.value} value={c.value} className="px-4 py-2 text-sm">
                {c.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {CATEGORIES.map((c) => (
            <TabsContent key={c.value} value={c.value} className="mt-8">
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold">{c.label}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
              </div>

              <UploadCard category={c.value} onUploaded={load} />

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {loading ? (
                  <div className="col-span-full flex items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
                  </div>
                ) : pubs.filter((p) => p.category === c.value).length === 0 ? (
                  <div className="col-span-full border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                    No {c.label.toLowerCase()} uploaded yet.
                  </div>
                ) : (
                  pubs
                    .filter((p) => p.category === c.value)
                    .map((p) => <PublicationCard key={p.id} pub={p} onDeleted={load} />)
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </>
  );
}

function UploadCard({ category, onUploaded }: { category: Category; onUploaded: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) {
      toast.error("Title and file are required.");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "pdf";
      const path = `${category}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("publications")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;

      const { error: insErr } = await supabase.from("publications").insert({
        category,
        title: title.trim(),
        description: description.trim() || null,
        file_path: path,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
      });
      if (insErr) throw insErr;

      toast.success("Uploaded.");
      setTitle(""); setDescription(""); setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onUploaded();
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border border-border bg-card p-6">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold-deep">
        <Upload className="h-3.5 w-3.5" /> Upload new
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-input bg-background px-3 py-2 text-sm outline-none focus:border-gold"
          required
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx,application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="border border-input bg-background px-3 py-2 text-sm file:mr-3 file:border-0 file:bg-secondary file:px-3 file:py-1 file:text-xs file:font-semibold"
          required
        />
      </div>
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="mt-4 w-full resize-none border border-input bg-background px-3 py-2 text-sm outline-none focus:border-gold"
      />
      <button
        type="submit"
        disabled={uploading}
        className="mt-4 inline-flex items-center gap-2 bg-ink px-4 py-2 text-sm font-semibold text-background transition hover:bg-ink/90 disabled:opacity-50"
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {uploading ? "Uploading…" : "Upload report"}
      </button>
    </form>
  );
}

function PublicationCard({ pub, onDeleted }: { pub: Publication; onDeleted: () => void }) {
  const url = supabase.storage.from("publications").getPublicUrl(pub.file_path).data.publicUrl;
  const isPdf = (pub.mime_type ?? "").includes("pdf") || pub.file_name.toLowerCase().endsWith(".pdf");
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete "${pub.title}"?`)) return;
    setDeleting(true);
    await supabase.storage.from("publications").remove([pub.file_path]);
    const { error } = await supabase.from("publications").delete().eq("id", pub.id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted."); onDeleted(); }
    setDeleting(false);
  };

  return (
    <div className="group flex flex-col border border-border bg-card transition hover:border-gold hover:shadow-elegant">
      <div className="aspect-[4/3] overflow-hidden border-b border-border bg-secondary/40">
        {isPdf ? (
          <object data={`${url}#toolbar=0&navpanes=0&view=FitH`} type="application/pdf" className="h-full w-full">
            <div className="grid h-full place-items-center text-muted-foreground">
              <FileText className="h-12 w-12" />
            </div>
          </object>
        ) : (
          <div className="grid h-full place-items-center text-muted-foreground">
            <FileText className="h-12 w-12" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold leading-tight">{pub.title}</h3>
        {pub.description && (
          <p className="mt-2 text-sm text-muted-foreground">{pub.description}</p>
        )}
        <div className="mt-2 text-xs text-muted-foreground">
          {new Date(pub.created_at).toLocaleDateString()} · {formatBytes(pub.file_size)}
        </div>
        <div className="mt-4 flex items-center gap-3 border-t border-border pt-3 text-xs">
          <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-muted-foreground transition hover:text-gold-deep">
            <Download className="h-3.5 w-3.5" /> View / Download
          </a>
          <button onClick={handleDelete} disabled={deleting} className="ml-auto inline-flex items-center gap-1.5 text-muted-foreground transition hover:text-destructive disabled:opacity-50">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
