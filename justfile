# Omarchy Design — the site is plain HTML, CSS and ES modules; Vite only serves and bundles it.
alias d := dev
alias c := check

default: dev

# install dependencies and the husky pre-commit hook
install:
    pnpm install

# run the dev server (home, /logo/, /icon/, /type/)
dev:
    pnpm vite

# lint and format-check everything, the way CI would
check:
    pnpm oxfmt
    pnpm oxlint

# rewrite files to the house format and fix what oxlint can fix
fix:
    pnpm oxfmt
    pnpm oxlint --fix

# bundle every page into dist/
build:
    pnpm vite build

# serve the built site
preview: build
    pnpm vite preview

# remove build output
clean:
    rm -rf dist
