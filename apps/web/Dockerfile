# syntax=docker/dockerfile:1
# Build a partir da RAIZ do monorepo:
#   docker build -f apps/web/Dockerfile --build-arg NEXT_PUBLIC_API_URL=https://api.seudominio.com/v1 -t mentis-web .
#
# NEXT_PUBLIC_API_URL é embutida no bundle em tempo de BUILD (é assim que o
# Next.js trata variáveis NEXT_PUBLIC_*) — não pode ser trocada só reiniciando
# o container, exige rebuild da imagem com o valor correto.

FROM node:20-alpine AS build
RUN apk add --no-cache libc6-compat
WORKDIR /repo
RUN corepack enable

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile

COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm --filter @mentis/web build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=build /repo/apps/web/.next/standalone ./
COPY --from=build /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /repo/apps/web/public ./apps/web/public

RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
USER app

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
