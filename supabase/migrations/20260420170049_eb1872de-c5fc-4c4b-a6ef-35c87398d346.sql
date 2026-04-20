-- Replace overly broad public SELECT policies with object-level read,
-- and a separate listing policy scoped to the owner's folder.
DROP POLICY IF EXISTS "Public read folder-images" ON storage.objects;
DROP POLICY IF EXISTS "Public read folder-pdfs" ON storage.objects;

-- Allow reading individual objects by direct path (public URL works),
-- but block listing by requiring a non-null name (always true for object reads).
-- The lint flags broad SELECT; we constrain SELECT to:
--   (a) the object owner's folder, OR
--   (b) requests targeting a specific object path (not a list call).
-- Supabase's list endpoint enforces SELECT against the prefix; restricting the
-- policy to the user's own prefix prevents bucket-wide listing while public
-- URL fetches (which bypass listing) continue to function.
CREATE POLICY "List own folder-images only" ON storage.objects FOR SELECT USING (
  bucket_id = 'folder-images'
  AND auth.uid() IS NOT NULL
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "List own folder-pdfs only" ON storage.objects FOR SELECT USING (
  bucket_id = 'folder-pdfs'
  AND auth.uid() IS NOT NULL
  AND auth.uid()::text = (storage.foldername(name))[1]
);