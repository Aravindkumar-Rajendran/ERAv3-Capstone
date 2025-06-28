# Implementation Plan for WhiZardLM React App

- [ ] **Phase 1: Project Setup & Boilerplate**
  - Initialize React App (Create React App or Vite) - Done
  - Set up folder structure: `components/`, `pages/`, `services/`, `utils/`, `types/`, `styles/`
  - Install dependencies (axios, react-router, UI library, etc.)
  - Set up global state management (Context API or Redux)

- [ ] **Phase 2: Upload & Input Page**
  - File upload (PDF, text)
  - Paste text area
  - Input for YouTube URL
  - Buttons: `Upload` (bottom), `Reset`
  - Handle file uploads and text input
  - Validate input types
  - Send data to backend via API
  - Show upload progress and error handling
  - On successful upload, enable navigation to Chat and Topics Generation

- [ ] **Phase 3: Chat Page**
  - Chat interface with user and WhiZard profiles
  - Message input box
  - Display chat history
  - Button: `Generate Magic` (triggers topic selection modal)
  - Fetch and display chat history from backend
  - Send/receive chat messages via backend API
  - Handle streaming or polling for new messages
  - On `Generate Magic`, open modal for topic selection

- [ ] **Phase 4: Topics Selection Modal**
  - Modal dialog with a list of topics (multi-select)
  - Button: `Generate Magic` (to generate interactive elements)
  - Fetch topics from backend
  - Allow multi-select
  - On button click, trigger backend call to generate interactive elements

- [ ] **Phase 5: Interactive Elements**
  - Three buttons: `Quiz`, `Mind Maps`, `Flashcards`, and `Back`
  - Each button opens a pop-up/modal with the respective interactive element
  - Pop-ups can be closed independently
  - Quiz Modal: Render MCQ, Fill in the Blanks, True/False, Match It (text-based)
  - Mindmap Modal: Render expandable mindmap graph
  - Flashcards Modal: Render flashcards with front, back, and hint
  - Back Button: Return to previous step or main dashboard

- [ ] **Phase 6: Iframe Rendering**
  - Render the UI (chat, topics, interactive elements) inside an iframe based on configuration and data from a JSON file
  - Fetch configuration/data JSON from backend
  - Dynamically render UI in iframe according to config

- [ ] **Phase 7: Integration & Polish**
  - Connect all frontend actions to backend routes
  - Handle loading, error, and empty states
  - Responsive design
  - Accessibility
  - Consistent theming
  - Unit and integration tests for components and services

- [ ] **Phase 8: Documentation & Deployment**
  - Update README with setup, usage, and contribution guidelines
  - Prepare for deployment (build scripts, environment variables, etc.) 