#!/usr/bin/env bash
# Fix expo-constants iOS script when the project path contains spaces.
set -euo pipefail

SCRIPT="node_modules/expo-constants/scripts/get-app-config-ios.sh"

if [[ ! -f "$SCRIPT" ]]; then
  exit 0
fi

if grep -q 'basename "\$PROJECT_DIR"' "$SCRIPT"; then
  exit 0
fi

sed -i '' 's/PROJECT_DIR_BASENAME=$(basename $PROJECT_DIR)/PROJECT_DIR_BASENAME=$(basename "$PROJECT_DIR")/' "$SCRIPT"
