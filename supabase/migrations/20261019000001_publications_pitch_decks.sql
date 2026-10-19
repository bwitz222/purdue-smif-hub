-- Pitch Decks: single-name stock pitches presented to the fund, posted to the
-- Research library alongside The Macro Brief. Ticker, sector, and the pitched
-- position ("Long" / "Short") are optional so other categories ignore them.
alter type public.publication_category add value if not exists 'pitch';

alter table public.publications
  add column if not exists ticker text,
  add column if not exists sector text,
  add column if not exists "position" text;
