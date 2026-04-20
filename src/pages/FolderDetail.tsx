import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Folder as FolderIcon, Image as ImageIcon, FileText, MessageSquare,
  Plus, Pencil, Trash2, Check, X, Send, Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import {
  useFolder, useRenameFolder,
  useImages, useImageMutations,
  useNotes, useNoteMutations,
  usePdfs, usePdfMutations,
  useChat, useChatMutations,
  publicUrl,
} from "@/hooks/useFolders";
import { toast } from "sonner";

const FolderDetail = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { data: folder, isLoading } = useFolder(id);
  const renameFolder = useRenameFolder();
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  if (loading || isLoading) {
    return <div className="container py-16 text-muted-foreground">Loading…</div>;
  }

  if (!folder) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-2">Folder not found</h1>
          <Button asChild><Link to="/">Back to home</Link></Button>
        </div>
      </div>
    );
  }

  const saveName = async () => {
    const next = nameDraft.trim();
    if (!next) return toast.error("Folder name cannot be empty");
    try {
      await renameFolder.mutateAsync({ id: folder.id, name: next });
      setEditingName(false);
      toast.success("Folder renamed");
    } catch (e: any) { toast.error(e.message ?? "Failed"); }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="container flex items-center gap-3 h-16">
          <Button asChild variant="ghost" size="icon">
            <Link to="/" aria-label="Back"><ArrowLeft /></Link>
          </Button>
          <div className="w-9 h-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
            <FolderIcon className="w-5 h-5" />
          </div>
          {editingName ? (
            <div className="flex items-center gap-2">
              <Input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} className="h-9 w-48 md:w-64" autoFocus />
              <Button size="icon" variant="secondary" onClick={saveName}><Check className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => setEditingName(false)}><X className="w-4 h-4" /></Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold">{folder.name}</h1>
              <Button size="icon" variant="ghost" onClick={() => { setNameDraft(folder.name); setEditingName(true); }}>
                <Pencil className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="container py-6 md:py-10">
        {folder.description && <p className="text-muted-foreground mb-6">{folder.description}</p>}

        <Tabs defaultValue="images" className="w-full">
          <TabsList className="grid grid-cols-4 w-full md:w-auto">
            <TabsTrigger value="images" className="gap-2"><ImageIcon className="w-4 h-4" /> Images</TabsTrigger>
            <TabsTrigger value="notes" className="gap-2"><FileText className="w-4 h-4" /> Notes</TabsTrigger>
            <TabsTrigger value="pdfs" className="gap-2"><FileText className="w-4 h-4" /> PDFs</TabsTrigger>
            <TabsTrigger value="chat" className="gap-2"><MessageSquare className="w-4 h-4" /> Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="images" className="mt-6"><ImagesTab folderId={folder.id} /></TabsContent>
          <TabsContent value="notes" className="mt-6"><NotesTab folderId={folder.id} /></TabsContent>
          <TabsContent value="pdfs" className="mt-6"><PdfsTab folderId={folder.id} /></TabsContent>
          <TabsContent value="chat" className="mt-6"><ChatTab folderId={folder.id} /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

/* -------- Images -------- */
const ImagesTab = ({ folderId }: { folderId: string }) => {
  const { data: images = [] } = useImages(folderId);
  const { upload, rename, remove } = useImageMutations(folderId);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const submit = async () => {
    if (!file) return toast.error("Pick an image file");
    try {
      await upload.mutateAsync({ file, name: name.trim() || file.name });
      setName(""); setFile(null); setOpen(false);
      toast.success("Image uploaded");
    } catch (e: any) { toast.error(e.message ?? "Upload failed"); }
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Images</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4" /> Upload image</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Upload image</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              <Input placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <DialogFooter>
              <Button onClick={submit} disabled={upload.isPending}>Upload</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {images.length === 0 ? (
        <Empty icon={<ImageIcon className="w-6 h-6" />} text="No images yet. Upload one to get started." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <Card key={img.id} className="overflow-hidden">
              <div className="aspect-square bg-muted overflow-hidden">
                <img src={publicUrl("folder-images", img.image_path)} alt={img.name} loading="lazy" className="w-full h-full object-cover" />
              </div>
              <CardContent className="p-3 space-y-2">
                {editingId === img.id ? (
                  <div className="flex gap-1">
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8" />
                    <Button size="icon" variant="secondary" onClick={async () => {
                      await rename.mutateAsync({ id: img.id, name: editName.trim() || img.name });
                      setEditingId(null);
                    }}><Check className="w-4 h-4" /></Button>
                  </div>
                ) : (
                  <p className="text-sm truncate" title={img.name}>{img.name}</p>
                )}
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="flex-1" onClick={() => { setEditingId(img.id); setEditName(img.name); }}>
                    <Pencil className="w-4 h-4" /> Rename
                  </Button>
                  <Button size="sm" variant="ghost" className="flex-1 text-destructive hover:text-destructive" onClick={async () => {
                    await remove.mutateAsync(img); toast.success("Image removed");
                  }}>
                    <Trash2 className="w-4 h-4" /> Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};

/* -------- Notes -------- */
const NotesTab = ({ folderId }: { folderId: string }) => {
  const { data: notes = [] } = useNotes(folderId);
  const { add, update, remove } = useNoteMutations(folderId);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  const submit = async () => {
    if (!title.trim()) return toast.error("Title required");
    await add.mutateAsync({ title: title.trim(), body: body.trim() });
    setTitle(""); setBody(""); setOpen(false); toast.success("Note added");
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Text notes</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4" /> Add note</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New note</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea placeholder="Write something important..." value={body} onChange={(e) => setBody(e.target.value)} rows={5} />
            </div>
            <DialogFooter><Button onClick={submit} disabled={add.isPending}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {notes.length === 0 ? (
        <Empty icon={<FileText className="w-6 h-6" />} text="No notes yet. Capture an idea." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((n) => (
            <Card key={n.id}>
              <CardHeader className="pb-2">
                {editingId === n.id ? (
                  <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                ) : (
                  <CardTitle className="text-base">{n.title}</CardTitle>
                )}
                <CardDescription>{new Date(n.updated_at).toLocaleString()}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {editingId === n.id ? (
                  <Textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} rows={4} />
                ) : (
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">{n.body || "—"}</p>
                )}
                <div className="flex gap-2">
                  {editingId === n.id ? (
                    <>
                      <Button size="sm" onClick={async () => {
                        if (!editTitle.trim()) return toast.error("Title required");
                        await update.mutateAsync({ id: n.id, title: editTitle.trim(), body: editBody });
                        setEditingId(null); toast.success("Updated");
                      }}><Check className="w-4 h-4" /> Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="w-4 h-4" /> Cancel</Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => { setEditingId(n.id); setEditTitle(n.title); setEditBody(n.body); }}>
                        <Pencil className="w-4 h-4" /> Edit
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={async () => {
                        await remove.mutateAsync(n.id); toast.success("Removed");
                      }}><Trash2 className="w-4 h-4" /> Remove</Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};

/* -------- PDFs -------- */
const PdfsTab = ({ folderId }: { folderId: string }) => {
  const { data: pdfs = [] } = usePdfs(folderId);
  const { upload, rename, remove } = usePdfMutations(folderId);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", genre: "", pages: "", posterUrl: "" });
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const submit = async () => {
    if (!file) return toast.error("Pick a PDF file");
    if (!form.title.trim()) return toast.error("Title required");
    try {
      await upload.mutateAsync({
        file,
        title: form.title.trim(),
        description: form.description.trim(),
        genre: form.genre.trim(),
        pages: Number(form.pages) || 0,
        posterUrl: form.posterUrl.trim(),
      });
      setForm({ title: "", description: "", genre: "", pages: "", posterUrl: "" });
      setFile(null); setOpen(false);
      toast.success("PDF uploaded");
    } catch (e: any) { toast.error(e.message ?? "Upload failed"); }
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">PDFs</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4" /> Upload PDF</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Upload PDF</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Genre" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} />
                <Input placeholder="Pages" type="number" value={form.pages} onChange={(e) => setForm({ ...form, pages: e.target.value })} />
              </div>
              <Input placeholder="Poster URL (optional)" value={form.posterUrl} onChange={(e) => setForm({ ...form, posterUrl: e.target.value })} />
            </div>
            <DialogFooter><Button onClick={submit} disabled={upload.isPending}>Upload</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {pdfs.length === 0 ? (
        <Empty icon={<FileText className="w-6 h-6" />} text="No PDFs yet. Upload one to your library." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pdfs.map((p) => (
            <Card key={p.id} className="overflow-hidden flex flex-col">
              {p.poster_url && (
                <div className="aspect-[16/10] bg-muted overflow-hidden">
                  <img src={p.poster_url} alt={p.title} loading="lazy" className="w-full h-full object-cover" />
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  {editingId === p.id ? (
                    <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="h-8" />
                  ) : (
                    <CardTitle className="text-base">{p.title}</CardTitle>
                  )}
                  <Badge variant="secondary">{p.genre}</Badge>
                </div>
                <CardDescription>{p.description || "—"}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto space-y-3">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{p.pages} pages</span>
                  <span>{p.size}</span>
                </div>
                <div className="flex gap-2">
                  {editingId === p.id ? (
                    <>
                      <Button size="sm" className="flex-1" onClick={async () => {
                        await rename.mutateAsync({ id: p.id, title: editTitle.trim() || p.title });
                        setEditingId(null); toast.success("Renamed");
                      }}><Check className="w-4 h-4" /> Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="w-4 h-4" /></Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="secondary" className="flex-1" asChild>
                        <a href={publicUrl("folder-pdfs", p.file_path)} target="_blank" rel="noreferrer">
                          <Download className="w-4 h-4" /> Open
                        </a>
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingId(p.id); setEditTitle(p.title); }}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={async () => {
                        await remove.mutateAsync(p); toast.success("Removed");
                      }}><Trash2 className="w-4 h-4" /></Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};

/* -------- Chat -------- */
const ChatTab = ({ folderId }: { folderId: string }) => {
  const { profile, user } = useAuth();
  const { data: messages = [] } = useChat(folderId);
  const { send, edit, remove } = useChatMutations(folderId);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const me = profile?.full_name || user?.email || "You";

  const submit = async () => {
    if (!text.trim()) return;
    await send.mutateAsync(text.trim());
    setText("");
  };

  return (
    <section>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Group chat</CardTitle>
          <CardDescription>Messages are private to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2 mb-4">
            {messages.length === 0 ? (
              <Empty icon={<MessageSquare className="w-6 h-6" />} text="No messages yet. Say hello!" />
            ) : messages.map((m) => (
              <div key={m.id} className="rounded-lg bg-secondary p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{me}</span>
                  <span className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleTimeString()}</span>
                </div>
                {editingId === m.id ? (
                  <div className="flex gap-2">
                    <Input value={editText} onChange={(e) => setEditText(e.target.value)} className="h-8" />
                    <Button size="icon" variant="secondary" onClick={async () => {
                      if (!editText.trim()) return;
                      await edit.mutateAsync({ id: m.id, text: editText.trim() });
                      setEditingId(null);
                    }}><Check className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}><X className="w-4 h-4" /></Button>
                  </div>
                ) : (
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap">{m.text}</p>
                )}
                {editingId !== m.id && (
                  <div className="flex gap-1 mt-2">
                    <Button size="sm" variant="ghost" onClick={() => { setEditingId(m.id); setEditText(m.text); }}>
                      <Pencil className="w-4 h-4" /> Edit
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={async () => {
                      await remove.mutateAsync(m.id);
                    }}><Trash2 className="w-4 h-4" /> Delete</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
            <Button onClick={submit} disabled={send.isPending}>
              <Send className="w-4 h-4" /> Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

const Empty = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="border border-dashed border-border rounded-lg p-10 text-center text-muted-foreground">
    <div className="w-10 h-10 rounded-full bg-secondary mx-auto flex items-center justify-center mb-3">{icon}</div>
    <p className="text-sm">{text}</p>
  </div>
);

export default FolderDetail;
