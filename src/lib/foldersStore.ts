import { useEffect, useState, useCallback } from "react";

export type ImageItem = { id: string; name: string; url: string };
export type NoteItem = { id: string; title: string; body: string; updatedAt: number };
export type PdfItem = {
  id: string;
  title: string;
  description: string;
  genre: string;
  pages: number;
  size: string;
  poster: string;
  url?: string;
};
export type ChatMessage = { id: string; author: string; text: string; ts: number };

export type Folder = {
  id: string;
  name: string;
  description: string;
  images: ImageItem[];
  notes: NoteItem[];
  pdfs: PdfItem[];
  chat: ChatMessage[];
};

const STORAGE_KEY = "unaad.folders.v1";

const seed: Folder[] = [
  {
    id: "f1",
    name: "Project Alpha",
    description: "Design assets, briefs and team chat for the launch.",
    images: [
      { id: "i1", name: "Hero mock", url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=70" },
      { id: "i2", name: "Logo draft", url: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&q=70" },
    ],
    notes: [
      { id: "n1", title: "Kickoff brief", body: "Goals, audience and timeline for launch.", updatedAt: Date.now() },
    ],
    pdfs: [
      {
        id: "p1",
        title: "Annual Report 2025",
        description: "Comprehensive overview of yearly performance.",
        genre: "Business",
        pages: 48,
        size: "3.2 MB",
        poster: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=70",
      },
    ],
    chat: [
      { id: "c1", author: "Alex", text: "Welcome to the project chat!", ts: Date.now() - 60000 },
      { id: "c2", author: "Sam", text: "Posters look great 🎉", ts: Date.now() - 30000 },
    ],
  },
  {
    id: "f2",
    name: "Marketing 2026",
    description: "Campaign creatives, strategy docs and announcements.",
    images: [],
    notes: [],
    pdfs: [
      {
        id: "p5",
        title: "Marketing Playbook",
        description: "Channel strategy and KPI frameworks.",
        genre: "Marketing",
        pages: 56,
        size: "6.0 MB",
        poster: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600&q=70",
      },
    ],
    chat: [],
  },
  {
    id: "f3",
    name: "Research Library",
    description: "Whitepapers, reference notes and discussion threads.",
    images: [],
    notes: [],
    pdfs: [],
    chat: [],
  },
  {
    id: "f4",
    name: "Team Knowledge",
    description: "Onboarding guides, SOPs and group conversations.",
    images: [],
    notes: [],
    pdfs: [],
    chat: [],
  },
];

const load = (): Folder[] => {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed;
    return JSON.parse(raw) as Folder[];
  } catch {
    return seed;
  }
};

const save = (folders: Folder[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
  } catch {
    /* ignore */
  }
};

const listeners = new Set<(f: Folder[]) => void>();
let state: Folder[] = load();

const setState = (next: Folder[]) => {
  state = next;
  save(next);
  listeners.forEach((l) => l(state));
};

export const useFolders = () => {
  const [folders, setFolders] = useState<Folder[]>(state);
  useEffect(() => {
    const fn = (f: Folder[]) => setFolders(f);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return folders;
};

export const useFolder = (id: string | undefined) => {
  const folders = useFolders();
  return folders.find((f) => f.id === id);
};

const updateFolder = (id: string, mutate: (f: Folder) => Folder) => {
  setState(state.map((f) => (f.id === id ? mutate(f) : f)));
};

const uid = () => Math.random().toString(36).slice(2, 10);

export const useFolderActions = (id: string) => {
  return {
    renameFolder: useCallback((name: string) => updateFolder(id, (f) => ({ ...f, name })), [id]),

    addImage: useCallback(
      (img: Omit<ImageItem, "id">) =>
        updateFolder(id, (f) => ({ ...f, images: [...f.images, { ...img, id: uid() }] })),
      [id],
    ),
    renameImage: useCallback(
      (imgId: string, name: string) =>
        updateFolder(id, (f) => ({
          ...f,
          images: f.images.map((i) => (i.id === imgId ? { ...i, name } : i)),
        })),
      [id],
    ),
    removeImage: useCallback(
      (imgId: string) =>
        updateFolder(id, (f) => ({ ...f, images: f.images.filter((i) => i.id !== imgId) })),
      [id],
    ),

    addNote: useCallback(
      (n: Omit<NoteItem, "id" | "updatedAt">) =>
        updateFolder(id, (f) => ({
          ...f,
          notes: [...f.notes, { ...n, id: uid(), updatedAt: Date.now() }],
        })),
      [id],
    ),
    updateNote: useCallback(
      (noteId: string, patch: Partial<Pick<NoteItem, "title" | "body">>) =>
        updateFolder(id, (f) => ({
          ...f,
          notes: f.notes.map((n) =>
            n.id === noteId ? { ...n, ...patch, updatedAt: Date.now() } : n,
          ),
        })),
      [id],
    ),
    removeNote: useCallback(
      (noteId: string) =>
        updateFolder(id, (f) => ({ ...f, notes: f.notes.filter((n) => n.id !== noteId) })),
      [id],
    ),

    addPdf: useCallback(
      (p: Omit<PdfItem, "id">) =>
        updateFolder(id, (f) => ({ ...f, pdfs: [...f.pdfs, { ...p, id: uid() }] })),
      [id],
    ),
    renamePdf: useCallback(
      (pdfId: string, title: string) =>
        updateFolder(id, (f) => ({
          ...f,
          pdfs: f.pdfs.map((p) => (p.id === pdfId ? { ...p, title } : p)),
        })),
      [id],
    ),
    removePdf: useCallback(
      (pdfId: string) =>
        updateFolder(id, (f) => ({ ...f, pdfs: f.pdfs.filter((p) => p.id !== pdfId) })),
      [id],
    ),

    addMessage: useCallback(
      (m: Omit<ChatMessage, "id" | "ts">) =>
        updateFolder(id, (f) => ({
          ...f,
          chat: [...f.chat, { ...m, id: uid(), ts: Date.now() }],
        })),
      [id],
    ),
    editMessage: useCallback(
      (msgId: string, text: string) =>
        updateFolder(id, (f) => ({
          ...f,
          chat: f.chat.map((m) => (m.id === msgId ? { ...m, text } : m)),
        })),
      [id],
    ),
    removeMessage: useCallback(
      (msgId: string) =>
        updateFolder(id, (f) => ({ ...f, chat: f.chat.filter((m) => m.id !== msgId) })),
      [id],
    ),
  };
};
