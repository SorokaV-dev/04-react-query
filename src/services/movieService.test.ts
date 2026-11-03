import axios from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchMovies } from "./movieService";
import type { Movie } from "../types/movie";

vi.mock("axios", () => ({
  default: { get: vi.fn() },
}));

const movie: Movie = {
  id: 3,
  poster_path: "/poster.jpg",
  backdrop_path: "/backdrop.jpg",
  title: "A Movie",
  overview: "A short description.",
  release_date: "2025-01-01",
  vote_average: 7.5,
};

describe("fetchMovies", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.mocked(axios.get).mockReset();
  });

  it("searches the requested TMDB page with the bearer token", async () => {
    vi.stubEnv("VITE_TMDB_TOKEN", "test-read-token");
    const response = {
      page: 2,
      results: [movie],
      total_pages: 4,
      total_results: 80,
    };
    vi.mocked(axios.get).mockResolvedValueOnce({ data: response });

    await expect(fetchMovies("science fiction", 2)).resolves.toEqual(response);
    expect(axios.get).toHaveBeenCalledWith(
      "https://api.themoviedb.org/3/search/movie",
      {
        params: { query: "science fiction", page: 2 },
        headers: { Authorization: "Bearer test-read-token" },
      },
    );
  });

  it("requires a token and does not make an unauthenticated request", async () => {
    await expect(fetchMovies("science fiction", 1)).rejects.toThrow(
      "TMDB access token is missing.",
    );
    expect(axios.get).not.toHaveBeenCalled();
  });
});
