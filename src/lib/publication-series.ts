import type { PublicationRow } from "@/lib/publications.functions";

/** Display name for each publication category, shared by /research and the home page. */
export const SERIES_LABEL: Record<PublicationRow["category"], string> = {
  macro: "The Macro Brief",
  pitch: "Pitch Decks",
  equity_research: "Equity Research",
  semester: "Semester Reports",
  annual: "Annual Reports",
};
