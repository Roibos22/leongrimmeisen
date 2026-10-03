#!/bin/sh
# Assemble projects/DoomsdayMethod as a standalone site for doomsdaymethod.com.
# Cloudflare Pages runs this on every push to main and serves dist/doomsday.
# The same pages stay live on leongrimmeisen.de/projects/DoomsdayMethod via GitHub Pages.
set -eu

cd "$(dirname "$0")/.."

SRC=projects/DoomsdayMethod
OUT=dist/doomsday

rm -rf "$OUT"
mkdir -p "$OUT"
cp -R "$SRC"/. "$OUT"/
find "$OUT" -name .DS_Store -delete

# Copy the shared files the pages pull from the repo-level assets/ folder.
refs=$(grep -ohE '\.\./\.\./assets/[^"'"'"') ]+' "$SRC"/*.html | sort -u || true)
for ref in $refs; do
	path=${ref#../../}
	mkdir -p "$OUT/$(dirname "$path")"
	cp "$path" "$OUT/$path"
done

# Point links at the new site root instead of the repo layout.
for f in "$OUT"/*.html; do
	sed -e 's#\.\./\.\./index\.html#https://leongrimmeisen.de/#g' \
	    -e 's#\.\./\.\./assets/#/assets/#g' \
	    -e 's#/projects/DoomsdayMethod/index\.html#/#g' \
	    -e 's#/projects/DoomsdayMethod/#/#g' \
	    "$f" > "$f.tmp"
	mv "$f.tmp" "$f"
done

if grep -nE '\.\./\.\./|/projects/' "$OUT"/*.html; then
	echo "build-doomsday: unrewritten repo paths left in $OUT (see above)" >&2
	exit 1
fi

echo "build-doomsday: built $OUT"
