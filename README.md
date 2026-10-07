# Mini-Trello: Real-Time Task & Idea Kanban Board

A production-oriented full-stack Kanban app built after reverse-engineering Excalidraw's collaboration model.

## Features

- Email/password authentication with signed HTTP-only session cookies.
- Workspace and multi-board model.
- Default Kanban columns: To Do, In Progress, Done.
- Card CRUD with priority, description, drag-and-drop moves, and deletion.
- Comments per card.
- Activity feed per board.
- Live UI updates across browser tabs with `BroadcastChannel` plus periodic board refresh.
- Prisma relational schema: `User -> Workspace -> Board -> Column -> Card -> Comment/Activity`.
- Zod validation on API inputs.

## Tech Stack

- Next.js App Router
- React
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Zod
- bcryptjs
- jose JWT sessions

## Local Setup

This machine currently has broken global `npm` and `yarn` shims, so the safest local commands use Corepack and local binaries directly.

1. Install dependencies:

```powershell
cd D:\excalidraw\mini-trello
corepack yarn install
```

2. Set environment variables in `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
AUTH_SECRET="replace-with-a-long-random-secret"
```

For local PostgreSQL, the included `docker-compose.yml` expects:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/minitrello?schema=public"
```

3. Create database tables:

```powershell
cd D:\excalidraw\mini-trello
.\node_modules\.bin\prisma.cmd db push
```

4. Run the app:

```powershell
cd D:\excalidraw\mini-trello
.\node_modules\.bin\next.cmd dev -p 3005
```

Open:

```text
http://localhost:3005
```

## Local PostgreSQL Options

Option A: Docker, if installed:

```powershell
cd D:\excalidraw\mini-trello
docker compose up -d
.\node_modules\.bin\prisma.cmd db push
.\node_modules\.bin\next.cmd dev -p 3005
```

Option B: Hosted Postgres, recommended for fastest deployment:

- Create a database on Neon, Supabase, Railway, or Render.
- Copy the pooled PostgreSQL connection string into `.env` as `DATABASE_URL`.
- Run `prisma db push`.

## Verification

Production build was verified locally with:

```powershell
.\node_modules\.bin\next.cmd build
```

## Deployment: Vercel + Hosted Postgres

1. Push this folder to GitHub.
2. Create a hosted PostgreSQL database.
3. Import the GitHub repo in Vercel.
4. Add environment variables in Vercel:

```env
DATABASE_URL="your-hosted-postgres-url"
AUTH_SECRET="a-long-random-production-secret"
```

5. Use these Vercel settings:

```text
Framework Preset: Next.js
Build Command: yarn build
Output Directory: .next
Install Command: yarn install --frozen-lockfile
```

6. After deployment, run Prisma schema sync against the production database:

```powershell
DATABASE_URL="your-hosted-postgres-url" .\node_modules\.bin\prisma.cmd db push
```

On Vercel you can also run this locally before deployment if the hosted database is reachable.

## GitHub Push Commands

If you already created an empty GitHub repo, run:

```powershell
cd D:\excalidraw\mini-trello
git init
git add .
git commit -m "Build Mini-Trello full-stack kanban app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Architecture Notes

Excalidraw separates live transport from durable persistence. This app follows the same mental model:

- API routes are the durable authority for boards, cards, comments, and activity.
- The browser applies optimistic UI updates by refreshing after each mutation.
- `BroadcastChannel` tells other tabs to refresh when one tab changes data.
- A periodic refresh catches missed tab messages, similar to Excalidraw's periodic full-scene sync.

For true multi-user realtime beyond browser tabs, the next step is adding Socket.IO or Pusher/Ably and broadcasting card mutation events to board subscribers.

## Known Environment Note

Yarn warned that `next@14.2.23` has a security advisory. The build passes, but before final public deployment, upgrade Next.js to a patched release:

```powershell
corepack yarn add next@latest eslint-config-next@latest
.\node_modules\.bin\next.cmd build
```
