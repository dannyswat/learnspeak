# Journey Invitation Feature

## Overview
The Journey Invitation feature allows teachers to generate shareable invitation links for their journeys. When students click on these links, they can view journey details and join the journey by registering or logging in.

## Architecture

### Database Schema

#### `journey_invitations` Table
```sql
CREATE TABLE journey_invitations (
    id SERIAL PRIMARY KEY,
    journey_id INTEGER NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
    invitation_token VARCHAR(64) NOT NULL UNIQUE,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP,              -- NULL = never expires
    max_uses INTEGER,                  -- NULL = unlimited uses
    current_uses INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**
- `idx_journey_invitations_journey_id` on `journey_id`
- `idx_journey_invitations_token` on `invitation_token` (unique)
- `idx_journey_invitations_created_by` on `created_by`
- `idx_journey_invitations_is_active` on `is_active`

### Backend Components

#### 1. Model (`models/journey_invitation.go`)
```go
type JourneyInvitation struct {
    ID              uint
    JourneyID       uint
    InvitationToken string     // 32-character random token
    CreatedBy       uint
    ExpiresAt       *time.Time // Optional expiration
    MaxUses         *int       // Optional usage limit
    CurrentUses     int
    IsActive        bool
    CreatedAt       time.Time
    UpdatedAt       time.Time
    
    Journey Journey
    Creator User
}

// IsValid checks if invitation can still be used
func (ji *JourneyInvitation) IsValid() bool
```

#### 2. DTOs (`dto/journey.go`)

**CreateInvitationRequest**
```go
type CreateInvitationRequest struct {
    ExpiresInDays *int // Optional: days until expiration
    MaxUses       *int // Optional: maximum number of uses
}
```

**InvitationResponse**
```go
type InvitationResponse struct {
    ID              uint
    JourneyID       uint
    Journey         *JourneyResponse
    InvitationToken string
    InvitationURL   string // Full URL to share
    CreatedBy       *UserInfo
    ExpiresAt       *string
    MaxUses         *int
    CurrentUses     int
    IsActive        bool
    IsValid         bool  // Computed: checks expiry, uses, active status
    CreatedAt       string
}
```

**InvitationDetailsResponse** (Public, for unauthenticated users)
```go
type InvitationDetailsResponse struct {
    JourneyID          uint
    JourneyName        string
    JourneyDescription string
    Language           *LanguageInfo
    TopicCount         int
    TotalWords         int
    CreatorName        string
    IsValid            bool
    Message            string // Validation error message if invalid
}
```

#### 3. Repository Methods (`repositories/journey_repository.go`)
```go
CreateInvitation(invitation *JourneyInvitation) error
GetInvitationByToken(token string) (*JourneyInvitation, error)
UpdateInvitationUses(id uint) error
DeactivateInvitation(id uint) error
GetJourneyInvitations(journeyID uint) ([]JourneyInvitation, error)
```

#### 4. Service Methods (`services/journey_service.go`)
```go
GenerateInvitation(journeyID uint, req *CreateInvitationRequest, createdBy uint) (*InvitationResponse, error)
GetInvitationDetails(token string) (*InvitationDetailsResponse, error)
AcceptInvitation(token string, userID uint) error
GetJourneyInvitations(journeyID uint) ([]InvitationResponse, error)
DeactivateInvitation(invitationID uint, journeyID uint, userID uint) error
```

**Key Logic:**
- `GenerateInvitation`: Creates a 32-character random token, calculates expiration if provided
- `GetInvitationDetails`: Public endpoint, returns journey info without authentication
- `AcceptInvitation`: Validates invitation, checks if user already enrolled, assigns journey, increments usage count

#### 5. Handlers (`handlers/journey_handler.go`)
```go
GenerateInvitation(c echo.Context) error      // POST /journeys/:id/invite
GetInvitationInfo(c echo.Context) error       // GET /invitations/:token
AcceptInvitation(c echo.Context) error        // POST /invitations/:token/accept
GetJourneyInvitations(c echo.Context) error   // GET /journeys/:id/invitations
DeactivateInvitation(c echo.Context) error    // DELETE /journeys/:id/invitations/:invitationId
```

### API Endpoints

#### Teacher Endpoints (Authenticated, teacher role required)

**1. Generate Invitation**
```
POST /api/v1/teacher/journeys/:id/invite
Authorization: Bearer <token>

Request Body:
{
  "expiresInDays": 30,  // Optional: days until expiration
  "maxUses": 100        // Optional: maximum uses
}

Response: 201 Created
{
  "id": 1,
  "journeyId": 5,
  "invitationToken": "abc123xyz789...",
  "invitationUrl": "http://localhost:3000/invite/abc123xyz789...",
  "createdBy": {
    "id": 2,
    "username": "teacher1",
    "name": "John Teacher",
    "email": "teacher@example.com"
  },
  "expiresAt": "2025-11-18T10:00:00Z",
  "maxUses": 100,
  "currentUses": 0,
  "isActive": true,
  "isValid": true,
  "createdAt": "2025-10-19T10:00:00Z"
}
```

**2. List Journey Invitations**
```
GET /api/v1/teacher/journeys/:id/invitations
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": 1,
    "journeyId": 5,
    "invitationToken": "abc123...",
    "invitationUrl": "http://localhost:3000/invite/abc123...",
    "currentUses": 25,
    "maxUses": 100,
    "isValid": true,
    ...
  }
]
```

**3. Deactivate Invitation**
```
DELETE /api/v1/teacher/journeys/:id/invitations/:invitationId
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Invitation deactivated successfully"
}
```

#### Public Endpoints (No authentication required)

**4. Get Invitation Details**
```
GET /api/v1/invitations/:token

Response: 200 OK
{
  "journeyId": 5,
  "journeyName": "Beginner Cantonese",
  "journeyDescription": "Learn basic Cantonese vocabulary",
  "language": {
    "code": "zh-HK",
    "name": "Cantonese",
    "nativeName": "廣東話"
  },
  "topicCount": 10,
  "totalWords": 250,
  "creatorName": "John Teacher",
  "isValid": true
}

// If invalid:
{
  "isValid": false,
  "message": "This invitation link has expired or is no longer valid"
}
```

#### Protected Endpoints (Authenticated users)

**5. Accept Invitation**
```
POST /api/v1/invitations/:token/accept
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Successfully joined the journey!"
}

// Errors:
400 Bad Request
{
  "error": "invitation is no longer valid"
}
{
  "error": "you are already enrolled in this journey"
}
```

## User Flow

### Teacher Flow
1. Teacher creates a journey with topics
2. Teacher clicks "Generate Invitation Link" button
3. Modal shows options:
   - Expiration (optional): e.g., "30 days"
   - Max uses (optional): e.g., "100 students"
4. System generates unique link: `https://yoursite.com/invite/abc123xyz789`
5. Teacher copies link and shares via:
   - Email
   - Messaging apps (WhatsApp, Telegram, etc.)
   - LMS (Learning Management System)
   - Social media
6. Teacher can view all active invitations and their usage statistics
7. Teacher can deactivate invitations that are no longer needed

### Student Flow

**Scenario A: Unauthenticated User**
1. Student clicks invitation link from teacher
2. Lands on `/invite/:token` page showing:
   - Journey name and description
   - Language
   - Number of topics and words
   - Teacher's name
   - "Register" button
   - "Login" button (if already has account)
3. Student clicks "Register"
4. Fills registration form
5. After successful registration, automatically enrolled in journey
6. Redirected to journey detail page

**Scenario B: Authenticated User**
1. Student clicks invitation link while logged in
2. Sees journey details
3. Clicks "Join Journey" button
4. Immediately enrolled in journey
5. Redirected to journey detail page or dashboard

**Scenario C: Already Enrolled**
1. Student clicks invitation link
2. System detects already enrolled
3. Shows message: "You are already enrolled in this journey"
4. Provides button to go to journey page

## Validation Rules

### Invitation Creation
- Teacher must own the journey (created_by matches)
- `expiresInDays`: 1-365 days (if provided)
- `maxUses`: >= 1 (if provided)

### Invitation Acceptance
- Invitation must exist
- Invitation must be active (`is_active = true`)
- Invitation must not be expired
- Invitation must not have reached max uses
- User must not already be enrolled in the journey

## Security Considerations

1. **Token Generation**: 32-character random alphanumeric string
2. **Unique Tokens**: Database constraint ensures no duplicates
3. **No Sensitive Data**: Tokens don't encode journey ID or user ID
4. **Rate Limiting**: Consider adding rate limiting to invitation endpoints
5. **Audit Trail**: All invitation creations and acceptances are logged with timestamps
6. **Soft Deletion**: Deactivation instead of deletion preserves audit trail

## Frontend Implementation (To Be Done)

### Components Needed

1. **InvitationLinkModal.tsx**
   - Form for expiration and max uses
   - Copy-to-clipboard button
   - QR code generation (optional)
   - Social sharing buttons (optional)

2. **InvitationListPanel.tsx**
   - Table of active invitations
   - Usage statistics (current_uses / max_uses)
   - Expiration countdown
   - Deactivate button
   - Copy link button

3. **JourneyInvitationPage.tsx** (`/invite/:token`)
   - Journey details display
   - Register/Login buttons
   - "Join Journey" button (if authenticated)
   - Error states (expired, invalid, etc.)

### Routes to Add
```typescript
// Public
{
  path: "/invite/:token",
  element: <JourneyInvitationPage />
}

// Protected - integrate into existing journey detail page
// Add InvitationLinkModal and InvitationListPanel to teacher's journey page
```

## Database Migration

The migration is automatically handled by GORM AutoMigrate and the SQL function in:
- `/backend/database/functions/003_journey_invitations_table.sql`

The function creates the table if it doesn't exist and handles idempotency.

## Testing Checklist

### Backend
- [ ] Generate invitation with no expiration or limit
- [ ] Generate invitation with expiration only
- [ ] Generate invitation with max uses only
- [ ] Generate invitation with both expiration and max uses
- [ ] Get invitation details (public, no auth)
- [ ] Accept invitation as authenticated user
- [ ] Attempt to accept expired invitation (should fail)
- [ ] Attempt to accept invitation at max uses (should fail)
- [ ] Attempt to accept invitation when already enrolled (should fail)
- [ ] List all invitations for a journey
- [ ] Deactivate an invitation
- [ ] Increment usage counter when invitation accepted

### Frontend (To Be Implemented)
- [ ] Teacher can generate invitation from journey page
- [ ] Teacher can see list of invitations with stats
- [ ] Teacher can copy invitation link
- [ ] Teacher can deactivate invitation
- [ ] Student can view invitation page (unauthenticated)
- [ ] Student can register from invitation page
- [ ] Student can login from invitation page
- [ ] Student is auto-enrolled after registration via invitation
- [ ] Authenticated student can join via invitation
- [ ] Error messages display correctly

## Future Enhancements

1. **Analytics**: Track which invitations are most effective
2. **Batch Invitations**: Generate multiple unique links at once
3. **Email Integration**: Send invitation emails directly from the app
4. **Custom Messages**: Allow teachers to add a personal message
5. **QR Codes**: Generate QR codes for physical sharing
6. **Social Sharing**: One-click sharing to social platforms
7. **Role-based Invitations**: Create invitations that auto-assign specific roles
8. **Conditional Enrollment**: Require approval before joining
9. **Invitation Templates**: Save common invitation configurations
10. **Revocation Notifications**: Notify users if their access is revoked

## Configuration

Add to environment variables (`.env`):
```
INVITATION_BASE_URL=http://localhost:3000
# Or in production:
# INVITATION_BASE_URL=https://yourapp.com
```

Currently hardcoded in `journey_service.go` but should be moved to config.
