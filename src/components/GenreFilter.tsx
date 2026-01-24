import { useState } from "react";

const genres = [
  { id: "all", name: "All", icon: "🎬" },
  { id: "action", name: "Action", icon: "💥" },
  { id: "comedy", name: "Comedy", icon: "😂" },
  { id: "drama", name: "Drama", icon: "🎭" },
  { id: "horror", name: "Horror", icon: "👻" },
  { id: "romance", name: "Romance", icon: "💕" },
  { id: "scifi", name: "Sci-Fi", icon: "🚀" },
  { id: "animation", name: "Animation", icon: "🎨" },
];

const GenreFilter = () => {
  const [activeGenre, setActiveGenre] = useState("all");

  return (
    <section className="py-6 border-b border-border">
      <div className="container px-4">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => setActiveGenre(genre.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                activeGenre === genre.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              <span>{genre.icon}</span>
              <span className="font-medium">{genre.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GenreFilter;
