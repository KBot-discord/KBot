## Builder ##
FROM node:22.0.0-alpine3.19 as base

RUN apk update --no-cache

## Builder ##
FROM base AS builder

WORKDIR /temp

RUN apk add -q --no-cache cairo-dev jpeg-dev pango-dev giflib-dev python3 g++ make

COPY prisma ./prisma/
COPY tsconfig.json tsup.config.ts pnpm-lock.yaml package.json .npmrc ./
COPY src ./src/

RUN corepack enable && \
	pnpm install --frozen-lockfile && \
	pnpm run build && \
	pnpm install --frozen-lockfile --prod

## App ##
FROM base as app

WORKDIR /app

COPY --chown=kbot:kbot assets ./assets/

LABEL org.opencontainers.image.source=https://github.com/KBot-discord/KBot
LABEL org.opencontainers.image.licenses=AGPL-3.0-or-later

ENV NODE_ENV=production

## Canvas dependencies
RUN apk add -q --no-cache \
		cairo=1.18.0-r0 \
		jpeg=9e-r1 \
		pango=1.51.0-r0 \
		giflib=5.2.2-r0 && \
	npm i -g prisma && \
	addgroup --system --gid 1001 kbot && \
	adduser --system --uid 1001 kbot

USER kbot:kbot

COPY --from=builder --chown=kbot:kbot /temp/prisma/migrations prisma/migrations/
COPY --from=builder --chown=kbot:kbot /temp/prisma/schema.prisma prisma/schema.prisma
COPY --from=builder --chown=kbot:kbot /temp/node_modules node_modules/
COPY --from=builder --chown=kbot:kbot /temp/dist dist/
COPY --from=builder --chown=kbot:kbot /temp/package.json ./

CMD ["npx", "prisma", "migrate", "deploy", "&&", "node", "--enable-source-maps", "./dist/KBot.js"]
