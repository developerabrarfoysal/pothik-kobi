# পথিক কবি | Pothik Kobi

Modern Bangla writer portfolio for **Muzahid Prince** — fully dynamic, admin-editable, SEO-optimized.

**Domain:** [pathikkobi.com](https://pathikkobi.com)

## Stack

Next.js 16 App Router · TypeScript · Tailwind CSS · Framer Motion · Prisma 7 · PostgreSQL · Vercel Blob

---

## Local Setup

```bash
npm install
cp .env.example .env
# Edit .env — set DATABASE_URL and AUTH_SECRET (min 32 chars)
```

### Database (development)

Use proper migrations — do **not** rely on `db push` for production.

```bash
# First time / schema changes in dev
npm run db:migrate

# Seed demo Bangla content + admin user (idempotent upserts)
npm run db:seed
```

### Run

```bash
npm run dev
```

- Public: http://localhost:3000
- Admin: http://localhost:3000/admin/login

### Default admin (change immediately)

| Field | Value |
|-------|-------|
| Email | `admin@pathikkobi.com` |
| Password | `ChangeMe123!` |

Override via `SEED_ADMIN_*` env vars before seeding.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | Min 32 chars — JWT session signing |
| `NEXT_PUBLIC_SITE_URL` | Yes | e.g. `https://pathikkobi.com` |
| `NEXT_PUBLIC_SITE_NAME` | Yes | `পথিক কবি` |
| `BLOB_READ_WRITE_TOKEN` | Production | Vercel Blob — **required for production media uploads** |
| `UPSTASH_REDIS_REST_URL` | Recommended prod | Contact form rate limiting (multi-instance safe) |
| `UPSTASH_REDIS_REST_TOKEN` | Recommended prod | Upstash REST token |

---

## Vercel Deployment

### 1. Connect repository

Import project in Vercel dashboard.

### 2. Add integrations

- **Neon Postgres** or **Vercel Postgres (Marketplace)** → sets `DATABASE_URL`
- **Vercel Blob** → sets `BLOB_READ_WRITE_TOKEN`
- **Upstash Redis (optional)** → rate limiting for contact form

### 3. Set env vars

All variables from `.env.example` in Vercel project settings.

Generate a strong `AUTH_SECRET` (32+ random characters).

### 4. Build settings

Default is fine:

- **Build command:** `npm run build` (runs `prisma generate` + `next build`)
- **Install command:** `npm install` (runs `postinstall` → `prisma generate`)

### 5. Run migrations (production)

After first deploy, run once via Vercel CLI or CI:

```bash
npx prisma migrate deploy
npm run db:seed   # first deploy only
```

**Never use `prisma db push` as the primary production strategy.**

| Environment | Command |
|-------------|---------|
| Development | `npm run db:migrate` (`prisma migrate dev`) |
| Production | `npx prisma migrate deploy` |
| Prototyping only | `npm run db:push` (local dev shortcut) |

### 6. Post-deploy checks

1. Visit `/` — homepage loads from DB
2. Login at `/admin/login` — change default password
3. Upload image in Media Library — confirms Blob works
4. Submit contact form — message appears in admin
5. Run Lighthouse on live URL (see below)

---

## Verification Commands

```bash
npm run typecheck   # TypeScript
npm run lint        # ESLint
npm run build       # Production build
```

---

## Lighthouse Testing (live domain)

After deploying to `pathikkobi.com`:

1. Open Chrome DevTools → Lighthouse tab
2. Test URL: `https://pathikkobi.com`
3. Mode: Navigation, Mobile + Desktop
4. Categories: Performance, Accessibility, Best Practices, SEO
5. Target: Performance 95+, Accessibility 95+, Best Practices 100, SEO 100

Also test:

- `/writings`
- `/writings/[slug]`
- `/about`
- `/contact`

---

## Security Notes

- Admin routes protected by JWT middleware (`httpOnly`, `secure` in production, `sameSite: lax`)
- All admin server actions call `requireAdmin()`
- Upload/admin API routes verify session cookie
- Passwords hashed with bcrypt (cost 12)
- Rich text sanitized via DOMPurify
- Production media uploads **blocked** without `BLOB_READ_WRITE_TOKEN` (no base64 in DB)
- Contact form rate limited (Upstash in prod, in-memory fallback in dev)
- Default seed password must be changed after first login

---

## Admin Panel

`/admin` — Dashboard, Pages, Homepage Builder, Writings, Categories, Media, Gallery, Videos, Navigation, SEO, Settings, Messages

All content is database-driven. No hardcoded public page content.

---

## Project Structure

```
src/app/(public)/     Public Bangla site
src/app/admin/        Admin CMS
src/lib/actions/      Server actions + revalidation
src/lib/queries/      Cached public queries
prisma/schema.prisma  Full CMS schema
prisma/seed.ts        Idempotent Bangla demo data
```

---

Private — Pothik Kobi / Muzahid Prince
