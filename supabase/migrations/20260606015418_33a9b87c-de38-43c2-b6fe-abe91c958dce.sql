CREATE POLICY "No one can read contact inquiries"
ON public.contact_inquiries
AS RESTRICTIVE
FOR SELECT
TO public
USING (false);