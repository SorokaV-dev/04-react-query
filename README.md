# Movie Search

Vite app for searching TMDB movies with paginated results. TanStack Query caches results by search term and page; React Paginate changes the requested page.

## Run locally

```sh
npm install
cp .env.example .env
```

Set `VITE_TMDB_TOKEN` in `.env` to a TMDB read access token, then run:

```sh
npm run dev
```

## Checks

```sh
npm test
npm run build
npm run lint
npm run format:check
```
