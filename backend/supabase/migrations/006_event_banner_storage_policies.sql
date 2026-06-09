-- Banner uploads now go directly from the admin browser to Supabase Storage
-- (bypassing the API, which was failing when proxied through the frontend on
-- Render). That makes these storage.objects RLS policies load-bearing, so
-- (re)create them idempotently to guarantee an authenticated admin can upload.

-- Ensure the bucket exists and is public.
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-banners', 'event-banners', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public read banners" ON storage.objects;
CREATE POLICY "Public read banners" ON storage.objects
  FOR SELECT USING (bucket_id = 'event-banners');

DROP POLICY IF EXISTS "Admins upload banners" ON storage.objects;
CREATE POLICY "Admins upload banners" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'event-banners' AND
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins update banners" ON storage.objects;
CREATE POLICY "Admins update banners" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'event-banners' AND
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins delete banners" ON storage.objects;
CREATE POLICY "Admins delete banners" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'event-banners' AND
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );
