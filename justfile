# Omarchy Design — the site is plain HTML, CSS and ES modules; Vite only serves and bundles it.

default: dev

# install dependencies and the husky pre-commit hook
install:
    pnpm install

# run the dev server (home, /logo/, /icon/, /type/)
dev: install
    pnpm vite

# lint and format-check everything, the way CI would
check: install
    pnpm oxlint
    pnpm oxfmt --check

# rewrite files to the house format and fix what oxlint can fix
fix: install
    pnpm oxfmt
    pnpm oxlint --fix

# bundle every page into dist/
build: install
    pnpm vite build

# serve the built site
preview: build
    pnpm vite preview

# remove build output
clean:
    rm -rf dist
