
-- Lock publications table writes to authenticated users
DROP POLICY IF EXISTS "Anyone can insert publications" ON public.publications;
DROP POLICY IF EXISTS "Anyone can delete publications" ON public.publications;

CREATE POLICY "Authenticated users can insert publications"
ON public.publications FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can delete publications"
ON public.publications FOR DELETE TO authenticated USING (true);

-- Lock publications storage bucket writes to authenticated users
DROP POLICY IF EXISTS "Anyone can upload publications" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete publications" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload publications" ON storage.objects;
DROP POLICY IF EXISTS "Public can delete publications" ON storage.objects;

CREATE POLICY "Authenticated can upload publications files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'publications');

CREATE POLICY "Authenticated can delete publications files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'publications');

-- Restrict listing in publications bucket (still allow direct file URL access via public bucket)
DROP POLICY IF EXISTS "Public can list publications" ON storage.objects;

-- Explicit restrictive SELECT policy on contact_submissions: deny by default
CREATE POLICY "No one can read contact submissions"
ON public.contact_submissions AS RESTRICTIVE FOR SELECT
TO public USING (false);
