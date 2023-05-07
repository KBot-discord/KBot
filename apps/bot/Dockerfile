## Builder ##
FROM node:20-alpine as builder

WORKDIR /temp

RUN apk add --no-cache libc6-compat

RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=@kbotdev/bot --docker

## Dependencies ##
FROM node:20-alpine AS deps

ENV NODE_ENV=production

WORKDIR /temp

RUN apk add -q --no-cache openssl libc6-compat cairo-dev jpeg-dev pango-dev giflib-dev python3 g++ make curl && \
	curl -sSL \
      "https://github.com/bufbuild/buf/releases/download/v1.18.0/buf-$(uname -s)-$(uname -m)" \
      -o "/usr/local/bin/buf" && \
    chmod +x "/usr/local/bin/buf" && \
	apk update

COPY .yarn .yarn/
COPY protos protos/
COPY .yarnrc.yml tsconfig.base.json ./
COPY --from=builder /temp/out/json/ /temp/out/yarn.lock ./
COPY turbo.json turbo.json

RUN yarn install --immutable

COPY --from=builder /temp/out/full/ .

RUN yarn db:generate && \
	yarn turbo build --filter=@kbotdev/bot

## App ##
FROM node:20-alpine as app

WORKDIR /app

## Canvas dependencies
RUN apk add -q --update cairo jpeg pango giflib && \
    yarn global add prisma && \
	addgroup --system --gid 1001 kbot && \
	adduser --system --uid 1001 kbot

USER kbot

COPY --from=deps /temp/node_modules node_modules/
COPY --from=deps /temp/packages packages/
COPY --from=deps /temp/apps/bot/assets assets/
COPY --from=deps /temp/apps/bot/prisma/generated prisma/generated/
COPY --from=deps /temp/apps/bot/prisma/migrations prisma/migrations/
COPY --from=deps /temp/apps/bot/prisma/schema.prisma prisma/schema.prisma
COPY --from=deps /temp/apps/bot/dist dist/
COPY --from=deps /temp/apps/bot/package.json ./

CMD ["yarn", "run", "start:migrate"]
