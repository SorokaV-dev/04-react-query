import { toast } from "react-hot-toast";
import css from "./SearchBar.module.css";

interface SearchBarProps {
  onSubmit: (query: string) => void;
}

function SearchBar({ onSubmit }: SearchBarProps) {
  const handleSubmit = (formData: FormData) => {
    const formQuery = formData.get("query");
    const query = typeof formQuery === "string" ? formQuery.trim() : "";

    if (!query) {
      toast.error("Please enter your search query.");
      return;
    }

    onSubmit(query);
  };

  return (
    <header className={css.header}>
      <div className={css.container}>
        <a className={css.link} href="/" aria-label="Movie Gallery home">
          Movie Gallery
        </a>
        <form className={css.form} action={handleSubmit}>
          <input
            className={css.input}
            type="search"
            name="query"
            aria-label="Search movies"
            placeholder="Search movies..."
          />
          <button className={css.button} type="submit">
            Search
          </button>
        </form>
      </div>
    </header>
  );
}

export default SearchBar;
