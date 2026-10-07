# Mini-Trello: Real-Time Task & Idea Kanban Board

A production-oriented full-stack Kanban app built after reverse-engineering Excalidraw's collaboration model.

## Features

- Email/password authentication with signed HTTP-only session cookies.
- Workspace and multi-board model.
- Default Kanban columns: To Do, In Progress, Done.
- Card CRUD with priority, description, move actions, and deletion.
- Comments per card.
- Activity feed per board.
- Live UI updates across browser tabs with `BroadcastChannel` plus periodic board refresh.
- Prisma + MongoDB schema: `User -> Workspace -> Board -> Column -> Card -> Comment/Activity`.
- Zod validation on API inputs.

## Tech Stack

- Next.js App Router
- React
- Tailwind CSS
- Next.js API Routes
- Prisma ORM
- MongoDB Atlas or local MongoDB
- Zod
- bcryptjs
- jose JWT sessions

## Local Setup

This project is in:

```powershell
D:\excalidraw\mini-trello
```

1. Install dependencies:

```powershell
cd D:\excalidraw\mini-trello
corepack yarn install
```

2. Create a MongoDB database.

Recommended: create a free MongoDB Atlas cluster, then copy the connection string. It should look like:

```env
DATABASE_URL="mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/minitrello?retryWrites=true&w=majority"
AUTH_SECRET="replace-with-a-long-random-secret"
```

Put those values in `D:\excalidraw\mini-trello\.env`.

3. Sync Prisma indexes/schema:

```powershell
cd D:\excalidraw\mini-trello
corepack yarn db:push
```

4. Run the app:

```powershell
cd D:\excalidraw\mini-trello
corepack yarn dev
```

Open:

```text
http://localhost:3005
```

## Optional Local MongoDB With Docker

Docker is not installed on the current machine, but if you install Docker Desktop later:

```powershell
cd D:\excalidraw\mini-trello
docker compose up -d
```

Then use this in `.env`:

```env
DATABASE_URL="mongodb://127.0.0.1:27017/minitrello"
AUTH_SECRET="dev-secret-change-before-deploy"
```

Then run:

```powershell
corepack yarn db:push
corepack yarn dev
```

## Verification

The MongoDB Prisma client generation and production build were verified locally:

```powershell
node .\node_modules\prisma\build\index.js generate
node .\node_modules\next\dist\bin\next build
```

## GitHub Push

Create an empty GitHub repository first. Then run:

```powershell
cd D:\excalidraw\mini-trello
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

If `origin` already exists:

```powershell
cd D:\excalidraw\mini-trello
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Deploy To Vercel

1. Push the project to GitHub.
2. Go to Vercel and import the GitHub repo.
3. Add environment variables:

```env
DATABASE_URL="your-mongodb-atlas-url"
AUTH_SECRET="a-long-random-production-secret"
```

4. Use these settings:

```text
Framework Preset: Next.js
Install Command: yarn install --frozen-lockfile
Build Command: yarn build
Output Directory: .next
```

5. Before or after deployment, run Prisma schema sync from your machine:

```powershell
cd D:\excalidraw\mini-trello
$env:DATABASE_URL="your-mongodb-atlas-url"
corepack yarn db:push
```

## Deploy To Render

1. Push the project to GitHub.
2. Create a new Render Web Service from the repo.
3. Set environment variables:

```env
DATABASE_URL="your-mongodb-atlas-url"
AUTH_SECRET="a-long-random-production-secret"
NODE_ENV="production"
```

4. Use these settings:

```text
Runtime: Node
Build Command: yarn install --frozen-lockfile && yarn build
Start Command: yarn start
```

5. Run Prisma schema sync from your machine:

```powershell
cd D:\excalidraw\mini-trello
$env:DATABASE_URL="your-mongodb-atlas-url"
corepack yarn db:push
```

## Architecture Notes

Excalidraw separates live transport from durable persistence. This app follows the same mental model:

- API routes are the durable authority for boards, cards, comments, and activity.
- The browser applies optimistic UI updates by refreshing after each mutation.
- `BroadcastChannel` tells other tabs to refresh when one tab changes data.
- A periodic refresh catches missed tab messages, similar to Excalidraw's periodic full-scene sync.

For true multi-user realtime beyond browser tabs, the next step is adding Socket.IO, Pusher, or Ably and broadcasting card mutation events to board subscribers.
