## Builder ##
FROM golang:1.20.4-alpine as builder

RUN apk add -q --no-cache curl && \
	curl -sSL \
      "https://github.com/bufbuild/buf/releases/download/v1.19.0/buf-$(uname -s)-$(uname -m)" \
      -o "/usr/local/bin/buf" && \
    chmod +x "/usr/local/bin/buf" && \
	apk update

WORKDIR /temp

COPY ./apps/discord-incident/ ./app/
COPY ./protos ./protos/

WORKDIR /temp/app

RUN buf generate ../protos/bot && \
	buf generate ../protos/types

RUN go mod download
RUN go vet -v
RUN go test -v ./...

RUN go build -o ./build

## App ##
FROM gcr.io/distroless/base as app

COPY --from=builder /temp/app/build /

ENTRYPOINT ["/build"]
