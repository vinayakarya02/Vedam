# Vedam Events — Backend API

Express REST API: Supabase, Resend email, QR tickets, analytics.

## Structure

```
backend/
├── .env                 # Server secrets (see .env.example)
├── src/
│   ├── index.ts         # Express app + routes
│   ├── services/        # Business logic
│   ├── middleware/      # Auth, CORS
│   ├── lib/             # Supabase clients, utils
│   └── types/
├── supabase/
│   ├── migrations/      # Database schema
│   ├── seed.sql
│   └── config.toml
└── scripts/
    └── cron-reminders.mjs
```

## Setup

```bash
cp .env.example .env
# Fill SUPABASE_*, RESEND_*, CRON_SECRET, FRONTEND_URL

npm install
npm run dev
```

API: http://localhost:4000  
Health: http://localhost:4000/api/health

## Database

1. Create a Supabase project
2. Run `supabase/migrations/001_initial_schema.sql` in SQL Editor
3. Optional: `supabase/seed.sql`

## Deploy

See [DEPLOY_RENDER.md](./DEPLOY_RENDER.md) (Render web service `rootDir: backend`).
