import { Link } from "react-router-dom";
import { Folder, Image as ImageIcon, FileText, MessageSquare, Download, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFolders } from "@/lib/foldersStore";

type PdfItem = {
  id: string;
  title: string;
  description: string;
  genre: string;
  pages: number;
  size: string;
  poster: string;
};

const pdfs: PdfItem[] = [
  {
    id: "p1",
    title: "Annual Report 2025",
    description: "Comprehensive overview of yearly performance and goals.",
    genre: "Business",
    pages: 48,
    size: "3.2 MB",
    poster: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=70",
  },
  {
    id: "p2",
    title: "Design Systems Guide",
    description: "Best practices for scalable design systems.",
    genre: "Design",
    pages: 32,
    size: "5.1 MB",
    poster: "https://images.unsplash.com/photo-1561070791-2526d30994b8?w=600&q=70",
  },
  {
    id: "p3",
    title: "Modern Web Architecture",
    description: "Patterns and pitfalls for production-grade web apps.",
    genre: "Technology",
    pages: 64,
    size: "4.8 MB",
    poster: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=70",
  },
  {
    id: "p4",
    title: "Brand Style Guide",
    description: "Logo usage, typography and color palette.",
    genre: "Branding",
    pages: 22,
    size: "2.4 MB",
    poster: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&q=70",
  },
  {
    id: "p5",
    title: "Marketing Playbook",
    description: "Channel strategy, funnels and KPI frameworks.",
    genre: "Marketing",
    pages: 56,
    size: "6.0 MB",
    poster: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600&q=70",
  },
  {
    id: "p6",
    title: "Product Research Notes",
    description: "User interviews, insights and opportunity mapping.",
    genre: "Research",
    pages: 40,
    size: "3.7 MB",
    poster: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&q=70",
  },
];

const Index = () => {
  const folders = useFolders();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center font-bold text-primary-foreground">
              U
            </div>
            <span className="text-xl font-bold tracking-tight">Unaad</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#folders" className="hover:text-foreground transition-colors">Folders</a>
            <a href="#pdfs" className="hover:text-foreground transition-colors">PDFs</a>
          </nav>
          <Button size="sm">Get Started</Button>
        </div>
      </header>

      <main>
        <section className="border-b border-border" style={{ background: "var(--gradient-hero)" }}>
          <div className="container py-16 md:py-24 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
              Organize everything in <span className="text-gradient">Unaad</span>
            </h1>
            <p className="max-w-2xl mx-auto text-base md:text-lg text-muted-foreground mb-8">
              Featured folders with images, important text, PDFs and chat groups — all in one place.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button size="lg" asChild>
                <a href="#folders">Explore Folders</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#pdfs">Browse PDFs</a>
              </Button>
            </div>
          </div>
        </section>

        <section id="folders" className="container py-12 md:py-16">
          <div className="flex items-end justify-between mb-6 md:mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Featured Folders</h2>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                Open a folder to add, rename or remove images, text, PDFs and chat messages.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {folders.map((f) => (
              <Card key={f.id} className="card-hover overflow-hidden">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/15 text-primary flex items-center justify-center mb-3">
                    <Folder className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-lg">{f.name}</CardTitle>
                  <CardDescription>{f.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ImageIcon className="w-4 h-4" /> {f.images.length} images
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="w-4 h-4" /> {f.notes.length} texts
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="w-4 h-4" /> {f.pdfs.length} PDFs
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MessageSquare className="w-4 h-4" /> {f.chat.length} chats
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" className="w-full" asChild>
                    <Link to={`/folder/${f.id}`}>Open folder</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="pdfs" className="container py-12 md:py-16 border-t border-border">
          <div className="flex items-end justify-between mb-6 md:mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">PDF Listings</h2>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                Browse PDFs with posters, details and genres.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {pdfs.map((p) => (
              <Card key={p.id} className="card-hover overflow-hidden flex flex-col">
                <div className="aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={p.poster}
                    alt={`${p.title} poster`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{p.title}</CardTitle>
                    <Badge variant="secondary">{p.genre}</Badge>
                  </div>
                  <CardDescription>{p.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{p.pages} pages</span>
                    <span>{p.size}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" className="flex-1">
                      <Eye className="w-4 h-4" /> View
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Download className="w-4 h-4" /> Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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

export default Index;
