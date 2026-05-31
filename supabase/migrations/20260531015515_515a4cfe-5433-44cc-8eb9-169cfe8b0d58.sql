CREATE TABLE public.contact_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  company text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contact_inquiries_topic_check CHECK (topic IN ('Prospective member','Alumni','Sponsor / Recruiter','Press','Other')),
  CONSTRAINT contact_inquiries_message_length CHECK (char_length(message) BETWEEN 20 AND 4000),
  CONSTRAINT contact_inquiries_name_length CHECK (char_length(name) BETWEEN 1 AND 120),
  CONSTRAINT contact_inquiries_email_length CHECK (char_length(email) BETWEEN 3 AND 255)
);

GRANT INSERT ON public.contact_inquiries TO anon;
GRANT INSERT ON public.contact_inquiries TO authenticated;
GRANT ALL ON public.contact_inquiries TO service_role;

ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a contact inquiry"
  ON public.contact_inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 120
    AND char_length(email) BETWEEN 3 AND 255
    AND char_length(message) BETWEEN 20 AND 4000
    AND topic IN ('Prospective member','Alumni','Sponsor / Recruiter','Press','Other')
  );