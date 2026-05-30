# Vedam Events Platform

Monorepo for Vedam School of Technology event management.

```
Vedam/
├── frontend/     # Next.js UI          → frontend/README.md
├── backend/      # Express API + DB    → backend/README.md
│   └── supabase/ # Migrations & seed
├── package.json  # npm workspaces
└── render.yaml   # Deploy both on Render
```

## Quick start

```bash
# 1. Env files
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env

# 2. Supabase: run backend/supabase/migrations/001_initial_schema.sql

# 3. Install & run (from root)
npm install
npm run dev
```

| Service  | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend  | http://localhost:4000 |

## Scripts (root)

| Command | Description |
|---------|-------------|
| `npm run dev` | Frontend + backend together |
| `npm run dev:frontend` | UI only |
| `npm run dev:backend` | API only |
| `npm run build` | Build both packages |

## Deploy

Use [render.yaml](./render.yaml) — two web services + cron. Details in [backend/DEPLOY_RENDER.md](./backend/DEPLOY_RENDER.md).

## License

Proprietary — Vedam School of Technology
