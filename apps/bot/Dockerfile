## Builder ##
FROM node:20.11.0-alpine3.19 AS builder

WORKDIR /temp

RUN apk add --no-cache libc6-compat

RUN yarn global add turbo@1.11.3
COPY . .
RUN turbo prune --scope=@kbotdev/bot --docker

## Dependencies ##
FROM node:20.11.0-alpine3.19 AS deps

ENV NODE_ENV=production

WORKDIR /temp

RUN apk add -q --no-cache openssl libc6-compat cairo-dev jpeg-dev pango-dev giflib-dev python3 g++ make curl && \
	apk update

COPY .yarn .yarn/
COPY scripts scripts/
COPY .yarnrc.yml tsconfig.base.json ./
COPY --from=builder /temp/out/json/ /temp/out/yarn.lock ./
COPY turbo.json turbo.json

RUN yarn install

COPY --from=builder /temp/out/full/ .

RUN yarn turbo build --filter=@kbotdev/bot && \
	yarn workspaces focus @kbotdev/bot --production

## App ##
FROM node:20.11.0-alpine3.19 AS app

LABEL org.opencontainers.image.source=https://github.com/KBot-discord/KBot
LABEL org.opencontainers.image.licenses=AGPL-3.0-or-later

WORKDIR /app

## Canvas dependencies
RUN apk add -q --no-cache cairo jpeg pango giflib && \
	rm -rf /var/cache/apk/* && \
	npm i -g prisma && \
	addgroup --system --gid 1001 kbot && \
	adduser --system --uid 1001 kbot

USER kbot

COPY --from=deps --chown=kbot:kbot /temp/node_modules node_modules/
COPY --from=deps --chown=kbot:kbot /temp/apps/bot/assets assets/
COPY --from=deps --chown=kbot:kbot /temp/apps/bot/prisma/migrations prisma/migrations/
COPY --from=deps --chown=kbot:kbot /temp/apps/bot/prisma/schema.prisma prisma/schema.prisma
COPY --from=deps --chown=kbot:kbot /temp/apps/bot/dist dist/
COPY --from=deps --chown=kbot:kbot /temp/packages packages/
COPY --from=deps --chown=kbot:kbot /temp/apps/bot/package.json ./

CMD npx prisma migrate deploy && npm run start
