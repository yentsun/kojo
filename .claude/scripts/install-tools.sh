#!/bin/bash
set -e

# Only run in cloud environment
if [ "$CLAUDE_CODE_REMOTE" = "true" ]; then
  if ! command -v gh &> /dev/null; then
    echo "Installing GitHub CLI..."
    sudo apt-get update
    sudo apt-get install -y gh
  fi
fi
