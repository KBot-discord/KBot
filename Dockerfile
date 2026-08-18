## Base ##
FROM node:26.7.0-trixie-slim AS base

RUN apt update && \
	npm install -g corepack && \
	corepack enable

## Builder ##
FROM base AS builder

WORKDIR /temp

COPY prisma ./prisma/
COPY .yarn .yarn/
COPY .yarnrc.yml tsconfig.json yarn.lock package.json tsdown.config.ts prisma.config.ts ./
COPY src/ src/

RUN yarn install --immutable && \
	yarn db:generate && \
	yarn build

## App ##
FROM base AS app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 kbot && \
	adduser --system --uid 1001 kbot

USER kbot:kbot

COPY --chown=kbot:kbot assets ./assets/
COPY --from=builder --chown=kbot:kbot /temp/prisma prisma/
COPY --from=builder --chown=kbot:kbot /temp/node_modules node_modules/
COPY --from=builder --chown=kbot:kbot /temp/dist dist/
COPY --from=builder --chown=kbot:kbot /temp/package.json ./

CMD ["npx", "prisma", "migrate", "deploy", ";", "node", "--enable-source-maps", "./dist/KBot.js"]
