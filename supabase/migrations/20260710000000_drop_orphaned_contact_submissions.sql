-- Drop the orphaned contact_submissions table.
--
-- Superseded by public.contact_inquiries (migration 20260531015515). The app
-- only ever writes contact_inquiries (see src/routes/contact.tsx); nothing reads
-- or writes contact_submissions at runtime. Verified empty (0 rows) before drop.
-- CASCADE also removes idx_contact_submissions_created_at and its RLS policies.

DROP TABLE IF EXISTS public.contact_submissions CASCADE;
