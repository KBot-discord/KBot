## Builder ##
FROM node:22.1.0-alpine3.19 as base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apk add -q --no-cache cairo-dev jpeg-dev pango-dev giflib-dev python3 g++ make && \
	corepack enable

## Production dependencies ##
FROM base as prod-deps

WORKDIR /temp

COPY pnpm-lock.yaml package.json .npmrc ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

## Builder ##
FROM base AS builder

WORKDIR /temp

COPY prisma ./prisma/
COPY tsconfig.json tsup.config.ts pnpm-lock.yaml package.json .npmrc ./
COPY src ./src/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm db:generate && \
	pnpm run build

## App ##
FROM node:22.1.0-alpine3.19 as app

WORKDIR /app

LABEL org.opencontainers.image.source=https://github.com/KBot-discord/KBot
LABEL org.opencontainers.image.licenses=AGPL-3.0-or-later

ENV NODE_ENV=production

## Canvas dependencies
RUN apk update --no-cache && \
	apk add -q --no-cache \
		cairo \
		jpeg \
		pango \
		giflib && \
	addgroup --system --gid 1001 kbot && \
	adduser --system --uid 1001 kbot

USER kbot:kbot

COPY --chown=kbot:kbot assets ./assets/
COPY --from=builder --chown=kbot:kbot /temp/prisma prisma/
COPY --from=prod-deps --chown=kbot:kbot /temp/node_modules node_modules/
COPY --from=builder --chown=kbot:kbot /temp/dist dist/
COPY --from=builder --chown=kbot:kbot /temp/package.json ./

CMD ["npx", "prisma", "migrate", "deploy", "&&", "node", "--enable-source-maps", "./dist/KBot.js"]
