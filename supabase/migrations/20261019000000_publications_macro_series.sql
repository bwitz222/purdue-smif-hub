-- The Macro Brief: a numbered, authored series from the Fixed Income & Macro
-- team. Adds the series as a publication category and lets any publication
-- credit its analysts and carry an issue number.
alter type public.publication_category add value if not exists 'macro';

alter table public.publications
  add column if not exists authors text[],
  add column if not exists issue_number integer;
