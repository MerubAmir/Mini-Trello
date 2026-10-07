# Deployment Checklist

## 1. Database

Create a PostgreSQL database on one of:

- Neon
- Supabase
- Railway
- Render

Copy the connection string.

## 2. Environment Variables

Set these locally and in Vercel:

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="generate-a-long-random-secret"
```

Generate a secret in PowerShell:

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

## 3. Push Schema

```powershell
cd D:\excalidraw\mini-trello
.\node_modules\.bin\prisma.cmd db push
```

## 4. Push Code

```powershell
cd D:\excalidraw\mini-trello
git init
git add .
git commit -m "Build Mini-Trello full-stack kanban app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## 5. Deploy On Vercel

- Import the GitHub repository.
- Add `DATABASE_URL` and `AUTH_SECRET`.
- Deploy.

## 6. Smoke Test

- Register a new account.
- Create a board.
- Add a card.
- Move the card between columns.
- Add a comment.
- Open the board in a second tab and confirm it refreshes after changes.
