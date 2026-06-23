# Tellero Developer Cheat Sheet

## Navigation

| Action | Full Command | Shortcut |
|----------|----------|----------|
| Go to Tellero project | `cd ~/Projects/Tellero` | `proj` |
| Go to docs folder | `cd docs` | `docs` |

---

## Development

| Action | Full Command | Shortcut |
|----------|----------|----------|
| Start dev server | `npm run dev` | `dev` |
| Build app | `npm run build` | `build` |
| Start production build | `npm run start` | `startapp` |
| Run linting | `npm run lint` | `lint` |

---

## Supabase

| Action | Full Command | Shortcut |
|----------|----------|----------|
| Login | `supabase login` | `slogin` |
| Link project | `supabase link` | `slink` |
| Show status | `supabase status` | `sstatus` |
| Pull schema | `supabase db pull` | `spull` |
| Push migrations | `supabase db push` | `spush` |
| Create migration | `supabase migration new <name>` | `sm <name>` |

### Examples

```bash
sm add_customer_tags
sm add_campaign_analytics
spush
```

---

## Vercel

| Action | Full Command | Shortcut |
|----------|----------|----------|
| Login | `vercel login` | `vlogin` |
| Link project | `vercel link` | `vlink` |
| Start dev server | `vercel dev` | |
| Pull env vars | `vercel env pull` | `venv` |
| Deploy preview | `vercel` | |
| Deploy to alias/staging | `vercel --alias staging.tellero.in` | |
| Add domain | `vercel domains add <domain>` | |
| Set alias | `vercel alias set <domain>` | |
| Add env var | `vercel env add <key> <env>` | |
| Deploy production | `vercel --prod` | `vprod` |

---

## Git

| Action | Full Command | Shortcut |
|----------|----------|----------|
| Status | `git status` | `gs` |
| Add all files | `git add .` | `ga` |
| Commit | `git commit -m "msg"` | `gc "msg"` |
| Push | `git push` | `gp` |
| Push new branch | `git push -u origin <branch>` | |
| Pull | `git pull` | `gl` |
| Branches | `git branch` | `gb` |
| Checkout branch | `git checkout branch-name` | `gco branch-name` |
| Create & switch branch | `git checkout -b <branch>` | |

### Examples

```bash
gs
ga
gc "Add analytics dashboard"
gp
```

---

## Combined Workflows

### Create a new feature

```bash
git pull
sm add_customer_segments
# edit migration
spush
ga
gc "Add customer segments"
gp
```

### Deploy Tellero

```bash
tellero_deploy "Add customer segments"
```

---

## Docker

| Action | Full Command | Shortcut |
|----------|----------|----------|
| List containers | `docker ps` | `dps` |
| Start Docker Desktop | `open -a Docker` | `dstart` |

---

## Utilities

| Action | Shortcut |
|----------|----------|
| Clear screen | `c` |
| Detailed directory listing | `ll` |
| Show listening ports | `ports` |

### Kill a process by port

```bash
killport 3000
killport 8080
killport 5432
```

---

## Terminal Productivity

### Search command history

```text
Ctrl + R
```

Examples:

```text
Ctrl + R
spush
```

```text
Ctrl + R
git push
```

### Repeat previous command

```text
↑
```

### Last command

```bash
!!
```

### Previous argument

```bash
!$
```

Example:

```bash
mkdir analytics
cd !$
```

Expands to:

```bash
cd analytics
```

---

## Tellero Daily Workflow

### Start working

```bash
proj
git pull
dev
```

### Database change

```bash
sm add_campaign_analytics
spush
```

### Commit code

```bash
ga
gc "Add campaign analytics"
gp
```

### Deploy

```bash
vprod
```

(or push to GitHub and let Vercel auto-deploy)