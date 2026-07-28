#!/bin/sh
set -e

export CI=true
export HUSKY=0

# Ждём, пока backend установит node_modules
until [ -f node_modules/.docker-ready ]; do
  echo ">>> Waiting for backend to install dependencies..."
  sleep 3
done

echo ">>> Building shared package..."
pnpm --filter @suzuki/shared build

echo ">>> Starting frontend (webpack + polling for Docker)..."
exec pnpm --filter @suzuki/frontend dev:docker
