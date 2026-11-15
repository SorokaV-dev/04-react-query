import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Toaster, toast } from "react-hot-toast";
import ReactPaginate from "react-paginate";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import Loader from "../Loader/Loader";
import MovieGrid from "../MovieGrid/MovieGrid";
import MovieModal from "../MovieModal/MovieModal";
import SearchBar from "../SearchBar/SearchBar";
import { fetchMovies } from "../../services/movieService";
import type { Movie } from "../../types/movie";
import css from "./App.module.css";

const ReactPaginateComponent =
  (ReactPaginate as unknown as { default?: typeof ReactPaginate }).default ??
  ReactPaginate;

function App() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const { data, isError, isFetching } = useQuery({
    queryKey: ["movies", query, page],
    queryFn: ({ signal }) => fetchMovies(query, page, signal),
    enabled: Boolean(query),
  });

  useEffect(() => {
    if (query && data?.results.length === 0) {
      toast.error("No movies found for your request.");
    }
  }, [data, query]);

  const handleSearch = useCallback((searchQuery: string) => {
    const normalizedQuery = searchQuery.trim();
    if (!normalizedQuery) return;

    setSelectedMovie(null);
    setPage(1);
    setQuery(normalizedQuery);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedMovie(null);
  }, []);

  const handlePageChange = useCallback(({ selected }: { selected: number }) => {
    setSelectedMovie(null);
    setPage(selected + 1);
  }, []);

  const movies = data?.results ?? [];
  const totalPages = data?.total_pages ?? 0;

  return (
    <main className={css.app}>
      <SearchBar onSubmit={handleSearch} />
      <section aria-live="polite">
        {isFetching && !data ? (
          <Loader />
        ) : isError ? (
          <ErrorMessage />
        ) : movies.length > 0 ? (
          <MovieGrid movies={movies} onSelect={setSelectedMovie} />
        ) : null}
      </section>
      {totalPages > 1 && (
        <ReactPaginateComponent
          pageCount={totalPages}
          pageRangeDisplayed={5}
          marginPagesDisplayed={1}
          onPageChange={handlePageChange}
          forcePage={page - 1}
          containerClassName={css.pagination}
          activeClassName={css.active}
          nextLabel="→"
          previousLabel="←"
        />
      )}
      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={handleCloseModal} />
      )}
      <Toaster position="top-right" />
    </main>
  );
}

export default App;
