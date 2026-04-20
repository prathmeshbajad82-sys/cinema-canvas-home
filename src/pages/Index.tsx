import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Folder, Image as ImageIcon, FileText, MessageSquare, Plus, LogOut, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useFolders, useCreateFolder, useDeleteFolder } from "@/hooks/useFolders";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const { user, profile, loading, signOut } = useAuth();
  const { data: folders = [], isLoading } = useFolders();
  const createFolder = useCreateFolder();
  const deleteFolder = useDeleteFolder();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const submit = async () => {
    if (!name.trim()) return toast.error("Folder name is required");
    try {
      await createFolder.mutateAsync({ name: name.trim(), description: description.trim() });
      setName(""); setDescription(""); setOpen(false);
      toast.success("Folder created");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to create folder");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this folder and all its contents?")) return;
    try {
      await deleteFolder.mutateAsync(id);
      toast.success("Folder deleted");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to delete folder");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center font-bold text-primary-foreground">U</div>
            <span className="text-xl font-bold tracking-tight">Unaad</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden sm:inline text-sm text-muted-foreground">
                  {profile?.full_name || user.email}
                </span>
                <Button size="sm" variant="ghost" onClick={signOut}>
                  <LogOut className="w-4 h-4" /> Sign out
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => navigate("/auth")}>Sign in</Button>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-border" style={{ background: "var(--gradient-hero)" }}>
          <div className="container py-16 md:py-24 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
              Organize everything in <span className="text-gradient">Unaad</span>
            </h1>
            <p className="max-w-2xl mx-auto text-base md:text-lg text-muted-foreground mb-8">
              Folders that hold your images, notes, PDFs and chats — synced to the cloud across devices.
            </p>
            {!user && !loading && (
              <Button size="lg" onClick={() => navigate("/auth")}>Get started</Button>
            )}
          </div>
        </section>

        <section className="container py-12 md:py-16">
          <div className="flex items-end justify-between mb-6 md:mb-8 gap-3 flex-wrap">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Your Folders</h2>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                Create folders to organise images, text, PDFs and chat messages.
              </p>
            </div>
            {user && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="w-4 h-4" /> New folder</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Create folder</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <Input placeholder="Folder name" value={name} onChange={(e) => setName(e.target.value)} />
                    <Textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                  </div>
                  <DialogFooter>
                    <Button onClick={submit} disabled={createFolder.isPending}>Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {!user ? (
            <EmptyCard
              title="Sign in to view your folders"
              text="Your data syncs to Lovable Cloud so you can access it from any device."
              action={<Button onClick={() => navigate("/auth")}>Sign in</Button>}
            />
          ) : isLoading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : folders.length === 0 ? (
            <EmptyCard
              title="No folders yet"
              text="Create your first folder to start organising content."
              action={<Button onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> New folder</Button>}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {folders.map((f) => (
                <Card key={f.id} className="card-hover overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-lg bg-primary/15 text-primary flex items-center justify-center mb-3">
                        <Folder className="w-6 h-6" />
                      </div>
                      <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => onDelete(f.id)} aria-label="Delete folder">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-lg">{f.name}</CardTitle>
                    <CardDescription>{f.description || "—"}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground"><ImageIcon className="w-4 h-4" /> {f.counts.images} images</div>
                      <div className="flex items-center gap-2 text-muted-foreground"><FileText className="w-4 h-4" /> {f.counts.notes} notes</div>
                      <div className="flex items-center gap-2 text-muted-foreground"><FileText className="w-4 h-4" /> {f.counts.pdfs} PDFs</div>
                      <div className="flex items-center gap-2 text-muted-foreground"><MessageSquare className="w-4 h-4" /> {f.counts.chat} chats</div>
                    </div>
                    <Button variant="secondary" size="sm" className="w-full" asChild>
                      <Link to={`/folder/${f.id}`}>Open folder</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-border py-8 mt-8">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Unaad. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

const EmptyCard = ({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) => (
  <div className="border border-dashed border-border rounded-lg p-10 text-center">
    <h3 className="text-lg font-semibold mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground mb-4">{text}</p>
    {action}
  </div>
);

export default Index;
