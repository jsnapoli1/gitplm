# syntax=docker/dockerfile:1

# Build the frontend
FROM node:20 AS frontend
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/vite.config.js ./
COPY frontend/index.html ./
COPY frontend/src ./src
RUN npm run build

# Build the backend
FROM golang:1.24 AS builder
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
ARG TARGETOS TARGETARCH
RUN CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH go build -o /gitplm

# Final image
FROM alpine:3.19
RUN apk --no-cache add ca-certificates
WORKDIR /app
COPY --from=builder /gitplm /app/gitplm
COPY --from=frontend /frontend/dist /app/frontend/dist
EXPOSE 8080
ENTRYPOINT ["/app/gitplm"]
