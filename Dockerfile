# syntax=docker/dockerfile:1

FROM golang:1.21 AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /gitplm

FROM alpine:3.18
RUN adduser -D appuser
USER appuser
WORKDIR /workspace
COPY --from=build /gitplm /usr/local/bin/gitplm
ENTRYPOINT ["gitplm"]
