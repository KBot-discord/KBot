## Builder ##
FROM golang:1.20.5-alpine as builder

ENV CGO_ENABLED=1 GOOS=linux GOARCH=amd64

RUN apk add -q --no-cache ca-certificates curl gcc musl-dev && \
	curl -sSL \
      "https://github.com/bufbuild/buf/releases/download/v1.21.0/buf-$(uname -s)-$(uname -m)" \
      -o "/usr/local/bin/buf" && \
    chmod +x "/usr/local/bin/buf" && \
	apk update

WORKDIR /temp

COPY ./apps/discord-status/ ./app/
COPY ./protos ./protos/

WORKDIR /temp/app

RUN buf generate ../protos/discord-status && \
	go mod download && \
	go vet -v && \
	go test -v ./... && \
	go build -o ./build -ldflags '-linkmode external -extldflags -static'

## App ##
FROM scratch as app

COPY --from=builder /temp/app/build /app/build

EXPOSE 8080

ENTRYPOINT ["/app/build"]
