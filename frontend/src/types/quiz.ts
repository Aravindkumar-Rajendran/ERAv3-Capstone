// Quiz data interfaces for the CodingAgent module

export type QuizSubtype = 'MCQ' | 'TrueFalse' | 'FillBlanks' | 'MatchFollowing';

export interface Theme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  animation?: string;
  iconSet?: string;
}

export interface MCQQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation?: string;
}

export interface TrueFalseQuestion {
  id: number;
  statement: string;
  correctAnswer: boolean;
  hint?: string;
  explanation?: string;
}

export interface FillBlanksQuestion {
  id: number;
  sentence: string; // with blanks marked as [BLANK]
  correctAnswers: string[];
  hint?: string;
  explanation?: string;
}

export interface MatchPair {
  id: number;
  left: string;
  right: string;
}

export interface MatchFollowingQuestion {
  id: number;
  instruction: string;
  pairs: MatchPair[];
}

export interface QuizData {
  subtype: QuizSubtype;
  theme: Theme;
  title: string;
  description?: string;
  questions: MCQQuestion[] | TrueFalseQuestion[] | FillBlanksQuestion[] | MatchFollowingQuestion[];
  timeLimit?: number; // in minutes
  passingScore?: number; // percentage
}

export interface QuizComponentProps {
  quizData: QuizData;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (score: number, totalQuestions: number) => void;
} 