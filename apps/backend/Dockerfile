# Build from repository root — see fly.toml [build] context.
# syntax=docker/dockerfile:1

FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/
RUN npm ci --workspace=backend

WORKDIR /app/apps/backend
COPY apps/backend/prisma ./prisma/
COPY apps/backend/src ./src/
COPY apps/backend/tsconfig.json apps/backend/tsconfig.build.json apps/backend/nest-cli.json ./

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup -S spendbrains && adduser -S spendbrains -G spendbrains

COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/
RUN npm ci --workspace=backend --omit=dev \
  && npm install prisma@6.19.3 --workspace=backend --no-save \
  && npm cache clean --force

WORKDIR /app/apps/backend
COPY --from=build /app/apps/backend/dist ./dist
COPY --from=build /app/apps/backend/prisma ./prisma
COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=build /app/node_modules/@prisma /app/node_modules/@prisma

USER spendbrains
EXPOSE 3000

CMD ["node", "dist/main.js"]
