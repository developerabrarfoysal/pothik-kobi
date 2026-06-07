# Prisma Migrations

## Development

When you change `prisma/schema.prisma`:

```bash
npm run db:migrate
# Enter a descriptive name when prompted, e.g. "add_writing_tags"
```

This creates a new folder under `prisma/migrations/` and applies it locally.

## Production (Vercel / CI)

After deploying code that includes new migrations:

```bash
npx prisma migrate deploy
```

Run this once per release that contains schema changes. Do **not** use `prisma db push` in production.

## First-time setup

1. Set `DATABASE_URL` in `.env`
2. Run `npm run db:migrate` — creates initial migration from schema
3. Run `npm run db:seed` — loads Bangla demo content and admin user

## Rollback

Prisma Migrate does not auto-rollback. Restore from database backup or write a corrective migration.
