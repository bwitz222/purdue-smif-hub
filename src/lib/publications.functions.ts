import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

type PublicationCategory = "macro" | "pitch" | "equity_research" | "semester" | "annual";

export interface PublicationRow {
  id: string;
  category: PublicationCategory;
  title: string;
  description: string | null;
  file_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
  /** Credited analysts, in byline order. Null when the fund is the author. */
  authors: string[] | null;
  /** Issue number within a numbered series (e.g. The Macro Brief #002). */
  issue_number: number | null;
  /** Pitch decks: the pitched security, its sector, and the side ("Long" / "Short"). */
  ticker: string | null;
  sector: string | null;
  position: string | null;
  url: string;
}

export const getPublications = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicationRow[]> => {
    // Degrade, never throw. This runs in the /research route loader, so a
    // rejection here 500s the whole page — including the header, nav, and
    // Substack link that don't depend on this data at all. The page already
    // renders a "coming soon" empty state per category, which is a far better
    // outcome for a reader (and for a crawler) than an error page when the
    // database is briefly unreachable or a key has rotated.
    try {
      const { data, error } = await supabase
        .from("publications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data ?? []) as Omit<PublicationRow, "url">[];
      return rows.map((p) => ({
        ...p,
        url: supabase.storage.from("publications").getPublicUrl(p.file_path).data.publicUrl,
      }));
    } catch (err) {
      console.error("[publications] fetch failed, serving empty list:", err);
      return [];
    }
  },
);
