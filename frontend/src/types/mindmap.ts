export interface Theme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
}

export interface MindmapNode {
  id: string;
  label: string;
  type: 'root' | 'concept';
  description?: string;
  children?: MindmapNode[];
}

export interface MindmapConnection {
  from: string;
  to: string;
  label: string;
}

export interface MindmapData {
  id: string;
  title: string;
  description: string;
  theme: Theme;
  nodes: MindmapNode[];
  connections: MindmapConnection[];
  createdAt?: string;
  lastModified?: string;
}

export interface MindmapComponentProps {
  mindmapData: MindmapData;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
} 