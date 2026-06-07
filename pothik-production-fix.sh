#!/usr/bin/env bash
set -euo pipefail

echo "=============================="
echo "Pothik Kobi Bulk Production Fix"
echo "=============================="

PROJECT_DIR="/Users/macbookairm1/pothikkobi"
cd "$PROJECT_DIR"

STAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_DIR=".fix-backups/$STAMP"
mkdir -p "$BACKUP_DIR"

echo ""
echo "1) Backing up important files..."
for f in .env package.json next.config.ts middleware.ts src/middleware.ts src/app/layout.tsx prisma/seed.ts; do
  if [ -f "$f" ]; then
    mkdir -p "$BACKUP_DIR/$(dirname "$f")"
    cp "$f" "$BACKUP_DIR/$f"
    echo "Backed up: $f"
  fi
done

echo ""
echo "2) Fixing DATABASE_URL in .env..."
python3 - <<'PY'
from pathlib import Path

p = Path(".env")
if not p.exists():
    p.write_text("")

text = p.read_text()
lines = text.splitlines()
fixed = []
done = False

for line in lines:
    if line.startswith("DATABASE_URL="):
        fixed.append('DATABASE_URL="postgresql://macbookairm1@localhost:5432/pothikkobi?schema=public"')
        done = True
    else:
        fixed.append(line)

if not done:
    fixed.append('DATABASE_URL="postgresql://macbookairm1@localhost:5432/pothikkobi?schema=public"')

p.write_text("\n".join(fixed).rstrip() + "\n")
PY

echo "Current DATABASE_URL:"
grep '^DATABASE_URL=' .env || true

export DATABASE_URL="postgresql://macbookairm1@localhost:5432/pothikkobi?schema=public"

echo ""
echo "3) Checking PostgreSQL..."
pg_isready -h localhost -p 5432
createdb pothikkobi 2>/dev/null || true
psql -h localhost -p 5432 -d pothikkobi -c "SELECT current_database(), current_user;"

echo ""
echo "4) Installing dotenv if missing..."
npm ls dotenv >/dev/null 2>&1 || npm install dotenv --save

echo ""
echo "5) Hardening prisma/seed.ts dotenv loading..."
python3 - <<'PY'
from pathlib import Path

p = Path("prisma/seed.ts")
if p.exists():
    text = p.read_text()
    if 'dotenv/config' not in text:
        text = 'import "dotenv/config";\n' + text
        p.write_text(text)
        print("Added import dotenv/config to prisma/seed.ts")
    else:
        print("prisma/seed.ts already loads dotenv/config")
else:
    print("prisma/seed.ts not found, skipped")
PY

echo ""
echo "6) Updating package.json scripts..."
node - <<'NODE'
const fs = require("fs");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

pkg.scripts = pkg.scripts || {};
pkg.scripts.dev = "next dev --webpack";
pkg.scripts["dev:turbo"] = "next dev --turbopack";
pkg.scripts["db:generate"] = "prisma generate";
pkg.scripts["db:migrate"] = "prisma migrate dev";
pkg.scripts["db:migrate:deploy"] = "prisma migrate deploy";
pkg.scripts["db:seed"] = "tsx -r dotenv/config prisma/seed.ts";
pkg.scripts["db:studio"] = "prisma studio";

if (!pkg.scripts.postinstall) {
  pkg.scripts.postinstall = "prisma generate";
} else if (!pkg.scripts.postinstall.includes("prisma generate")) {
  pkg.scripts.postinstall = pkg.scripts.postinstall + " && prisma generate";
}

fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
console.log("package.json scripts updated");
NODE

echo ""
echo "7) Adding use client to error boundaries if needed..."
python3 - <<'PY'
from pathlib import Path

targets = []
for pattern in ["src/app/**/error.tsx", "src/app/**/global-error.tsx", "app/**/error.tsx", "app/**/global-error.tsx"]:
    targets.extend(Path(".").glob(pattern))

seen = set()
for p in targets:
    if p in seen or not p.is_file():
        continue
    seen.add(p)
    text = p.read_text()
    stripped = text.lstrip()
    if not (stripped.startswith('"use client"') or stripped.startswith("'use client'")):
        p.write_text('"use client";\n\n' + text)
        print(f"Added use client: {p}")
    else:
        print(f"Already client: {p}")
PY

echo ""
echo "8) Adding suppressHydrationWarning to root layout only..."
python3 - <<'PY'
from pathlib import Path
import re

candidates = [Path("src/app/layout.tsx"), Path("app/layout.tsx")]
for p in candidates:
    if not p.exists():
        continue

    text = p.read_text()
    original = text

    # Add suppressHydrationWarning to html tag if missing
    text = re.sub(
        r"<html(?![^>]*suppressHydrationWarning)([^>]*)>",
        r"<html suppressHydrationWarning\1>",
        text,
        count=1,
    )

    # Add suppressHydrationWarning to body tag if missing, useful for extension-injected body attrs
    text = re.sub(
        r"<body(?![^>]*suppressHydrationWarning)([^>]*)>",
        r"<body suppressHydrationWarning\1>",
        text,
        count=1,
    )

    if text != original:
        p.write_text(text)
        print(f"Patched hydration warning suppression: {p}")
    else:
        print(f"No hydration patch needed: {p}")
PY

echo ""
echo "9) Migrating middleware.ts to proxy.ts for Next.js 16 warning if present..."
python3 - <<'PY'
from pathlib import Path
import re
import shutil

pairs = [
    (Path("middleware.ts"), Path("proxy.ts")),
    (Path("src/middleware.ts"), Path("src/proxy.ts")),
]

for old, new in pairs:
    if not old.exists():
        continue

    text = old.read_text()

    # Rename exported middleware function to proxy where possible.
    text = re.sub(r"export\s+async\s+function\s+middleware\s*\(", "export async function proxy(", text)
    text = re.sub(r"export\s+function\s+middleware\s*\(", "export function proxy(", text)
    text = re.sub(r"export\s+default\s+async\s+function\s+middleware\s*\(", "export default async function proxy(", text)
    text = re.sub(r"export\s+default\s+function\s+middleware\s*\(", "export default function proxy(", text)
    text = text.replace("export { middleware", "export { proxy")
    text = text.replace("as middleware", "as proxy")

    if new.exists():
        print(f"{new} already exists. Keeping it and leaving {old} unchanged.")
    else:
        new.write_text(text)
        old.rename(old.with_suffix(old.suffix + ".bak"))
        print(f"Created {new} and renamed {old} to {old}.bak")
PY

echo ""
echo "10) Searching direct THREE.Clock usage..."
if grep -R "new THREE.Clock\|new Clock\|Clock(" -n src app 2>/dev/null | grep -v node_modules; then
  echo ""
  echo "Direct THREE.Clock usage found above."
  echo "Manual review needed because Timer replacement depends on the animation code."
else
  echo "No direct THREE.Clock usage found in app code. Warning likely comes from dependency."
fi

echo ""
echo "11) Cleaning caches..."
rm -rf .next
rm -rf node_modules/.cache

echo ""
echo "12) Prisma generate + migration status + seed..."
npx prisma generate
npx prisma migrate status || true
npm run db:migrate
npm run db:seed

echo ""
echo "13) Running verification..."
npm run typecheck
npm run lint
npm run build

echo ""
echo "=============================="
echo "Bulk fix completed."
echo "Now run:"
echo "npm run dev"
echo "Then test:"
echo "http://localhost:3000"
echo "http://localhost:3000/admin/login"
echo "=============================="
