// src/types/index.ts

export interface ComponentProps {
    title: string;
    isActive: boolean;
}

export interface User {
    id: number;
    name: string;
    email: string;
}

export type Status = 'active' | 'inactive' | 'pending';

// Export all quiz types
export * from './quiz';

// Export flashcard types (with prefix to avoid conflicts)
export type { 
  Theme as FlashcardTheme,
  FlashcardItem,
  FlashcardData,
  FlashcardComponentProps
} from './flashcard';

// Export timeline types
export type {
  Theme as TimelineTheme,
  TimelineEvent,
  TimelineEra,
  TimelineData,
  TimelineComponentProps
} from './timeline';

// Export mindmap types
export type {
  Theme as MindmapTheme,
  MindmapNode,
  MindmapConnection,
  MindmapData,
  MindmapComponentProps
} from './mindmap';