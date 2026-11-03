import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { MouseEvent } from "react";
import type { Movie } from "../../types/movie";
import css from "./MovieModal.module.css";

interface MovieModalProps {
  movie: Movie;
  onClose: () => void;
}

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";
const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";

function MovieModal({ movie, onClose }: MovieModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousActiveElement = document.activeElement;
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus();
      }
    };
  }, [onClose]);

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  const backdropPath = movie.backdrop_path
    ? `${IMAGE_BASE_URL}${movie.backdrop_path}`
    : movie.poster_path
      ? `${POSTER_BASE_URL}${movie.poster_path}`
      : undefined;

  return createPortal(
    <div
      className={css.backdrop}
      data-testid="modal-backdrop"
      onClick={handleBackdropClick}
    >
      <div
        className={css.modal}
        role="dialog"
        aria-modal="true"
        aria-label={movie.title}
      >
        {backdropPath && (
          <img className={css.image} src={backdropPath} alt="" />
        )}
        <button
          ref={closeButtonRef}
          className={css.closeButton}
          type="button"
          aria-label="Close modal"
          onClick={onClose}
        >
          ×
        </button>
        <div className={css.content}>
          <h2>{movie.title}</h2>
          <p>{movie.overview}</p>
          <p>
            <strong>Release date:</strong> {movie.release_date}
          </p>
          <p>
            <strong>Rating:</strong> {movie.vote_average}/10
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default MovieModal;
