# Grain: Next.js app image. Used by docker-compose.yml (targets: runner, tools).

FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS builder
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN mkdir -p public && npm run build

# One-shot jobs that need the full toolchain (tsx + scripts), e.g. building the corpus.
FROM deps AS tools
COPY . .
CMD ["npx", "tsx", "scripts/build-corpus.ts", "--if-stale"]

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -S app && adduser -S app -G app \
 && mkdir -p /data/runs /data/corpus && chown -R app:app /data
COPY --from=builder --chown=app:app /app/public ./public
COPY --from=builder --chown=app:app /app/.next/standalone ./
COPY --from=builder --chown=app:app /app/.next/static ./.next/static
COPY --from=builder --chown=app:app /app/data ./data
USER app
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s \
  CMD wget -qO- http://127.0.0.1:3000/api/runs/golden >/dev/null || exit 1
CMD ["node", "server.js"]
