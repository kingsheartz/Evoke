# Evoke Frontend

Next.js 16 app (App Router, Tailwind v4, TypeScript).

## Run with Docker (recommended)

From the **repo root**:

| Shell | Start | Fix stale UI |
|-------|-------|----------------|
| PowerShell | `.\scripts\dev.ps1 up` | `.\scripts\dev.ps1 reset-frontend` |
| CMD | `scripts\dev.cmd up` | `scripts\dev.cmd reset-frontend` |
| WSL / bash | `./scripts/dev.sh up` | `./scripts/dev.sh reset-frontend` |

Open http://localhost:3000

## Run locally (without Docker)

```bash
npm install
npm run dev
```

Set `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Full documentation

See **[../docs/DEVELOPMENT.md](../docs/DEVELOPMENT.md)** for all commands, Docker notes, and troubleshooting.
