import axios from "axios";
import type { Movie } from "../types/movie";

interface SearchMoviesResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

const API_URL = "https://api.themoviedb.org/3/search/movie";

export async function fetchMovies(
  query: string,
  page: number,
  signal?: AbortSignal,
): Promise<SearchMoviesResponse> {
  const token = import.meta.env.VITE_TMDB_TOKEN;

  if (!token) {
    throw new Error("TMDB access token is missing.");
  }

  const response = await axios.get<SearchMoviesResponse>(API_URL, {
    params: { query, page },
    headers: { Authorization: `Bearer ${token}` },
    ...(signal ? { signal } : {}),
  });

  return response.data;
}
