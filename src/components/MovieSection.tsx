import MovieCard from "./MovieCard";
import movie1 from "@/assets/movie-1.jpg";
import movie2 from "@/assets/movie-2.jpg";
import movie3 from "@/assets/movie-3.jpg";
import movie4 from "@/assets/movie-4.jpg";
import movie5 from "@/assets/movie-5.jpg";
import movie6 from "@/assets/movie-6.jpg";

const movies = [
  {
    id: 1,
    title: "Dark Vengeance",
    image: movie1,
    rating: 8.9,
    genres: ["Action", "Thriller"],
    language: "English",
    releaseDate: "Jan 24, 2026",
  },
  {
    id: 2,
    title: "Love in Paris",
    image: movie2,
    rating: 8.2,
    genres: ["Romance", "Drama"],
    language: "English",
    releaseDate: "Jan 20, 2026",
  },
  {
    id: 3,
    title: "The Haunting Manor",
    image: movie3,
    rating: 7.8,
    genres: ["Horror", "Mystery"],
    language: "English",
    releaseDate: "Jan 18, 2026",
  },
  {
    id: 4,
    title: "Galactic Odyssey",
    image: movie4,
    rating: 9.1,
    genres: ["Sci-Fi", "Adventure"],
    language: "English",
    releaseDate: "Jan 25, 2026",
  },
  {
    id: 5,
    title: "Family Adventure",
    image: movie5,
    rating: 8.5,
    genres: ["Animation", "Family"],
    language: "English",
    releaseDate: "Jan 22, 2026",
  },
  {
    id: 6,
    title: "Shadow Detective",
    image: movie6,
    rating: 8.0,
    genres: ["Crime", "Noir"],
    language: "English",
    releaseDate: "Jan 23, 2026",
  },
];

interface MovieSectionProps {
  title: string;
  subtitle?: string;
}

const MovieSection = ({ title, subtitle }: MovieSectionProps) => {
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

        {/* Movie Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {movies.map((movie, index) => (
            <div
              key={movie.id}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <MovieCard {...movie} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MovieSection;
