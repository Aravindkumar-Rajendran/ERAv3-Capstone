export interface Theme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
}

export interface MindmapNode {
  id: string;
  label: string;
  description: string;
  parent: string | null;
}

export interface MindmapLevel {
  level: number;
  title: string;
  nodes: MindmapNode[];
}

export interface MindmapData {
  id: string;
  title: string;
  description: string;
  theme: Theme;
  levels: MindmapLevel[];
  createdAt?: string;
  lastModified?: string;
}

export interface MindmapComponentProps {
  mindmapData: MindmapData;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
} 