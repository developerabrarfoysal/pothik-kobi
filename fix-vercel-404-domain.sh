#!/usr/bin/env bash
set -euo pipefail

cd /Users/macbookairm1/pothikkobi

V="npx --yes vercel@latest"

echo "=============================="
echo "Pothik Kobi Vercel 404 Fix"
echo "=============================="

echo ""
echo "1) Check login..."
$V whoami >/dev/null 2>&1 || $V login

echo ""
echo "2) Check project link..."
if [ ! -f ".vercel/project.json" ]; then
  $V link
fi

echo ""
echo "3) Show linked Vercel project..."
cat .vercel/project.json || true

echo ""
echo "4) Check production env list..."
$V env ls production || true

echo ""
echo "5) Run local build before deploy..."
npm run typecheck
npm run lint
npm run build

echo ""
echo "6) Deploy production..."
DEPLOY_OUTPUT="$($V --prod --yes 2>&1 | tee /tmp/pothik-vercel-deploy.log)"

echo ""
echo "7) Extract deployment URL..."
DEPLOY_URL="$(grep -Eo 'https://[^ ]+\.vercel\.app' /tmp/pothik-vercel-deploy.log | head -n1 || true)"

if [ -z "$DEPLOY_URL" ]; then
  echo "Could not auto-detect deployment URL. Full deploy log:"
  cat /tmp/pothik-vercel-deploy.log
  exit 1
fi

echo "Deployment URL: $DEPLOY_URL"

echo ""
echo "8) Test deployment root..."
curl -I "$DEPLOY_URL/" || true

echo ""
echo "9) Test important paths..."
for path in "/" "/admin/login" "/writings" "/robots.txt" "/sitemap.xml"; do
  echo "Testing: $DEPLOY_URL$path"
  curl -s -o /dev/null -w "%{http_code} %{url_effective}\n" "$DEPLOY_URL$path" || true
done

echo ""
echo "10) Try alias custom domains..."
$V alias set "$DEPLOY_URL" pathikkobi.com || true
$V alias set "$DEPLOY_URL" www.pathikkobi.com || true

echo ""
echo "11) Show project domains..."
$V domains ls || true

echo ""
echo "12) Test custom domains..."
for url in "https://pathikkobi.com" "https://www.pathikkobi.com"; do
  echo "Testing: $url"
  curl -I "$url" || true
done

echo ""
echo "=============================="
echo "DONE"
echo "Use these URLs:"
echo "$DEPLOY_URL"
echo "https://pathikkobi.com"
echo "https://www.pathikkobi.com"
echo ""
echo "If pathikkobi.com still shows Vercel 404, fix DNS:"
echo "Root domain A record -> 76.76.21.21"
echo "www CNAME -> cname.vercel-dns.com"
echo "Then wait DNS propagation and redeploy/alias again."
echo "=============================="
