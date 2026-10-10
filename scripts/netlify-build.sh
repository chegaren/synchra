#!/usr/bin/env bash
set -euo pipefail

curl -fsSL https://foundry.paradigm.xyz | bash
export PATH="$HOME/.foundry/bin:$PATH"
foundryup

bun run contracts:build
bun run build
