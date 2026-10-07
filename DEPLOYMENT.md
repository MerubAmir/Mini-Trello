# Deployment Checklist

## 1. Create MongoDB Atlas

- Create a free MongoDB Atlas cluster.
- Create a database user.
- Allow network access. For quick student deployment, `0.0.0.0/0` works, but restrict it later.
- Copy the MongoDB connection string.

Example:

```env
DATABASE_URL="mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/minitrello?retryWrites=true&w=majority"
```

## 2. Environment Variables

Set these locally, in Vercel, and in Render:

```env
DATABASE_URL="your-mongodb-atlas-url"
AUTH_SECRET="generate-a-long-random-secret"
```

Generate a secret in PowerShell:

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

## 3. Push Prisma Schema

```powershell
cd D:\excalidraw\mini-trello
$env:DATABASE_URL="your-mongodb-atlas-url"
corepack yarn db:push
```

## 4. Run Locally

```powershell
cd D:\excalidraw\mini-trello
corepack yarn dev
```

Open:

```text
http://localhost:3005
```

## 5. Push Code To GitHub

```powershell
cd D:\excalidraw\mini-trello
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

If `origin` exists:

```powershell
cd D:\excalidraw\mini-trello
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## 6. Deploy On Vercel

- Import the GitHub repository.
- Add `DATABASE_URL` and `AUTH_SECRET`.
- Build command: `yarn build`
- Install command: `yarn install --frozen-lockfile`
- Output directory: `.next`
- Deploy.

## 7. Deploy On Render

- Create a new Web Service from the GitHub repository.
- Add `DATABASE_URL`, `AUTH_SECRET`, and `NODE_ENV=production`.
- Build command: `yarn install --frozen-lockfile && yarn build`
- Start command: `yarn start`
- Deploy.

## 8. Smoke Test

- Register a new account.
- Create a board.
- Add a card.
- Move the card between columns.
- Add a comment.
- Open the board in a second tab and confirm it refreshes after changes.
