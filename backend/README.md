# LearnSpeak Backend

Go backend API for the LearnSpeak language learning platform.

## Project Structure

```
backend/
├── config/          # Configuration management
├── database/        # Database connection and migrations
├── dto/            # Data Transfer Objects
├── handlers/       # HTTP request handlers
├── middleware/     # Custom middleware (auth, etc.)
├── models/         # Database models
├── routes/         # Route definitions
├── utils/          # Utility functions
├── main.go         # Application entry point
├── go.mod          # Go module dependencies
└── .env.example    # Example environment variables
```

## Getting Started

### Prerequisites

- Go 1.24.3 or later
- PostgreSQL 15+
- **macOS only**: Azure Speech SDK (for TTS features)

### Installation

1. Clone the repository

2. **macOS only**: Install Azure Speech SDK for TTS functionality:
   ```bash
   ./setup-speech-sdk.sh
   ```
   This downloads the Azure Speech SDK C library (~12MB) to `lib/speechsdk/`

3. Copy `.env.example` to `.env` and configure your environment variables:
   ```bash
   cp .env.example .env
   ```

4. Install dependencies (already done):
   ```bash
   go mod download
   ```

5. Create a PostgreSQL database:
   ```sql
   CREATE DATABASE learnspeak;
   ```

5. Run the application:
   ```bash
   ./run.sh
   ```

The server will start on `http://localhost:8080` (or the port specified in your `.env` file).

## API Endpoints

### Authentication

#### Register a new user
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securepassword123",
  "email": "john@example.com",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securepassword123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "name": "John Doe",
    "profilePicUrl": null,
    "roles": ["learner"]
  }
}
```

### Protected Endpoints

#### Get user profile
```http
GET /api/v1/profile
Authorization: Bearer <token>
```

### Health Check

```http
GET /health
```

## Database Migrations

Migrations run automatically on server startup. The following tables are created:

- `users` - User accounts
- `roles` - User roles (learner, teacher, admin)
- `user_roles` - User-role relationships

Default roles are seeded automatically:
- **learner** - Regular learner user
- **teacher** - Teacher who can create content
- **admin** - Administrator with full access

## Development

### Running in development mode
```bash
ENV=development sh run.sh
```

### Building for production
```bash
go build -o learnspeak-api main.go
./learnspeak-api
```

The backend will serve both the API and frontend static files from `../frontend/dist`.

## Static File Serving

In production, the backend serves the React frontend:

1. Build the frontend: `cd ../frontend && npm run build`
2. The backend automatically serves files from `../frontend/dist`
3. Supports client-side routing (HTML5 mode)
4. API routes take precedence over static files

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `PORT` - Server port (default: 8080)
- `DB_HOST` - Database host
- `DB_NAME` - Database name
- `JWT_SECRET` - Secret key for JWT tokens (change in production!)
- `JWT_EXPIRATION_HOURS` - Token expiration time
- `CORS_ALLOWED_ORIGINS` - CORS origins (only needed for dev with separate frontend, leave empty in production)

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- CORS protection (configurable)
- Request size limits
- Input validation

## Architecture

### Development
- Frontend: `http://localhost:5173` (Vite dev server with proxy)
- Backend: `http://localhost:8080` (API only)
- Vite proxies `/api/*` to backend

### Production
- Single server: `http://localhost:8080`
- Backend serves both API and static files
- No CORS needed (same origin)

## Next Steps

To extend the backend:

1. Add more models in `models/` directory
2. Create corresponding DTOs in `dto/`
3. Implement handlers in `handlers/`
4. Register routes in `routes/routes.go`
5. Update migrations in `database/migrate.go`
