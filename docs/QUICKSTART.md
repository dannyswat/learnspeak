# LearnSpeak - Quick Start Guide

Get up and running with LearnSpeak in 5 minutes!

## Prerequisites

- **Go 1.24.3+** installed
- **Node.js 20+** installed  
- **PostgreSQL 15+** running (or use Docker Compose)

## Quick Start with Docker Compose (Recommended)

```bash
# Clone and start everything
git clone https://github.com/dannyswat/learnspeak.git
cd learnspeak
docker-compose up
```

Access the app at **http://localhost:5173**

## Manual Development Setup

### 1. Database Setup

Create database:
```bash
createdb learnspeak
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
sh run.sh
```

Backend runs at **http://localhost:8080**

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

## Test the API

### Register a user:
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123",
    "email": "test@example.com",
    "name": "Test User"
  }'
```

### Login:
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

## Production Build

```bash
./build.sh
cd backend
./learnspeak-api
```

Access at **http://localhost:8080**

## Common Issues

**Backend won't start?**
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure `learnspeak` database exists

**Frontend can't connect?**
- Make sure backend is running on port 8080
- Check Vite proxy configuration

## Next Steps

- 📖 See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- 📋 Check [PROGRESS.md](../design/PROGRESS.md) for project roadmap
- 🔧 Read backend/frontend READMEs for detailed documentation
