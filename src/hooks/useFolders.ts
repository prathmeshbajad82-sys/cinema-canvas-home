import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const sb = supabase as any;

export type Folder = { id: string; user_id: string; name: string; description: string | null; created_at: string };
export type FolderNote = { id: string; folder_id: string; user_id: string; title: string; body: string; updated_at: string };
export type FolderImage = { id: string; folder_id: string; user_id: string; name: string; image_path: string };
export type FolderPdf = {
  id: string; folder_id: string; user_id: string;
  title: string; description: string; genre: string;
  pages: number; size: string; poster_url: string | null; file_path: string | null;
};
export type FolderChatMessage = { id: string; folder_id: string; user_id: string; text: string; created_at: string };

export const publicUrl = (bucket: string, path: string | null | undefined) => {
  if (!path) return "";
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
};

/* -------------------- Folders -------------------- */
export const useFolders = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["folders", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<(Folder & { counts: { images: number; notes: number; pdfs: number; chat: number } })[]> => {
      const { data: folders, error } = await sb
        .from("folders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const ids = (folders ?? []).map((f: Folder) => f.id);
      const empty = { images: 0, notes: 0, pdfs: 0, chat: 0 };
      if (ids.length === 0) return [];

      const [imgs, notes, pdfs, chat] = await Promise.all([
        sb.from("folder_images").select("folder_id").in("folder_id", ids),
        sb.from("folder_notes").select("folder_id").in("folder_id", ids),
        sb.from("folder_pdfs").select("folder_id").in("folder_id", ids),
        sb.from("folder_chat_messages").select("folder_id").in("folder_id", ids),
      ]);

      const tally = (rows: any[] | null, key: keyof typeof empty) => {
        const map: Record<string, number> = {};
        (rows ?? []).forEach((r: any) => { map[r.folder_id] = (map[r.folder_id] ?? 0) + 1; });
        return map;
      };
      const ic = tally(imgs.data, "images");
      const nc = tally(notes.data, "notes");
      const pc = tally(pdfs.data, "pdfs");
      const cc = tally(chat.data, "chat");

      return (folders as Folder[]).map((f) => ({
        ...f,
        counts: {
          images: ic[f.id] ?? 0,
          notes: nc[f.id] ?? 0,
          pdfs: pc[f.id] ?? 0,
          chat: cc[f.id] ?? 0,
        },
      }));
    },
  });
};

export const useFolder = (id: string | undefined) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["folder", id],
    enabled: !!user && !!id,
    queryFn: async (): Promise<Folder | null> => {
      const { data, error } = await sb.from("folders").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as Folder | null;
    },
  });
};

export const useCreateFolder = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: { name: string; description?: string }) => {
      const { data, error } = await sb
        .from("folders")
        .insert({ name: input.name, description: input.description ?? "", user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data as Folder;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["folders"] }),
  });
};

export const useRenameFolder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await sb.from("folders").update({ name }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["folders"] });
      qc.invalidateQueries({ queryKey: ["folder", v.id] });
    },
  });
};

export const useDeleteFolder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb.from("folders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["folders"] }),
  });
};

/* -------------------- Notes -------------------- */
export const useNotes = (folderId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["notes", folderId],
    enabled: !!user && !!folderId,
    queryFn: async (): Promise<FolderNote[]> => {
      const { data, error } = await sb
        .from("folder_notes")
        .select("*")
        .eq("folder_id", folderId)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as FolderNote[];
    },
  });
};

export const useNoteMutations = (folderId: string) => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const inv = () => {
    qc.invalidateQueries({ queryKey: ["notes", folderId] });
    qc.invalidateQueries({ queryKey: ["folders"] });
  };
  return {
    add: useMutation({
      mutationFn: async (n: { title: string; body: string }) => {
        const { error } = await sb.from("folder_notes").insert({ ...n, folder_id: folderId, user_id: user!.id });
        if (error) throw error;
      },
      onSuccess: inv,
    }),
    update: useMutation({
      mutationFn: async ({ id, title, body }: { id: string; title: string; body: string }) => {
        const { error } = await sb.from("folder_notes").update({ title, body }).eq("id", id);
        if (error) throw error;
      },
      onSuccess: inv,
    }),
    remove: useMutation({
      mutationFn: async (id: string) => {
        const { error } = await sb.from("folder_notes").delete().eq("id", id);
        if (error) throw error;
      },
      onSuccess: inv,
    }),
  };
};

/* -------------------- Images -------------------- */
export const useImages = (folderId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["images", folderId],
    enabled: !!user && !!folderId,
    queryFn: async (): Promise<FolderImage[]> => {
      const { data, error } = await sb
        .from("folder_images")
        .select("*")
        .eq("folder_id", folderId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as FolderImage[];
    },
  });
};

export const useImageMutations = (folderId: string) => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const inv = () => {
    qc.invalidateQueries({ queryKey: ["images", folderId] });
    qc.invalidateQueries({ queryKey: ["folders"] });
  };
  return {
    upload: useMutation({
      mutationFn: async ({ file, name }: { file: File; name: string }) => {
        const ext = file.name.split(".").pop() || "bin";
        const path = `${user!.id}/${folderId}/${crypto.randomUUID()}.${ext}`;
        const up = await supabase.storage.from("folder-images").upload(path, file, { upsert: false });
        if (up.error) throw up.error;
        const { error } = await sb.from("folder_images").insert({
          folder_id: folderId, user_id: user!.id, name, image_path: path,
        });
        if (error) throw error;
      },
      onSuccess: inv,
    }),
    rename: useMutation({
      mutationFn: async ({ id, name }: { id: string; name: string }) => {
        const { error } = await sb.from("folder_images").update({ name }).eq("id", id);
        if (error) throw error;
      },
      onSuccess: inv,
    }),
    remove: useMutation({
      mutationFn: async (img: FolderImage) => {
        await supabase.storage.from("folder-images").remove([img.image_path]);
        const { error } = await sb.from("folder_images").delete().eq("id", img.id);
        if (error) throw error;
      },
      onSuccess: inv,
    }),
  };
};

/* -------------------- PDFs -------------------- */
export const usePdfs = (folderId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["pdfs", folderId],
    enabled: !!user && !!folderId,
    queryFn: async (): Promise<FolderPdf[]> => {
      const { data, error } = await sb
        .from("folder_pdfs")
        .select("*")
        .eq("folder_id", folderId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as FolderPdf[];
    },
  });
};

export const usePdfMutations = (folderId: string) => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const inv = () => {
    qc.invalidateQueries({ queryKey: ["pdfs", folderId] });
    qc.invalidateQueries({ queryKey: ["folders"] });
  };
  return {
    upload: useMutation({
      mutationFn: async (input: {
        file: File; title: string; description: string; genre: string; pages: number; posterUrl?: string;
      }) => {
        const path = `${user!.id}/${folderId}/${crypto.randomUUID()}.pdf`;
        const up = await supabase.storage.from("folder-pdfs").upload(path, input.file, { upsert: false, contentType: "application/pdf" });
        if (up.error) throw up.error;
        const sizeMb = (input.file.size / (1024 * 1024)).toFixed(1) + " MB";
        const { error } = await sb.from("folder_pdfs").insert({
          folder_id: folderId, user_id: user!.id,
          title: input.title, description: input.description, genre: input.genre || "General",
          pages: input.pages || 0, size: sizeMb,
          poster_url: input.posterUrl || null, file_path: path,
        });
        if (error) throw error;
      },
      onSuccess: inv,
    }),
    rename: useMutation({
      mutationFn: async ({ id, title }: { id: string; title: string }) => {
        const { error } = await sb.from("folder_pdfs").update({ title }).eq("id", id);
        if (error) throw error;
      },
      onSuccess: inv,
    }),
    remove: useMutation({
      mutationFn: async (p: FolderPdf) => {
        if (p.file_path) await supabase.storage.from("folder-pdfs").remove([p.file_path]);
        const { error } = await sb.from("folder_pdfs").delete().eq("id", p.id);
        if (error) throw error;
      },
      onSuccess: inv,
    }),
  };
};

/* -------------------- Chat -------------------- */
export const useChat = (folderId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["chat", folderId],
    enabled: !!user && !!folderId,
    queryFn: async (): Promise<FolderChatMessage[]> => {
      const { data, error } = await sb
        .from("folder_chat_messages")
        .select("*")
        .eq("folder_id", folderId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as FolderChatMessage[];
    },
  });
};

export const useChatMutations = (folderId: string) => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const inv = () => {
    qc.invalidateQueries({ queryKey: ["chat", folderId] });
    qc.invalidateQueries({ queryKey: ["folders"] });
  };
  return {
    send: useMutation({
      mutationFn: async (text: string) => {
        const { error } = await sb.from("folder_chat_messages").insert({
          folder_id: folderId, user_id: user!.id, text,
        });
        if (error) throw error;
      },
      onSuccess: inv,
    }),
    edit: useMutation({
      mutationFn: async ({ id, text }: { id: string; text: string }) => {
        const { error } = await sb.from("folder_chat_messages").update({ text }).eq("id", id);
        if (error) throw error;
      },
      onSuccess: inv,
    }),
    remove: useMutation({
      mutationFn: async (id: string) => {
        const { error } = await sb.from("folder_chat_messages").delete().eq("id", id);
        if (error) throw error;
      },
      onSuccess: inv,
    }),
  };
};
