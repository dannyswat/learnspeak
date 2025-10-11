# LearnSpeak - Requirements Document

**Project**: Language Learning Platform for Cantonese  
**Version**: 1.0  
**Date**: October 11, 2025  
**Target MVP**: ASAP (5 users initially)

---

## 1. Executive Summary

LearnSpeak is a personalized language learning platform designed to help children and beginners learn Cantonese through customized learning journeys. The platform enables teachers (parents) to create and manage content with AI assistance, while learners engage with vocabulary through flashcards, pronunciation practice, conversation simulations, and quizzes.

### Key Differentiators
- Customized learning journeys for individual learners
- Teacher-managed content with AI-assisted features
- Focus on vocabulary building and conversation practice
- Designed specifically for children and beginners

---

## 2. User Roles & Permissions

### 2.1 Learner
**Primary Users**: Children and beginners learning Cantonese

**Capabilities**:
- Complete assigned learning journeys
- Practice vocabulary through various activities
- View progress and achievements
- Bookmark words and topics for review
- Add personal notes (nice-to-have)
- View achievement page for sharing

**Restrictions**:
- Cannot create or edit content
- Cannot access other users' data
- Must complete topics sequentially within a journey

### 2.2 Teacher
**Primary Users**: Parents/educators managing learner content

**Capabilities**:
- All learner capabilities
- Create and manage words, topics, and journeys
- Assign journeys to specific learners
- Set customizable learning goals for learners
- Record audio pronunciations
- Utilize AI-assisted content creation
- View detailed analytics and reports
- Manage difficulty levels (beginner, intermediate, advanced)

### 2.3 Administrator
**Primary Users**: Platform managers

**Capabilities**:
- All teacher capabilities
- Manage user accounts (learners, teachers, admins)
- Access platform-wide analytics
- System configuration and maintenance
- User progress backup management

---

## 3. Functional Requirements

### 3.1 User Management

#### FR-1: Authentication
- **FR-1.1**: Users must authenticate with username and password
- **FR-1.2**: System must support three user roles: Learner, Teacher, Administrator
- **FR-1.3**: Passwords must be securely hashed before storage

#### FR-2: User Profiles
- **FR-2.1**: Users can set and update profile name
- **FR-2.2**: Users can upload and change profile photo
- **FR-2.3**: Profile must display user's achievements and badges

### 3.2 Content Management

#### FR-3: Word Management
- **FR-3.1**: Teachers can create words with:
  - English text
  - Cantonese text (traditional Chinese characters)
  - Romanization (Jyutping or Yale)
  - Audio pronunciation (recorded or AI-generated)
  - Associated images (AI-generated or uploaded)
- **FR-3.2**: Teachers can edit and delete words
- **FR-3.3**: System supports AI text-to-speech for Cantonese pronunciation
- **FR-3.4**: System supports AI image generation for vocabulary

#### FR-4: Topic Management
- **FR-4.1**: Topics must have:
  - Name/title
  - Difficulty level (beginner, intermediate, advanced)
  - List of associated words
  - Optional description
- **FR-4.2**: Teachers can create, edit, and delete topics
- **FR-4.3**: Topics can belong to multiple journeys
- **FR-4.4**: Topics must contain quizzes/assessments

#### FR-5: Journey Management
- **FR-5.1**: Journeys must have:
  - Name/title
  - Ordered list of topics
  - Optional description
- **FR-5.2**: Teachers can create, edit, and delete journeys
- **FR-5.3**: Teachers can assign journeys to specific learners
- **FR-5.4**: Learners must complete topics sequentially within a journey

### 3.3 Learning Activities

#### FR-6: Flashcard Practice
- **FR-6.1**: Display word with image
- **FR-6.2**: Show English and Cantonese text
- **FR-6.3**: Play audio pronunciation
- **FR-6.4**: Allow manual progression (next/previous)
- **FR-6.5**: Implement spaced repetition algorithm

#### FR-7: Pronunciation Practice
- **FR-7.1**: Display word with audio playback
- **FR-7.2**: Allow learners to listen and repeat
- **FR-7.3**: Track completion of pronunciation exercises

#### FR-8: Conversation Simulations
- **FR-8.1**: Present dialogue scenarios using learned vocabulary
- **FR-8.2**: Display both English and Cantonese
- **FR-8.3**: Include audio playback for conversations
- **FR-8.4**: Track completion

#### FR-9: Multiple Choice Quizzes
- **FR-9.1**: Generate questions from topic vocabulary
- **FR-9.2**: Provide 4 answer options
- **FR-9.3**: Validate answers and provide immediate feedback
- **FR-9.4**: Display score at completion
- **FR-9.5**: Award achievements based on performance

### 3.4 Progress Tracking & Achievements

#### FR-10: Progress Tracking
- **FR-10.1**: Track metrics per learner:
  - Time spent learning
  - Completion rate by topic/journey
  - Accuracy by language, topic, and level
- **FR-10.2**: System must backup user progress regularly
- **FR-10.3**: Display visual progress indicators

#### FR-11: Achievements & Badges
- **FR-11.1**: Award badges for:
  - Completing topics
  - Completing journeys
  - High quiz scores
  - Consistency milestones
- **FR-11.2**: Display achievements on user profile
- **FR-11.3**: Provide achievement page suitable for screenshots/sharing

#### FR-12: Analytics Dashboard (Teachers/Admins)
- **FR-12.1**: Display aggregate metrics:
  - Total time spent
  - Completion rates
  - Accuracy by topic/level
  - Learner progress overview
- **FR-12.2**: Filter by learner, topic, journey, level
- **FR-12.3**: Visual charts and graphs

### 3.5 Personalization Features

#### FR-13: Bookmarking
- **FR-13.1**: Learners can bookmark words for quick review
- **FR-13.2**: Learners can bookmark topics
- **FR-13.3**: Provide dedicated bookmark view/section

#### FR-14: Notes (Nice-to-Have)
- **FR-14.1**: Users can add personal notes to words
- **FR-14.2**: Notes are private to the user

#### FR-15: Customizable Goals
- **FR-15.1**: Teachers can set learning goals for learners
- **FR-15.2**: Goals can specify completion targets or time-based objectives

### 3.6 AI-Assisted Features

#### FR-16: AI Text-to-Speech
- **FR-16.1**: Generate Cantonese audio pronunciations for words
- **FR-16.2**: Support both male and female voices (optional)
- **FR-16.3**: Cache generated audio for reuse

#### FR-17: AI Image Generation
- **FR-17.1**: Generate contextual images for vocabulary words
- **FR-17.2**: Allow teachers to regenerate or upload custom images
- **FR-17.3**: Cache generated images

#### FR-18: AI Content Assistance (Optional)
- **FR-18.1**: Suggest related words for topics
- **FR-18.2**: Generate conversation scenarios
- **FR-18.3**: Recommend personalized learning paths based on performance

---

## 4. Non-Functional Requirements

### 4.1 Performance
- **NFR-1**: Page load time must be < 500ms
- **NFR-2**: System must support 5 concurrent users initially
- **NFR-3**: Audio files should load and play within 200ms
- **NFR-4**: Database queries must complete within 100ms

### 4.2 Usability
- **NFR-5**: Interface must be playful and engaging for children
- **NFR-6**: Application must be simple and intuitive to use
- **NFR-7**: Responsive web design required (mobile, tablet, desktop)
- **NFR-8**: Green color scheme preferred

### 4.3 Security
- **NFR-9**: All communication must use HTTPS
- **NFR-10**: Passwords must be hashed using bcrypt or similar
- **NFR-11**: User sessions must expire after inactivity
- **NFR-12**: No real personal data collection (privacy-focused)

### 4.4 Reliability
- **NFR-13**: User progress must be backed up regularly
- **NFR-14**: System uptime target: 99% (MVP phase)
- **NFR-15**: Graceful error handling with user-friendly messages

### 4.5 Scalability
- **NFR-16**: Architecture must support future expansion to 100+ users
- **NFR-17**: Database schema must accommodate additional languages
- **NFR-18**: Design must allow future mobile app migration (React Native)

### 4.6 Maintainability
- **NFR-19**: Code must follow TypeScript and Go best practices
- **NFR-20**: Comprehensive error logging
- **NFR-21**: API documentation using OpenAPI/Swagger
- **NFR-22**: Database migrations must be versioned

---

## 5. Technical Requirements

### 5.1 Technology Stack

**Frontend**:
- Framework: React with TypeScript
- State Management: React Context API or Redux
- Styling: TailwindCSS or Material-UI
- Build Tool: Vite or Create React App

**Backend**:
- Language: Go
- Framework: Echo
- Authentication: JWT tokens
- API: RESTful API

**Database**:
- Primary Database: PostgreSQL
- Caching: Redis (optional for MVP)

**Infrastructure**:
- Containerization: Docker
- Deployment: Docker Compose (MVP)
- Future: Kubernetes for scaling

**AI Services**:
- Text-to-Speech: Google Cloud TTS, Azure Speech, or ElevenLabs
- Image Generation: DALL-E, Stable Diffusion, or similar

### 5.2 Development Environment
- Version Control: Git
- Code Repository: GitHub/GitLab
- Development OS: Cross-platform (macOS, Linux, Windows)
- Package Management: npm/yarn (frontend), Go modules (backend)

---

## 6. Data Requirements

### 6.1 Content Data
- Initial Content: 100 words, 10 topics
- Languages: English and Cantonese
- Regional Variations: Support for different Cantonese romanization systems

### 6.2 Storage
- Audio Files: Compressed format (MP3/OGG)
- Images: Optimized format (WebP/JPEG)
- Database: Relational structure for words, topics, journeys

### 6.3 Backup
- User progress backed up daily
- Content backed up on changes
- Retention: 30 days minimum

---

## 7. Integration Requirements

### 7.1 Third-Party Services
- AI Text-to-Speech API
- AI Image Generation API
- YouTube video embedding (optional future feature)

### 7.2 APIs
- RESTful API for frontend-backend communication
- Future: GraphQL consideration for complex queries

---

## 8. Constraints & Assumptions

### 8.1 Constraints
- No payment processing required
- No social features or user interaction
- No mobile apps for MVP
- No external API integrations (except AI services)
- No email notifications

### 8.2 Assumptions
- Users have stable internet connection
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Content created by teachers will be of good quality
- 5 concurrent users for MVP phase
- English is the base instruction language

---

## 9. MVP Scope

### 9.1 Must-Have Features (P0)
✅ User authentication (username/password)  
✅ User roles (Learner, Teacher, Admin)  
✅ Word management with AI TTS and image generation  
✅ Topic management  
✅ Journey management  
✅ Journey assignment to learners  
✅ Flashcard practice  
✅ Multiple choice quizzes  
✅ Progress tracking  
✅ Achievements/badges  
✅ Responsive web design  

### 9.2 Should-Have Features (P1)
📝 Pronunciation practice  
📝 Conversation simulations  
📝 Spaced repetition system  
📝 Bookmark words and topics  
📝 Teacher analytics dashboard  
📝 Achievement page for sharing  

### 9.3 Nice-to-Have Features (P2)
💡 User notes on words  
💡 AI-powered personalized learning paths  
💡 Interactive animations  
💡 YouTube video integration  
💡 Advanced performance analytics  

### 9.4 Future Features
🔮 Mobile apps (React Native)  
🔮 Additional language pairs  
🔮 Social features  
🔮 Subscription model  
🔮 Advanced AI features  

---

## 10. Success Criteria

### 10.1 MVP Success Metrics
- 5 users successfully onboarded
- 100 words created with AI assistance
- 10 topics created
- 3+ journeys created and assigned
- Average session time > 10 minutes
- User satisfaction score > 4/5
- Page load time < 500ms achieved
- Zero critical bugs

### 10.2 User Acceptance Criteria
- Learners can complete a full journey without assistance
- Teachers can create content in < 5 minutes per topic
- Achievement system motivates continued learning
- Interface is intuitive for children (age 5+)

---

## 11. Out of Scope (MVP)

❌ Payment integration  
❌ Social features (forums, chat, user connections)  
❌ Email notifications  
❌ Multi-language UI  
❌ Right-to-left language support  
❌ Native mobile apps  
❌ Live tutoring  
❌ Speech recognition  
❌ Automated grammar correction  
❌ GDPR/CCPA compliance features  
❌ Data export functionality  
❌ Customer support chat  
❌ Placement tests  
❌ Certification  

---

## 12. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| AI API costs exceed budget | High | Medium | Set usage limits, cache aggressively, use free tiers initially |
| AI-generated content quality issues | Medium | Medium | Allow teacher override/editing, human review |
| Performance with media files | Medium | Medium | Optimize images, lazy loading, CDN consideration |
| User adoption by children | High | Low | Focus on playful design, parental involvement |
| Scope creep | Medium | High | Strict MVP definition, phased approach |

---

## Approval

**Product Owner**: _______________  
**Date**: _______________

**Technical Lead**: _______________  
**Date**: _______________
