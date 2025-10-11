# LearnSpeak - Quick Start Guide

## Development Mode (Separate Frontend & Backend)

### 1. Start the Backend (Terminal 1)

```bash
cd /Users/dannys/repos/learnspeak/backend
go run main.go
```

The backend will start on `http://localhost:8080`

### 2. Start the Frontend with Dev Server (Terminal 2)

```bash
cd /Users/dannys/repos/learnspeak/frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

**Note:** Vite proxy forwards `/api` requests to `http://localhost:8080` automatically.

### 3. Open Browser

Navigate to `http://localhost:5173` to use the application.

---

## Production Mode (Single Server)

### 1. Build the Application

```bash
cd /Users/dannys/repos/learnspeak
./build.sh
```

This will:
- Build the React frontend to `frontend/dist`
- Compile the Go backend to `backend/learnspeak-api`

### 2. Configure Environment

Update `backend/.env`:
```bash
# Remove or leave CORS_ALLOWED_ORIGINS empty for production
CORS_ALLOWED_ORIGINS=

# Other settings...
PORT=8080
ENV=production
```

### 3. Run the Server

```bash
cd backend
./learnspeak-api
```

The server will:
- Serve the API on `/api/v1/*`
- Serve the frontend static files from `../frontend/dist`
- Handle client-side routing (HTML5 mode)

### 4. Open Browser

Navigate to `http://localhost:8080` to use the application.

## Testing with cURL

### Register a new user:
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

Copy the token from the response and use it for authenticated requests:

```bash
curl -X GET http://localhost:8080/api/v1/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Project Structure

```
learnspeak/
├── backend/               # Go backend
│   ├── config/           # Configuration
│   ├── database/         # Database & migrations
│   ├── dto/             # Data transfer objects
│   ├── handlers/        # HTTP handlers
│   ├── middleware/      # Authentication middleware
│   ├── models/          # Database models
│   ├── routes/          # Route definitions
│   ├── utils/           # Utilities (JWT, password)
│   └── main.go          # Entry point
│
├── frontend/             # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── contexts/    # React contexts
│   │   ├── hooks/       # Custom hooks
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── types/       # TypeScript types
│   └── package.json
│
└── design/              # Design files & mockups
    └── html/            # HTML/CSS mockups
```

## Troubleshooting

**Backend won't start:**
- Check PostgreSQL is running
- Verify database credentials in `backend/.env`
- Ensure database `learnspeak` exists

**Frontend can't connect:**
- Verify backend is running on port 8080
- Check CORS settings in backend
- Verify `VITE_API_BASE_URL` in `frontend/.env`

**Login fails:**
- Check network tab in browser DevTools
- Verify credentials are correct
- Check backend logs for errors

## Next Steps

1. Implement full dashboard based on `design/html/learner-dashboard.html`
2. Add word learning features
3. Create topic and journey management
4. Implement quiz functionality
5. Add achievements and progress tracking
