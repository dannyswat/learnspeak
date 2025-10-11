# LearnSpeak - API Documentation

**Version**: 1.0  
**Base URL**: `http://localhost:8080/api/v1` (Development)  
**Base URL**: `https://api.learnspeak.com/api/v1` (Production)  
**Date**: October 11, 2025

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Users](#2-users)
3. [Words](#3-words)
4. [Topics](#4-topics)
5. [Journeys](#5-journeys)
6. [Quizzes](#6-quizzes)
7. [Learning Activities](#7-learning-activities)
8. [Progress & Analytics](#8-progress--analytics)
9. [Achievements](#9-achievements)
10. [Bookmarks](#10-bookmarks)
11. [Notes](#11-notes)
12. [Spaced Repetition](#12-spaced-repetition)
13. [AI Services](#13-ai-services)
14. [Admin](#14-admin)

---

## API Conventions

### HTTP Methods
- `GET`: Retrieve resources
- `POST`: Create new resources
- `PUT`: Update entire resource
- `PATCH`: Partial update
- `DELETE`: Remove resource

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  }
}
```

### Status Codes
- `200 OK`: Successful GET, PUT, PATCH
- `201 Created`: Successful POST
- `204 No Content`: Successful DELETE
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (duplicate)
- `500 Internal Server Error`: Server error

### Authentication
Most endpoints require JWT authentication via Bearer token:
```
Authorization: Bearer <jwt_token>
```

### Pagination
List endpoints support pagination:
```
GET /api/v1/words?page=1&limit=20
```

Response includes pagination metadata:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## 1. Authentication

### 1.1 Register User

**Endpoint:** `POST /auth/register`  
**Auth Required:** No

**Request Body:**
```json
{
  "username": "emma01",
  "password": "securePassword123",
  "name": "Emma Chen",
  "email": "emma@example.com",
  "role": "learner"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "emma01",
      "name": "Emma Chen",
      "email": "emma@example.com",
      "roles": ["learner"],
      "profilePicUrl": null,
      "createdAt": "2025-10-11T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

**Validation Rules:**
- `username`: 3-50 chars, alphanumeric + underscore, unique
- `password`: min 8 chars
- `name`: 1-100 chars
- `email`: valid email format (optional)
- `role`: "learner" or "teacher"

**Error Codes:**
- `USERNAME_EXISTS`: Username already taken
- `EMAIL_EXISTS`: Email already registered
- `INVALID_INPUT`: Validation failed

---

### 1.2 Login

**Endpoint:** `POST /auth/login`  
**Auth Required:** No

**Request Body:**
```json
{
  "username": "emma01",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "emma01",
      "name": "Emma Chen",
      "email": "emma@example.com",
      "roles": ["learner"],
      "profilePicUrl": "/uploads/profiles/emma.jpg",
      "createdAt": "2025-10-11T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

**Error Codes:**
- `INVALID_CREDENTIALS`: Wrong username or password
- `USER_NOT_FOUND`: User does not exist

---

### 1.3 Logout

**Endpoint:** `POST /auth/logout`  
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 1.4 Refresh Token

**Endpoint:** `POST /auth/refresh`  
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 2. Users

### 2.1 Get Current User

**Endpoint:** `GET /users/me`  
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "emma01",
    "name": "Emma Chen",
    "email": "emma@example.com",
    "roles": ["learner"],
    "profilePicUrl": "/uploads/profiles/emma.jpg",
    "createdAt": "2025-10-11T10:00:00Z",
    "updatedAt": "2025-10-11T10:00:00Z"
  }
}
```

---

### 2.2 Update Profile

**Endpoint:** `PUT /users/me`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "name": "Emma Chen",
  "email": "emma.new@example.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "emma01",
    "name": "Emma Chen",
    "email": "emma.new@example.com",
    "roles": ["learner"],
    "profilePicUrl": "/uploads/profiles/emma.jpg",
    "updatedAt": "2025-10-11T11:00:00Z"
  },
  "message": "Profile updated successfully"
}
```

---

### 2.3 Upload Profile Picture

**Endpoint:** `POST /users/me/profile-picture`  
**Auth Required:** Yes  
**Content-Type:** `multipart/form-data`

**Request Body:**
```
profilePicture: <file> (max 5MB, jpg/png)
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "profilePicUrl": "/uploads/profiles/emma_1234567890.jpg"
  },
  "message": "Profile picture uploaded successfully"
}
```

**Error Codes:**
- `FILE_TOO_LARGE`: File exceeds 5MB
- `INVALID_FILE_TYPE`: Only jpg/png allowed

---

### 2.4 Change Password

**Endpoint:** `POST /users/me/change-password`  
**Auth Required:** Yes

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Codes:**
- `INVALID_PASSWORD`: Current password incorrect
- `WEAK_PASSWORD`: New password too weak

---

### 2.5 Get User Statistics

**Endpoint:** `GET /users/me/stats`  
**Auth Required:** Yes  
**Roles:** Learner

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalLearningTimeMinutes": 330,
    "topicsCompleted": 7,
    "journeysCompleted": 1,
    "journeysInProgress": 2,
    "averageQuizAccuracy": 87.5,
    "wordsLearned": 85,
    "achievementsEarned": 5,
    "currentStreak": 0,
    "longestStreak": 7
  }
}
```

---

### 2.6 List Students (Teacher Only)

**Endpoint:** `GET /users/students`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `search` (optional): Search by name or username

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "emma01",
      "name": "Emma Chen",
      "profilePicUrl": "/uploads/profiles/emma.jpg",
      "journeysAssigned": 2,
      "journeysCompleted": 1,
      "averageProgress": 68.5,
      "lastActive": "2025-10-11T09:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### 2.7 Get Student Detail (Teacher Only)

**Endpoint:** `GET /users/students/:id`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "emma01",
    "name": "Emma Chen",
    "profilePicUrl": "/uploads/profiles/emma.jpg",
    "email": "emma@example.com",
    "createdAt": "2025-09-01T10:00:00Z",
    "stats": {
      "totalLearningTimeMinutes": 330,
      "topicsCompleted": 7,
      "journeysCompleted": 1,
      "averageQuizAccuracy": 87.5,
      "wordsLearned": 85
    },
    "assignedJourneys": [
      {
        "id": 1,
        "name": "My First 100 Words",
        "progress": 70,
        "assignedAt": "2025-09-15T10:00:00Z",
        "status": "in_progress"
      }
    ]
  }
}
```

---

## 3. Words

### 3.1 List Words

**Endpoint:** `GET /words`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `search` (optional): Search English or Cantonese text
- `sortBy` (default: "createdAt"): "createdAt" | "english" | "cantonese"
- `order` (default: "desc"): "asc" | "desc"

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "english": "Cat",
      "cantonese": "貓",
      "romanization": "maau1",
      "audioUrl": "/uploads/audio/cat_1234.mp3",
      "imageUrl": "/uploads/images/cat_5678.jpg",
      "notes": "Common pet animal",
      "createdBy": {
        "id": 2,
        "name": "Danny"
      },
      "usedInTopics": 2,
      "createdAt": "2025-10-10T10:00:00Z",
      "updatedAt": "2025-10-10T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 127,
    "totalPages": 7
  }
}
```

---

### 3.2 Get Word by ID

**Endpoint:** `GET /words/:id`  
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "english": "Cat",
    "cantonese": "貓",
    "romanization": "maau1",
    "audioUrl": "/uploads/audio/cat_1234.mp3",
    "imageUrl": "/uploads/images/cat_5678.jpg",
    "notes": "Common pet animal",
    "createdBy": {
      "id": 2,
      "name": "Danny",
      "username": "danny"
    },
    "topics": [
      {
        "id": 1,
        "name": "Animals",
        "level": "beginner"
      }
    ],
    "createdAt": "2025-10-10T10:00:00Z",
    "updatedAt": "2025-10-10T10:00:00Z"
  }
}
```

---

### 3.3 Create Word

**Endpoint:** `POST /words`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin

**Request Body:**
```json
{
  "english": "Cat",
  "cantonese": "貓",
  "romanization": "maau1",
  "notes": "Common pet animal"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "english": "Cat",
    "cantonese": "貓",
    "romanization": "maau1",
    "audioUrl": null,
    "imageUrl": null,
    "notes": "Common pet animal",
    "createdBy": {
      "id": 2,
      "name": "Danny"
    },
    "createdAt": "2025-10-11T12:00:00Z",
    "updatedAt": "2025-10-11T12:00:00Z"
  },
  "message": "Word created successfully"
}
```

**Validation Rules:**
- `english`: required, 1-255 chars
- `cantonese`: required, 1-255 chars
- `romanization`: optional, 1-100 chars
- `notes`: optional, max 1000 chars

---

### 3.4 Update Word

**Endpoint:** `PUT /words/:id`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin (or creator)

**Request Body:**
```json
{
  "english": "Cat",
  "cantonese": "貓",
  "romanization": "maau1",
  "notes": "Updated notes"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "english": "Cat",
    "cantonese": "貓",
    "romanization": "maau1",
    "audioUrl": "/uploads/audio/cat_1234.mp3",
    "imageUrl": "/uploads/images/cat_5678.jpg",
    "notes": "Updated notes",
    "updatedAt": "2025-10-11T13:00:00Z"
  },
  "message": "Word updated successfully"
}
```

---

### 3.5 Delete Word

**Endpoint:** `DELETE /words/:id`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin (or creator)

**Response:** `204 No Content`

**Error Codes:**
- `WORD_IN_USE`: Word is used in topics (provide override flag)

---

### 3.6 Upload Word Audio

**Endpoint:** `POST /words/:id/audio`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin  
**Content-Type:** `multipart/form-data`

**Request Body:**
```
audio: <file> (max 10MB, mp3/ogg/wav)
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "audioUrl": "/uploads/audio/cat_1697123456.mp3"
  },
  "message": "Audio uploaded successfully"
}
```

---

### 3.7 Upload Word Image

**Endpoint:** `POST /words/:id/image`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin  
**Content-Type:** `multipart/form-data`

**Request Body:**
```
image: <file> (max 5MB, jpg/png/webp)
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "imageUrl": "/uploads/images/cat_1697123456.jpg"
  },
  "message": "Image uploaded successfully"
}
```

---

## 4. Topics

### 4.1 List Topics

**Endpoint:** `GET /topics`  
**Auth Required:** Yes

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `level` (optional): "beginner" | "intermediate" | "advanced"
- `search` (optional): Search by name
- `createdBy` (optional): Filter by creator user ID

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Animals",
      "description": "Learn common animal names in Cantonese",
      "level": "beginner",
      "wordCount": 10,
      "createdBy": {
        "id": 2,
        "name": "Danny"
      },
      "usedInJourneys": 3,
      "createdAt": "2025-10-01T10:00:00Z",
      "updatedAt": "2025-10-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

---

### 4.2 Get Topic by ID

**Endpoint:** `GET /topics/:id`  
**Auth Required:** Yes

**Query Parameters:**
- `includeWords` (default: false): Include full word list

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Animals",
    "description": "Learn common animal names in Cantonese",
    "level": "beginner",
    "createdBy": {
      "id": 2,
      "name": "Danny",
      "username": "danny"
    },
    "words": [
      {
        "id": 1,
        "english": "Cat",
        "cantonese": "貓",
        "romanization": "maau1",
        "audioUrl": "/uploads/audio/cat_1234.mp3",
        "imageUrl": "/uploads/images/cat_5678.jpg",
        "sequenceOrder": 1
      },
      {
        "id": 2,
        "english": "Dog",
        "cantonese": "狗",
        "romanization": "gau2",
        "audioUrl": "/uploads/audio/dog_1234.mp3",
        "imageUrl": "/uploads/images/dog_5678.jpg",
        "sequenceOrder": 2
      }
    ],
    "quizCount": 10,
    "createdAt": "2025-10-01T10:00:00Z",
    "updatedAt": "2025-10-01T10:00:00Z"
  }
}
```

---

### 4.3 Create Topic

**Endpoint:** `POST /topics`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin

**Request Body:**
```json
{
  "name": "Animals",
  "description": "Learn common animal names in Cantonese",
  "level": "beginner",
  "wordIds": [1, 2, 3, 4, 5]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Animals",
    "description": "Learn common animal names in Cantonese",
    "level": "beginner",
    "wordCount": 5,
    "createdBy": {
      "id": 2,
      "name": "Danny"
    },
    "createdAt": "2025-10-11T14:00:00Z"
  },
  "message": "Topic created successfully"
}
```

**Validation Rules:**
- `name`: required, 1-200 chars, unique
- `description`: optional, max 1000 chars
- `level`: required, one of ["beginner", "intermediate", "advanced"]
- `wordIds`: array of word IDs (can be empty initially)

---

### 4.4 Update Topic

**Endpoint:** `PUT /topics/:id`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin (or creator)

**Request Body:**
```json
{
  "name": "Animals (Updated)",
  "description": "Updated description",
  "level": "beginner",
  "wordIds": [1, 2, 3, 4, 5, 6]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Animals (Updated)",
    "description": "Updated description",
    "level": "beginner",
    "wordCount": 6,
    "updatedAt": "2025-10-11T15:00:00Z"
  },
  "message": "Topic updated successfully"
}
```

---

### 4.5 Delete Topic

**Endpoint:** `DELETE /topics/:id`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin (or creator)

**Response:** `204 No Content`

**Error Codes:**
- `TOPIC_IN_USE`: Topic is used in journeys

---

### 4.6 Reorder Topic Words

**Endpoint:** `PUT /topics/:id/words/reorder`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin (or creator)

**Request Body:**
```json
{
  "wordIds": [3, 1, 5, 2, 4]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Words reordered successfully"
}
```

---

## 5. Journeys

### 5.1 List Journeys

**Endpoint:** `GET /journeys`  
**Auth Required:** Yes

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `createdBy` (optional): Filter by creator
- `search` (optional): Search by name

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "My First 100 Words",
      "description": "A complete beginner journey to learn your first 100 Cantonese words",
      "topicCount": 10,
      "totalWords": 100,
      "createdBy": {
        "id": 2,
        "name": "Danny"
      },
      "assignedToCount": 5,
      "createdAt": "2025-09-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1
  }
}
```

---

### 5.2 Get Journey by ID

**Endpoint:** `GET /journeys/:id`  
**Auth Required:** Yes

**Query Parameters:**
- `includeTopics` (default: true): Include topics list
- `userId` (optional): Include user progress if provided

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "My First 100 Words",
    "description": "A complete beginner journey",
    "createdBy": {
      "id": 2,
      "name": "Danny"
    },
    "topics": [
      {
        "id": 1,
        "name": "Colors",
        "level": "beginner",
        "wordCount": 10,
        "sequenceOrder": 1,
        "completed": true,
        "quizScore": 90
      },
      {
        "id": 2,
        "name": "Numbers",
        "level": "beginner",
        "wordCount": 10,
        "sequenceOrder": 2,
        "completed": true,
        "quizScore": 85
      },
      {
        "id": 3,
        "name": "Animals",
        "level": "beginner",
        "wordCount": 10,
        "sequenceOrder": 3,
        "completed": false,
        "quizScore": null
      }
    ],
    "totalTopics": 10,
    "totalWords": 100,
    "progress": 70,
    "createdAt": "2025-09-15T10:00:00Z"
  }
}
```

---

### 5.3 Create Journey

**Endpoint:** `POST /journeys`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin

**Request Body:**
```json
{
  "name": "My First 100 Words",
  "description": "A complete beginner journey to learn your first 100 Cantonese words",
  "topicIds": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "My First 100 Words",
    "description": "A complete beginner journey to learn your first 100 Cantonese words",
    "topicCount": 10,
    "createdBy": {
      "id": 2,
      "name": "Danny"
    },
    "createdAt": "2025-10-11T16:00:00Z"
  },
  "message": "Journey created successfully"
}
```

**Validation Rules:**
- `name`: required, 1-200 chars
- `description`: optional, max 1000 chars
- `topicIds`: array of topic IDs in order

---

### 5.4 Update Journey

**Endpoint:** `PUT /journeys/:id`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin (or creator)

**Request Body:**
```json
{
  "name": "My First 100 Words (Updated)",
  "description": "Updated description",
  "topicIds": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "My First 100 Words (Updated)",
    "description": "Updated description",
    "topicCount": 11,
    "updatedAt": "2025-10-11T17:00:00Z"
  },
  "message": "Journey updated successfully"
}
```

---

### 5.5 Delete Journey

**Endpoint:** `DELETE /journeys/:id`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin (or creator)

**Response:** `204 No Content`

---

### 5.6 Assign Journey to Users

**Endpoint:** `POST /journeys/:id/assign`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin

**Request Body:**
```json
{
  "userIds": [1, 3, 5],
  "message": "Start this journey to learn your first words!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "assignedCount": 3,
    "assignments": [
      {
        "userId": 1,
        "userName": "Emma Chen",
        "assignedAt": "2025-10-11T18:00:00Z"
      },
      {
        "userId": 3,
        "userName": "Alex Wong",
        "assignedAt": "2025-10-11T18:00:00Z"
      },
      {
        "userId": 5,
        "userName": "Sophie Liu",
        "assignedAt": "2025-10-11T18:00:00Z"
      }
    ]
  },
  "message": "Journey assigned successfully"
}
```

---

### 5.7 Get My Assigned Journeys (Learner)

**Endpoint:** `GET /journeys/my-journeys`  
**Auth Required:** Yes  
**Roles:** Learner

**Query Parameters:**
- `status` (optional): "assigned" | "in_progress" | "completed"

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "My First 100 Words",
      "description": "A complete beginner journey",
      "topicCount": 10,
      "completedTopics": 7,
      "progress": 70,
      "status": "in_progress",
      "assignedBy": {
        "id": 2,
        "name": "Danny"
      },
      "assignedAt": "2025-09-15T10:00:00Z",
      "startedAt": "2025-09-16T09:00:00Z",
      "currentTopic": {
        "id": 8,
        "name": "Food",
        "sequenceOrder": 8
      }
    }
  ]
}
```

---

## 6. Quizzes

### 6.1 List Quiz Questions (Teacher)

**Endpoint:** `GET /topics/:topicId/quizzes`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "questionType": "translation",
      "questionText": "What is 'Cat' in Cantonese?",
      "correctAnswer": "B",
      "optionA": "狗 (gau2)",
      "optionB": "貓 (maau1)",
      "optionC": "鳥 (niu5)",
      "optionD": "魚 (jyu2)",
      "wordId": 1,
      "createdAt": "2025-10-05T10:00:00Z"
    }
  ]
}
```

---

### 6.2 Create Quiz Question

**Endpoint:** `POST /topics/:topicId/quizzes`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin

**Request Body:**
```json
{
  "questionType": "translation",
  "questionText": "What is 'Cat' in Cantonese?",
  "correctAnswer": "B",
  "optionA": "狗 (gau2)",
  "optionB": "貓 (maau1)",
  "optionC": "鳥 (niu5)",
  "optionD": "魚 (jyu2)",
  "wordId": 1
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "questionType": "translation",
    "questionText": "What is 'Cat' in Cantonese?",
    "correctAnswer": "B",
    "optionA": "狗 (gau2)",
    "optionB": "貓 (maau1)",
    "optionC": "鳥 (niu5)",
    "optionD": "魚 (jyu2)",
    "wordId": 1,
    "createdAt": "2025-10-11T19:00:00Z"
  },
  "message": "Quiz question created successfully"
}
```

**Validation Rules:**
- `questionType`: required, one of ["translation", "listening", "image"]
- `questionText`: required, 1-500 chars
- `correctAnswer`: required, one of ["A", "B", "C", "D"]
- `optionA-D`: required, 1-255 chars each
- `wordId`: optional, reference to word

---

### 6.3 Update Quiz Question

**Endpoint:** `PUT /quizzes/:id`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin

**Request Body:** Same as Create

**Response:** `200 OK`

---

### 6.4 Delete Quiz Question

**Endpoint:** `DELETE /quizzes/:id`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin

**Response:** `204 No Content`

---

### 6.5 Get Quiz for Topic (Learner)

**Endpoint:** `GET /topics/:topicId/quiz`  
**Auth Required:** Yes  
**Roles:** Learner

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "topicId": 1,
    "topicName": "Animals",
    "questions": [
      {
        "id": 1,
        "questionType": "translation",
        "questionText": "What is 'Cat' in Cantonese?",
        "optionA": "狗 (gau2)",
        "optionB": "貓 (maau1)",
        "optionC": "鳥 (niu5)",
        "optionD": "魚 (jyu2)"
      },
      {
        "id": 2,
        "questionType": "listening",
        "questionText": "Listen and select the correct word",
        "audioUrl": "/uploads/audio/dog_1234.mp3",
        "optionA": "Cat",
        "optionB": "Dog",
        "optionC": "Bird",
        "optionD": "Fish"
      }
    ],
    "totalQuestions": 10
  }
}
```

Note: `correctAnswer` is NOT included for learners

---

### 6.6 Submit Quiz Answers

**Endpoint:** `POST /topics/:topicId/quiz/submit`  
**Auth Required:** Yes  
**Roles:** Learner

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": 1,
      "selectedAnswer": "B"
    },
    {
      "questionId": 2,
      "selectedAnswer": "B"
    },
    {
      "questionId": 3,
      "selectedAnswer": "A"
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "score": 9,
    "maxScore": 10,
    "percentage": 90,
    "results": [
      {
        "questionId": 1,
        "correct": true,
        "selectedAnswer": "B",
        "correctAnswer": "B"
      },
      {
        "questionId": 2,
        "correct": true,
        "selectedAnswer": "B",
        "correctAnswer": "B"
      },
      {
        "questionId": 3,
        "correct": false,
        "selectedAnswer": "A",
        "correctAnswer": "C"
      }
    ],
    "achievementsEarned": [
      {
        "id": 3,
        "name": "Perfect Score",
        "badgeIconUrl": "/badges/perfect-score.svg"
      }
    ]
  },
  "message": "Quiz submitted successfully"
}
```

---

## 7. Learning Activities

### 7.1 Get Flashcards for Topic

**Endpoint:** `GET /topics/:topicId/flashcards`  
**Auth Required:** Yes  
**Roles:** Learner

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "topicId": 1,
    "topicName": "Animals",
    "cards": [
      {
        "wordId": 1,
        "english": "Cat",
        "cantonese": "貓",
        "romanization": "maau1",
        "audioUrl": "/uploads/audio/cat_1234.mp3",
        "imageUrl": "/uploads/images/cat_5678.jpg",
        "isBookmarked": false
      },
      {
        "wordId": 2,
        "english": "Dog",
        "cantonese": "狗",
        "romanization": "gau2",
        "audioUrl": "/uploads/audio/dog_1234.mp3",
        "imageUrl": "/uploads/images/dog_5678.jpg",
        "isBookmarked": true
      }
    ],
    "totalCards": 10
  }
}
```

---

### 7.2 Complete Flashcard Activity

**Endpoint:** `POST /topics/:topicId/activities/flashcard/complete`  
**Auth Required:** Yes  
**Roles:** Learner

**Request Body:**
```json
{
  "timeSpentSeconds": 300
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "activityCompleted": true,
    "timeSpent": 300,
    "topicProgress": 25
  },
  "message": "Flashcard activity completed"
}
```

---

### 7.3 Get Pronunciation Practice

**Endpoint:** `GET /topics/:topicId/pronunciation`  
**Auth Required:** Yes  
**Roles:** Learner

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "topicId": 1,
    "topicName": "Animals",
    "words": [
      {
        "id": 1,
        "english": "Cat",
        "cantonese": "貓",
        "romanization": "maau1",
        "audioUrl": "/uploads/audio/cat_1234.mp3"
      }
    ]
  }
}
```

---

### 7.4 Complete Pronunciation Activity

**Endpoint:** `POST /topics/:topicId/activities/pronunciation/complete`  
**Auth Required:** Yes  
**Roles:** Learner

**Request Body:**
```json
{
  "timeSpentSeconds": 180
}
```

**Response:** `200 OK`

---

### 7.5 Get Conversation Simulations

**Endpoint:** `GET /topics/:topicId/conversations`  
**Auth Required:** Yes  
**Roles:** Learner

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": 1,
        "title": "Meeting a pet",
        "lines": [
          {
            "speaker": "A",
            "english": "This is my cat",
            "cantonese": "呢隻係我嘅貓",
            "romanization": "nei1 zek3 hai6 ngo5 ge3 maau1",
            "audioUrl": "/uploads/audio/conv_1_line1.mp3"
          },
          {
            "speaker": "B",
            "english": "Your cat is very cute!",
            "cantonese": "你嘅貓好得意！",
            "romanization": "nei5 ge3 maau1 hou2 dak1 ji3",
            "audioUrl": "/uploads/audio/conv_1_line2.mp3"
          }
        ]
      }
    ]
  }
}
```

---

### 7.6 Complete Conversation Activity

**Endpoint:** `POST /topics/:topicId/activities/conversation/complete`  
**Auth Required:** Yes  
**Roles:** Learner

**Request Body:**
```json
{
  "conversationId": 1,
  "timeSpentSeconds": 240
}
```

**Response:** `200 OK`

---

## 8. Progress & Analytics

### 8.1 Track Learning Session

**Endpoint:** `POST /progress/session/start`  
**Auth Required:** Yes  
**Roles:** Learner

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "sessionId": "abc123",
    "startedAt": "2025-10-11T20:00:00Z"
  }
}
```

---

### 8.2 End Learning Session

**Endpoint:** `POST /progress/session/end`  
**Auth Required:** Yes  
**Roles:** Learner

**Request Body:**
```json
{
  "sessionId": "abc123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "sessionId": "abc123",
    "durationSeconds": 1800,
    "activitiesCompleted": 3
  }
}
```

---

### 8.3 Get User Progress

**Endpoint:** `GET /progress/me`  
**Auth Required:** Yes  
**Roles:** Learner

**Query Parameters:**
- `journeyId` (optional): Filter by journey

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "journeys": [
      {
        "journeyId": 1,
        "journeyName": "My First 100 Words",
        "progress": 70,
        "completedTopics": 7,
        "totalTopics": 10,
        "timeSpentMinutes": 330,
        "averageQuizScore": 88.5
      }
    ],
    "recentActivities": [
      {
        "type": "quiz",
        "topicName": "Animals",
        "score": 90,
        "completedAt": "2025-10-11T18:30:00Z"
      },
      {
        "type": "flashcard",
        "topicName": "Colors",
        "completedAt": "2025-10-11T17:00:00Z"
      }
    ]
  }
}
```

---

### 8.4 Get Teacher Analytics

**Endpoint:** `GET /analytics/teacher`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin

**Query Parameters:**
- `studentId` (optional): Filter by student
- `topicId` (optional): Filter by topic
- `journeyId` (optional): Filter by journey
- `startDate` (optional): Start date (ISO 8601)
- `endDate` (optional): End date (ISO 8601)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalStudents": 5,
      "activeStudents": 4,
      "averageProgress": 68.5,
      "averageQuizScore": 85.2,
      "totalLearningTimeHours": 12.5
    },
    "studentPerformance": [
      {
        "studentId": 1,
        "studentName": "Emma Chen",
        "journeysCompleted": 1,
        "journeysInProgress": 2,
        "averageQuizScore": 87.5,
        "totalTimeMinutes": 330,
        "lastActive": "2025-10-11T18:30:00Z"
      }
    ],
    "topicPerformance": [
      {
        "topicId": 1,
        "topicName": "Animals",
        "level": "beginner",
        "studentsAttempted": 5,
        "studentsCompleted": 5,
        "averageQuizScore": 90,
        "averageTimeMinutes": 12
      }
    ],
    "dailyActivity": [
      {
        "date": "2025-10-11",
        "activeUsers": 3,
        "totalTimeMinutes": 95,
        "quizzesTaken": 8
      }
    ]
  }
}
```

---

### 8.5 Get Admin Analytics

**Endpoint:** `GET /analytics/admin`  
**Auth Required:** Yes  
**Roles:** Admin

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 12,
      "learners": 8,
      "teachers": 3,
      "admins": 1,
      "activeLastWeek": 8
    },
    "content": {
      "words": 127,
      "topics": 15,
      "journeys": 3,
      "quizQuestions": 150
    },
    "engagement": {
      "totalLearningSessions": 45,
      "totalLearningTimeHours": 50,
      "quizzesTaken": 85,
      "averageQuizScore": 85.2,
      "achievementsEarned": 28
    },
    "topTopics": [
      {
        "topicName": "Animals",
        "completions": 25
      },
      {
        "topicName": "Colors",
        "completions": 22
      }
    ]
  }
}
```

---

## 9. Achievements

### 9.1 List All Achievements

**Endpoint:** `GET /achievements`  
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "First Topic",
      "description": "Complete your first topic",
      "badgeIconUrl": "/badges/first-topic.svg",
      "criteriaType": "topic_complete",
      "criteriaValue": 1
    },
    {
      "id": 2,
      "name": "Journey Beginner",
      "description": "Complete your first journey",
      "badgeIconUrl": "/badges/first-journey.svg",
      "criteriaType": "journey_complete",
      "criteriaValue": 1
    }
  ]
}
```

---

### 9.2 Get My Achievements

**Endpoint:** `GET /achievements/me`  
**Auth Required:** Yes  
**Roles:** Learner

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "earned": [
      {
        "id": 1,
        "name": "First Topic",
        "description": "Complete your first topic",
        "badgeIconUrl": "/badges/first-topic.svg",
        "earnedAt": "2025-10-10T15:00:00Z"
      },
      {
        "id": 3,
        "name": "Perfect Score",
        "description": "Get 100% on a quiz",
        "badgeIconUrl": "/badges/perfect-score.svg",
        "earnedAt": "2025-10-09T12:00:00Z"
      }
    ],
    "locked": [
      {
        "id": 2,
        "name": "Journey Beginner",
        "description": "Complete your first journey",
        "badgeIconUrl": "/badges/first-journey.svg",
        "criteriaType": "journey_complete",
        "criteriaValue": 1,
        "progress": 0.7
      }
    ],
    "totalEarned": 5,
    "totalAvailable": 20
  }
}
```

---

## 10. Bookmarks

### 10.1 Get My Bookmarks

**Endpoint:** `GET /bookmarks/me`  
**Auth Required:** Yes  
**Roles:** Learner

**Query Parameters:**
- `type` (optional): "word" | "topic"

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "words": [
      {
        "bookmarkId": 1,
        "wordId": 5,
        "english": "Cat",
        "cantonese": "貓",
        "romanization": "maau1",
        "audioUrl": "/uploads/audio/cat_1234.mp3",
        "imageUrl": "/uploads/images/cat_5678.jpg",
        "createdAt": "2025-10-08T10:00:00Z"
      }
    ],
    "topics": [
      {
        "bookmarkId": 2,
        "topicId": 3,
        "name": "Animals",
        "level": "beginner",
        "wordCount": 10,
        "createdAt": "2025-10-07T14:00:00Z"
      }
    ]
  }
}
```

---

### 10.2 Bookmark Word

**Endpoint:** `POST /bookmarks/words/:wordId`  
**Auth Required:** Yes  
**Roles:** Learner

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "bookmarkId": 1,
    "wordId": 5,
    "createdAt": "2025-10-11T21:00:00Z"
  },
  "message": "Word bookmarked successfully"
}
```

---

### 10.3 Remove Word Bookmark

**Endpoint:** `DELETE /bookmarks/words/:wordId`  
**Auth Required:** Yes  
**Roles:** Learner

**Response:** `204 No Content`

---

### 10.4 Bookmark Topic

**Endpoint:** `POST /bookmarks/topics/:topicId`  
**Auth Required:** Yes  
**Roles:** Learner

**Response:** `201 Created`

---

### 10.5 Remove Topic Bookmark

**Endpoint:** `DELETE /bookmarks/topics/:topicId`  
**Auth Required:** Yes  
**Roles:** Learner

**Response:** `204 No Content`

---

## 11. Notes

### 11.1 Get My Notes

**Endpoint:** `GET /notes/me`  
**Auth Required:** Yes  
**Roles:** Learner

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "wordId": 5,
      "word": {
        "english": "Cat",
        "cantonese": "貓"
      },
      "noteText": "Remember: sounds like 'meow'",
      "createdAt": "2025-10-10T10:00:00Z",
      "updatedAt": "2025-10-10T10:00:00Z"
    }
  ]
}
```

---

### 11.2 Add Note to Word

**Endpoint:** `POST /notes/words/:wordId`  
**Auth Required:** Yes  
**Roles:** Learner

**Request Body:**
```json
{
  "noteText": "Remember: sounds like 'meow'"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "wordId": 5,
    "noteText": "Remember: sounds like 'meow'",
    "createdAt": "2025-10-11T22:00:00Z"
  },
  "message": "Note added successfully"
}
```

**Validation:**
- `noteText`: required, max 500 chars

---

### 11.3 Update Note

**Endpoint:** `PUT /notes/:id`  
**Auth Required:** Yes  
**Roles:** Learner

**Request Body:**
```json
{
  "noteText": "Updated note text"
}
```

**Response:** `200 OK`

---

### 11.4 Delete Note

**Endpoint:** `DELETE /notes/:id`  
**Auth Required:** Yes  
**Roles:** Learner

**Response:** `204 No Content`

---

## 12. Spaced Repetition

### 12.1 Get Due Reviews

**Endpoint:** `GET /srs/reviews/due`  
**Auth Required:** Yes  
**Roles:** Learner

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "dueCount": 15,
    "words": [
      {
        "srsId": 1,
        "wordId": 5,
        "english": "Cat",
        "cantonese": "貓",
        "romanization": "maau1",
        "audioUrl": "/uploads/audio/cat_1234.mp3",
        "imageUrl": "/uploads/images/cat_5678.jpg",
        "nextReviewDate": "2025-10-11",
        "intervalDays": 3,
        "repetitions": 2
      }
    ]
  }
}
```

---

### 12.2 Submit Review

**Endpoint:** `POST /srs/reviews/submit`  
**Auth Required:** Yes  
**Roles:** Learner

**Request Body:**
```json
{
  "wordId": 5,
  "remembered": true
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "wordId": 5,
    "nextReviewDate": "2025-10-18",
    "intervalDays": 7,
    "easeFactor": 2.6,
    "repetitions": 3
  },
  "message": "Review submitted successfully"
}
```

---

### 12.3 Get SRS Statistics

**Endpoint:** `GET /srs/stats`  
**Auth Required:** Yes  
**Roles:** Learner

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalWords": 85,
    "dueToday": 15,
    "dueTomorrow": 8,
    "dueThisWeek": 32,
    "averageRetentionRate": 85.5,
    "totalReviews": 245
  }
}
```

---

## 13. AI Services

### 13.1 Generate Audio (TTS)

**Endpoint:** `POST /ai/generate-audio`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin

**Request Body:**
```json
{
  "text": "貓",
  "language": "cantonese",
  "voice": "female"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "audioUrl": "/uploads/ai-audio/generated_1697123456.mp3",
    "durationSeconds": 1.2,
    "cached": false
  },
  "message": "Audio generated successfully"
}
```

**Error Codes:**
- `AI_SERVICE_ERROR`: TTS API failed
- `QUOTA_EXCEEDED`: API quota exceeded

---

### 13.2 Generate Image

**Endpoint:** `POST /ai/generate-image`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin

**Request Body:**
```json
{
  "prompt": "A cute cartoon cat for children, simple and colorful",
  "style": "cartoon"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "imageUrl": "/uploads/ai-images/generated_1697123456.jpg",
    "cached": false
  },
  "message": "Image generated successfully"
}
```

**Error Codes:**
- `AI_SERVICE_ERROR`: Image API failed
- `QUOTA_EXCEEDED`: API quota exceeded
- `INAPPROPRIATE_CONTENT`: Content filter triggered

---

## 14. Admin

### 14.1 List All Users

**Endpoint:** `GET /admin/users`  
**Auth Required:** Yes  
**Roles:** Admin

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `role` (optional): Filter by role
- `search` (optional): Search by name/username

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "emma01",
      "name": "Emma Chen",
      "email": "emma@example.com",
      "roles": ["learner"],
      "createdAt": "2025-09-01T10:00:00Z",
      "lastActive": "2025-10-11T18:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 12,
    "totalPages": 1
  }
}
```

---

### 14.2 Create User (Admin)

**Endpoint:** `POST /admin/users`  
**Auth Required:** Yes  
**Roles:** Admin

**Request Body:**
```json
{
  "username": "newuser",
  "password": "tempPassword123",
  "name": "New User",
  "email": "newuser@example.com",
  "roles": ["learner"]
}
```

**Response:** `201 Created`

---

### 14.3 Update User Roles

**Endpoint:** `PUT /admin/users/:id/roles`  
**Auth Required:** Yes  
**Roles:** Admin

**Request Body:**
```json
{
  "roles": ["learner", "teacher"]
}
```

**Response:** `200 OK`

---

### 14.4 Delete User

**Endpoint:** `DELETE /admin/users/:id`  
**Auth Required:** Yes  
**Roles:** Admin

**Response:** `204 No Content`

---

## Error Codes Reference

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `AUTHENTICATION_REQUIRED` | No valid token provided |
| `INVALID_CREDENTIALS` | Wrong username/password |
| `INSUFFICIENT_PERMISSIONS` | User lacks required role |
| `NOT_FOUND` | Resource not found |
| `ALREADY_EXISTS` | Duplicate resource |
| `USERNAME_EXISTS` | Username taken |
| `EMAIL_EXISTS` | Email already registered |
| `FILE_TOO_LARGE` | File exceeds size limit |
| `INVALID_FILE_TYPE` | Unsupported file type |
| `WORD_IN_USE` | Cannot delete word used in topics |
| `TOPIC_IN_USE` | Cannot delete topic used in journeys |
| `AI_SERVICE_ERROR` | AI API request failed |
| `QUOTA_EXCEEDED` | API quota limit reached |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `SERVER_ERROR` | Internal server error |

---

## Rate Limiting

All endpoints are rate-limited:
- **Authenticated requests**: 100 requests/minute
- **AI endpoints**: 10 requests/minute
- **File uploads**: 5 uploads/minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1697123456
```

---

## Versioning

API version is in the URL: `/api/v1/...`

Breaking changes will result in a new version: `/api/v2/...`

---

## CORS

Development: Allow all origins  
Production: Whitelist specific domains

---

## WebSocket Endpoints (Future)

For real-time features:
- `/ws/notifications`: Real-time notifications
- `/ws/progress`: Live progress updates

---

**End of API Documentation**

For implementation details, see:
- Go Models: `GO_MODELS.md`
- TypeScript Models: `TS_MODELS.md`
