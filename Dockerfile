## Base ##
FROM node:18-alpine as builder

ENV CI=true NODE_ENV=production

# canvas build deps
RUN apk add -q --update && \
	apk add -q --no-cache --virtual .build-deps cairo-dev jpeg-dev pango-dev giflib-dev python3 g++ make curl && \
    curl -sSL \
      "https://github.com/bufbuild/buf/releases/download/v1.11.0/buf-$(uname -s)-$(uname -m)" \
      -o "/usr/local/bin/buf" && \
    chmod +x "/usr/local/bin/buf"

COPY assets/ assets/

WORKDIR /temp

COPY tsconfig.base.json .yarnrc.yml buf.gen.yaml ./
COPY prisma/ prisma/
COPY yarn.lock package.json ./
COPY .yarn/ .yarn/
COPY src/ src/

RUN yarn install --immutable && \
    yarn buf:generate && \
	yarn build && \
    apk del -q .build-deps

## Publish ##
FROM node:18-alpine as app

# canvas deps
RUN apk add -q --update && \
	apk add -q --update cairo jpeg pango giflib

COPY --from=builder temp/package.json ./
COPY --from=builder temp/node_modules node_modules/
COPY --from=builder temp/dist dist/
COPY --from=builder assets/ assets/

EXPOSE 8600 8601

CMD ["yarn", "run", "start"]
