// Centralized API routes and base URL

export const BASE_URL = "http://192.168.1.7:8000";

export const ROUTES = {
  PROJECTS: `${BASE_URL}/projects`,
  SOURCES: (projectId: string) => `${BASE_URL}/sources?project_id=${projectId}`,
  CONVERSATIONS: (conversationId: string) => `${BASE_URL}/conversations/${conversationId}`,
  AUTH_CONVERSATIONS: (projectId: string) => `${BASE_URL}/auth/conversations?project_id=${projectId}`,
  UPLOAD: `${BASE_URL}/upload`,
  TOPICS: (id: string) => `${BASE_URL}/topics/${id}`,
  CHAT: `${BASE_URL}/chat`,
  NEW_CONVERSATION: `${BASE_URL}/conversations/new`,
  INTERACT_HISTORY: (projectId: string) => `${BASE_URL}/interact-history?project_id=${projectId}`,
  INTERACT_CONTENT: (interactId: string) => `${BASE_URL}/interact-content/${interactId}`,
  INTERACT_QUIZ: `${BASE_URL}/interact-quiz`,
  INTERACT_TIMELINE: `${BASE_URL}/interact-timeline`,
  INTERACT_MINDMAP: `${BASE_URL}/interact-mindmap`,
  INTERACT_FLASHCARD: `${BASE_URL}/interact-flashcard`,
}; 