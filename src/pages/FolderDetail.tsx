import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Folder as FolderIcon,
  Image as ImageIcon,
  FileText,
  MessageSquare,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useFolder, useFolderActions } from "@/lib/foldersStore";
import { toast } from "sonner";

const FolderDetail = () => {
  const { id = "" } = useParams();
  const folder = useFolder(id);
  const actions = useFolderActions(id);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(folder?.name ?? "");

  const counts = useMemo(
    () => ({
      images: folder?.images.length ?? 0,
      notes: folder?.notes.length ?? 0,
      pdfs: folder?.pdfs.length ?? 0,
      chat: folder?.chat.length ?? 0,
    }),
    [folder],
  );

  if (!folder) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-2">Folder not found</h1>
          <p className="text-muted-foreground mb-6">This folder may have been removed.</p>
          <Button asChild>
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const saveName = () => {
    const next = nameDraft.trim();
    if (!next) {
      toast.error("Folder name cannot be empty");
      return;
    }
    actions.renameFolder(next);
    setEditingName(false);
    toast.success("Folder renamed");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon">
              <Link to="/" aria-label="Back to home">
                <ArrowLeft />
              </Link>
            </Button>
            <div className="w-9 h-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
              <FolderIcon className="w-5 h-5" />
            </div>
            {editingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  className="h-9 w-48 md:w-64"
                  autoFocus
                />
                <Button size="icon" variant="secondary" onClick={saveName} aria-label="Save name">
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setNameDraft(folder.name);
                    setEditingName(false);
                  }}
                  aria-label="Cancel"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-bold">{folder.name}</h1>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setNameDraft(folder.name);
                    setEditingName(true);
                  }}
                  aria-label="Rename folder"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container py-6 md:py-10">
        <p className="text-muted-foreground mb-6">{folder.description}</p>

        <Tabs defaultValue="images" className="w-full">
          <TabsList className="grid grid-cols-4 w-full md:w-auto">
            <TabsTrigger value="images" className="gap-2">
              <ImageIcon className="w-4 h-4" /> Images
              <Badge variant="secondary" className="ml-1">{counts.images}</Badge>
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-2">
              <FileText className="w-4 h-4" /> Notes
              <Badge variant="secondary" className="ml-1">{counts.notes}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pdfs" className="gap-2">
              <FileText className="w-4 h-4" /> PDFs
              <Badge variant="secondary" className="ml-1">{counts.pdfs}</Badge>
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2">
              <MessageSquare className="w-4 h-4" /> Chat
              <Badge variant="secondary" className="ml-1">{counts.chat}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="images" className="mt-6">
            <ImagesTab folderId={folder.id} />
          </TabsContent>
          <TabsContent value="notes" className="mt-6">
            <NotesTab folderId={folder.id} />
          </TabsContent>
          <TabsContent value="pdfs" className="mt-6">
            <PdfsTab folderId={folder.id} />
          </TabsContent>
          <TabsContent value="chat" className="mt-6">
            <ChatTab folderId={folder.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

/* -------- Images -------- */
const ImagesTab = ({ folderId }: { folderId: string }) => {
  const folder = useFolder(folderId)!;
  const { addImage, removeImage, renameImage } = useFolderActions(folderId);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const submit = () => {
    if (!url.trim()) return toast.error("Image URL is required");
    addImage({ name: name.trim() || "Untitled", url: url.trim() });
    setName("");
    setUrl("");
    setOpen(false);
    toast.success("Image added");
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Images</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4" /> Add image</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add image</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
              <Input placeholder="Image URL" value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>
            <DialogFooter>
              <Button onClick={submit}>Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {folder.images.length === 0 ? (
        <EmptyState icon={<ImageIcon className="w-6 h-6" />} text="No images yet. Add one to get started." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {folder.images.map((img) => (
            <Card key={img.id} className="overflow-hidden">
              <div className="aspect-square bg-muted overflow-hidden">
                <img src={img.url} alt={img.name} loading="lazy" className="w-full h-full object-cover" />
              </div>
              <CardContent className="p-3 space-y-2">
                {editingId === img.id ? (
                  <div className="flex gap-1">
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8" />
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => {
                        renameImage(img.id, editName.trim() || img.name);
                        setEditingId(null);
                      }}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm truncate" title={img.name}>{img.name}</p>
                )}
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1"
                    onClick={() => {
                      setEditingId(img.id);
                      setEditName(img.name);
                    }}
                  >
                    <Pencil className="w-4 h-4" /> Rename
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 text-destructive hover:text-destructive"
                    onClick={() => {
                      removeImage(img.id);
                      toast.success("Image removed");
                    }}
                  >
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
  const folder = useFolder(folderId)!;
  const { addNote, updateNote, removeNote } = useFolderActions(folderId);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  const submit = () => {
    if (!title.trim()) return toast.error("Title is required");
    addNote({ title: title.trim(), body: body.trim() });
    setTitle("");
    setBody("");
    setOpen(false);
    toast.success("Note added");
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Text notes</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4" /> Add note</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New note</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea
                placeholder="Write something important..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
              />
            </div>
            <DialogFooter>
              <Button onClick={submit}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {folder.notes.length === 0 ? (
        <EmptyState icon={<FileText className="w-6 h-6" />} text="No notes yet. Capture an idea or memo." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {folder.notes.map((n) => (
            <Card key={n.id}>
              <CardHeader className="pb-2">
                {editingId === n.id ? (
                  <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                ) : (
                  <CardTitle className="text-base">{n.title}</CardTitle>
                )}
                <CardDescription>{new Date(n.updatedAt).toLocaleString()}</CardDescription>
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
                      <Button
                        size="sm"
                        onClick={() => {
                          if (!editTitle.trim()) return toast.error("Title required");
                          updateNote(n.id, { title: editTitle.trim(), body: editBody });
                          setEditingId(null);
                          toast.success("Note updated");
                        }}
                      >
                        <Check className="w-4 h-4" /> Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        <X className="w-4 h-4" /> Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditingId(n.id);
                          setEditTitle(n.title);
                          setEditBody(n.body);
                        }}
                      >
                        <Pencil className="w-4 h-4" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          removeNote(n.id);
                          toast.success("Note removed");
                        }}
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </Button>
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
  const folder = useFolder(folderId)!;
  const { addPdf, removePdf, renamePdf } = useFolderActions(folderId);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    genre: "",
    pages: "",
    size: "",
    poster: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const submit = () => {
    if (!form.title.trim()) return toast.error("Title is required");
    addPdf({
      title: form.title.trim(),
      description: form.description.trim(),
      genre: form.genre.trim() || "General",
      pages: Number(form.pages) || 0,
      size: form.size.trim() || "—",
      poster:
        form.poster.trim() ||
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=70",
    });
    setForm({ title: "", description: "", genre: "", pages: "", size: "", poster: "" });
    setOpen(false);
    toast.success("PDF added");
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">PDFs</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4" /> Add PDF</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add PDF</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Genre" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} />
                <Input placeholder="Pages" type="number" value={form.pages} onChange={(e) => setForm({ ...form, pages: e.target.value })} />
              </div>
              <Input placeholder="Size (e.g. 2.4 MB)" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
              <Input placeholder="Poster URL (optional)" value={form.poster} onChange={(e) => setForm({ ...form, poster: e.target.value })} />
            </div>
            <DialogFooter>
              <Button onClick={submit}>Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {folder.pdfs.length === 0 ? (
        <EmptyState icon={<FileText className="w-6 h-6" />} text="No PDFs yet. Add one to your library." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {folder.pdfs.map((p) => (
            <Card key={p.id} className="overflow-hidden flex flex-col">
              <div className="aspect-[16/10] bg-muted overflow-hidden">
                <img src={p.poster} alt={p.title} loading="lazy" className="w-full h-full object-cover" />
              </div>
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
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          renamePdf(p.id, editTitle.trim() || p.title);
                          setEditingId(null);
                          toast.success("PDF renamed");
                        }}
                      >
                        <Check className="w-4 h-4" /> Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1"
                        onClick={() => {
                          setEditingId(p.id);
                          setEditTitle(p.title);
                        }}
                      >
                        <Pencil className="w-4 h-4" /> Rename
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1 text-destructive hover:text-destructive"
                        onClick={() => {
                          removePdf(p.id);
                          toast.success("PDF removed");
                        }}
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </Button>
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
  const folder = useFolder(folderId)!;
  const { addMessage, editMessage, removeMessage } = useFolderActions(folderId);
  const [author, setAuthor] = useState("You");
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    addMessage({ author: author.trim() || "You", text: text.trim() });
    setText("");
  };

  return (
    <section>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Group chat</CardTitle>
          <CardDescription>Share quick messages with your team.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2 mb-4">
            {folder.chat.length === 0 ? (
              <EmptyState icon={<MessageSquare className="w-6 h-6" />} text="No messages yet. Say hello!" />
            ) : (
              folder.chat.map((m) => (
                <div key={m.id} className="rounded-lg bg-secondary p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{m.author}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(m.ts).toLocaleTimeString()}
                    </span>
                  </div>
                  {editingId === m.id ? (
                    <div className="flex gap-2">
                      <Input value={editText} onChange={(e) => setEditText(e.target.value)} className="h-8" />
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => {
                          if (!editText.trim()) return;
                          editMessage(m.id, editText.trim());
                          setEditingId(null);
                        }}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">{m.text}</p>
                  )}
                  {editingId !== m.id && (
                    <div className="flex gap-1 mt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingId(m.id);
                          setEditText(m.text);
                        }}
                      >
                        <Pencil className="w-4 h-4" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeMessage(m.id)}
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr_auto] gap-2">
            <Input placeholder="Your name" value={author} onChange={(e) => setAuthor(e.target.value)} />
            <Input
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <Button onClick={send}>
              <Send className="w-4 h-4" /> Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

const EmptyState = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="border border-dashed border-border rounded-lg p-10 text-center text-muted-foreground">
    <div className="w-10 h-10 rounded-full bg-secondary mx-auto flex items-center justify-center mb-3">
      {icon}
    </div>
    <p className="text-sm">{text}</p>
  </div>
);

export default FolderDetail;
