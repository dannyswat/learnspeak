# LearnSpeak - API Documentation

**Version**: 1.0  
**Base URL**: `http://localhost:8080/api/v1` (Development)  
**Base URL**: `https://api.learnspeak.com/api/v1` (Production)  
**Date**: October 11, 2025

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Users](#2-users)
3. [Languages](#3-languages)
4. [Words](#4-words)
5. [Topics](#5-topics)
6. [Journeys](#6-journeys)
7. [Quizzes](#7-quizzes)
8. [Learning Activities](#8-learning-activities)
9. [Conversations](#9-conversations)
10. [Progress & Analytics](#10-progress--analytics)
11. [Achievements](#11-achievements)
12. [Bookmarks](#12-bookmarks)
13. [Notes](#13-notes)
14. [Spaced Repetition](#14-spaced-repetition)
15. [AI Services](#15-ai-services)
16. [Admin](#16-admin)

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

## 3. Languages

### 3.1 List Languages

**Endpoint:** `GET /languages`  
**Auth Required:** Yes

**Query Parameters:**
- `active` (optional): Filter by active status ("true" or "false")

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "en",
      "name": "English",
      "nativeName": "English",
      "isActive": true
    },
    {
      "id": 2,
      "code": "zh-HK",
      "name": "Cantonese",
      "nativeName": "廣東話",
      "isActive": true
    },
    {
      "id": 3,
      "code": "zh-CN",
      "name": "Mandarin",
      "nativeName": "普通话",
      "isActive": true
    },
    {
      "id": 4,
      "code": "es",
      "name": "Spanish",
      "nativeName": "Español",
      "isActive": true
    }
  ]
}
```

---

### 3.2 Get Language by ID

**Endpoint:** `GET /languages/:id`  
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 2,
    "code": "zh-HK",
    "name": "Cantonese",
    "nativeName": "廣東話",
    "direction": "ltr",
    "isActive": true
  }
}
```

---

### 3.3 Get Language by Code

**Endpoint:** `GET /languages/code/:code`  
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 2,
    "code": "zh-HK",
    "name": "Cantonese",
    "nativeName": "廣東話",
    "direction": "ltr",
    "isActive": true
  }
}
```

**Error Codes:**
- `LANGUAGE_NOT_FOUND`: Language with specified code not found

---

## 4. Words

### 4.1 List Words

**Endpoint:** `GET /words`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `search` (optional): Search base word or translations
- `languageCode` (optional): Filter words with translations in specific language (e.g., "zh-HK")
- `sortBy` (default: "createdAt"): "createdAt" | "baseWord"
- `order` (default: "desc"): "asc" | "desc"

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "baseWord": "cat",
      "imageUrl": "/uploads/images/cat_5678.jpg",
      "translations": [
        {
          "id": 1,
          "languageCode": "en",
          "languageName": "English",
          "translation": "Cat",
          "romanization": null,
          "audioUrl": "/uploads/audio/en_cat_1234.mp3"
        },
        {
          "id": 2,
          "languageCode": "zh-HK",
          "languageName": "Cantonese",
          "translation": "貓",
          "romanization": "maau1",
          "audioUrl": "/uploads/audio/zh_cat_5678.mp3"
        },
        {
          "id": 3,
          "languageCode": "es",
          "languageName": "Spanish",
          "translation": "Gato",
          "romanization": null,
          "audioUrl": "/uploads/audio/es_cat_9012.mp3"
        }
      ],
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

### 4.2 Get Word by ID

**Endpoint:** `GET /words/:id`  
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "baseWord": "cat",
    "imageUrl": "/uploads/images/cat_5678.jpg",
    "notes": "Common pet animal",
    "translations": [
      {
        "id": 1,
        "languageCode": "en",
        "languageName": "English",
        "translation": "Cat",
        "romanization": null,
        "audioUrl": "/uploads/audio/en_cat_1234.mp3"
      },
      {
        "id": 2,
        "languageCode": "zh-HK",
        "languageName": "Cantonese",
        "translation": "貓",
        "romanization": "maau1",
        "audioUrl": "/uploads/audio/zh_cat_5678.mp3"
      },
      {
        "id": 3,
        "languageCode": "zh-CN",
        "languageName": "Mandarin",
        "translation": "猫",
        "romanization": "māo",
        "audioUrl": "/uploads/audio/cn_cat_3456.mp3"
      }
    ],
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

### 4.3 Create Word

**Endpoint:** `POST /words`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin

**Request Body:**
```json
{
  "baseWord": "cat",
  "notes": "Common pet animal",
  "translations": [
    {
      "languageCode": "en",
      "translation": "Cat"
    },
    {
      "languageCode": "zh-HK",
      "translation": "貓",
      "romanization": "maau1"
    },
    {
      "languageCode": "es",
      "translation": "Gato"
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "baseWord": "cat",
    "imageUrl": null,
    "notes": "Common pet animal",
    "translations": [
      {
        "id": 1,
        "languageCode": "en",
        "languageName": "English",
        "translation": "Cat",
        "romanization": null,
        "audioUrl": null
      },
      {
        "id": 2,
        "languageCode": "zh-HK",
        "languageName": "Cantonese",
        "translation": "貓",
        "romanization": "maau1",
        "audioUrl": null
      },
      {
        "id": 3,
        "languageCode": "es",
        "languageName": "Spanish",
        "translation": "Gato",
        "romanization": null,
        "audioUrl": null
      }
    ],
    "createdBy": {
      "id": 2,
      "name": "Danny"
    },
    "usedInTopics": 0,
    "createdAt": "2025-10-11T11:00:00Z",
    "updatedAt": "2025-10-11T11:00:00Z"
  },
  "message": "Word created successfully"
}
```

**Validation Rules:**
- `baseWord`: 1-100 chars, required
- `translations`: Array with at least 1 translation, required
- `translations[].languageCode`: Valid language code from languages table, required
- `translations[].translation`: 1-100 chars, required
- `translations[].romanization`: 1-200 chars, optional
- `notes`: Max 500 chars, optional

**Error Codes:**
- `WORD_EXISTS`: Base word already exists
- `LANGUAGE_NOT_FOUND`: Invalid language code in translations
- `INVALID_INPUT`: Validation failed

---

### 4.4 Update Word

**Endpoint:** `PUT /words/:id`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin

**Request Body:**
```json
{
  "baseWord": "cat",
  "notes": "Updated notes - common pet animal",
  "translations": [
    {
      "languageCode": "en",
      "translation": "Cat"
    },
    {
      "languageCode": "zh-HK",
      "translation": "貓",
      "romanization": "maau1"
    },
    {
      "languageCode": "zh-CN",
      "translation": "猫",
      "romanization": "māo"
    },
    {
      "languageCode": "es",
      "translation": "Gato"
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "baseWord": "cat",
    "imageUrl": "/uploads/images/cat_5678.jpg",
    "notes": "Updated notes - common pet animal",
    "translations": [
      {
        "id": 1,
        "languageCode": "en",
        "languageName": "English",
        "translation": "Cat",
        "romanization": null,
        "audioUrl": "/uploads/audio/en_cat_1234.mp3"
      },
      {
        "id": 2,
        "languageCode": "zh-HK",
        "languageName": "Cantonese",
        "translation": "貓",
        "romanization": "maau1",
        "audioUrl": "/uploads/audio/zh_cat_5678.mp3"
      },
      {
        "id": 3,
        "languageCode": "zh-CN",
        "languageName": "Mandarin",
        "translation": "猫",
        "romanization": "māo",
        "audioUrl": "/uploads/audio/cn_cat_3456.mp3"
      },
      {
        "id": 4,
        "languageCode": "es",
        "languageName": "Spanish",
        "translation": "Gato",
        "romanization": null,
        "audioUrl": null
      }
    ],
    "createdBy": {
      "id": 2,
      "name": "Danny"
    },
    "usedInTopics": 2,
    "updatedAt": "2025-10-11T13:00:00Z"
  },
  "message": "Word updated successfully"
}
```

**Validation Rules:**
- `baseWord`: 1-100 chars, required
- `translations`: Array with at least 1 translation, optional (if omitted, keeps existing translations)
- `translations[].languageCode`: Valid language code, required if translations provided
- `translations[].translation`: 1-100 chars, required if translations provided
- `notes`: Max 500 chars, optional

**Note:** Updating translations will replace all existing translations with the new ones provided.

---

### 4.5 Get Word Translations

**Endpoint:** `GET /words/:id/translations`  
**Auth Required:** Yes

**Query Parameters:**
- `languageCode` (optional): Filter translations by language code

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "languageCode": "en",
      "languageName": "English",
      "translation": "Cat",
      "romanization": null,
      "audioUrl": "/uploads/audio/en_cat_1234.mp3"
    },
    {
      "id": 2,
      "languageCode": "zh-HK",
      "languageName": "Cantonese",
      "translation": "貓",
      "romanization": "maau1",
      "audioUrl": "/uploads/audio/zh_cat_5678.mp3"
    }
  ]
}
```

---

### 4.6 Delete Word

**Endpoint:** `DELETE /words/:id`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin (or creator)

**Response:** `204 No Content`

**Error Codes:**
- `WORD_IN_USE`: Word is used in topics (provide override flag)

---

### 4.7 Upload Word Audio

**Endpoint:** `POST /words/:id/audio`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin  
**Content-Type:** `multipart/form-data`

**Query Parameters:**
- `languageCode`: Language code for the audio (required)

**Request Body:**
```
audio: <file> (max 10MB, mp3/ogg/wav)
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "languageCode": "zh-HK",
    "audioUrl": "/uploads/audio/zh_cat_1697123456.mp3"
  },
  "message": "Audio uploaded successfully for Cantonese translation"
}
```

**Error Codes:**
- `TRANSLATION_NOT_FOUND`: No translation exists for specified language code

---

### 4.8 Upload Word Image

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

**Note:** Images are shared across all language translations of the word.

---

## 5. Topics

### 5.1 List Topics

**Endpoint:** `GET /topics`  
**Auth Required:** Yes

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `level` (optional): "beginner" | "intermediate" | "advanced"
- `languageCode` (optional): Filter topics by language (e.g., "zh-HK", "es")
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
      "language": {
        "id": 2,
        "code": "zh-HK",
        "name": "Cantonese"
      },
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

### 5.2 Get Topic by ID

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
    "language": {
      "id": 2,
      "code": "zh-HK",
      "name": "Cantonese"
    },
    "createdBy": {
      "id": 2,
      "name": "Danny",
      "username": "danny"
    },
    "words": [
      {
        "id": 1,
        "baseWord": "cat",
        "translation": "貓",
        "romanization": "maau1",
        "audioUrl": "/uploads/audio/zh_cat_1234.mp3",
        "imageUrl": "/uploads/images/cat_5678.jpg",
        "sequenceOrder": 1
      },
      {
        "id": 2,
        "baseWord": "dog",
        "translation": "狗",
        "romanization": "gau2",
        "audioUrl": "/uploads/audio/zh_dog_1234.mp3",
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

**Note:** Words in topic response show the translation for the topic's language only.

---

### 5.3 Create Topic

**Endpoint:** `POST /topics`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin

**Request Body:**
```json
{
  "name": "Animals",
  "description": "Learn common animal names in Cantonese",
  "level": "beginner",
  "languageCode": "zh-HK",
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
    "language": {
      "id": 2,
      "code": "zh-HK",
      "name": "Cantonese"
    },
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
- `name`: required, 1-200 chars, unique per language
- `description`: optional, max 1000 chars
- `level`: required, one of ["beginner", "intermediate", "advanced"]
- `languageCode`: required, valid language code from languages table
- `wordIds`: array of word IDs (can be empty initially)

**Error Codes:**
- `LANGUAGE_NOT_FOUND`: Invalid language code
- `WORD_NOT_FOUND`: One or more word IDs don't exist

---

### 5.4 Update Topic

**Endpoint:** `PUT /topics/:id`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin (or creator)

**Request Body:**
```json
{
  "name": "Animals (Updated)",
  "description": "Updated description",
  "level": "beginner",
  "languageCode": "zh-HK",
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
    "language": {
      "id": 2,
      "code": "zh-HK",
      "name": "Cantonese"
    },
    "wordCount": 6,
    "updatedAt": "2025-10-11T15:00:00Z"
  },
  "message": "Topic updated successfully"
}
```

**Validation Rules:**
- `languageCode`: Optional (if omitted, keeps existing language)

---

### 5.5 Delete Topic

**Endpoint:** `DELETE /topics/:id`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin (or creator)

**Response:** `204 No Content`

**Error Codes:**
- `TOPIC_IN_USE`: Topic is used in journeys

---

### 5.6 Reorder Topic Words

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

## 6. Journeys

### 6.1 List Journeys

**Endpoint:** `GET /journeys`  
**Auth Required:** Yes

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `languageCode` (optional): Filter journeys by language
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
      "language": {
        "id": 2,
        "code": "zh-HK",
        "name": "Cantonese"
      },
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

### 6.2 Get Journey by ID

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
    "language": {
      "id": 2,
      "code": "zh-HK",
      "name": "Cantonese"
    },
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

### 6.3 Create Journey

**Endpoint:** `POST /journeys`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin

**Request Body:**
```json
{
  "name": "My First 100 Words",
  "description": "A complete beginner journey to learn your first 100 Cantonese words",
  "languageCode": "zh-HK",
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
    "language": {
      "id": 2,
      "code": "zh-HK",
      "name": "Cantonese"
    },
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
- `languageCode`: required, valid language code from languages table
- `topicIds`: array of topic IDs in order (all topics must be in the same language as the journey)

**Error Codes:**
- `LANGUAGE_NOT_FOUND`: Invalid language code
- `TOPIC_LANGUAGE_MISMATCH`: One or more topics don't match the journey's language

---

### 6.4 Update Journey

**Endpoint:** `PUT /journeys/:id`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin (or creator)

**Request Body:**
```json
{
  "name": "My First 100 Words (Updated)",
  "description": "Updated description",
  "languageCode": "zh-HK",
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
    "language": {
      "id": 2,
      "code": "zh-HK",
      "name": "Cantonese"
    },
    "topicCount": 11,
    "updatedAt": "2025-10-11T17:00:00Z"
  },
  "message": "Journey updated successfully"
}
```

**Validation Rules:**
- `languageCode`: Optional (if omitted, keeps existing language)

---

### 6.5 Delete Journey

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
      "language": {
        "id": 2,
        "code": "zh-HK",
        "name": "Cantonese"
      },
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

## 7. Quizzes

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

## 8. Learning Activities

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

## 9. Conversations

### 9.1 List Conversations

**Endpoint:** `GET /conversations`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `languageCode` (optional): Filter by language
- `difficultyLevel` (optional): "beginner" | "intermediate" | "advanced"
- `topicId` (optional): Filter conversations used in a specific topic
- `search` (optional): Search by title
- `createdBy` (optional): Filter by creator

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Simple Greetings",
      "description": "Learn how to greet people in Cantonese",
      "language": {
        "id": 2,
        "code": "zh-HK",
        "name": "Cantonese"
      },
      "difficultyLevel": "beginner",
      "lineCount": 4,
      "createdBy": {
        "id": 2,
        "name": "Danny"
      },
      "usedInTopics": 2,
      "createdAt": "2025-10-01T10:00:00Z"
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

### 9.2 Get Conversation by ID

**Endpoint:** `GET /conversations/:id`  
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Simple Greetings",
    "description": "Learn how to greet people in Cantonese",
    "context": "Practice basic greeting phrases you can use when meeting someone",
    "language": {
      "id": 2,
      "code": "zh-HK",
      "name": "Cantonese"
    },
    "difficultyLevel": "beginner",
    "createdBy": {
      "id": 2,
      "name": "Danny",
      "username": "danny"
    },
    "lines": [
      {
        "id": 1,
        "sequenceOrder": 1,
        "speakerRole": "Person A",
        "englishText": "Hello!",
        "targetText": "你好！",
        "romanization": "nei5 hou2!",
        "audioUrl": "/audio/zh/greeting_1.mp3",
        "wordId": 1,
        "isLearnerLine": false
      },
      {
        "id": 2,
        "sequenceOrder": 2,
        "speakerRole": "Person B",
        "englishText": "Hello! How are you?",
        "targetText": "你好！你好嗎？",
        "romanization": "nei5 hou2! nei5 hou2 maa3?",
        "audioUrl": "/audio/zh/greeting_2.mp3",
        "isLearnerLine": true
      }
    ],
    "totalLines": 4,
    "usedInTopics": 2,
    "createdAt": "2025-10-01T10:00:00Z",
    "updatedAt": "2025-10-01T10:00:00Z"
  }
}
```

---

### 9.3 Create Conversation

**Endpoint:** `POST /conversations`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin

**Request Body:**
```json
{
  "title": "At the Restaurant",
  "description": "Learn how to order food at a restaurant",
  "context": "You are at a Cantonese restaurant and want to order",
  "languageCode": "zh-HK",
  "difficultyLevel": "intermediate",
  "lines": [
    {
      "sequenceOrder": 1,
      "speakerRole": "Waiter",
      "englishText": "What would you like to eat?",
      "targetText": "你想食咩呀？",
      "romanization": "nei5 soeng2 sik6 me1 aa3?",
      "isLearnerLine": false
    },
    {
      "sequenceOrder": 2,
      "speakerRole": "Customer",
      "englishText": "I want fried rice.",
      "targetText": "我想要炒飯。",
      "romanization": "ngo5 soeng2 jiu3 caau2 faan6.",
      "wordId": 42,
      "isLearnerLine": true
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 5,
    "title": "At the Restaurant",
    "description": "Learn how to order food at a restaurant",
    "language": {
      "id": 2,
      "code": "zh-HK",
      "name": "Cantonese"
    },
    "difficultyLevel": "intermediate",
    "createdBy": {
      "id": 2,
      "name": "Danny"
    },
    "lines": [...],
    "totalLines": 2,
    "usedInTopics": 0,
    "createdAt": "2025-10-11T18:00:00Z",
    "updatedAt": "2025-10-11T18:00:00Z"
  },
  "message": "Conversation created successfully"
}
```

**Validation Rules:**
- `title`: required, 1-200 chars
- `languageCode`: required, valid language code
- `difficultyLevel`: required, one of ["beginner", "intermediate", "advanced"]
- `lines`: array with at least 2 lines, required
- `lines[].sequenceOrder`: required, must be sequential starting from 1
- `lines[].speakerRole`: required, 1-100 chars
- `lines[].englishText`: required
- `lines[].targetText`: required

**Error Codes:**
- `LANGUAGE_NOT_FOUND`: Invalid language code
- `WORD_NOT_FOUND`: Referenced word_id doesn't exist
- `INVALID_SEQUENCE`: Line sequence orders are not sequential

---

### 9.4 Update Conversation

**Endpoint:** `PUT /conversations/:id`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin (or creator)

**Request Body:**
```json
{
  "title": "At the Restaurant (Updated)",
  "description": "Updated description",
  "difficultyLevel": "beginner",
  "lines": [...]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 5,
    "title": "At the Restaurant (Updated)",
    "totalLines": 4,
    "updatedAt": "2025-10-11T19:00:00Z"
  },
  "message": "Conversation updated successfully"
}
```

**Note:** Updating lines will replace all existing lines with the new ones provided.

---

### 9.5 Delete Conversation

**Endpoint:** `DELETE /conversations/:id`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin (or creator)

**Response:** `204 No Content`

**Error Codes:**
- `CONVERSATION_IN_USE`: Conversation is linked to topics

---

### 9.6 Upload Conversation Line Audio

**Endpoint:** `POST /conversations/:id/lines/:lineId/audio`  
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
    "lineId": 15,
    "audioUrl": "/uploads/audio/conversation_line_15.mp3"
  },
  "message": "Audio uploaded successfully"
}
```

---

### 9.7 Get Conversations for Topic

**Endpoint:** `GET /topics/:topicId/conversations`  
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Simple Greetings",
      "difficultyLevel": "beginner",
      "lineCount": 4,
      "sequenceOrder": 1,
      "completed": true,
      "replayCount": 3
    },
    {
      "id": 2,
      "title": "Introducing Yourself",
      "difficultyLevel": "beginner",
      "lineCount": 6,
      "sequenceOrder": 2,
      "completed": false,
      "replayCount": 0
    }
  ]
}
```

**Note:** Includes user's progress if authenticated as learner

---

### 9.8 Get User's Conversation Progress

**Endpoint:** `GET /conversations/:id/progress`  
**Auth Required:** Yes  
**Roles:** Learner

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "conversationId": 1,
    "title": "Simple Greetings",
    "difficultyLevel": "beginner",
    "lineCount": 4,
    "completed": true,
    "replayCount": 3,
    "timeSpentSeconds": 420,
    "completedAt": "2025-10-05T14:30:00Z",
    "lastAccessedAt": "2025-10-10T10:00:00Z",
    "progressPercent": 100
  }
}
```

---

### 9.9 Complete Conversation

**Endpoint:** `POST /conversations/:id/complete`  
**Auth Required:** Yes  
**Roles:** Learner

**Request Body:**
```json
{
  "timeSpentSeconds": 180
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "conversationId": 1,
    "completed": true,
    "replayCount": 1,
    "totalTimeSpent": 180,
    "achievementsEarned": []
  },
  "message": "Conversation completed successfully"
}
```

**Note:** If already completed, increments replay_count

---

## 10. Progress & Analytics

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

## 11. Achievements

### 11.1 List All Achievements

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

### 11.2 Get My Achievements

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

## 12. Bookmarks

### 12.1 Get My Bookmarks

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

### 12.2 Bookmark Word

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

### 12.3 Remove Word Bookmark

**Endpoint:** `DELETE /bookmarks/words/:wordId`  
**Auth Required:** Yes  
**Roles:** Learner

**Response:** `204 No Content`

---

### 12.4 Bookmark Topic

**Endpoint:** `POST /bookmarks/topics/:topicId`  
**Auth Required:** Yes  
**Roles:** Learner

**Response:** `201 Created`

---

### 12.5 Remove Topic Bookmark

**Endpoint:** `DELETE /bookmarks/topics/:topicId`  
**Auth Required:** Yes  
**Roles:** Learner

**Response:** `204 No Content`

---

## 13. Notes

### 13.1 Get My Notes

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

### 13.2 Add Note to Word

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

### 13.3 Update Note

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

### 13.4 Delete Note

**Endpoint:** `DELETE /notes/:id`  
**Auth Required:** Yes  
**Roles:** Learner

**Response:** `204 No Content`

---

## 14. Spaced Repetition

### 14.1 Get Due Reviews

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

### 14.2 Submit Review

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

### 14.3 Get SRS Statistics

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

## 15. AI Services

### 15.1 Generate Audio (TTS)

**Endpoint:** `POST /ai/generate-audio`  
**Auth Required:** Yes  
**Roles:** Teacher, Admin

**Request Body:**
```json
{
  "text": "貓",
  "languageCode": "zh-HK",
  "voice": "female"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "audioUrl": "/uploads/ai-audio/generated_1697123456.mp3",
    "languageCode": "zh-HK",
    "durationSeconds": 1.2,
    "estimatedCost": 0.002,
    "cached": false
  },
  "message": "Audio generated successfully"
}
```

**Validation Rules:**
- `text`: required, 1-500 chars
- `languageCode`: required, valid language code
- `voice`: optional, "male" | "female" | specific voice ID

**Error Codes:**
- `LANGUAGE_NOT_SUPPORTED`: Language not supported by TTS service
- `AI_SERVICE_ERROR`: TTS API failed
- `QUOTA_EXCEEDED`: API quota exceeded

---

### 15.2 Generate Image

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

## 16. Admin

### 16.1 List All Users

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

### 16.2 Create User (Admin)

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

### 16.3 Update User Roles

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

### 16.4 Delete User

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
