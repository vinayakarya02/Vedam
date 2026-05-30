# Vedam Events — Frontend

Next.js 15 app: public event pages, registration UI, admin dashboard.

## Structure

```
frontend/
├── .env.local           # Public env (see .env.example)
├── public/
├── src/
│   ├── app/             # Routes (pages only — no API routes)
│   ├── components/      # UI components
│   ├── features/        # Page sections & admin UI
│   ├── lib/
│   │   ├── api.ts       # Server-side fetch to backend
│   │   ├── api-client.ts # Client fetch + auth token
│   │   └── supabase/    # Auth only (login)
│   └── types/           # Shared TypeScript types
└── ...
```

## Setup

```bash
cp .env.example .env.local
```

Required:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Start backend first, then:

```bash
npm install
npm run dev
```

App: http://localhost:3000

## Notes

- All data goes through the **backend API** (`NEXT_PUBLIC_API_URL`)
- Supabase in the frontend is **only for admin login** (Auth)
- No `SUPABASE_SERVICE_ROLE_KEY` in this package
