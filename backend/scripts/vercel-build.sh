#!/bin/sh
# Build command used on Vercel (see vercel.json): apply database migrations, then build Next.js.
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set."
  echo "Connect a Postgres database in Vercel (Storage > Create Database > Neon), then redeploy."
  exit 1
fi

# Prisma migrations need a direct (non-pooled) connection. Neon's Vercel integration provides it
# as DATABASE_URL_UNPOOLED; a DIRECT_URL set by hand takes precedence.
if [ -z "$DIRECT_URL" ]; then
  export DIRECT_URL="${DATABASE_URL_UNPOOLED:-$DATABASE_URL}"
fi

npx prisma generate

# Only production deployments change the production database schema. Preview deployments
# (branches, pull requests) skip this step so an unmerged migration can never reach real data.
if [ "$VERCEL_ENV" = "production" ]; then
  npx prisma migrate deploy
else
  echo "Skipping prisma migrate deploy (VERCEL_ENV=${VERCEL_ENV:-unset})"
fi

npx next build
