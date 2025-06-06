// Using string literal union type for better type safety
export type QuizSubtype = 'MCQ' | 'TrueFalse' | 'FillBlanks' | 'MatchFollowing';
export type InteractiveType = 'quiz' | 'flashcards' | 'mindmap' | 'timeline';

// Theme interface for consistent theming
export interface Theme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily: string;
  animation?: string;
  iconSet?: string;
}

// Base interface for all interactive content
export interface BaseInteractiveContent {
  id: string;
  type: InteractiveType;
  title: string;
  description: string;
  theme: Theme;
  createdAt: string;
  updatedAt: string;
}

export interface QuizData extends BaseInteractiveContent {
  type: 'quiz';
  subtype: QuizSubtype;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: string | string[];
    explanation: string;
  }>;
}

export interface FlashcardData extends BaseInteractiveContent {
  type: 'flashcards';
  cards: Flashcard[];
  difficulty?: 'easy' | 'medium' | 'hard';
  tags: string[];
  category: string;
}

// Flashcard data types
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags: string[];
  category: string;
  lastReviewed?: string;
  nextReviewDate?: string;
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MindmapData extends BaseInteractiveContent {
  type: 'mindmap';
  nodes: MindmapNode[];
  connections: MindmapConnection[];
}

export interface MindmapNode {
  id: string;
  label: string;
  type: 'root' | 'concept' | 'topic';
  children?: MindmapNode[];
  description?: string;
}

export interface MindmapConnection {
  from: string;
  to: string;
  label?: string;
}

export interface TimelineData {
  id: string;
  title: string;
  description: string;
  theme: Theme;
  events: TimelineEvent[];
  eras?: TimelineEra[];
  createdAt: string;
  lastModified: string;
}

export interface TimelineEvent {
  id: number;
  title: string;
  date: string;
  endDate?: string;
  description: string;
  category?: string;
  importance?: 'low' | 'medium' | 'high';
  media?: {
    type: 'image' | 'video' | 'audio';
    url: string;
    caption?: string;
  };
}

export interface TimelineEra {
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export type InteractiveData = FlashcardData | MindmapData | TimelineData;
