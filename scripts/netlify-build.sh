#!/usr/bin/env bash
set -euo pipefail

export PATH="$HOME/.foundry/bin:$PATH"

if ! command -v forge >/dev/null 2>&1; then
  curl --fail --silent --show-error --location https://foundry.paradigm.xyz | bash
  "$HOME/.foundry/bin/foundryup"
fi

bun run build
