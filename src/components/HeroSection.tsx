import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useFeaturedMovies, Movie } from '@/hooks/useMovies';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import BookingDialog from './BookingDialog';
import movie1 from '@/assets/movie-1.jpg';
import movie2 from '@/assets/movie-2.jpg';
import movie3 from '@/assets/movie-3.jpg';

// Fallback images map
const fallbackImages: Record<string, string> = {
  '/movie-1.jpg': movie1,
  '/movie-2.jpg': movie2,
  '/movie-3.jpg': movie3,
};

// Fallback featured movies
const fallbackFeaturedMovies: Movie[] = [
  {
    id: '1',
    title: 'Dark Vengeance',
    description: 'A masked vigilante emerges from the shadows.',
    tagline: 'Justice Has A New Face',
    duration: 142,
    release_date: '2026-01-24',
    poster_url: '/movie-1.jpg',
    rating: 8.9,
    genres: ['Action', 'Thriller'],
    language: 'English',
    is_available: true,
    is_featured: true,
    show_times: ['10:00 AM', '1:30 PM', '5:00 PM', '9:00 PM'],
    ticket_price: 200,
    available_seats: 85,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Love in Paris',
    description: 'Two strangers meet in the City of Lights.',
    tagline: 'Where Dreams Find Their Way',
    duration: 118,
    release_date: '2026-01-20',
    poster_url: '/movie-2.jpg',
    rating: 8.2,
    genres: ['Romance', 'Drama'],
    language: 'English',
    is_available: true,
    is_featured: true,
    show_times: ['11:00 AM', '2:30 PM', '6:00 PM'],
    ticket_price: 150,
    available_seats: 120,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'The Haunting Manor',
    description: 'A family discovers dark secrets within ancient walls.',
    tagline: 'Some Doors Should Stay Closed',
    duration: 125,
    release_date: '2026-01-18',
    poster_url: '/movie-3.jpg',
    rating: 7.8,
    genres: ['Horror', 'Mystery'],
    language: 'English',
    is_available: true,
    is_featured: true,
    show_times: ['12:00 PM', '4:00 PM', '8:00 PM', '11:00 PM'],
    ticket_price: 175,
    available_seats: 60,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  
  const { data: featuredMovies, isLoading } = useFeaturedMovies();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Use fallback if no data
  const movies = featuredMovies && featuredMovies.length > 0 ? featuredMovies : fallbackFeaturedMovies;
  const movie = movies[currentSlide] || movies[0];

  useEffect(() => {
    if (movies.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % movies.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [movies.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % movies.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + movies.length) % movies.length);
  };

  const handleBookClick = () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please sign in to book tickets.',
      });
      navigate('/auth');
      return;
    }
    setShowBookingDialog(true);
  };

  // Get the appropriate image source
  const imageSrc = movie?.poster_url && fallbackImages[movie.poster_url] 
    ? fallbackImages[movie.poster_url] 
    : movie?.poster_url || movie1;

  if (isLoading) {
    return (
      <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center overflow-hidden bg-card">
        <div className="container relative z-10 px-4 py-24 md:py-32">
          <div className="max-w-2xl space-y-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-16 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-12 w-48" />
          </div>
        </div>
      </section>
    );
  }

  if (!movie) return null;

  return (
    <>
      <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: `url(${imageSrc})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
        </div>

        {/* Content */}
        <div className="container relative z-10 px-4 py-24 md:py-32">
          <div className="max-w-2xl animate-fade-in" key={movie.id}>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium border border-primary/30">
                Featured
              </span>
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-semibold">{movie.rating}</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 leading-tight">
              {movie.title}
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-2 italic">
              "{movie.tagline}"
            </p>

            <p className="text-muted-foreground mb-8">
              {movie.genres.join(' / ')}
            </p>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="gap-2" onClick={handleBookClick}>
                <Play className="w-5 h-5" />
                Book Tickets
              </Button>
              <Button size="lg" variant="outline" className="border-muted-foreground/30 hover:bg-secondary">
                Watch Trailer
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {movies.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all z-20"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all z-20"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {movies.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {movies.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? 'w-8 bg-primary'
                    : 'bg-muted-foreground/50 hover:bg-muted-foreground'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {movie && (
        <BookingDialog 
          movie={movie} 
          open={showBookingDialog} 
          onOpenChange={setShowBookingDialog} 
        />
      )}
    </>
  );
};

export default HeroSection;
