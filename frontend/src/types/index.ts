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

// Export interactive component types (excluding Theme to avoid conflicts)
export type { TimelineData, TimelineEvent, TimelineEra, TimelineComponentProps } from './timeline';
export type { MindmapData, MindmapNode, MindmapConnection, MindmapComponentProps } from './mindmap';
export type { FlashcardData, FlashcardItem, FlashcardComponentProps } from './flashcard';