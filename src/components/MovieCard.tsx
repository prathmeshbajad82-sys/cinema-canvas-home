import { Star, Heart } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface MovieCardProps {
  title: string;
  image: string;
  rating: number;
  genres: string[];
  releaseDate?: string;
  language?: string;
}

const MovieCard = ({ title, image, rating, genres, releaseDate, language }: MovieCardProps) => {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="group relative overflow-hidden rounded-xl bg-card transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer animate-scale-in">
      {/* Image Container */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-primary hover:scale-110 z-10"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isLiked ? "fill-primary text-primary" : "text-foreground"
            }`}
          />
        </button>

        {/* Rating Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-md bg-card/80 backdrop-blur-sm">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-semibold text-foreground">{rating.toFixed(1)}</span>
        </div>

        {/* Book Button - visible on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
            Book Tickets
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <div className="flex flex-wrap gap-1.5 mb-2">
          {genres.slice(0, 2).map((genre) => (
            <Badge key={genre} variant="secondary" className="text-xs font-normal">
              {genre}
            </Badge>
          ))}
        </div>

        {(language || releaseDate) && (
          <p className="text-sm text-muted-foreground">
            {language && <span>{language}</span>}
            {language && releaseDate && <span className="mx-1">•</span>}
            {releaseDate && <span>{releaseDate}</span>}
          </p>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
