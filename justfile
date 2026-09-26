# Omarchy Design — the docs are Astro pages; the tools in public/ are plain HTML, CSS and ES modules.
alias d := dev
alias c := check

default: dev

# install dependencies and the husky pre-commit hook
install:
    pnpm install

# run the dev server (docs, plus /logo/ and /icon/)
dev:
    pnpm astro dev

# lint and format-check everything, the way CI would
check:
    pnpm oxfmt --check
    pnpm oxlint

# rewrite files to the house format and fix what oxlint can fix
fix:
    pnpm oxfmt
    pnpm oxlint --fix

# build the site into dist/
build:
    pnpm astro build

# build as GitHub Pages serves it, under /omarchy-design/
build-pages:
    BASE_PATH=/omarchy-design/ pnpm astro build

# serve the built site
preview: build
    pnpm astro preview

# remove build output
clean:
    rm -rf dist .astro

# refresh the shipped themes and the shell template from Omarchy (needs gh)
themes ref="quattro":
    ./scripts/fetch-themes.sh {{ref}}
