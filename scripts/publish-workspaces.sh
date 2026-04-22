#!/usr/bin/env bash
set -euo pipefail

# Usage: scripts/publish-workspaces.sh <pnpm-filter> <package-relative-path>
# Env:   NEXT_VERSION — set by @semantic-release/exec via ${nextRelease.version}

PACKAGE_FILTER="${1}"
PACKAGE_PATH="${2}"

if [[ -z "${NEXT_VERSION:-}" ]]; then
  echo "ERROR: NEXT_VERSION is not set" >&2
  exit 1
fi

REPO_ROOT=$(git rev-parse --show-toplevel)
TARGET_DIR="${REPO_ROOT}/${PACKAGE_PATH}/src/main/target"

echo "Publishing ${PACKAGE_FILTER}@${NEXT_VERSION} from ${TARGET_DIR}"

cd "${REPO_ROOT}"
VERSION="${NEXT_VERSION}" pnpm --filter="${PACKAGE_FILTER}" run build:main

cd "${TARGET_DIR}"
npm publish --access public
