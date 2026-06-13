import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

export type PublicationCategory = "equity_research" | "semester" | "annual";

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
  url: string;
}

export const getPublications = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicationRow[]> => {
    const { data, error } = await supabase
      .from("publications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[publications] fetch error:", error);
      throw new Error("Failed to load publications.");
    }
    const rows = (data ?? []) as Omit<PublicationRow, "url">[];
    return rows.map((p) => ({
      ...p,
      url: supabase.storage.from("publications").getPublicUrl(p.file_path).data
        .publicUrl,
    }));
  },
);
