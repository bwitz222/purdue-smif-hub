-- Public storage bucket for team headshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('team-headshots', 'team-headshots', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can view headshots (public bucket)
CREATE POLICY "Public read access to team headshots"
ON storage.objects
FOR SELECT
USING (bucket_id = 'team-headshots');

-- Only authenticated users can upload/manage (admins via dashboard)
CREATE POLICY "Authenticated users can upload team headshots"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'team-headshots');

CREATE POLICY "Authenticated users can update team headshots"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'team-headshots');

CREATE POLICY "Authenticated users can delete team headshots"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'team-headshots');
