# LearnSpeak - Cantonese Learning Platform

A modern, AI-powered language learning platform focused on Cantonese, built with Go and React.

## Project Overview

LearnSpeak is a comprehensive language learning platform that combines:
- **Structured Learning Journeys** - Organized topics and vocabulary
- **Interactive Quizzes** - Multiple quiz types with instant feedback
- **AI-Powered Features** - Automated content generation and suggestions
- **Progress Tracking** - Detailed analytics and learning statistics
- **Role-Based Access** - Separate interfaces for learners, teachers, and admins

## Tech Stack

### Backend
- **Go 1.24.3** - High-performance API server
- **Echo v4** - Web framework
- **PostgreSQL 15+** - Primary database
- **GORM** - ORM with auto-migrations
- **JWT** - Authentication tokens
- **Docker** - Containerization

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client

## Project Structure

```
learnspeak/
├── backend/           # Go API server
│   ├── config/        # Configuration management
│   ├── database/      # Database connection and migrations
│   ├── dto/          # Data Transfer Objects
│   ├── handlers/     # HTTP request handlers
│   ├── middleware/   # Custom middleware
│   ├── models/       # Database models
│   ├── routes/       # Route definitions
│   ├── utils/        # Utility functions
│   └── main.go       # Entry point
├── frontend/         # React application
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── contexts/    # React contexts
│   │   ├── hooks/       # Custom hooks
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── types/       # TypeScript types
│   └── public/       # Static assets
├── design/           # Design mockups and documentation
├── docs/             # Additional documentation
├── docker-compose.yml # Docker orchestration
└── build.sh          # Production build script
```

## Quick Start

### Prerequisites

- **Go 1.24.3+**
- **Node.js 20+**
- **PostgreSQL 15+** (or use Docker)
- **Docker & Docker Compose** (optional, for containerized setup)

### Option 1: Docker Compose (Recommended for Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/dannyswat/learnspeak.git
   cd learnspeak
   ```

2. **Start all services**
   ```bash
   docker-compose up
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080
   - Database: localhost:5432

### Option 2: Manual Setup

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Copy environment file**
   ```bash
   cp .env.example .env
   ```

3. **Configure database** (update `.env` with your PostgreSQL credentials)

4. **Install dependencies** (already done via go.mod)
   ```bash
   go mod download
   ```

5. **Run the backend**
   ```bash
   ./run.sh
   ```

Backend runs at: http://localhost:8080

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

Frontend runs at: http://localhost:5173

### Database Setup

If running PostgreSQL locally:

```sql
CREATE DATABASE learnspeak;
```

The backend will automatically run migrations on startup.

## Development

### Running Tests

**Backend**:
```bash
cd backend
go test ./...
```

**Frontend**:
```bash
cd frontend
npm test
```

### Linting

**Backend**:
```bash
cd backend
golangci-lint run
```

**Frontend**:
```bash
cd frontend
npm run lint
```

### Code Formatting

**Backend**:
```bash
cd backend
gofmt -w .
```

**Frontend**:
```bash
cd frontend
npm run format
```

## Production Build

Use the build script to create production builds:

```bash
./build.sh
```

This will:
1. Build the frontend (outputs to `frontend/dist/`)
2. Build the backend binary (outputs to `backend/learnspeak-api`)

The backend will serve both the API and static frontend files.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions including:
- Manual deployment
- Docker deployment
- Nginx configuration
- Environment setup
- Security checklist

## Documentation

- 📚 **[docs/](docs/)** - Complete documentation hub
- 🚀 **[docs/QUICKSTART.md](docs/QUICKSTART.md)** - Get started in 5 minutes
- 🚢 **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Production deployment guide
- 📋 **[design/PROGRESS.md](design/PROGRESS.md)** - Project timeline and sprint progress
- 🔧 **[backend/README.md](backend/README.md)** - Backend API documentation
- 💻 **[frontend/README.md](frontend/README.md)** - Frontend architecture
- ❓ **[docs/ANSWERS.md](docs/ANSWERS.md)** - Project requirements and decisions

## Features

### Current Features (Sprint 1.1)
- ✅ User registration and authentication
- ✅ JWT-based authorization
- ✅ Protected routes
- ✅ Role-based access control
- ✅ Responsive UI design
- ✅ Development and production environments

### Planned Features
- Word and topic management
- Learning journeys
- Interactive quizzes
- Progress tracking
- AI-powered content generation
- Teacher and admin interfaces

## API Documentation

API endpoints are available at:
- Development: http://localhost:8080/api/v1
- Production: https://your-domain.com/api/v1

### Authentication Endpoints
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/profile` - Get user profile (protected)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

Danny Wat - [@dannyswat](https://github.com/dannyswat)

Project Link: [https://github.com/dannyswat/learnspeak](https://github.com/dannyswat/learnspeak)
