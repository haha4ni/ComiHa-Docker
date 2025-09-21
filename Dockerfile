# Build frontend
FROM node:20-bullseye AS frontend
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Build backend
FROM golang:1.25-bookworm AS backend
WORKDIR /app
COPY backend/go.mod ./
RUN go mod download || true
COPY backend/ ./
COPY --from=frontend /app/dist ./frontend/dist
RUN go build -o server .

# Runtime
FROM debian:bookworm-slim
WORKDIR /app
COPY --from=backend /app/server .
COPY --from=backend /app/frontend/dist ./frontend/dist
EXPOSE 8080
CMD ["./server"]
