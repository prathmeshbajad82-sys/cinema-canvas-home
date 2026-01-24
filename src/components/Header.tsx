import { Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">B</span>
            </div>
            <span className="text-xl md:text-2xl font-bold text-foreground">
              Book<span className="text-primary">My</span>Show
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">Movies</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Stream</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Events</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Plays</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Sports</a>
          </nav>

          {/* Search and Actions */}
          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for Movies, Events..."
                className="w-64 pl-10 pr-4 py-2 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button variant="default" size="sm">
              Sign In
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for Movies, Events..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <nav className="flex flex-col gap-4">
              <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">Movies</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Stream</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Events</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Plays</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Sports</a>
            </nav>
            <Button variant="default" className="w-full mt-4">
              Sign In
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
