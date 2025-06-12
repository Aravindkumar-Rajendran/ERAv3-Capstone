export interface Theme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
}

export interface TimelineEvent {
  id: number;
  title: string;
  date: string;
  endDate?: string;
  description: string;
  category: string;
  importance: 'high' | 'medium' | 'low';
  media?: {
    type: 'image' | 'video';
    url: string;
    caption: string;
  };
}

export interface TimelineEra {
  name: string;
  startDate: string;
  startYear: number;
  endDate: string;
  endYear: number;
}

export interface TimelineData {
  id: string;
  title: string;
  description: string;
  theme: Theme;
  events: TimelineEvent[];
  eras: TimelineEra[];
  createdAt?: string;
  lastModified?: string;
}

export interface TimelineRejection {
  error: 'TIMELINE_NOT_SUITABLE';
  message: string;
}

export interface TimelineComponentProps {
  timelineData: TimelineData | TimelineRejection;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
} 