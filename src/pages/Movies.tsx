import { Link } from 'react-router-dom';
import { useAvailableMovies, useMovies } from '@/hooks/useMovies';
import { useRealtimeMovies } from '@/hooks/useRealtimeMovies';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Clock, Star, ArrowLeft } from 'lucide-react';

const Movies = () => {
  useRealtimeMovies();
  const { data: movies, isLoading } = useMovies();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <h1 className="text-lg font-semibold">Movies</h1>
          <span className="text-xs text-muted-foreground hidden sm:inline">Live availability</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : !movies || movies.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">No movies yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {movies.map((m) => {
              const available = (m as any).is_available !== false;
              return (
                <Card key={m.id} className="overflow-hidden group">
                  <div className="aspect-[2/3] bg-muted relative overflow-hidden">
                    {m.poster_url ? (
                      <img src={m.poster_url} alt={m.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">No poster</div>
                    )}
                    <Badge className="absolute top-2 right-2" variant={available ? 'default' : 'secondary'}>
                      {available ? 'Available' : 'Sold out'}
                    </Badge>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base line-clamp-1">{m.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" />{m.rating}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{m.duration}m</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline">{m.genre}</Badge>
                    </div>
                    <Button size="sm" className="w-full mt-2" disabled={!available}>
                      {available ? 'Book now' : 'Unavailable'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Movies;
