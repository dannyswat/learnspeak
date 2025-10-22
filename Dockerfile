# Multi-stage Dockerfile for LearnSpeak Application
# Builds both frontend (React/Vite) and backend (Go with Azure Speech SDK)

# ============================================================================
# Stage 1: Build Frontend
# ============================================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files and install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source code
COPY frontend/ ./

# Build the frontend application
RUN npm run build

# ============================================================================
# Stage 2: Build Backend
# ============================================================================
FROM golang:1.24-bookworm AS backend-builder

# Install build dependencies for CGO (required for Azure Speech SDK)
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    make \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

# Copy go mod files and download dependencies
COPY backend/go.mod backend/go.sum ./
RUN go mod download

# Copy backend source code
COPY backend/ ./

# Copy Speech SDK library (amd64 only)
# The setup-speech-sdk-linux.sh script should be run before building
COPY backend/lib/speechsdk-linux/amd64/SpeechSDK-Linux-1.43.0/ ./lib/speechsdk/

# Enable CGO and set Speech SDK flags
ENV CGO_ENABLED=1
ENV CGO_CFLAGS="-I/app/backend/lib/speechsdk/include/c_api"
ENV CGO_LDFLAGS="-L/app/backend/lib/speechsdk/lib/x64 -lMicrosoft.CognitiveServices.Speech.core -Wl,-rpath,/app/lib"

# Build the Go application with Speech SDK support
RUN go build -o learnspeak-api main.go

# ============================================================================
# Stage 3: Production Runtime
# ============================================================================
FROM debian:bookworm-slim

# Install runtime dependencies (required for Speech SDK)
RUN apt-get update && apt-get install -y \
    ca-certificates \
    tzdata \
    libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

# Create app user for security
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

WORKDIR /app

# Copy backend binary from builder
COPY --from=backend-builder /app/backend/learnspeak-api .

# Copy database SQL migration files
COPY --from=backend-builder /app/backend/database/functions ./database/functions
COPY --from=backend-builder /app/backend/database/triggers ./database/triggers

# Copy Speech SDK runtime libraries (amd64)
COPY --from=backend-builder /app/backend/lib/speechsdk/lib/x64/ ./lib/

# Set library path for Speech SDK
ENV LD_LIBRARY_PATH=/app/lib

# Copy frontend build from frontend builder
COPY --from=frontend-builder /app/frontend/dist ./frontend

# Create directories for uploads and ensure proper permissions
RUN mkdir -p ./uploads/images \
    ./uploads/audio \
    ./uploads/image-cache \
    ./uploads/tts-cache \
    ./uploads/translation-cache && \
    chown -R appuser:appgroup /app

# Copy .env.example as a template (users should mount their own .env)
COPY backend/.env.example ./.env.example

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/v1/health || exit 1

# Set environment variables
ENV PORT=8080 \
    ENVIRONMENT=production

# Run the application
CMD ["./learnspeak-api"]
