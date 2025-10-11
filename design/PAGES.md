# LearnSpeak - Pages & UI Design

**Version**: 1.0  
**Date**: October 11, 2025  
**Design Style**: Playful, Child-Friendly, Green Color Theme

---

## Design Principles

1. **Simplicity First**: Intuitive navigation, minimal cognitive load
2. **Playful & Engaging**: Colorful, animated, gamified elements
3. **Child-Friendly**: Large buttons, clear icons, simple language
4. **Responsive**: Mobile-first approach, works on all devices
5. **Accessibility**: High contrast, readable fonts, ARIA labels

---

## Color Palette

### Primary Colors
- **Primary Green**: `#22c55e` (Bright Green)
- **Primary Dark**: `#16a34a` (Forest Green)
- **Primary Light**: `#86efac` (Light Green)

### Secondary Colors
- **Secondary Blue**: `#3b82f6` (Sky Blue)
- **Secondary Yellow**: `#fbbf24` (Golden Yellow)
- **Secondary Purple**: `#a855f7` (Lavender)
- **Secondary Orange**: `#fb923c` (Sunset Orange)

### Neutral Colors
- **Background**: `#f9fafb` (Light Gray)
- **Surface**: `#ffffff` (White)
- **Text Primary**: `#111827` (Dark Gray)
- **Text Secondary**: `#6b7280` (Medium Gray)
- **Border**: `#e5e7eb` (Light Border)

### Status Colors
- **Success**: `#10b981` (Green)
- **Error**: `#ef4444` (Red)
- **Warning**: `#f59e0b` (Amber)
- **Info**: `#3b82f6` (Blue)

---

## Typography

### Fonts
- **Primary Font**: 'Poppins' (Headings, Playful)
- **Secondary Font**: 'Inter' (Body text, Readable)
- **Cantonese Font**: 'Noto Sans TC' (Traditional Chinese)

### Font Sizes
- **Heading 1**: 2.5rem (40px) - Page titles
- **Heading 2**: 2rem (32px) - Section titles
- **Heading 3**: 1.5rem (24px) - Card titles
- **Body**: 1rem (16px) - Regular text
- **Small**: 0.875rem (14px) - Captions, labels
- **Large Text**: 1.25rem (20px) - Important info

---

## Component Library

### Buttons
```
Primary Button:
- Background: #22c55e
- Text: White
- Border Radius: 8px
- Padding: 12px 24px
- Hover: #16a34a
- Shadow: 0 2px 4px rgba(0,0,0,0.1)

Secondary Button:
- Background: White
- Text: #22c55e
- Border: 2px solid #22c55e
- Same dimensions as primary

Icon Button:
- Circular or square
- Icon only, 40x40px minimum
- Hover effect: scale(1.1)
```

### Cards
```
Standard Card:
- Background: White
- Border Radius: 16px
- Padding: 24px
- Shadow: 0 4px 6px rgba(0,0,0,0.1)
- Hover: lift effect (shadow increase)

Topic Card:
- Badge showing difficulty level
- Progress bar at bottom
- Icon or image at top
```

### Progress Indicators
```
Progress Bar:
- Height: 8px
- Background: #e5e7eb
- Fill: Gradient (#22c55e to #16a34a)
- Border Radius: 4px
- Animated fill transition

Circular Progress:
- Stroke width: 8px
- Size: 120px (desktop), 80px (mobile)
- Animated
```

### Badges & Achievements
```
Badge:
- Circular icon (64x64px)
- Colorful when earned
- Grayscale when locked
- Glow effect when newly earned
- Animation on award
```

---

## Page Layouts

---

## 1. Authentication Pages

### 1.1 Login Page
**Route**: `/login`  
**User Roles**: All (Public)

```
┌─────────────────────────────────────────────┐
│                                             │
│              🌟 LearnSpeak                  │
│         Learn Languages Playfully!          │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  Username: [________________]         │ │
│  │                                       │ │
│  │  Password: [________________]         │ │
│  │                                       │ │
│  │     [    Login    ]                  │ │
│  │                                       │ │
│  │  Don't have an account? Sign up →    │ │
│  └───────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

**Components**:
- LearnSpeak logo (playful design)
- Centered login form card
- Username input field
- Password input field (with show/hide toggle)
- Primary login button
- Link to registration page
- Friendly illustrations (books, stars, children learning)

---

### 1.2 Registration Page
**Route**: `/register`  
**User Roles**: All (Public)

```
┌─────────────────────────────────────────────┐
│              Create Account                 │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  Name:     [________________]         │ │
│  │                                       │ │
│  │  Username: [________________]         │ │
│  │                                       │ │
│  │  Email (optional):                   │ │
│  │            [________________]         │ │
│  │                                       │ │
│  │  Password: [________________]         │ │
│  │                                       │ │
│  │  I am a:   ○ Learner  ○ Teacher      │ │
│  │                                       │ │
│  │     [    Sign Up    ]                │ │
│  │                                       │ │
│  │  Already have an account? Login →    │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Components**:
- Form fields with validation
- Role selection (radio buttons)
- Password strength indicator
- Primary sign-up button
- Link to login page

---

## 2. Learner Pages

### 2.1 Learner Dashboard
**Route**: `/dashboard` or `/learner/home`  
**User Role**: Learner

```
┌─────────────────────────────────────────────────────────┐
│  ☰  LearnSpeak          🏆 Achievements    👤 Profile    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  👋 Welcome back, Emma!                                 │
│                                                         │
│  ┌──────────────────────┐  ┌──────────────────────┐   │
│  │  🎯 My Journeys      │  │  ⭐ Quick Stats      │   │
│  │                      │  │                      │   │
│  │  Active: 2           │  │  📚 Topics: 12/20   │   │
│  │  Completed: 1        │  │  ⏱️ Time: 45 mins   │   │
│  └──────────────────────┘  │  🎖️ Badges: 5       │   │
│                             └──────────────────────┘   │
│                                                         │
│  📚 My Learning Journeys                               │
│  ┌─────────────────────────────────────────────────┐  │
│  │  🚀 My First 100 Words             [Continue] ▶ │  │
│  │  ━━━━━━━━━━━━━━━━━━━━━░░░░░ 70%              │  │
│  │  📍 Topic 7 of 10: Animals                      │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  🌟 Daily Conversations            [Start] ▶   │  │
│  │  ━━━━░░░░░░░░░░░░░░░░░░░░░ 20%              │  │
│  │  📍 Topic 2 of 8: Greetings                    │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  🔖 Bookmarked Items        📝 Review Due (3 words)    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Components**:
- Top navigation bar with menu, achievements, profile
- Welcome message with user name
- Stats cards (journeys, topics, time, badges)
- Journey cards with:
  - Journey icon and name
  - Progress bar
  - Current topic indicator
  - Continue/Start button
- Quick access to bookmarks and SRS reviews

---

### 2.2 Journey Detail Page
**Route**: `/learner/journey/:id`  
**User Role**: Learner

```
┌─────────────────────────────────────────────────────────┐
│  ← Back      My First 100 Words                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🚀 My First 100 Words                                 │
│  Learn your first 100 Cantonese words through fun      │
│  topics and activities!                                │
│                                                         │
│  Overall Progress: ━━━━━━━━━━━━━━░░░░ 70%            │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  ✅ 1. Colors (Beginner)          Completed     │  │
│  │     10 words • Quiz: 100%                       │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  ✅ 2. Numbers (Beginner)         Completed     │  │
│  │     10 words • Quiz: 90%                        │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  ▶️ 3. Animals (Beginner)         [Continue] ▶  │  │
│  │     10 words • In Progress                      │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  🔒 4. Food (Beginner)            Locked        │  │
│  │     12 words • Complete Topic 3 to unlock       │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Components**:
- Journey header with title and description
- Overall progress bar
- List of topics in sequence:
  - ✅ Completed topics (green checkmark)
  - ▶️ Current topic (play icon, highlighted)
  - 🔒 Locked topics (lock icon, grayed out)
- Each topic card shows:
  - Level badge (Beginner/Intermediate/Advanced)
  - Word count
  - Quiz score (if completed)
  - Action button (Continue/Start/Locked)

---

### 2.3 Topic Learning Page
**Route**: `/learner/topic/:id`  
**User Role**: Learner

```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Journey              Topic: Animals          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🐾 Animals (Beginner)                                 │
│                                                         │
│  Choose an activity:                                   │
│                                                         │
│  ┌────────────────────┐  ┌────────────────────┐       │
│  │   📇 Flashcards   │  │  🗣️ Pronunciation  │       │
│  │                    │  │                    │       │
│  │   Practice with    │  │  Listen & Learn    │       │
│  │   interactive      │  │  pronunciations    │       │
│  │   cards            │  │                    │       │
│  │                    │  │                    │       │
│  │    [Start] ▶      │  │    [Start] ▶      │       │
│  └────────────────────┘  └────────────────────┘       │
│                                                         │
│  ┌────────────────────┐  ┌────────────────────┐       │
│  │  💬 Conversations  │  │   ✏️ Quiz          │       │
│  │                    │  │                    │       │
│  │   Practice         │  │  Test your         │       │
│  │   dialogues        │  │  knowledge         │       │
│  │                    │  │                    │       │
│  │    [Start] ▶      │  │   [Take Quiz] ▶   │       │
│  └────────────────────┘  └────────────────────┘       │
│                                                         │
│  📊 Your Progress:                                     │
│  Flashcards: ✅  Pronunciation: ✅  Conversations: ⏳  │
│  Quiz: Not started                                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Components**:
- Topic header with name and level badge
- 4 activity cards in grid layout:
  - Flashcards
  - Pronunciation Practice
  - Conversation Simulations
  - Quiz
- Each card has:
  - Icon
  - Title
  - Brief description
  - Start button
- Progress tracker showing completed activities

---

### 2.4 Flashcard Activity Page
**Route**: `/learner/activity/flashcard/:topicId`  
**User Role**: Learner

```
┌─────────────────────────────────────────────────────────┐
│  ✕ Exit                      Flashcards                 │
│                        Card 5 of 10                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                                                         │
│            ┌─────────────────────────┐                 │
│            │                         │                 │
│            │      [Image: Dog]       │                 │
│            │                         │                 │
│            │         Dog             │                 │
│            │         狗              │                 │
│            │        [gau²]           │                 │
│            │                         │                 │
│            │      🔊 [Listen]        │                 │
│            │                         │                 │
│            └─────────────────────────┘                 │
│                                                         │
│                                                         │
│       ← Previous          Next →                       │
│                                                         │
│       ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                  │
│       Progress: 50%                                    │
│                                                         │
│  [🔖 Bookmark]                     [Note icon]         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Components**:
- Exit button (top left)
- Progress indicator (Card X of Y)
- Large card with:
  - AI-generated image
  - English word
  - Cantonese characters
  - Romanization
  - Audio play button (large, prominent)
- Navigation buttons (Previous/Next)
- Progress bar at bottom
- Bookmark and note buttons

**Interactions**:
- Swipe left/right for navigation (mobile)
- Tap card to flip (optional front/back view)
- Auto-advance option

---

### 2.5 Quiz Activity Page
**Route**: `/learner/activity/quiz/:topicId`  
**User Role**: Learner

```
┌─────────────────────────────────────────────────────────┐
│  ✕ Exit                Quiz: Animals                    │
│                    Question 3 of 5                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━░░░░ 60%                       │
│                                                         │
│  What is "Cat" in Cantonese?                           │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  A) 狗 (gau²)                                   │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  B) 貓 (maau¹)                      [Selected]  │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  C) 鳥 (niu⁵)                                   │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  D) 魚 (jyu²)                                   │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│                                                         │
│               [    Submit Answer    ]                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**After Answer Submission**:
```
┌─────────────────────────────────────────────────────────┐
│  ✕ Exit                Quiz: Animals                    │
│                    Question 3 of 5                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ✅ Correct! Well done!                                │
│                                                         │
│  What is "Cat" in Cantonese?                           │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  B) 貓 (maau¹)                    ✅ CORRECT   │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  🔊 Listen to pronunciation                            │
│                                                         │
│                                                         │
│               [    Next Question    ]                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Quiz Results Page**:
```
┌─────────────────────────────────────────────────────────┐
│              🎉 Quiz Complete! 🎉                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                                                         │
│                ┌─────────────┐                         │
│                │             │                         │
│                │    90%      │                         │
│                │             │                         │
│                └─────────────┘                         │
│                                                         │
│          You got 9 out of 10 correct!                  │
│                                                         │
│  🎖️ Achievement Unlocked: Perfect Score!               │
│                                                         │
│  ┌──────────────────────────────────────┐             │
│  │  ✅ Question 1 - Correct             │             │
│  │  ✅ Question 2 - Correct             │             │
│  │  ❌ Question 3 - Incorrect           │             │
│  │  ✅ Question 4 - Correct             │             │
│  │  ✅ Question 5 - Correct             │             │
│  └──────────────────────────────────────┘             │
│                                                         │
│  [Back to Topic]  [Review Mistakes]  [Share] 📤       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Components**:
- Progress bar
- Question text (large, clear)
- 4 answer options as cards
- Visual feedback (green for correct, red for incorrect)
- Next button after answer
- Results screen with:
  - Score (large circular progress)
  - Achievement notification (if earned)
  - Question-by-question breakdown
  - Action buttons

---

### 2.6 Achievements Page
**Route**: `/learner/achievements`  
**User Role**: Learner

```
┌─────────────────────────────────────────────────────────┐
│  ← Back            🏆 My Achievements                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  You've earned 5 out of 20 badges!                     │
│  ━━━━━━━━━░░░░░░░░░░░░░░░░░░░░░░░░ 25%               │
│                                                         │
│  ✨ Recently Earned                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │   🎯    │  │   ⭐     │  │   📚     │            │
│  │ First    │  │ Perfect  │  │  Word    │            │
│  │ Topic    │  │  Score   │  │ Master   │            │
│  │          │  │          │  │   50     │            │
│  │ Oct 10   │  │ Oct 9    │  │ Oct 8    │            │
│  └──────────┘  └──────────┘  └──────────┘            │
│                                                         │
│  📊 All Achievements                                   │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │   🎯    │  │   🚀     │  │   ⭐     │  │   📚   ││
│  │ First    │  │ Journey  │  │ Perfect  │  │  Word  ││
│  │ Topic    │  │ Beginner │  │  Score   │  │ Master ││
│  │ EARNED   │  │ EARNED   │  │ EARNED   │  │   50   ││
│  └──────────┘  └──────────┘  └──────────┘  └────────┘│
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │   🔥    │  │   💯     │  │   🎓     │  │   🌟   ││
│  │ 7 Day    │  │  Quiz    │  │ Journey  │  │  Word  ││
│  │ Streak   │  │  Master  │  │  Expert  │  │ Master ││
│  │ LOCKED   │  │ LOCKED   │  │ LOCKED   │  │  100   ││
│  └──────────┘  └──────────┘  └──────────┘  └────────┘│
│                                                         │
│              [Share Achievements] 📤                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Components**:
- Progress toward all achievements
- Recently earned section (colorful, highlighted)
- Grid of all achievement badges
- Earned badges: full color with date
- Locked badges: grayscale with requirement text
- Share button for screenshot-friendly layout

---

### 2.7 Bookmarks Page
**Route**: `/learner/bookmarks`  
**User Role**: Learner

```
┌─────────────────────────────────────────────────────────┐
│  ← Back            🔖 My Bookmarks                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📚 Bookmarked Topics (2)   |   📝 Bookmarked Words (8)│
│  ─────────────────────────       ───────────────────── │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  🐾 Animals (Beginner)          [Practice] ▶   │  │
│  │  10 words • Last practiced: 2 days ago          │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  🍎 Food (Beginner)             [Practice] ▶   │  │
│  │  12 words • Last practiced: 5 days ago          │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│                                                         │
│  📝 Words:                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │   [Image]    │  │   [Image]    │  │   [Image]    ││
│  │              │  │              │  │              ││
│  │   Cat        │  │   Dog        │  │   Bird       ││
│  │   貓         │  │   狗         │  │   鳥         ││
│  │   (maau¹)    │  │   (gau²)     │  │   (niu⁵)     ││
│  │              │  │              │  │              ││
│  │  🔊  🗑️     │  │  🔊  🗑️     │  │  🔊  🗑️     ││
│  └──────────────┘  └──────────────┘  └──────────────┘│
│                                                         │
│            [Practice All Bookmarks] ▶                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Components**:
- Tab navigation (Topics / Words)
- Bookmarked topic list with practice button
- Bookmarked words in card grid
- Each word card with audio and remove bookmark button
- Practice all button for flashcard review

---

### 2.8 Profile Page
**Route**: `/profile`  
**User Role**: All

```
┌─────────────────────────────────────────────────────────┐
│  ← Back              👤 My Profile                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌────────────────────────────────────────────┐        │
│  │        ┌──────────┐                        │        │
│  │        │  Photo   │         Emma           │        │
│  │        │  Upload  │                        │        │
│  │        └──────────┘         Learner        │        │
│  │                                            │        │
│  │  📧 emma@email.com                        │        │
│  │  📅 Joined: Sep 2025                      │        │
│  └────────────────────────────────────────────┘        │
│                                                         │
│  📊 Learning Stats                                     │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Total Learning Time:    5 hours 30 mins        │ │
│  │  Topics Completed:       7                      │ │
│  │  Journeys Completed:     1                      │ │
│  │  Quiz Average:           87%                    │ │
│  │  Words Learned:          85                     │ │
│  │  Achievements:           5 badges               │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│  ⚙️ Settings                                           │
│  ┌──────────────────────────────────────────────────┐ │
│  │  [  Change Name  ]                              │ │
│  │  [  Change Password  ]                          │ │
│  │  [  Upload Profile Picture  ]                   │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
│  🚪 [  Logout  ]                                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Teacher Pages

### 3.1 Teacher Dashboard
**Route**: `/teacher/dashboard`  
**User Role**: Teacher

```
┌─────────────────────────────────────────────────────────┐
│  ☰  LearnSpeak    📚 Content   📊 Analytics   👤 Profile│
├─────────────────────────────────────────────────────────┤
│                                                         │
│  👋 Welcome, Danny!                                    │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ 📝 Words     │  │ 📚 Topics    │  │ 🗺️ Journeys  │ │
│  │              │  │              │  │              │ │
│  │    127       │  │     15       │  │      3       │ │
│  │ [+ Add New]  │  │ [+ Create]   │  │ [+ Create]   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  👥 My Students (5)                                    │
│  ┌─────────────────────────────────────────────────┐  │
│  │  Emma    │ 2 Journeys │ 70% Progress │ [View] → │  │
│  │  Alex    │ 1 Journey  │ 45% Progress │ [View] → │  │
│  │  Sophie  │ 2 Journeys │ 90% Progress │ [View] → │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  📊 Quick Stats                                        │
│  - Most practiced topic: Animals                       │
│  - Average quiz score: 85%                             │
│  - Total learning time this week: 12 hours             │
│                                                         │
│  ⚡ Quick Actions                                      │
│  [+ Create Word with AI]  [+ Create Topic]            │
│  [📤 Assign Journey]      [📊 View Analytics]          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Components**:
- Top navigation with sections
- Summary cards (words, topics, journeys)
- Student list with progress
- Quick stats
- Quick action buttons

---

### 3.2 Word Management Page
**Route**: `/teacher/words`  
**User Role**: Teacher

```
┌─────────────────────────────────────────────────────────┐
│  ← Dashboard        📝 Vocabulary Management            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [+ Create New Word with AI]      🔍 [Search...]       │
│                                                         │
│  Showing 127 words                      Sort by: ▼     │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  [Image] Cat    貓 (maau¹)        🔊 🖊️ 🗑️    │  │
│  │  Created: Oct 10 • Used in 2 topics             │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  [Image] Dog    狗 (gau²)         🔊 🖊️ 🗑️    │  │
│  │  Created: Oct 10 • Used in 1 topic              │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  [Image] Bird   鳥 (niu⁵)         🔊 🖊️ 🗑️    │  │
│  │  Created: Oct 9 • Used in 1 topic               │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  [Load More...]                                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### 3.3 Create Word with AI Page
**Route**: `/teacher/words/create`  
**User Role**: Teacher

```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Words      ✨ Create New Word with AI       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Step 1: Enter Word Information                        │
│  ┌───────────────────────────────────────────────┐    │
│  │  English:      [________________]             │    │
│  │                                               │    │
│  │  Cantonese:    [________________]             │    │
│  │                                               │    │
│  │  Romanization: [________________]             │    │
│  │                                               │    │
│  │  Notes (optional): [___________________]      │    │
│  └───────────────────────────────────────────────┘    │
│                                                         │
│  Step 2: Generate Audio & Image                       │
│  ┌───────────────────────────────────────────────┐    │
│  │  🔊 Audio Pronunciation                       │    │
│  │  ┌─────────────────────────────────────────┐ │    │
│  │  │  [  Generate Audio with AI  ]  🔊 Play  │ │    │
│  │  │  or [Upload Custom Audio]               │ │    │
│  │  └─────────────────────────────────────────┘ │    │
│  │                                               │    │
│  │  🖼️ Vocabulary Image                         │    │
│  │  ┌─────────────────────────────────────────┐ │    │
│  │  │                                         │ │    │
│  │  │      [Generated Image Preview]          │ │    │
│  │  │                                         │ │    │
│  │  │  [Regenerate]  [Upload Custom]          │ │    │
│  │  └─────────────────────────────────────────┘ │    │
│  └───────────────────────────────────────────────┘    │
│                                                         │
│            [Cancel]     [Save Word]                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Components**:
- Step-by-step form
- Input fields for word data
- AI generation buttons with loading states
- Preview panels for audio and image
- Regenerate and custom upload options
- Save/Cancel actions

---

### 3.4 Topic Creation Page
**Route**: `/teacher/topics/create`  
**User Role**: Teacher

```
┌─────────────────────────────────────────────────────────┐
│  ← Back              📚 Create New Topic                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Topic Details                                         │
│  ┌───────────────────────────────────────────────┐    │
│  │  Name:  [________________]                    │    │
│  │                                               │    │
│  │  Description: [_______________________]       │    │
│  │                                               │    │
│  │  Level:  ○ Beginner  ○ Intermediate         │    │
│  │          ○ Advanced                          │    │
│  └───────────────────────────────────────────────┘    │
│                                                         │
│  Select Words (5 selected)                            │
│  🔍 [Search words...]                                  │
│                                                         │
│  Available Words:                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │  Cat ✅  │  │  Dog ✅  │  │  Bird ✅ │  │ Fish   ││
│  │  貓      │  │  狗      │  │  鳥      │  │  魚    ││
│  └──────────┘  └──────────┘  └──────────┘  └────────┘│
│                                                         │
│  Selected Words (Drag to reorder):                    │
│  ┌─────────────────────────────────────────────────┐  │
│  │  1. ≡ Cat 貓                              [×]  │  │
│  │  2. ≡ Dog 狗                              [×]  │  │
│  │  3. ≡ Bird 鳥                             [×]  │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│            [Cancel]     [Create Topic]                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### 3.5 Journey Creation Page
**Route**: `/teacher/journeys/create`  
**User Role**: Teacher

```
┌─────────────────────────────────────────────────────────┐
│  ← Back              🗺️ Create Learning Journey        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Journey Details                                       │
│  ┌───────────────────────────────────────────────┐    │
│  │  Name:  [________________]                    │    │
│  │                                               │    │
│  │  Description: [_______________________]       │    │
│  └───────────────────────────────────────────────┘    │
│                                                         │
│  Select Topics (3 selected)                           │
│  🔍 [Search topics...]                                 │
│                                                         │
│  Available Topics:                                     │
│  ┌─────────────────┐  ┌─────────────────┐            │
│  │  Colors ✅      │  │  Numbers ✅     │            │
│  │  Beginner       │  │  Beginner       │            │
│  │  10 words       │  │  10 words       │            │
│  └─────────────────┘  └─────────────────┘            │
│                                                         │
│  Journey Path (Topics will be completed in order):    │
│  ┌─────────────────────────────────────────────────┐  │
│  │  1. ≡ Colors (Beginner)                   [×]  │  │
│  │     10 words                                    │  │
│  │  2. ≡ Numbers (Beginner)                  [×]  │  │
│  │     10 words                                    │  │
│  │  3. ≡ Animals (Beginner)                  [×]  │  │
│  │     10 words                                    │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  💡 AI Suggestion: Consider adding "Family" topic     │
│     between "Numbers" and "Animals" for better flow.   │
│                                                         │
│            [Cancel]     [Create Journey]               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### 3.6 Assign Journey Page
**Route**: `/teacher/assign`  
**User Role**: Teacher

```
┌─────────────────────────────────────────────────────────┐
│  ← Back              📤 Assign Journey                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Select Journey                                        │
│  ┌───────────────────────────────────────────────┐    │
│  │  ▼ My First 100 Words                        │    │
│  └───────────────────────────────────────────────┘    │
│                                                         │
│  Journey Preview:                                      │
│  - 10 topics (Beginner level)                         │
│  - 100 words total                                     │
│  - Estimated time: 5-7 hours                          │
│                                                         │
│  Select Students (2 selected)                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  ☑️ Emma                                        │  │
│  │  ☐ Alex (Already assigned)                     │  │
│  │  ☑️ Sophie                                      │  │
│  │  ☐ Michael                                      │  │
│  │  ☐ Lisa                                         │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  📝 Optional Message to Students:                     │
│  ┌───────────────────────────────────────────────┐    │
│  │  [_________________________________]          │    │
│  │                                               │    │
│  └───────────────────────────────────────────────┘    │
│                                                         │
│            [Cancel]     [Assign Journey]               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### 3.7 Teacher Analytics Page
**Route**: `/teacher/analytics`  
**User Role**: Teacher

```
┌─────────────────────────────────────────────────────────┐
│  ← Dashboard         📊 Student Analytics               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Filter: [All Students ▼]  [All Topics ▼]  [Last 30d ▼]│
│                                                         │
│  📈 Overview                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Avg Progress │  │ Avg Accuracy │  │ Total Time   │ │
│  │     68%      │  │     85%      │  │   12 hours   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  👥 Student Performance                                │
│  ┌─────────────────────────────────────────────────┐  │
│  │                                                 │  │
│  │     [Bar Chart: Completion Rate by Student]    │  │
│  │                                                 │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  📚 Topic Performance                                  │
│  ┌─────────────────────────────────────────────────┐  │
│  │  Topic       │ Attempts │ Avg Score │ Avg Time │  │
│  │──────────────┼──────────┼───────────┼──────────│  │
│  │  Animals     │    5     │   90%     │  12 min  │  │
│  │  Colors      │    5     │   95%     │  10 min  │  │
│  │  Numbers     │    4     │   80%     │  15 min  │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ⏱️ Learning Activity (Last 7 Days)                    │
│  ┌─────────────────────────────────────────────────┐  │
│  │                                                 │  │
│  │     [Line Chart: Daily Active Time]            │  │
│  │                                                 │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Admin Pages

### 4.1 Admin Dashboard
**Route**: `/admin/dashboard`  
**User Role**: Administrator

```
┌─────────────────────────────────────────────────────────┐
│  ☰  Admin Panel     👥 Users   📚 Content   📊 Analytics│
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🔧 System Overview                                    │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ 👥 Users     │  │ 📚 Content   │  │ 📊 Activity  │ │
│  │    12        │  │  Words: 127  │  │  Sessions:   │ │
│  │ Learners: 8  │  │ Topics: 15   │  │    45        │ │
│  │ Teachers: 3  │  │Journeys: 3   │  │  This week   │ │
│  │ Admins: 1    │  │              │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  ⚡ Quick Actions                                      │
│  [+ Create User]  [View All Content]  [System Logs]   │
│                                                         │
│  📈 Platform Metrics                                   │
│  ┌─────────────────────────────────────────────────┐  │
│  │  Total Learning Time: 50 hours                  │  │
│  │  Quizzes Taken: 85                              │  │
│  │  Average Quiz Score: 85%                        │  │
│  │  Active Users (Last 7 Days): 8                  │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  🎯 Most Popular Topics                               │
│  1. Animals (25 completions)                          │
│  2. Colors (22 completions)                           │
│  3. Numbers (20 completions)                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### 4.2 User Management Page
**Route**: `/admin/users`  
**User Role**: Administrator

```
┌─────────────────────────────────────────────────────────┐
│  ← Dashboard         👥 User Management                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [+ Create New User]         🔍 [Search users...]      │
│                                                         │
│  Filter: [All Roles ▼]      Showing 12 users          │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Name   │ Username │ Role    │ Status │ Actions │  │
│  │────────┼──────────┼─────────┼────────┼─────────│  │
│  │ Emma   │ emma01   │ Learner │ Active │ 🖊️ 🗑️  │  │
│  │ Danny  │ danny    │ Teacher │ Active │ 🖊️ 🗑️  │  │
│  │ Alex   │ alex     │ Learner │ Active │ 🖊️ 🗑️  │  │
│  │ Admin  │ admin    │ Admin   │ Active │ 🖊️      │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  [1] [2] [3] Next →                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Responsive Design Breakpoints

### Mobile (< 768px)
- Single column layouts
- Bottom navigation for learners
- Hamburger menu
- Full-width cards
- Stacked activity buttons

### Tablet (768px - 1024px)
- Two-column grid for cards
- Side navigation
- Moderate card sizing

### Desktop (> 1024px)
- Multi-column layouts
- Persistent side navigation
- Larger cards and images
- Dashboard widgets in grid

---

## 6. Common UI Components

### Navigation Bar (Top)
```
[☰ Menu]  LearnSpeak Logo   [🏆] [👤]
```

### Bottom Navigation (Mobile - Learner)
```
[🏠 Home] [📚 Learn] [🔖 Saved] [🏆 Achievements] [👤 Profile]
```

### Loading States
- Skeleton screens for cards
- Spinner for API calls
- Progress bars for uploads

### Empty States
- Friendly illustrations
- Call-to-action buttons
- Helpful messages

### Error States
- Clear error messages
- Retry buttons
- Support contact info

---

## 7. Animations & Interactions

### Micro-interactions
- Button hover: scale(1.05)
- Card hover: lift shadow
- Success: checkmark animation
- Achievement: confetti effect
- Quiz correct: green pulse
- Quiz incorrect: red shake

### Page Transitions
- Fade in/out
- Slide for sequential content
- Scale for modals

### Loading
- Skeleton screens (preferred)
- Spinners for quick loads
- Progress bars for uploads

---

## 8. Accessibility

### Requirements
- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus indicators
- Alt text for all images
- High contrast mode compatible
- Screen reader friendly
- Minimum tap target: 44x44px

### Color Contrast
- Text: minimum 4.5:1 ratio
- Large text: minimum 3:1 ratio
- Interactive elements: clear visual distinction

---

## Design Assets Needed

### Icons
- Topic icons (animals, colors, numbers, food, etc.)
- Achievement badges (25+ designs)
- Activity icons (flashcard, quiz, pronunciation, conversation)
- Navigation icons
- Status icons (lock, checkmark, play, etc.)

### Illustrations
- Empty states
- Success/completion screens
- Error states
- Onboarding screens
- Achievement celebrations

### Audio
- Success sounds
- Error sounds
- Achievement unlocked sound
- Button click sounds (optional)

---

## Technical Implementation Notes

### Frontend Framework
- React + TypeScript
- Component library: Material-UI or shadcn/ui
- Styling: TailwindCSS
- Icons: Lucide Icons or Heroicons
- Animations: Framer Motion

### State Management
- React Context for auth
- React Query for server state
- Local state with useState/useReducer

### Routing
- React Router v6
- Protected routes
- Role-based access

---

**This design document provides a comprehensive blueprint for all pages in the LearnSpeak platform. Actual implementation should follow these designs while allowing for iterative improvements based on user testing.**
