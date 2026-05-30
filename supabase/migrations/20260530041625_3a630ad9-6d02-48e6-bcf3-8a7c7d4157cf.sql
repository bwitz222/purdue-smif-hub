-- Revert admin role system and restore simpler read-only access for publications

-- 1. Drop admin-only publications policies
DROP POLICY IF EXISTS "Admins can insert publications" ON public.publications;
DROP POLICY IF EXISTS "Admins can update publications" ON public.publications;
DROP POLICY IF EXISTS "Admins can delete publications" ON public.publications;

-- 2. Drop admin-only storage policies
DROP POLICY IF EXISTS "Admins can upload publications" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update publications" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete publications" ON storage.objects;

-- 3. Drop user_roles table and its policies (cascades policies)
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- 4. Drop has_role function
DROP FUNCTION IF EXISTS public.has_role(UUID, public.app_role);

-- 5. Drop app_role enum
DROP TYPE IF EXISTS public.app_role CASCADE;