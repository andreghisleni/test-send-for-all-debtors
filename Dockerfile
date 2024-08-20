FROM node:18 AS base

RUN npm install -g pnpm

FROM base AS dependencies

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

FROM base AS build

WORKDIR /app

COPY . .

COPY --from=dependencies /app/node_modules ./node_modules

# RUN pnpm prisma generate
# RUN pnpm prisma migrate deploy

RUN pnpm build

FROM node:18-alpine3.20 AS deploy

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma


RUN npx prisma generate

RUN node node_modules/puppeteer/install.js

EXPOSE 3333

CMD [ "node", "./dist/shared/infra/http/server.js" ]