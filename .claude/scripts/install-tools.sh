#!/bin/bash
set -e

# Only run in cloud environment
if [ "$CLAUDE_CODE_REMOTE" = "true" ]; then
  if ! command -v gh &> /dev/null; then
    echo "Installing GitHub CLI..."
    GH_VERSION=$(curl -s https://api.github.com/repos/cli/cli/releases/latest | grep '"tag_name"' | cut -d '"' -f 4 | sed 's/^v//')
    echo "Latest version: ${GH_VERSION}"
    curl -L "https://github.com/cli/cli/releases/download/v${GH_VERSION}/gh_${GH_VERSION}_linux_amd64.tar.gz" -o /tmp/gh.tar.gz
    tar -xzf /tmp/gh.tar.gz -C /tmp
    sudo cp "/tmp/gh_${GH_VERSION}_linux_amd64/bin/gh" /usr/local/bin/
    rm -rf /tmp/gh.tar.gz "/tmp/gh_${GH_VERSION}_linux_amd64"
    echo "GitHub CLI ${GH_VERSION} installed successfully"
  fi
fi
