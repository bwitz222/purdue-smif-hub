-- 1. Role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'member');

-- 2. user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can see their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. Security definer role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Admins can view all role assignments
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can manage role assignments
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Tighten publications table policies
DROP POLICY IF EXISTS "Authenticated users can insert publications" ON public.publications;
DROP POLICY IF EXISTS "Authenticated users can delete publications" ON public.publications;

CREATE POLICY "Admins can insert publications"
ON public.publications
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update publications"
ON public.publications
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete publications"
ON public.publications
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 5. Tighten publications storage bucket policies
DROP POLICY IF EXISTS "Authenticated users can upload publications" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update publications" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete publications" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload publications" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update publications" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete publications" ON storage.objects;

CREATE POLICY "Admins can upload publications"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'publications' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update publications"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'publications' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete publications"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'publications' AND public.has_role(auth.uid(), 'admin'));
