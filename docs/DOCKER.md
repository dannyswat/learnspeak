# Docker Deployment Guide

This guide explains how to build and deploy the LearnSpeak application using Docker.

## Overview

The LearnSpeak application consists of:
- **Frontend**: React/TypeScript application built with Vite
- **Backend**: Go API server with Azure Speech SDK support (requires CGO)
- **Database**: PostgreSQL

The production Dockerfile creates a single container that serves both the frontend (static files) and backend API. The image is built for **linux/amd64** architecture with full Speech SDK support using Debian Bookworm (glibc-based) for compatibility with Azure Speech SDK native libraries.

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- At least 2GB of RAM available for containers
- **Azure Speech SDK for Linux** in `backend/lib/speechsdk-linux/amd64/` (automatically downloaded by setup script)

## Quick Start (Production)

### 1. Setup Environment Variables

Create a `.env` file in the root directory:

```bash
# Database Configuration
DB_NAME=learnspeak
DB_USER=postgres
DB_PASSWORD=your_secure_password_here
DB_PORT=5432

# Server Configuration
PORT=8080
JWT_SECRET=your-super-secret-jwt-key-change-this

# Azure OpenAI (Optional - for image generation)
AZURE_OPENAI_KEY=your_azure_openai_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=dall-e-3
AZURE_OPENAI_API_VERSION=2024-02-01

# Ideogram API (Optional - alternative image generation)
IDEOGRAM_API_KEY=your_ideogram_api_key
IMAGE_GENERATION_PROVIDER=ideogram

# Azure Speech SDK (Optional - for TTS)
AZURE_SPEECH_KEY=your_speech_key
AZURE_SPEECH_REGION=eastus

# Azure Translator (Optional - for translation)
AZURE_TRANSLATOR_KEY=your_translator_key
AZURE_TRANSLATOR_REGION=eastus
AZURE_TRANSLATOR_ENDPOINT=https://api.cognitive.microsofttranslator.com/

# Cache Configuration
IMAGE_CACHE_ENABLED=true
TTS_CACHE_ENABLED=true
TRANSLATOR_CACHE_ENABLED=true

# Upload Configuration
MAX_UPLOAD_SIZE=10485760
```

### 2. Download Azure Speech SDK

The application requires Azure Speech SDK for Linux (amd64 platform):

```bash
# Download Speech SDK for amd64
cd backend && ./setup-speech-sdk-linux.sh
cd ..
```

This will download and extract the Speech SDK v1.43.0 to:
- `backend/lib/speechsdk-linux/amd64/`

**Note**: ARM64 Linux binaries are not currently available from Azure. The Docker image only supports linux/amd64.

### 3. Build and Run

```bash
# Build and start all services (using helper script)
./docker-build.sh build
./docker-build.sh up

# OR using docker-compose directly
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down

# Stop and remove volumes (WARNING: deletes all data)
docker-compose -f docker-compose.prod.yml down -v
```

### 4. Access the Application

- **Web Application**: http://localhost:8080
- **API Endpoint**: http://localhost:8080/api/v1
- **Health Check**: http://localhost:8080/api/v1/health

## Advanced Build Options

### Pushing to Registry

To push the image to Docker Hub or a private registry:

```bash
# Login to Docker Hub
docker login

# Build and push
docker build -t dannyswat/learnspeak:latest -t dannyswat/learnspeak:v1.0.0 .
docker push dannyswat/learnspeak:latest
docker push dannyswat/learnspeak:v1.0.0
```

### Custom Build

For advanced builds with custom tags or options:

```bash
# Build with specific version tag
docker build -t dannyswat/learnspeak:v1.0.0 .

# Build with no cache (clean build)
docker build --no-cache -t dannyswat/learnspeak:latest .
```

## Development Setup

For development with hot-reload, use the original docker-compose.yml:

```bash
docker-compose up -d
```

This runs:
- Backend on http://localhost:8080 (with live reload)
- Frontend on http://localhost:5173 (with Vite dev server)
- PostgreSQL on localhost:5432

## Building the Docker Image Manually

```bash
# Build the image
docker build -t learnspeak:latest .

# Run the container
docker run -d \
  --name learnspeak \
  -p 8080:8080 \
  -e DB_HOST=host.docker.internal \
  -e DB_USER=postgres \
  -e DB_PASSWORD=postgres \
  -e DB_NAME=learnspeak \
  -e JWT_SECRET=your-secret-key \
  -v learnspeak-uploads:/app/uploads \
  learnspeak:latest
```

## Important Notes

### Azure Speech SDK Support

The Docker build **includes full Azure Speech SDK support** with CGO-enabled builds:
- ✅ Platform support: `linux/amd64` only
- ✅ Native Speech SDK TTS works in Docker containers
- ✅ All features fully functional in production

**Architecture Details**:
- The `setup-speech-sdk-linux.sh` script downloads SDK v1.43.0 for amd64
- Runtime libraries are included in the final Alpine image with `LD_LIBRARY_PATH` configured
- ARM64 binaries are not available from Azure, so only amd64 is supported

**For local development** with native Speech SDK support (macOS):
```bash
cd backend
./setup-speech-sdk.sh  # Downloads macOS framework
./build.sh             # Build with CGO and Speech SDK
./run.sh               # Run with TTS support
```

### Platform Support

The Docker build targets **linux/amd64** platform:
- ✅ Works on x86-64 servers (most cloud providers)
- ✅ CGO enabled with Speech SDK libraries
- ❌ ARM64 not supported (Azure Speech SDK not available for ARM64 Linux)
- ✅ Smaller, more secure image
- ✅ Better portability across platforms
- ✅ Faster builds
- ✅ No runtime library dependencies

### Health Checks

The application includes health checks:
- Container health: `http://localhost:8080/api/v1/health`
- Database health: PostgreSQL `pg_isready` check

### Volumes

Two volumes are created:
- `postgres_data`: Database files (persists across restarts)
- `uploads_data`: Uploaded images, audio, and cache files

### Security Considerations

1. **Change default passwords**: Update all passwords in `.env`
2. **JWT Secret**: Use a strong, random secret for JWT tokens
3. **Database**: Use strong credentials and consider enabling SSL in production
4. **API Keys**: Never commit API keys to version control
5. **User permissions**: The container runs as non-root user `appuser`

## Troubleshooting

### Container fails to start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs app

# Check if database is ready
docker-compose -f docker-compose.prod.yml logs postgres
```

### CGO build errors

Ensure the Speech SDK is present:
```bash
ls -la backend/lib/speechsdk/
```

You should see `MicrosoftCognitiveServicesSpeech.framework/`

### Database connection issues

```bash
# Verify database is running
docker-compose -f docker-compose.prod.yml ps

# Test database connection
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -d learnspeak -c "SELECT 1;"
```

### Permission errors

```bash
# Fix upload directory permissions
docker-compose -f docker-compose.prod.yml exec app chmod -R 755 /app/uploads
```

## Production Deployment

For production deployment:

1. **Use a reverse proxy** (nginx/Traefik) for SSL termination
2. **Enable SSL** for PostgreSQL connections
3. **Set up backups** for the database and uploads volumes
4. **Configure monitoring** (Prometheus, Grafana, etc.)
5. **Use secrets management** (Docker secrets, HashiCorp Vault, etc.)
6. **Set resource limits** in docker-compose.prod.yml:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## Backup and Restore

### Backup

```bash
# Backup database
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U postgres learnspeak > backup.sql

# Backup uploads
docker run --rm -v learnspeak_uploads_data:/data -v $(pwd):/backup alpine tar czf /backup/uploads-backup.tar.gz /data
```

### Restore

```bash
# Restore database
cat backup.sql | docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres learnspeak

# Restore uploads
docker run --rm -v learnspeak_uploads_data:/data -v $(pwd):/backup alpine tar xzf /backup/uploads-backup.tar.gz -C /
```

## Updating the Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# Clean up old images
docker image prune -f
```

## License

See LICENSE file for details.
