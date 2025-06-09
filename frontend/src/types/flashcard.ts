export interface Theme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
}

export interface FlashcardItem {
  id: number;
  front: string;
  back: string;
  hint?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export interface FlashcardData {
  id: string;
  title: string;
  description: string;
  theme: Theme;
  cards: FlashcardItem[];
  createdAt?: string;
  lastModified?: string;
}

export interface FlashcardComponentProps {
  flashcardData: FlashcardData;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
} 