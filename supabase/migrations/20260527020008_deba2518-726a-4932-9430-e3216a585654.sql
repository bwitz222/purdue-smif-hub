
DROP POLICY IF EXISTS "Anyone can delete publications files" ON storage.objects;
DROP POLICY IF EXISTS "Publications files publicly readable" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can insert publications" ON public.publications;
DROP POLICY IF EXISTS "Authenticated users can delete publications" ON public.publications;

CREATE POLICY "Authenticated users can insert publications"
ON public.publications FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete publications"
ON public.publications FOR DELETE TO authenticated
USING (auth.uid() IS NOT NULL);
