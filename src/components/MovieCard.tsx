import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Movie } from '@/hooks/useMovies';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import BookingDialog from './BookingDialog';
import movie1 from '@/assets/movie-1.jpg';
import movie2 from '@/assets/movie-2.jpg';
import movie3 from '@/assets/movie-3.jpg';
import movie4 from '@/assets/movie-4.jpg';
import movie5 from '@/assets/movie-5.jpg';
import movie6 from '@/assets/movie-6.jpg';

// Fallback images map
const fallbackImages: Record<string, string> = {
  '/movie-1.jpg': movie1,
  '/movie-2.jpg': movie2,
  '/movie-3.jpg': movie3,
  '/movie-4.jpg': movie4,
  '/movie-5.jpg': movie5,
  '/movie-6.jpg': movie6,
};

interface MovieCardProps {
  movie: Movie;
}

const MovieCard = ({ movie }: MovieCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Get the appropriate image source
  const imageSrc = movie.poster_url && fallbackImages[movie.poster_url] 
    ? fallbackImages[movie.poster_url] 
    : movie.poster_url || movie1;

  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please sign in to add to favorites.',
      });
      return;
    }
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? 'Removed from Favorites' : 'Added to Favorites',
      description: isLiked ? `${movie.title} removed from your favorites.` : `${movie.title} added to your favorites.`,
    });
  };

  return (
    <>
      <div className="group relative overflow-hidden rounded-xl bg-card transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer animate-scale-in">
        {/* Image Container */}
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={imageSrc}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Like Button */}
          <button
            onClick={handleLikeClick}
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-primary hover:scale-110 z-10"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isLiked ? 'fill-primary text-primary' : 'text-foreground'
              }`}
            />
          </button>

          {/* Rating Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-md bg-card/80 backdrop-blur-sm">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold text-foreground">{movie.rating.toFixed(1)}</span>
          </div>

          {/* Availability Badge */}
          {!movie.is_available && (
            <div className="absolute top-12 left-3 px-2 py-1 rounded-md bg-destructive/80 backdrop-blur-sm">
              <span className="text-xs font-medium text-destructive-foreground">Not Available</span>
            </div>
          )}

          {/* Book Button - visible on hover */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button 
              onClick={handleBookClick}
              disabled={!movie.is_available}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {movie.is_available ? 'Book Tickets' : 'Not Available'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-foreground text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {movie.title}
          </h3>
          
          <div className="flex flex-wrap gap-1.5 mb-2">
            {movie.genres.slice(0, 2).map((genre) => (
              <Badge key={genre} variant="secondary" className="text-xs font-normal">
                {genre}
              </Badge>
            ))}
          </div>

          {(movie.language || movie.release_date) && (
            <p className="text-sm text-muted-foreground">
              {movie.language && <span>{movie.language}</span>}
              {movie.language && movie.release_date && <span className="mx-1">•</span>}
              {movie.release_date && <span>{new Date(movie.release_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
            </p>
          )}
        </div>
      </div>

      <BookingDialog 
        movie={movie} 
        open={showBookingDialog} 
        onOpenChange={setShowBookingDialog} 
      />
    </>
  );
};

export default MovieCard;
