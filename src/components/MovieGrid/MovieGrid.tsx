import type { KeyboardEvent } from "react";
import type { Movie } from "../../types/movie";
import css from "./MovieGrid.module.css";

interface MovieGridProps {
  movies: Movie[];
  onSelect: (movie: Movie) => void;
}

const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";

function MovieGrid({ movies, onSelect }: MovieGridProps) {
  const handleKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    movie: Movie,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.currentTarget.focus();
      onSelect(movie);
    }
  };

  return (
    <ul className={css.grid}>
      {movies.map((movie) => (
        <li key={movie.id}>
          <div
            className={css.card}
            role="button"
            tabIndex={0}
            onClick={(event) => {
              event.currentTarget.focus();
              onSelect(movie);
            }}
            onKeyDown={(event) => handleKeyDown(event, movie)}
          >
            {movie.poster_path && (
              <img
                className={css.image}
                src={`${POSTER_BASE_URL}${movie.poster_path}`}
                alt={movie.title}
                loading="lazy"
              />
            )}
            <h2 className={css.title}>{movie.title}</h2>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default MovieGrid;
