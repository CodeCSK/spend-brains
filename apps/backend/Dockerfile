# Self-contained backend image — build context is apps/backend (see fly.toml).
# syntax=docker/dockerfile:1

FROM node:20-alpine AS build
WORKDIR /app

COPY package.json ./
RUN npm install

COPY prisma ./prisma/
COPY src ./src/
COPY tsconfig.json tsconfig.build.json nest-cli.json ./

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup -S spendbrains && adduser -S spendbrains -G spendbrains

COPY package.json ./
RUN npm install --omit=dev \
  && npm install prisma@6.19.3 --no-save \
  && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma

USER spendbrains
EXPOSE 3000

CMD ["node", "dist/main.js"]
