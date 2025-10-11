# LearnSpeak - User Stories

**Version**: 1.0  
**Date**: October 11, 2025

---

## Epic Structure

```
├── Epic 1: User Management & Authentication
├── Epic 2: Content Creation & Management (Teacher)
├── Epic 3: Learning Activities (Learner)
├── Epic 4: Progress Tracking & Achievements
├── Epic 5: AI-Assisted Features
└── Epic 6: Administration
```

---

## Epic 1: User Management & Authentication

### Story 1.1: User Registration
**As a** new user  
**I want to** create an account with username and password  
**So that** I can access the learning platform

**Acceptance Criteria:**
- [ ] User can enter username, password, name, and optional email
- [ ] Username must be unique
- [ ] Password must be at least 8 characters
- [ ] User can select role during registration (learner/teacher)
- [ ] Success message displayed after registration
- [ ] User automatically logged in after registration

**Priority:** P0 (Must-Have)  
**Estimate:** 3 points

---

### Story 1.2: User Login
**As a** registered user  
**I want to** log in with my username and password  
**So that** I can access my personalized learning content

**Acceptance Criteria:**
- [ ] User can enter username and password
- [ ] Invalid credentials show error message
- [ ] Successful login redirects to appropriate dashboard
- [ ] JWT token generated and stored
- [ ] Session remains active for 7 days

**Priority:** P0 (Must-Have)  
**Estimate:** 2 points

---

### Story 1.3: User Profile Management
**As a** user  
**I want to** view and edit my profile  
**So that** I can personalize my account

**Acceptance Criteria:**
- [ ] User can view profile page with name and profile picture
- [ ] User can update name
- [ ] User can upload profile picture (max 5MB)
- [ ] User can see achievements and badges on profile
- [ ] Changes saved with confirmation message

**Priority:** P0 (Must-Have)  
**Estimate:** 3 points

---

### Story 1.4: User Logout
**As a** logged-in user  
**I want to** log out of my account  
**So that** my account remains secure

**Acceptance Criteria:**
- [ ] Logout button visible in navigation
- [ ] User session cleared on logout
- [ ] Redirected to login page
- [ ] Cannot access protected pages after logout

**Priority:** P0 (Must-Have)  
**Estimate:** 1 point

---

## Epic 2: Content Creation & Management (Teacher)

### Story 2.1: Create Word with AI
**As a** teacher  
**I want to** create vocabulary words with AI-generated audio and images  
**So that** I can quickly build learning content

**Acceptance Criteria:**
- [ ] Form to enter English word, Cantonese translation, and romanization
- [ ] AI generates Cantonese pronunciation audio automatically
- [ ] AI generates contextual image for the word
- [ ] Teacher can preview audio and image before saving
- [ ] Teacher can regenerate or upload custom audio/image
- [ ] Word saved to database with all media URLs

**Priority:** P0 (Must-Have)  
**Estimate:** 8 points

---

### Story 2.2: Edit and Delete Words
**As a** teacher  
**I want to** edit or delete existing words  
**So that** I can maintain accurate content

**Acceptance Criteria:**
- [ ] Teacher can view list of all created words
- [ ] Edit button opens form with existing data
- [ ] Changes saved with confirmation
- [ ] Delete requires confirmation
- [ ] Deleted words removed from associated topics

**Priority:** P0 (Must-Have)  
**Estimate:** 3 points

---

### Story 2.3: Create Topic
**As a** teacher  
**I want to** create topics with selected words  
**So that** I can organize vocabulary by theme

**Acceptance Criteria:**
- [ ] Form to enter topic name, description, and difficulty level
- [ ] Search and select words to add to topic
- [ ] Drag-and-drop to reorder words in topic
- [ ] Set difficulty level (beginner, intermediate, advanced)
- [ ] Topic saved with word associations

**Priority:** P0 (Must-Have)  
**Estimate:** 5 points

---

### Story 2.4: Create Journey
**As a** teacher  
**I want to** create learning journeys with ordered topics  
**So that** I can design complete learning paths

**Acceptance Criteria:**
- [ ] Form to enter journey name and description
- [ ] Select and add topics to journey
- [ ] Drag-and-drop to reorder topics
- [ ] Preview journey structure
- [ ] Journey saved successfully

**Priority:** P0 (Must-Have)  
**Estimate:** 5 points

---

### Story 2.5: Assign Journey to Learner
**As a** teacher  
**I want to** assign journeys to specific learners  
**So that** they have personalized learning paths

**Acceptance Criteria:**
- [ ] View list of learners
- [ ] Select journey to assign
- [ ] Assign journey to one or more learners
- [ ] Learners receive assignment immediately
- [ ] Assignment tracked in database

**Priority:** P0 (Must-Have)  
**Estimate:** 3 points

---

### Story 2.6: Create Quiz Questions
**As a** teacher  
**I want to** create multiple-choice quizzes for topics  
**So that** learners can test their knowledge

**Acceptance Criteria:**
- [ ] Form to create quiz question for a topic
- [ ] Enter question text and 4 answer options
- [ ] Mark correct answer
- [ ] Associate with specific word (optional)
- [ ] Preview quiz question
- [ ] Multiple questions per topic

**Priority:** P0 (Must-Have)  
**Estimate:** 5 points

---

### Story 2.7: View Teacher Analytics
**As a** teacher  
**I want to** view analytics on my learners' progress  
**So that** I can understand their learning patterns

**Acceptance Criteria:**
- [ ] Dashboard shows all assigned learners
- [ ] View completion rates by learner
- [ ] View average quiz scores
- [ ] View time spent by learner
- [ ] Filter by journey, topic, or level
- [ ] Visual charts and graphs

**Priority:** P1 (Should-Have)  
**Estimate:** 8 points

---

## Epic 3: Learning Activities (Learner)

### Story 3.1: View Assigned Journeys
**As a** learner  
**I want to** see my assigned learning journeys  
**So that** I know what to study

**Acceptance Criteria:**
- [ ] Dashboard shows all assigned journeys
- [ ] Each journey displays name, description, and progress
- [ ] Journeys sorted by assignment date
- [ ] Visual progress indicator (e.g., 3/10 topics completed)
- [ ] Click to start/continue journey

**Priority:** P0 (Must-Have)  
**Estimate:** 3 points

---

### Story 3.2: Sequential Topic Navigation
**As a** learner  
**I want to** complete topics in order within a journey  
**So that** I build knowledge progressively

**Acceptance Criteria:**
- [ ] Only current/next topic is clickable
- [ ] Completed topics show checkmark
- [ ] Locked topics show lock icon
- [ ] Must complete current topic to unlock next
- [ ] Clear visual indication of progress

**Priority:** P0 (Must-Have)  
**Estimate:** 3 points

---

### Story 3.3: Flashcard Practice
**As a** learner  
**I want to** practice vocabulary with flashcards  
**So that** I can memorize words effectively

**Acceptance Criteria:**
- [ ] Card shows word image
- [ ] Front shows English, back shows Cantonese
- [ ] Audio plays on click
- [ ] Swipe or button to flip card
- [ ] Next/previous navigation
- [ ] Progress indicator (card X of Y)

**Priority:** P0 (Must-Have)  
**Estimate:** 5 points

---

### Story 3.4: Take Quiz
**As a** learner  
**I want to** take multiple-choice quizzes on topics  
**So that** I can test my knowledge

**Acceptance Criteria:**
- [ ] Quiz presents questions one at a time
- [ ] Display 4 answer options
- [ ] Select answer and submit
- [ ] Immediate feedback (correct/incorrect)
- [ ] Show correct answer if wrong
- [ ] Display final score at end
- [ ] Award achievement if high score

**Priority:** P0 (Must-Have)  
**Estimate:** 5 points

---

### Story 3.5: Pronunciation Practice
**As a** learner  
**I want to** listen to word pronunciations  
**So that** I can learn correct Cantonese pronunciation

**Acceptance Criteria:**
- [ ] List of words from topic
- [ ] Play button for each word
- [ ] Audio plays clearly
- [ ] Can replay multiple times
- [ ] Progress tracked when activity completed

**Priority:** P1 (Should-Have)  
**Estimate:** 3 points

---

### Story 3.6: Conversation Simulations
**As a** learner  
**I want to** practice conversations using learned vocabulary  
**So that** I can apply words in context

**Acceptance Criteria:**
- [ ] Display dialogue scenario
- [ ] Show English and Cantonese lines
- [ ] Audio playback for each line
- [ ] Visual indication of current line
- [ ] Completion tracked

**Priority:** P1 (Should-Have)  
**Estimate:** 5 points

---

### Story 3.7: View Achievements
**As a** learner  
**I want to** see my earned achievements and badges  
**So that** I feel motivated and can track milestones

**Acceptance Criteria:**
- [ ] Achievement page shows all badges
- [ ] Earned badges displayed in color
- [ ] Locked badges shown in grayscale
- [ ] Badge name and description visible
- [ ] Achievement date shown for earned badges
- [ ] Share/screenshot friendly layout

**Priority:** P0 (Must-Have)  
**Estimate:** 3 points

---

### Story 3.8: Bookmark Words
**As a** learner  
**I want to** bookmark difficult words  
**So that** I can review them later

**Acceptance Criteria:**
- [ ] Bookmark icon on each word
- [ ] Click to bookmark/unbookmark
- [ ] Visual indication of bookmarked status
- [ ] View all bookmarked words in dedicated section
- [ ] Practice bookmarked words with flashcards

**Priority:** P1 (Should-Have)  
**Estimate:** 3 points

---

### Story 3.9: Bookmark Topics
**As a** learner  
**I want to** bookmark topics for quick access  
**So that** I can easily return to important content

**Acceptance Criteria:**
- [ ] Bookmark icon on topics
- [ ] Bookmarked topics appear in favorites
- [ ] Quick access from dashboard
- [ ] Remove bookmark option

**Priority:** P1 (Should-Have)  
**Estimate:** 2 points

---

### Story 3.10: Add Notes to Words
**As a** learner  
**I want to** add personal notes to vocabulary words  
**So that** I can remember helpful tips

**Acceptance Criteria:**
- [ ] Notes field on word detail view
- [ ] Add/edit/delete notes
- [ ] Notes are private to user
- [ ] Notes visible during flashcard practice
- [ ] Character limit: 500

**Priority:** P2 (Nice-to-Have)  
**Estimate:** 3 points

---

## Epic 4: Progress Tracking & Achievements

### Story 4.1: Track Learning Time
**As a** learner  
**I want to** see how much time I've spent learning  
**So that** I can monitor my effort

**Acceptance Criteria:**
- [ ] System tracks active learning time
- [ ] Display total time on dashboard
- [ ] Show time per topic/journey
- [ ] Time updates in real-time during activities

**Priority:** P0 (Must-Have)  
**Estimate:** 3 points

---

### Story 4.2: Track Topic Completion
**As a** learner  
**I want to** see which topics I've completed  
**So that** I can track my progress

**Acceptance Criteria:**
- [ ] Completed topics marked with checkmark
- [ ] Completion percentage shown
- [ ] Completion date recorded
- [ ] Completion triggers achievement check

**Priority:** P0 (Must-Have)  
**Estimate:** 2 points

---

### Story 4.3: Track Quiz Accuracy
**As a** learner  
**I want to** see my quiz scores and accuracy  
**So that** I can identify areas for improvement

**Acceptance Criteria:**
- [ ] Quiz results saved after completion
- [ ] Display score and percentage
- [ ] Show accuracy by topic
- [ ] Show accuracy by difficulty level
- [ ] Historical performance visible

**Priority:** P0 (Must-Have)  
**Estimate:** 3 points

---

### Story 4.4: Automatic Achievement Awards
**As a** learner  
**I want to** automatically receive achievements when I reach milestones  
**So that** I feel rewarded for my progress

**Acceptance Criteria:**
- [ ] Achievements awarded automatically on trigger
- [ ] Notification shown when badge earned
- [ ] Achievement criteria checked after each activity
- [ ] Multiple achievements can be earned simultaneously
- [ ] No duplicate awards

**Priority:** P0 (Must-Have)  
**Estimate:** 5 points

---

### Story 4.5: Journey Completion Certificate
**As a** learner  
**I want to** see a completion screen when I finish a journey  
**So that** I can celebrate my achievement

**Acceptance Criteria:**
- [ ] Completion screen displays on journey finish
- [ ] Shows journey name and completion date
- [ ] Shows summary statistics (time, accuracy)
- [ ] Celebrates with visual effects
- [ ] Button to share/screenshot

**Priority:** P1 (Should-Have)  
**Estimate:** 3 points

---

## Epic 5: AI-Assisted Features

### Story 5.1: AI Text-to-Speech Generation
**As a** teacher  
**I want** AI to generate Cantonese pronunciation audio  
**So that** I don't have to record every word manually

**Acceptance Criteria:**
- [ ] Enter Cantonese text
- [ ] AI generates natural-sounding audio
- [ ] Audio file saved and URL stored
- [ ] Preview audio before saving
- [ ] Option to regenerate
- [ ] Cache audio to avoid duplicate API calls

**Priority:** P0 (Must-Have)  
**Estimate:** 5 points

---

### Story 5.2: AI Image Generation
**As a** teacher  
**I want** AI to generate contextual images for vocabulary  
**So that** visual learning is enhanced

**Acceptance Criteria:**
- [ ] Enter English word and get image suggestion
- [ ] AI generates relevant, child-friendly image
- [ ] Image URL stored in database
- [ ] Preview image before saving
- [ ] Option to regenerate or upload custom
- [ ] Cache images to reduce costs

**Priority:** P0 (Must-Have)  
**Estimate:** 5 points

---

### Story 5.3: AI Learning Path Suggestions
**As a** teacher  
**I want** AI to suggest optimal topic ordering  
**So that** I can create effective learning journeys

**Acceptance Criteria:**
- [ ] AI analyzes word difficulty and topic connections
- [ ] Suggests logical progression
- [ ] Teacher can accept or modify suggestions
- [ ] Suggestions based on pedagogy best practices

**Priority:** P2 (Nice-to-Have)  
**Estimate:** 8 points

---

## Epic 6: Spaced Repetition System

### Story 6.1: Initialize SRS for New Words
**As a** learner  
**I want** new words automatically added to my review schedule  
**So that** I can retain vocabulary long-term

**Acceptance Criteria:**
- [ ] Words added to SRS when first encountered
- [ ] Initial review scheduled for next day
- [ ] SRS data initialized with default values
- [ ] No duplicate entries

**Priority:** P1 (Should-Have)  
**Estimate:** 3 points

---

### Story 6.2: Daily Review Practice
**As a** learner  
**I want to** see words due for review each day  
**So that** I can maintain long-term retention

**Acceptance Criteria:**
- [ ] Dashboard shows review count
- [ ] Review session shows due words only
- [ ] Flashcard-style review interface
- [ ] Mark word as remembered or forgotten
- [ ] SRS algorithm updates interval based on response

**Priority:** P1 (Should-Have)  
**Estimate:** 8 points

---

### Story 6.3: SRS Algorithm Implementation
**As a** system  
**I want to** use SM-2 algorithm for scheduling reviews  
**So that** optimal retention is achieved

**Acceptance Criteria:**
- [ ] Correct answer increases interval
- [ ] Incorrect answer resets interval
- [ ] Ease factor adjusts based on performance
- [ ] Maximum interval capped at 180 days
- [ ] Algorithm tested and validated

**Priority:** P1 (Should-Have)  
**Estimate:** 5 points

---

## Epic 7: Administration

### Story 7.1: User Management
**As an** administrator  
**I want to** view and manage all user accounts  
**So that** I can maintain the platform

**Acceptance Criteria:**
- [ ] View list of all users
- [ ] Filter by role (learner/teacher/admin)
- [ ] Edit user details
- [ ] Deactivate/reactivate accounts
- [ ] Assign roles to users

**Priority:** P0 (Must-Have)  
**Estimate:** 5 points

---

### Story 7.2: Platform Analytics
**As an** administrator  
**I want to** view platform-wide analytics  
**So that** I can monitor overall usage

**Acceptance Criteria:**
- [ ] Total users count (by role)
- [ ] Total content (words, topics, journeys)
- [ ] Overall engagement metrics
- [ ] Most popular topics
- [ ] Average completion rates

**Priority:** P1 (Should-Have)  
**Estimate:** 5 points

---

### Story 7.3: Content Moderation
**As an** administrator  
**I want to** review and moderate user-generated content  
**So that** quality is maintained

**Acceptance Criteria:**
- [ ] View all content across users
- [ ] Edit or delete inappropriate content
- [ ] Flag content for review
- [ ] Approve content before public use (if needed)

**Priority:** P2 (Nice-to-Have)  
**Estimate:** 5 points

---

## Story Summary by Priority

### P0 - Must Have (MVP)
- 18 stories
- Total: ~67 story points

### P1 - Should Have
- 10 stories
- Total: ~44 story points

### P2 - Nice to Have
- 4 stories
- Total: ~19 story points

**Grand Total: 32 stories, ~130 story points**

---

## Definition of Done

A user story is considered "Done" when:

✅ Code is written and follows style guidelines  
✅ Unit tests written with >80% coverage  
✅ Integration tests pass  
✅ Code reviewed and approved  
✅ UI/UX reviewed (for frontend stories)  
✅ Documentation updated  
✅ Deployed to staging environment  
✅ Acceptance criteria verified  
✅ Product owner approval received  

---

## Story Dependencies

```
Story 1.1 → Story 1.2 → All other stories
Story 2.1 → Story 2.3 → Story 2.4 → Story 2.5
Story 3.1 → Story 3.2 → All learning activity stories
Story 5.1, 5.2 → Story 2.1
Story 6.1 → Story 6.2 → Story 6.3
```

---

## Personas

### Persona 1: Emma (Learner - Child)
- **Age**: 8 years old
- **Goal**: Learn Cantonese to talk with grandparents
- **Tech Savvy**: Medium (iPad user)
- **Motivation**: Fun activities and earning badges
- **Challenges**: Short attention span, needs visual/audio aids

### Persona 2: Danny (Teacher - Parent)
- **Age**: 35 years old
- **Goal**: Create customized Cantonese curriculum for children
- **Tech Savvy**: High (software developer)
- **Motivation**: Personalized education for kids
- **Challenges**: Limited time, wants AI assistance for content creation

### Persona 3: Sarah (Administrator)
- **Age**: 40 years old
- **Goal**: Ensure platform runs smoothly
- **Tech Savvy**: High
- **Motivation**: Help families learn together
- **Challenges**: Content quality control, user support
