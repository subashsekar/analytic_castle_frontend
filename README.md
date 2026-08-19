# AnalyticCastle

Frontend for AnalyticCastle, an AI Data Analyst Employee.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file and adjust if needed:

```bash
cp .env.example .env.local
```

3. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The API client expects `NEXT_PUBLIC_API_URL` to point at the FastAPI backend (default: `http://127.0.0.1:8000`).

See [docs/frontend-architecture.md](docs/frontend-architecture.md) for the folder layout and ownership rules.

## Scripts

| Command             | Description                  |
| ------------------- | ---------------------------- |
| `npm run dev`       | Start the development server |
| `npm run build`     | Create a production build    |
| `npm run start`     | Start the production server  |
| `npm run lint`      | Run ESLint                   |
| `npm run typecheck` | Run the TypeScript compiler  |
| `npm run format`    | Format files with Prettier   |
| `npm test`          | Run unit tests               |
