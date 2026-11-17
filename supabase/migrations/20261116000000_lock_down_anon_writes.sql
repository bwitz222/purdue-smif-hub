-- Audit 2026-11-16 (S-1, S-5). NOT YET APPLIED: review, then run.
--
-- 1. The contact form posts to a server function that inserts with the service
--    role (src/lib/contact.functions.ts). The old browser-side insert policy is
--    still live, so anyone holding the publishable key (it ships in the page)
--    can insert rows directly, skipping the honeypot and the flood guard.
drop policy if exists "Anyone can submit a contact inquiry" on public.contact_inquiries;

-- 2. anon and authenticated hold INSERT/UPDATE/DELETE/TRUNCATE on every public
--    table. RLS denies the writes today because no write policy exists, but one
--    careless permissive policy would open the table. The site only reads with
--    these roles, so take the write grants away and make that the default.
revoke insert, update, delete, truncate, references, trigger
  on all tables in schema public from anon, authenticated;
alter default privileges in schema public
  revoke insert, update, delete, truncate, references, trigger on tables from anon, authenticated;

-- 3. price_history and etf_sector_weights are read only by the service role.
--    They have RLS on and no policy, which is the intended state (deny all);
--    drop the stray read grant so the intent is explicit.
revoke select on public.price_history from anon, authenticated;
revoke select on public.contact_inquiries from anon, authenticated;

-- 4. Scratch table left behind by an earlier audit.
drop table if exists public.tmp_audit_drop;
