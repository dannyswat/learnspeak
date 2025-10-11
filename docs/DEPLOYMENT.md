# LearnSpeak - Deployment Guide

## Summary of Changes

The application now uses a unified architecture:

- **Development:** Frontend runs on port 5173 with Vite proxy, backend on port 8080
- **Production:** Single server on port 8080 serving both API and frontend

### Key Changes:
1. ✅ Frontend API calls use relative paths (`/api/v1`)
2. ✅ Vite proxy configured for development
3. ✅ Backend serves static files from `../frontend/dist` in production
4. ✅ CORS only enabled in development (configurable via env)
5. ✅ No environment variables needed for frontend
6. ✅ Build script created for easy production builds

---

## Development Setup

### 1. Backend (.env configuration)

```bash
cd backend
```

Edit `.env`:
```bash
PORT=8080
ENV=development
CORS_ALLOWED_ORIGINS=http://localhost:5173  # Enable CORS for dev

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=learnspeak
DB_SSLMODE=disable

# JWT
JWT_SECRET=your-dev-secret-key
JWT_EXPIRATION_HOURS=24
```

### 2. Run Development Servers

Terminal 1 - Backend:
```bash
cd backend
go run main.go
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Open: `http://localhost:5173`

---

## Production Deployment

### Option 1: Quick Build & Run

```bash
# From project root
./build.sh

# Configure production environment
cd backend
nano .env  # Set CORS_ALLOWED_ORIGINS= (empty)

# Run
./learnspeak-api
```

Open: `http://localhost:8080`

### Option 2: Manual Build

```bash
# Build frontend
cd frontend
npm run build
# Output: frontend/dist/

# Build backend
cd ../backend
go build -o learnspeak-api main.go

# Configure
nano .env  # Remove CORS_ALLOWED_ORIGINS

# Run
./learnspeak-api
```

### Option 3: Docker Deployment

Create `Dockerfile` in project root:

```dockerfile
# Build frontend
FROM node:18 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Build backend
FROM golang:1.24 AS backend-builder
WORKDIR /app
COPY backend/go.* ./
RUN go mod download
COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -o learnspeak-api main.go

# Final image
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=backend-builder /app/learnspeak-api .
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
COPY backend/.env.example .env

EXPOSE 8080
CMD ["./learnspeak-api"]
```

Build and run:
```bash
docker build -t learnspeak .
docker run -p 8080:8080 \
  -e DB_HOST=host.docker.internal \
  -e JWT_SECRET=your-production-secret \
  learnspeak
```

---

## Production Environment Variables

Minimal `.env` for production:

```bash
PORT=8080
ENV=production
CORS_ALLOWED_ORIGINS=   # Empty - no CORS needed

# Database
DB_HOST=your-db-host
DB_PORT=5432
DB_USER=your-db-user
DB_PASSWORD=your-strong-password
DB_NAME=learnspeak
DB_SSLMODE=require

# Security
JWT_SECRET=your-very-strong-secret-key-change-this
JWT_EXPIRATION_HOURS=24

# Upload
MAX_UPLOAD_SIZE=10485760
UPLOAD_DIR=./uploads
```

---

## File Structure After Build

```
learnspeak/
├── frontend/
│   └── dist/              # Built frontend files
│       ├── index.html
│       ├── assets/
│       └── ...
└── backend/
    ├── learnspeak-api     # Compiled binary
    ├── .env               # Production config
    └── ...
```

---

## How It Works

### Development Mode

```
User Request
    ↓
http://localhost:5173 (Vite Dev Server)
    ↓
Vite checks request:
    ├─ /api/* → Proxy to http://localhost:8080
    └─ /* → Serve from src/ with HMR
```

### Production Mode

```
User Request
    ↓
http://localhost:8080 (Go Server)
    ↓
Echo Router checks:
    ├─ /api/v1/* → API Handlers
    ├─ /health → Health check
    └─ /* → Static files from ../frontend/dist
                ├─ File exists → Serve file
                └─ File not found → Serve index.html (SPA routing)
```

---

## Verification Steps

### Development

1. Backend running: `curl http://localhost:8080/health`
2. Frontend running: Open `http://localhost:5173`
3. API proxy working: Login and check Network tab

### Production

1. Build successful: Check `frontend/dist/` and `backend/learnspeak-api` exist
2. Server starts: `./learnspeak-api` shows no errors
3. API accessible: `curl http://localhost:8080/health`
4. Frontend loads: Open `http://localhost:8080` in browser
5. Login works: Register and login successfully
6. Routing works: Navigate to dashboard, refresh page (should not 404)

---

## Troubleshooting

**Frontend can't reach API in dev:**
- Check backend is running on port 8080
- Check Vite proxy in `vite.config.ts`
- Check CORS_ALLOWED_ORIGINS includes `http://localhost:5173`

**404 errors in production:**
- Check `frontend/dist` exists and has files
- Check backend finds static directory
- Look for "Serving static files" in backend logs

**CORS errors in production:**
- Set `CORS_ALLOWED_ORIGINS=` (empty) in backend/.env
- Ensure both frontend and backend on same origin

**Routes not working after refresh:**
- Check backend HTML5 mode is enabled (`HTML5: true`)
- All non-API routes should serve `index.html`

---

## Security Checklist for Production

- [ ] Change `JWT_SECRET` to strong random value
- [ ] Set `ENV=production`
- [ ] Remove or empty `CORS_ALLOWED_ORIGINS`
- [ ] Use SSL/TLS (HTTPS)
- [ ] Set `DB_SSLMODE=require`
- [ ] Use strong database password
- [ ] Set proper file permissions on `.env`
- [ ] Enable firewall rules
- [ ] Set up database backups
- [ ] Configure log rotation

---

## Scaling Considerations

For high traffic:

1. **Reverse Proxy:** Use Nginx/Caddy in front
2. **Static CDN:** Serve `dist/` files from CDN
3. **API Separation:** Run API and static serving separately
4. **Load Balancing:** Multiple backend instances
5. **Database:** Connection pooling, read replicas

Example Nginx config:
```nginx
server {
    listen 80;
    server_name learnspeak.com;

    # Static files
    location / {
        root /var/www/learnspeak/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
