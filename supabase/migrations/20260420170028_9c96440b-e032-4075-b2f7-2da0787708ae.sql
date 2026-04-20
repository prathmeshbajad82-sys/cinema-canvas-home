-- Folders
CREATE TABLE public.folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own folders" ON public.folders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own folders" ON public.folders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own folders" ON public.folders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own folders" ON public.folders FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_folders_user ON public.folders(user_id);

-- Notes
CREATE TABLE public.folder_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id uuid NOT NULL REFERENCES public.folders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.folder_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own notes" ON public.folder_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own notes" ON public.folder_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own notes" ON public.folder_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own notes" ON public.folder_notes FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_folder_notes_folder ON public.folder_notes(folder_id);

-- PDFs
CREATE TABLE public.folder_pdfs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id uuid NOT NULL REFERENCES public.folders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  genre text DEFAULT 'General',
  pages integer DEFAULT 0,
  size text DEFAULT '',
  poster_url text,
  file_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.folder_pdfs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own pdfs" ON public.folder_pdfs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own pdfs" ON public.folder_pdfs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own pdfs" ON public.folder_pdfs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own pdfs" ON public.folder_pdfs FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_folder_pdfs_folder ON public.folder_pdfs(folder_id);

-- Images
CREATE TABLE public.folder_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id uuid NOT NULL REFERENCES public.folders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Untitled',
  image_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.folder_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own images" ON public.folder_images FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own images" ON public.folder_images FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own images" ON public.folder_images FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own images" ON public.folder_images FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_folder_images_folder ON public.folder_images(folder_id);

-- Chat messages
CREATE TABLE public.folder_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id uuid NOT NULL REFERENCES public.folders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.folder_chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own messages" ON public.folder_chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own messages" ON public.folder_chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own messages" ON public.folder_chat_messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own messages" ON public.folder_chat_messages FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_folder_chat_folder ON public.folder_chat_messages(folder_id);

-- updated_at triggers (function already exists)
CREATE TRIGGER trg_folders_updated BEFORE UPDATE ON public.folders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_notes_updated BEFORE UPDATE ON public.folder_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_pdfs_updated BEFORE UPDATE ON public.folder_pdfs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_images_updated BEFORE UPDATE ON public.folder_images FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_chat_updated BEFORE UPDATE ON public.folder_chat_messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup if not exists
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('folder-images', 'folder-images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('folder-pdfs', 'folder-pdfs', true) ON CONFLICT DO NOTHING;

-- Storage policies: files stored under {user_id}/...
CREATE POLICY "Public read folder-images" ON storage.objects FOR SELECT USING (bucket_id = 'folder-images');
CREATE POLICY "Users upload own folder-images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'folder-images' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users update own folder-images" ON storage.objects FOR UPDATE USING (
  bucket_id = 'folder-images' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users delete own folder-images" ON storage.objects FOR DELETE USING (
  bucket_id = 'folder-images' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Public read folder-pdfs" ON storage.objects FOR SELECT USING (bucket_id = 'folder-pdfs');
CREATE POLICY "Users upload own folder-pdfs" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'folder-pdfs' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users update own folder-pdfs" ON storage.objects FOR UPDATE USING (
  bucket_id = 'folder-pdfs' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users delete own folder-pdfs" ON storage.objects FOR DELETE USING (
  bucket_id = 'folder-pdfs' AND auth.uid()::text = (storage.foldername(name))[1]
);