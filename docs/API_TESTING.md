# API Testing Guide

## Using cURL

### 1. Register a new user

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "password123",
    "email": "john@example.com",
    "name": "John Doe"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "password123"
  }'
```

Save the token from the response!

### 3. Get Profile (Protected)

```bash
curl -X GET http://localhost:8080/api/v1/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Health Check

```bash
curl http://localhost:8080/health
```

## Expected Responses

### Successful Registration/Login
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
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

### Error Response
```json
{
  "error": "validation_error",
  "message": "Validation failed",
  "details": {
    "Password": "min",
    "Email": "email"
  }
}
```

## Testing Workflow

1. Start the server: `go run main.go`
2. Register a new user
3. Login with credentials
4. Copy the token from login response
5. Use token to access protected endpoints
6. Token expires after 24 hours (configurable)
