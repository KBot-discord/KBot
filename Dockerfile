## Base ##
FROM node:26.4.0-trixie-slim AS base

RUN apt update && \
	npm install -g corepack && \
	corepack enable

## Builder ##
FROM base AS builder

WORKDIR /temp

COPY .yarn .yarn/
COPY .yarnrc.yml tsconfig.json yarn.lock package.json tsdown.config.ts ./
COPY src/ src/

RUN yarn install --immutable && \
	yarn build

## App ##
FROM base AS app

LABEL org.opencontainers.image.source=https://github.com/KBot-discord/KBot
LABEL org.opencontainers.image.licenses=AGPL-3.0-or-later

ENV NODE_ENV=production

## Canvas dependencies
RUN addgroup --system --gid 1001 kbot && \
	adduser --system --uid 1001 kbot

USER kbot:kbot

COPY --chown=kbot:kbot assets ./assets/
COPY --from=builder --chown=kbot:kbot /temp/node_modules node_modules/
COPY --from=builder --chown=kbot:kbot /temp/dist dist/
COPY --from=builder --chown=kbot:kbot /temp/package.json ./

CMD ["node", "--enable-source-maps", "dist/KBot.mjs"]
