#!/usr/bin/env bash
# Refresh src/data/themes from the colors.toml of every theme Omarchy ships.
# The roles page audits these against the contrast rules at build time.
set -euo pipefail

REPO=omacom/omarchy
REF=${1:-quattro}
OUT="$(dirname "$0")/../src/data/themes"

mkdir -p "$OUT"
rm -f "$OUT"/*.toml
for theme in $(gh api "repos/$REPO/contents/themes?ref=$REF" --jq '.[].name'); do
  gh api "repos/$REPO/contents/themes/$theme/colors.toml?ref=$REF" --jq '.content' | base64 -d >"$OUT/$theme.toml"
  echo "$theme"
done
