# Deploy preview (GitHub Pages)

Public demo: **https://kibou37.github.io/suzu/**

Uses static export + demo catalog data (no backend). Local Docker development is unchanged.

## One-time GitHub setup (required)

Deploy fails with **404** until Pages is enabled manually:

1. Open **Settings → Pages**: https://github.com/Kibou37/suzu/settings/pages
2. Under **Build and deployment**, set **Source** to **GitHub Actions** (not “Deploy from a branch”)
3. Save — no other options needed
4. Re-run the workflow: **Actions → Deploy GitHub Pages → Re-run all jobs**

Expected URL after success: **https://kibou37.github.io/suzu/**

## Local development (unchanged)

```bash
pnpm docker:up
# or
pnpm dev
```

Uses live API at `http://localhost:4000`. Do **not** set `GITHUB_PAGES` or `NEXT_PUBLIC_USE_DEMO_DATA`.

## Test static build locally (optional)

PowerShell:

```powershell
$env:GITHUB_PAGES='true'
$env:NEXT_PUBLIC_USE_DEMO_DATA='true'
pnpm --filter @suzuki/shared build
pnpm --filter @suzuki/frontend build
```

Output: `frontend/out/` — open `frontend/out/index.html` via a static server with base path `/suzu`.

## Environment flags

| Variable | Local dev | GitHub Pages |
|----------|-----------|--------------|
| `GITHUB_PAGES` | unset | `true` |
| `NEXT_PUBLIC_USE_DEMO_DATA` | unset | `true` |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | not used |
