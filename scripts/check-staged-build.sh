#!/usr/bin/env bash
set -euo pipefail

root="$(git rev-parse --show-toplevel)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

cd "$root"
git checkout-index --all --prefix="$tmp/"
ln -s "$root/node_modules" "$tmp/node_modules"

cd "$tmp"
if ! output="$(npm run --silent build 2>&1)"; then
    echo "$output"
    echo
    echo "Build of staged changes failed. Commit aborted." >&2
    exit 1
fi
echo "Build OK."
