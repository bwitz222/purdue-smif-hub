-- Create publications table
CREATE TYPE public.publication_category AS ENUM ('equity_research', 'semester', 'annual');

CREATE TABLE public.publications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category public.publication_category NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Publications are viewable by everyone"
  ON public.publications FOR SELECT USING (true);

CREATE POLICY "Anyone can insert publications"
  ON public.publications FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can delete publications"
  ON public.publications FOR DELETE USING (true);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('publications', 'publications', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Publications files publicly readable"
  ON storage.objects FOR SELECT USING (bucket_id = 'publications');

CREATE POLICY "Anyone can upload publications"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'publications');

CREATE POLICY "Anyone can delete publications files"
  ON storage.objects FOR DELETE USING (bucket_id = 'publications');
