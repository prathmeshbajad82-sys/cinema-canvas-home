import { Skeleton } from '@/components/ui/skeleton';
import MovieCard from './MovieCard';
import { useAvailableMovies, Movie } from '@/hooks/useMovies';
import movie1 from '@/assets/movie-1.jpg';
import movie2 from '@/assets/movie-2.jpg';
import movie3 from '@/assets/movie-3.jpg';
import movie4 from '@/assets/movie-4.jpg';
import movie5 from '@/assets/movie-5.jpg';
import movie6 from '@/assets/movie-6.jpg';

// Fallback movies for when database is empty
const fallbackMovies: Movie[] = [
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
  {
    id: '4',
    title: 'Galactic Odyssey',
    description: 'Explorers journey to discover humanity origins.',
    tagline: 'Beyond The Stars Lies The Truth',
    duration: 156,
    release_date: '2026-01-25',
    poster_url: '/movie-4.jpg',
    rating: 9.1,
    genres: ['Sci-Fi', 'Adventure'],
    language: 'English',
    is_available: true,
    is_featured: false,
    show_times: ['10:30 AM', '2:00 PM', '5:30 PM', '9:30 PM'],
    ticket_price: 250,
    available_seats: 95,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Family Adventure',
    description: 'An animated tale of a quirky animal family.',
    tagline: 'Together We Can Do Anything',
    duration: 98,
    release_date: '2026-01-22',
    poster_url: '/movie-5.jpg',
    rating: 8.5,
    genres: ['Animation', 'Family'],
    language: 'English',
    is_available: true,
    is_featured: false,
    show_times: ['9:00 AM', '11:30 AM', '2:00 PM', '4:30 PM'],
    ticket_price: 120,
    available_seats: 150,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    title: 'Shadow Detective',
    description: 'A noir detective story set in 1940s Los Angeles.',
    tagline: 'Every Shadow Hides A Secret',
    duration: 134,
    release_date: '2026-01-23',
    poster_url: '/movie-6.jpg',
    rating: 8.0,
    genres: ['Crime', 'Noir'],
    language: 'English',
    is_available: true,
    is_featured: false,
    show_times: ['1:00 PM', '4:30 PM', '8:00 PM'],
    ticket_price: 180,
    available_seats: 70,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

interface MovieSectionProps {
  title: string;
  subtitle?: string;
}

const MovieSection = ({ title, subtitle }: MovieSectionProps) => {
  const { data: movies, isLoading, error } = useAvailableMovies();

  // Use fallback movies if no data from database
  const displayMovies = movies && movies.length > 0 ? movies : fallbackMovies;

  return (
    <section className="py-12 md:py-16">
      <div className="container px-4">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
              {title}
            </h2>
            {subtitle && (
              <p className="text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <a
            href="#"
            className="text-primary hover:text-primary/80 transition-colors font-medium text-sm hidden sm:block"
          >
            See All →
          </a>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[2/3] rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Movie Grid */}
        {!isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {displayMovies.map((movie, index) => (
              <div
                key={movie.id}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <p className="text-center text-muted-foreground py-8">
            Using demo movies. Connect database to see real data.
          </p>
        )}
      </div>
    </section>
  );
};

export default MovieSection;
