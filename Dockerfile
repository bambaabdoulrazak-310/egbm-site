# Image de production simple : build complet + `next start`.
# Choix volontaire (plutôt que `output: standalone`) pour garder le CLI Prisma
# disponible dans l'image et exécuter `prisma migrate deploy` au démarrage.
FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NODE_ENV=production

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
RUN useradd --system --create-home --shell /bin/false egbm
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/src/generated ./src/generated
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN mkdir -p /app/public/uploads/products && chown -R egbm:egbm /app
RUN chmod +x /app/docker-entrypoint.sh

USER egbm
EXPOSE 3000
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["npm", "start"]
