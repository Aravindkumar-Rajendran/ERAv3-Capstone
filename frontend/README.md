# WhiZardLM
An interactive educational platform that transforms user content into engaging learning experiences through multiple interactive formats including quizzes, timelines, mind maps, and flashcards.

NotebookLM for School Students - AI education platform that helps students to learn in an interactive way. 

## Pages

- Home (NCERT book catalog)
- Chat (Chat dashboard and Upload sources)
- Interactive Playground (Interactive components)

## Features

NCERT book library - we embed all the books for NCERT and store it in vector DB
 -> Select book and chapter to access the content and move to chat interface
 -> Or Upload your own content (Text, Pdf, YouTube video URL)

Chat Interface
-> Chat interface 
-> Ask questions

Interactive Playground 
-> Generates interactive web pages for below content types. 
      - Quizzes - MCQ, Fill in the blanks, True/False, Match it (text based) - Various UI styles (popup, plain click)
      - Mindmaps
      - Flashcards
      - Timeline (graphs)


## Project Structure

```
frontend/
├── public/                 # Static files
│   ├── index.html          # Main HTML template
│   └── assets/             # Images, fonts, and other static files
│
├── src/
│   ├── assets/             # Global static assets
│   │   ├── images/         # Image assets
│   │   ├── fonts/          # Font files
│   │   └── styles/         # Global styles and themes
│   │
│   ├── components/        # Reusable UI components
│   │   ├── common/         # Common components (Button, Input, etc.)
│   │   ├── layout/         # Layout components (Header, Footer, Sidebar)
│   │   └── ui/             # UI components specific to features
│   │
│   ├── features/          # Feature-based modules
│   │   ├── quiz/           # Quiz feature components
│   │   ├── timeline/       # Timeline feature components
│   │   ├── mindmap/        # Mindmap feature components
│   │   └── flashcards/     # Flashcard components
│   │
│   ├── layouts/           # Page layout components
│   │   ├── MainLayout/     # Main application layout
│   │   └── AuthLayout/     # Authentication layout
│   │
│   ├── pages/             # Page components
│   │   ├── Home/           # Home page
│   │   ├── Dashboard/      # User dashboard
│   │   └── ...
│   │
│   ├── services/          # API and service integrations
│   │   ├── api/            # API clients and configurations
│   │   ├── auth/           # Authentication services
│   │   └── storage/        # Local/session storage utilities
│   │
│   ├── store/             # State management
│   │   ├── slices/         # Redux slices
│   │   └── hooks/          # Custom hooks
|   |
│   ├── specs/               # Specification files
|   |   ├── quiz/           # Quiz feature specifications
|   |   ├── timeline/       # Timeline feature specifications
|   |   ├── mindmap/        # Mindmap feature specifications
|   |   └── flashcards/     # Flashcard specifications
│   │
│   ├── types/             # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── constants/          # Application constants
│   ├── hooks/              # Custom React hooks
│   ├── contexts/           # React contexts
│   ├── routes/             # Application routes
│   ├── App.tsx             # Root component
│   └── index.tsx           # Application entry point
│
├── .env                  # Environment variables
├── package.json           # Project dependencies
├── tsconfig.json          # TypeScript configuration
└── README.md              # Project documentation
```

### Key Directories Explained

- **/public**: Contains static assets that will be served as-is
- **/src/assets**: Global static assets used across the application
- **/src/components**: Reusable UI components organized by type
- **/src/features**: Self-contained feature modules with their own components and logic
- **/src/layouts**: Page layout components that define the overall structure
- **/src/pages**: Page components that represent routes
- **/src/services**: API clients, authentication, and other services
- **/src/store**: State management (Redux, Zustand, etc.)
- **/src/types**: TypeScript type definitions
- **/src/utils**: Utility and helper functions

### Technologies Used
- React
- Redux
- TypeScript
- React Router
- MUI (Material-UI)

# Development Plan

## Phase 1: Project Setup & Core Infrastructure

### 1.1 Project Initialization
- [ ] Set up TypeScript configuration
- [ ] Configure ESLint, Prettier, and Husky
- [ ] Set up Redux Toolkit with RTK Query
- [ ] Configure React Router v6
- [ ] Set up MUI theming and global styles

### 1.2 Authentication & User Management
- [ ] Implement auth context and hooks
- [ ] Create login/signup pages
- [ ] Set up protected routes
- [ ] Implement JWT token management

## Phase 2: Core Features

### 2.1 NCERT Book Browser
- [ ] Create book catalog component
- [ ] Implement chapter navigation
- [ ] Add search and filter functionality
- [ ] Design responsive book viewer

### 2.2 Chat Interface
- [ ] Implement chat message components
- [ ] Create message input with file upload
- [ ] Add support for different message types (text, PDF, YouTube)
- [ ] Implement message history and persistence

## Phase 3: Interactive Components

### 3.1 Quiz System
- [ ] Implement MCQ component
- [ ] Create True/False component
- [ ] Add Fill-in-the-blanks
- [ ] Develop Matching questions
- [ ] Add scoring and feedback system

### 3.2 Mindmap
- [ ] Create interactive node system
- [ ] Implement zoom/pan functionality
- [ ] Add node creation/editing
- [ ] Implement auto-layout algorithms

### 3.3 Flashcards
- [ ] Create flashcard component
- [ ] Implement flip animation
- [ ] Add deck management
- [ ] Create study mode with spaced repetition

### 3.4 Timeline
- [ ] Implement horizontal timeline
- [ ] Add event cards with media support
- [ ] Create era visualization
- [ ] Add zoom/pan controls

## Phase 4: Integration & Polish

### 4.1 Backend Integration
- [ ] Set up API services
- [ ] Implement file upload
- [ ] Add error handling and loading states
- [ ] Set up API for real-time updates

### 4.2 Performance Optimization
- [ ] Implement code splitting
- [ ] Add lazy loading for routes
- [ ] Optimize bundle size
- [ ] Add loading skeletons

### 4.3 Testing
- [ ] Write unit tests for components
- [ ] Add integration tests
- [ ] Implement E2E tests with Cypress

### 4.4 Documentation & Polish
- [ ] Write component documentation
- [ ] Add JSDoc comments
- [ ] Create user guide
- [ ] Polish animations and transitions

## Technical Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit + RTK Query
- **Styling**: MUI v5 + Emotion
- **Routing**: React Router v6
- **Form Handling**: React Hook Form
- **Data Visualization**: D3.js (for mindmaps/timelines)
- **Testing**: Jest + React Testing Library + Cypress

### Backend (Future Scope)
- **API**: FastAPI
- **Database**: PostgreSQL + pgvector
- **Search**: Elasticsearch
- **Storage**: AWS S3
- **AI/ML**: OpenAI API, LangChain

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd frontend
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Start the development server:
   ```
   npm start
   ```

## Usage

After starting the development server, open your browser and navigate to `http://localhost:3000` to view the application.

