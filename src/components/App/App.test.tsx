import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { fetchMovies } from "../../services/movieService";
import type { Movie } from "../../types/movie";

vi.mock("../../services/movieService", () => ({
  fetchMovies: vi.fn(),
}));

const movie: Movie = {
  id: 1,
  poster_path: "/poster.jpg",
  backdrop_path: "/backdrop.jpg",
  title: "The Grand Budapest Hotel",
  overview: "A hotel concierge and his lobby boy solve a mystery.",
  release_date: "2014-02-26",
  vote_average: 8.1,
};

const secondMovie: Movie = {
  ...movie,
  id: 2,
  title: "The Grand Budapest Hotel: Part Two",
};

const fetchMoviesMock = vi.mocked(fetchMovies);
const queryClients: QueryClient[] = [];

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  queryClients.push(queryClient);
  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
}

describe("Movie Gallery", () => {
  beforeEach(() => {
    fetchMoviesMock.mockReset();
  });

  afterEach(() => {
    queryClients.splice(0).forEach((queryClient) => queryClient.clear());
  });

  it("shows the required toast when the search field is empty", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(
      await screen.findByText("Please enter your search query."),
    ).toBeInTheDocument();
    expect(fetchMoviesMock).not.toHaveBeenCalled();
  });

  it("shows loading, displays results, and opens movie details", async () => {
    const user = userEvent.setup();
    let resolveSearch:
      | ((response: {
          page: number;
          results: Movie[];
          total_pages: number;
          total_results: number;
        }) => void)
      | undefined;
    fetchMoviesMock.mockReturnValue(
      new Promise((resolve) => {
        resolveSearch = resolve;
      }),
    );
    renderApp();

    await user.type(
      screen.getByRole("searchbox", { name: "Search movies" }),
      "hotel",
    );
    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(
      screen.getByText("Loading movies, please wait..."),
    ).toBeInTheDocument();
    await act(async () => {
      resolveSearch?.({
        page: 1,
        results: [movie],
        total_pages: 1,
        total_results: 1,
      });
    });

    const movieCard = await screen.findByRole("button", {
      name: /The Grand Budapest Hotel/,
    });
    expect(within(movieCard).getByRole("img")).toHaveAttribute(
      "src",
      "https://image.tmdb.org/t/p/w500/poster.jpg",
    );

    await user.click(movieCard);

    const dialog = screen.getByRole("dialog", {
      name: "The Grand Budapest Hotel",
    });
    expect(dialog).toHaveTextContent("Release date: 2014-02-26");
    expect(dialog).toHaveTextContent("Rating: 8.1/10");
    expect(document.body.style.overflow).toBe("hidden");

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
    expect(movieCard).toHaveFocus();
  });

  it("closes the modal from the close button and by clicking the backdrop", async () => {
    const user = userEvent.setup();
    fetchMoviesMock.mockResolvedValue({
      page: 1,
      results: [movie],
      total_pages: 1,
      total_results: 1,
    });
    renderApp();

    await user.type(
      screen.getByRole("searchbox", { name: "Search movies" }),
      "hotel",
    );
    await user.click(screen.getByRole("button", { name: "Search" }));
    await user.click(
      await screen.findByRole("button", { name: /The Grand Budapest Hotel/ }),
    );
    await user.click(screen.getByRole("button", { name: "Close modal" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /The Grand Budapest Hotel/ }),
    );
    fireEvent.click(screen.getByTestId("modal-backdrop"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("clears old results and shows the required toast for an empty result", async () => {
    const user = userEvent.setup();
    fetchMoviesMock
      .mockResolvedValueOnce({
        page: 1,
        results: [movie],
        total_pages: 1,
        total_results: 1,
      })
      .mockResolvedValueOnce({
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0,
      });
    renderApp();

    const searchbox = screen.getByRole("searchbox", { name: "Search movies" });
    await user.type(searchbox, "hotel");
    await user.click(screen.getByRole("button", { name: "Search" }));
    expect(await screen.findByText(movie.title)).toBeInTheDocument();

    await user.clear(searchbox);
    await user.type(searchbox, "unknown");
    await user.click(screen.getByRole("button", { name: "Search" }));

    await waitFor(() =>
      expect(screen.queryByText(movie.title)).not.toBeInTheDocument(),
    );
    expect(
      await screen.findByText("No movies found for your request."),
    ).toBeInTheDocument();
  });

  it("shows the error message when the request fails", async () => {
    const user = userEvent.setup();
    fetchMoviesMock.mockRejectedValue(new Error("Request failed"));
    renderApp();

    await user.type(
      screen.getByRole("searchbox", { name: "Search movies" }),
      "hotel",
    );
    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(
      await screen.findByText("There was an error, please try again..."),
    ).toBeInTheDocument();
  });

  it("loads the selected result page and updates the active page", async () => {
    const user = userEvent.setup();
    fetchMoviesMock
      .mockResolvedValueOnce({
        page: 1,
        results: [movie],
        total_pages: 3,
        total_results: 3,
      })
      .mockResolvedValueOnce({
        page: 2,
        results: [secondMovie],
        total_pages: 3,
        total_results: 3,
      });
    renderApp();

    await user.type(
      screen.getByRole("searchbox", { name: "Search movies" }),
      "hotel",
    );
    await user.click(screen.getByRole("button", { name: "Search" }));
    expect(await screen.findByText(movie.title)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Page 2" }));

    expect(await screen.findByText(secondMovie.title)).toBeInTheDocument();
    expect(fetchMoviesMock).toHaveBeenNthCalledWith(
      1,
      "hotel",
      1,
      expect.any(AbortSignal),
    );
    expect(fetchMoviesMock).toHaveBeenNthCalledWith(
      2,
      "hotel",
      2,
      expect.any(AbortSignal),
    );
    expect(
      screen.getByRole("button", { name: "Page 2 is your current page" })
        .parentElement,
    ).toHaveClass(/active/);
  });

  it("hides pagination when the response contains one page", async () => {
    const user = userEvent.setup();
    fetchMoviesMock.mockResolvedValue({
      page: 1,
      results: [movie],
      total_pages: 1,
      total_results: 1,
    });
    renderApp();

    await user.type(
      screen.getByRole("searchbox", { name: "Search movies" }),
      "hotel",
    );
    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(await screen.findByText(movie.title)).toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Pagination" }),
    ).not.toBeInTheDocument();
  });
});
