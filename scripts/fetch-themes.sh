#!/usr/bin/env bash
# Refresh src/data/themes from the colors.toml of every theme Omarchy ships,
# and src/data/shell.toml.tpl from the template that themes the desktop shell.
# The roles page audits the themes; the desktop pages draw from the template.
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

gh api "repos/$REPO/contents/default/themed/shell.toml.tpl?ref=$REF" --jq '.content' | base64 -d >"$OUT/../shell.toml.tpl"
echo "shell.toml.tpl"
