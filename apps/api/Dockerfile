# syntax=docker/dockerfile:1
# Build a partir da RAIZ do monorepo:
#   docker build -f apps/api/Dockerfile -t mentis-api .

FROM node:20-alpine AS build
RUN apk add --no-cache openssl libc6-compat
WORKDIR /repo
RUN corepack enable

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm --filter @mentis/api prisma:generate
RUN pnpm --filter @mentis/api build

FROM node:20-alpine AS runtime
RUN apk add --no-cache openssl libc6-compat
WORKDIR /repo
RUN corepack enable
ENV NODE_ENV=production

COPY --from=build /repo /repo
RUN addgroup -S app && adduser -S app -G app && chown -R app:app /repo
USER app

WORKDIR /repo/apps/api
EXPOSE 3001
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/main.js"]
