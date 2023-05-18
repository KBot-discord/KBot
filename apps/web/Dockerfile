## Builder ##
FROM node:20-alpine as builder

## Canvas dependencies
RUN apk add --no-cache libc6-compat

WORKDIR /temp

RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=@kbotdev/web --docker

## Dependencies ##
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat && \
	apk add -q --update openssl && \
	apk add -q --no-cache libc6-compat curl && \
	curl -sSL \
      "https://github.com/bufbuild/buf/releases/download/v1.19.0/buf-$(uname -s)-$(uname -m)" \
      -o "/usr/local/bin/buf" && \
    chmod +x "/usr/local/bin/buf" && \
	apk update

WORKDIR /temp

COPY .yarn .yarn/
COPY protos protos/
COPY scripts scripts/
COPY .yarnrc.yml tsconfig.base.json ./
COPY --from=builder /temp/out/json/ /temp/out/yarn.lock ./
COPY turbo.json turbo.json

RUN yarn install

COPY --from=builder /temp/out/full/ .

RUN yarn turbo build --filter=@kbotdev/web

## App ##
FROM node:20-alpine as app

ENV NODE_ENV production

RUN apk add -q --update

RUN addgroup --system --gid 1001 kbot
RUN adduser --system --uid 1001 kbot
USER kbot

COPY --from=deps /temp/node_modules ./
COPY --from=deps --chown=kbot /temp/apps/web/build ./
COPY --from=deps /temp/apps/web/package.json ./

CMD ["node", "./build/index.js"]
