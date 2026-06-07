#!/usr/bin/env bash
set -euo pipefail

echo "======================================"
echo "Fixing relative /api/writings fetch bug"
echo "======================================"

cd /Users/macbookairm1/pothikkobi

STAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_DIR=".fix-backups/fetch-url-$STAMP"
mkdir -p "$BACKUP_DIR"

echo ""
echo "1) Backing up likely source files..."
grep -RIl "/api/writings" src app 2>/dev/null | while read -r f; do
  mkdir -p "$BACKUP_DIR/$(dirname "$f")"
  cp "$f" "$BACKUP_DIR/$f"
  echo "Backed up: $f"
done

echo ""
echo "2) Ensuring local NEXT_PUBLIC_SITE_URL exists in .env..."
python3 - <<'PY'
from pathlib import Path

p = Path(".env")
if not p.exists():
    p.write_text("")

text = p.read_text()
lines = text.splitlines()
out = []
done = False

for line in lines:
    if line.startswith("NEXT_PUBLIC_SITE_URL="):
        out.append('NEXT_PUBLIC_SITE_URL="http://localhost:3000"')
        done = True
    else:
        out.append(line)

if not done:
    out.append('NEXT_PUBLIC_SITE_URL="http://localhost:3000"')

p.write_text("\n".join(out).rstrip() + "\n")
PY

grep '^NEXT_PUBLIC_SITE_URL=' .env || true

echo ""
echo "3) Creating safe URL helper..."
mkdir -p src/lib
cat > src/lib/absolute-url.ts <<'TS'
export function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}

export function absoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return new URL(path, getBaseUrl()).toString();
}
TS

echo ""
echo "4) Patching server-side relative fetch usages..."
python3 - <<'PY'
from pathlib import Path
import re

files = []
for root in [Path("src"), Path("app")]:
    if root.exists():
        files.extend([p for p in root.rglob("*") if p.suffix in [".ts", ".tsx", ".js", ".jsx"]])

changed = []

def ensure_import(text: str) -> str:
    if 'from "@/lib/absolute-url"' in text or "from '@/lib/absolute-url'" in text:
        return text
    # Put after use client if present; otherwise top.
    if text.startswith('"use client";'):
        return text.replace('"use client";', '"use client";\n\nimport { absoluteUrl } from "@/lib/absolute-url";', 1)
    if text.startswith("'use client';"):
        return text.replace("'use client';", "'use client';\n\nimport { absoluteUrl } from '@/lib/absolute-url';", 1)
    return 'import { absoluteUrl } from "@/lib/absolute-url";\n' + text

for p in files:
    text = p.read_text()
    original = text

    if "/api/writings" not in text:
        continue

    # fetch("/api/writings...")
    text = re.sub(
        r'fetch\(\s*"(/api/writings[^"]*)"',
        r'fetch(absoluteUrl("\1")',
        text
    )

    # fetch('/api/writings...')
    text = re.sub(
        r"fetch\(\s*'(/api/writings[^']*)'",
        r"fetch(absoluteUrl('\1')",
        text
    )

    # fetch(`/api/writings...`)
    text = re.sub(
        r'fetch\(\s*`(/api/writings[^`]*)`',
        r'fetch(absoluteUrl(`\1`)',
        text
    )

    # fetch(apiUrl) pattern when const apiUrl = `/api/writings...`
    text = re.sub(
        r'(const\s+\w+\s*=\s*)`(/api/writings[^`]*)`',
        r'\1absoluteUrl(`/\2`)'.replace('//api', '/api'),
        text
    )
    text = re.sub(
        r'(let\s+\w+\s*=\s*)`(/api/writings[^`]*)`',
        r'\1absoluteUrl(`/\2`)'.replace('//api', '/api'),
        text
    )

    # Clean accidental absoluteUrl(`/api...) generation mistakes
    text = text.replace("absoluteUrl(`//api/writings", "absoluteUrl(`/api/writings")
    text = text.replace('absoluteUrl("//api/writings', 'absoluteUrl("/api/writings')
    text = text.replace("absoluteUrl('//api/writings", "absoluteUrl('/api/writings")

    if text != original:
        text = ensure_import(text)
        p.write_text(text)
        changed.append(str(p))

print("Changed files:")
for f in changed:
    print(" -", f)

if not changed:
    print("No auto-change made. Showing /api/writings references:")
    for p in files:
        text = p.read_text()
        if "/api/writings" in text:
            print(" -", p)
PY

echo ""
echo "5) Showing remaining /api/writings references..."
grep -RIn "/api/writings" src app 2>/dev/null || true

echo ""
echo "6) Running Prisma + verification..."
npx prisma generate
npm run typecheck
npm run lint
npm run build

echo ""
echo "======================================"
echo "Fetch URL fix completed."
echo "Now run: npm run dev"
echo "======================================"
