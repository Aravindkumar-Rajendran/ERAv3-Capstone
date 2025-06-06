import { FlashcardData, MindmapData, MindmapNode, TimelineData, Theme } from '../types/interactive';

const now = new Date().toISOString();

const defaultTheme: Theme = {
  primaryColor: '#2196F3',
  secondaryColor: '#1976D2',
  backgroundColor: '#F5F5F5',
  textColor: '#212121',
  fontFamily: 'Arial, sans-serif',
  animation: 'fade',
};

export const generateDummyFlashcards = (): FlashcardData[] => {
  return [
    {
      id: 'card-1',
      question: 'What is the chemical symbol for water?',
      answer: 'H₂O',
      category: 'Chemistry',
      difficulty: 'easy',
    },
    {
      id: 'card-2',
      question: 'What is the powerhouse of the cell?',
      answer: 'Mitochondria',
      category: 'Biology',
      difficulty: 'easy',
    },
  ];
};
      id: 4,
      front: 'What is the chemical symbol for gold?',
      back: 'Au',
      hint: 'From the Latin word "aurum"',
      difficulty: 'easy' as const,
      tags: ['chemistry', 'elements']
    },
    {
      id: 5,
      front: 'What is the process by which plants make their own food?',
      back: 'Photosynthesis',
      hint: 'Involves sunlight, water, and carbon dioxide',
      difficulty: 'easy' as const,
      tags: ['biology', 'plants']
    }
  ],
  createdAt: now,
  lastModified: now
});

export const generateDummyMindmap = (): MindmapData => {
  const rootNode: MindmapNode = {
    id: 'root',
    label: 'Biology',
    type: 'root',
    description: 'The study of living organisms',
    children: [
      {
        id: 'cell',
        label: 'Cell Structure',
        type: 'concept',
        children: [
          { id: 'nucleus', label: 'Nucleus', type: 'concept' },
          { id: 'mitochondria', label: 'Mitochondria', type: 'concept' },
          { id: 'cell-membrane', label: 'Cell Membrane', type: 'concept' }
        ]
      },
      {
        id: 'genetics',
        label: 'Genetics',
        type: 'concept',
        children: [
          { id: 'dna', label: 'DNA', type: 'concept' },
          { id: 'rna', label: 'RNA', type: 'concept' },
          { id: 'chromosomes', label: 'Chromosomes', type: 'concept' }
        ]
      },
      {
        id: 'ecology',
        label: 'Ecology',
        type: 'concept',
        children: [
          { id: 'ecosystems', label: 'Ecosystems', type: 'concept' },
          { id: 'biodiversity', label: 'Biodiversity', type: 'concept' }
        ]
      }
    ]
  };

  return {
    id: 'mindmap-1',
    title: 'Biology Concepts',
    description: 'Mindmap of key biology concepts',
    theme: {
      ...defaultTheme,
      primaryColor: '#9C27B0',
      backgroundColor: '#F3E5F5',
      textColor: '#4A148C',
    },
    nodes: [rootNode],
    connections: [
      { from: 'nucleus', to: 'dna', label: 'contains' },
      { from: 'dna', to: 'rna', label: 'transcribes to' },
      { from: 'cell', to: 'genetics', label: 'leads to' },
      { from: 'cell', to: 'ecology', label: 'interacts with' }
    ],
    createdAt: now,
    lastModified: now
  };
};

export const generateDummyTimeline = (): TimelineData => ({
  id: 'timeline-1',
  title: 'World War II Events',
  description: 'Major events of World War II',
  theme: {
    ...defaultTheme,
    primaryColor: '#F44336',
    backgroundColor: '#FFEBEE',
    textColor: '#B71C1C',
  },
  events: [
    {
      id: 1,
      title: 'Invasion of Poland',
      date: '1939-09-01',
      endDate: '1939-10-06',
      description: 'Germany invades Poland, marking the start of World War II',
      category: 'military',
      importance: 'high' as const,
      media: {
        type: 'image' as const,
        url: 'path/to/invasion-poland.jpg',
        caption: 'German troops at the Polish border'
      }
    },
    {
      id: 2,
      title: 'Attack on Pearl Harbor',
      date: '1941-12-07',
      description: 'Japanese attack brings the United States into the war',
      category: 'military',
      importance: 'high' as const,
      media: {
        type: 'image' as const,
        url: 'path/to/pearl-harbor.jpg',
        caption: 'USS Arizona burning after the attack'
      }
    },
    {
      id: 3,
      title: 'D-Day',
      date: '1944-06-06',
      description: 'Allied forces land in Normandy, France',
      category: 'military',
      importance: 'high' as const
    },
    {
      id: 4,
      title: 'Atomic Bomb on Hiroshima',
      date: '1945-08-06',
      description: 'United States drops atomic bomb on Hiroshima, Japan',
      category: 'military',
      importance: 'high' as const,
      media: {
        type: 'image' as const,
        url: 'path/to/hiroshima.jpg',
        caption: 'Mushroom cloud over Hiroshima'
      }
    },
    {
      id: 5,
      title: 'Japan Surrenders',
      date: '1945-09-02',
      description: 'Japan signs the instrument of surrender, ending World War II',
      category: 'politics',
      importance: 'high' as const
    }
  ],
  eras: [
    {
      name: 'European Theater',
      startDate: '1939-09-01',
      endDate: '1945-05-08',
      description: 'War in Europe'
    },
    {
      name: 'Pacific Theater',
      startDate: '1941-12-07',
      endDate: '1945-09-02',
      description: 'War in the Pacific'
    }
  ],
  createdAt: now,
  lastModified: now
});
