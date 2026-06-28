#!/bin/sh
set -e

export CI=true

needs_install() {
  if [ ! -f node_modules/.docker-ready ]; then
    return 0
  fi

  if [ ! -f backend/node_modules/prisma/build/index.js ]; then
    return 0
  fi

  return 1
}

if needs_install; then
  echo ">>> Installing dependencies..."
  rm -f node_modules/.docker-ready
  pnpm install --frozen-lockfile
fi

echo ">>> Generating Prisma client..."
pnpm --filter @suzuki/backend exec prisma generate

echo ">>> Building shared package..."
pnpm --filter @suzuki/shared build

touch node_modules/.docker-ready

echo ">>> Starting backend..."
exec pnpm --filter @suzuki/backend dev
