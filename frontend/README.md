# LearnSpeak Frontend

React + TypeScript frontend for the LearnSpeak language learning platform.

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Styling (based on design/html templates)

## Getting Started

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

The app will open at `http://localhost:5173`

**Note:** Vite proxy forwards `/api` to `http://localhost:8080` automatically.

## Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production (outputs to `dist/`)
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

The frontend uses relative paths for API calls:

- Development: Vite proxy forwards `/api/*` to `http://localhost:8080`
- Production: Backend serves frontend and API from same origin

No environment variables needed!

## Features

- ✅ User registration & login
- ✅ JWT authentication
- ✅ Protected routes
- ✅ Responsive design
- ✅ Form validation
- ✅ Password visibility toggle
- ✅ Error handling
- ✅ Loading states

## Production Build

```bash
npm run build
```

Output goes to `dist/` directory. The Go backend will serve these files automatically.

## Architecture

### Development Mode
```
Browser → http://localhost:5173 → Vite Dev Server
                                    ↓ (proxy /api/*)
                                    Backend :8080
```

### Production Mode
```
Browser → http://localhost:8080 → Go Server
                                   ├─ /api/* → API Handlers
                                   └─ /*     → Static Files
```

## Project Structure

```
src/
├── components/      # Reusable components
├── contexts/        # React contexts (Auth)
├── hooks/          # Custom hooks (useAuth)
├── pages/          # Page components
├── services/       # API services
└── types/          # TypeScript types
```

## Styling

- Based on `design/html/` mockups
- No CSS framework - custom CSS
- Fonts: Poppins (headings), Inter (body)
- Primary color: #22c55e (green)

