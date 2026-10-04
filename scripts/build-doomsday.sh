#!/bin/sh
# Assemble projects/DoomsdayMethod as the standalone site for doomsdaymethod.com.
# The Cloudflare Worker runs this (via wrangler.jsonc) on every push to main and serves dist/doomsday.
# The folder is self-contained with relative links, so the same files also stay live on
# leongrimmeisen.de/projects/DoomsdayMethod via GitHub Pages.
set -eu

cd "$(dirname "$0")/.."

SRC=projects/DoomsdayMethod
OUT=dist/doomsday

node scripts/check-doomsday.mjs

rm -rf "$OUT"
mkdir -p "$OUT"
cp -R "$SRC"/. "$OUT"/
find "$OUT" -name .DS_Store -delete

# Links must stay inside the site folder, or they break on one of the two hosts.
if grep -rnE '(href|src)="[^"]*(\.\./\.\./|/projects/)' --include='*.html' "$OUT"; then
	echo "build-doomsday: links that leave the site folder (see above)" >&2
	exit 1
fi

echo "build-doomsday: built $OUT"
