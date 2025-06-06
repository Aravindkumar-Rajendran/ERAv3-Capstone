import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiFileText, FiCheckCircle, FiX, FiLoader, FiPlus, FiAlertCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

// Import components
import { Quiz } from '../components/quiz/Quiz';
import { Flashcard } from '../components/flashcard/Flashcard';
import { Mindmap } from '../components/mindmap';
import { Timeline } from '../components/timeline';

interface MindmapNode {
  id: string;
  label: string;
  children?: MindmapNode[];
}

interface MindmapData {
  id: string;
  label: string;
  children?: MindmapNode[];
}

// Import types and interfaces
import { 
  QuizData, 
  QuizSubtype, 
  FlashcardData, 
  MindmapData, 
  TimelineEvent, 
  Theme, 
  InteractiveType 
} from '../types/interactive';

interface InteractiveOption {
  type: InteractiveType;
  label: string;
  icon: string;
  color: string;
}

export const WhizardPage = () => {
  // Form state
  const [userContent, setUserContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for interactive components
  const [activeQuiz, setActiveQuiz] = useState<QuizData | null>(null);
  const [activeFlashcards, setActiveFlashcards] = useState<FlashcardData | null>(null);
  const [activeMindmap, setActiveMindmap] = useState<MindmapData | null>(null);
  const [activeTimeline, setActiveTimeline] = useState<TimelineEvent[]>([]);
  
  // Modal states
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);
  const [isMindmapOpen, setIsMindmapOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  
  // Track current quiz index for cycling through quiz types
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  
  // Interactive options
  const interactiveOptions: InteractiveOption[] = [
    { type: 'quiz', label: 'Quiz', icon: '📝', color: 'bg-blue-500 hover:bg-blue-600' },
    { type: 'flashcards', label: 'Flashcards', icon: '🔖', color: 'bg-green-500 hover:bg-green-600' },
    { type: 'mindmap', label: 'Mind Map', icon: '🗺️', color: 'bg-purple-500 hover:bg-purple-600' },
    { type: 'timeline', label: 'Timeline', icon: '⏳', color: 'bg-yellow-500 hover:bg-yellow-600' },
  ];

  const handleGenerateElements = () => {
    if (!userContent.trim() && !selectedFile) {
      alert('Please enter some content or upload a file first!');
      return;
    }
    setIsLoading(true);
    // Simulate processing time
    setTimeout(() => {
      setIsLoading(false);
      setShowOptions(true);
    }, 1500);
  };

  const handleOptionClick = (option: { id: string; name: string; icon: string; color: string; label: string }) => {
    try {
      setIsLoading(true);
      setError(null);

      // Generate dummy data based on the selected option
      switch (option.id) {
        case 'quiz': {
          const quizData = generateDummyQuizJSON();
          setActiveQuiz(quizData);
          setIsQuizOpen(true);
          break;
        }
        case 'flashcards': {
          const flashcardData = generateDummyFlashcardJSON();
          setActiveFlashcards(flashcardData);
          setIsFlashcardsOpen(true);
          break;
        }
        case 'mindmap': {
          const mindmapData = generateDummyMindmapJSON();
          setActiveMindmap(mindmapData);
          setIsMindmapOpen(true);
          break;
        }
        case 'timeline': {
          const timelineData = generateDummyTimelineJSON();
          setActiveTimeline(timelineData);
          setIsTimelineOpen(true);
          break;
        }
        default:
          console.warn('Unknown option:', option.id);
      }
    } catch (error) {
      console.error('Error generating interactive content:', error);
      setError('Failed to generate interactive content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizClose = () => {
    setIsQuizOpen(false);
    setActiveQuiz(null);
  };

  const handleQuizComplete = (score: number) => {
    console.log(`Quiz completed! Score: ${score}`);
    // Handle quiz completion logic here
  };

  const generateDummyQuizJSON = (): QuizData => {
    const subtypes: QuizSubtype[] = ['MCQ', 'TrueFalse', 'FillBlanks', 'MatchFollowing'];
    const currentSubtype = subtypes[currentQuizIndex % subtypes.length];
    
    // Common theme properties
    const theme: Theme = {
      primaryColor: '#4f46e5',
      secondaryColor: '#818cf8',
      fontFamily: 'Inter, sans-serif'
    };
    
    const now = new Date().toISOString();
    
    switch (currentSubtype) {
      case 'MCQ':
        return {
          id: `quiz-${Date.now()}`,
          type: 'quiz',
          subtype: 'MCQ',
          title: 'Sample MCQ Quiz',
          description: 'Test your knowledge with multiple choice questions',
          theme,
          questions: [
            {
              id: 'q1',
              question: 'What is the capital of France?',
              options: ['London', 'Berlin', 'Paris', 'Madrid'],
              correctAnswer: 'Paris',
              explanation: 'Paris is the capital of France.'
            },
            {
              id: 'q2',
              question: 'Which planet is known as the Red Planet?',
              options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
              correctAnswer: 'Mars',
              explanation: 'Mars is often called the Red Planet due to its reddish appearance.'
            }
          ],
          createdAt: now,
          updatedAt: now
        };
      
      case 'TrueFalse':
        return {
          id: `quiz-${Date.now()}`,
          type: 'quiz',
          subtype: 'TrueFalse',
          title: 'Sample True/False Quiz',
          description: 'Test your knowledge with true/false questions',
          theme: {
            ...theme,
            primaryColor: '#10b981',
            secondaryColor: '#6ee7b7'
          },
          questions: [
            {
              id: 'q1',
              question: 'The Earth is flat.',
              options: ['True', 'False'],
              correctAnswer: 'False',
              explanation: 'The Earth is an oblate spheroid, not flat.'
            },
            {
              id: 'q2',
              question: 'The Great Wall of China is visible from space.',
              options: ['True', 'False'],
              correctAnswer: 'False',
              explanation: 'The Great Wall is generally not visible to the naked eye from space.'
            }
          ],
          createdAt: now,
          updatedAt: now
        };

      case 'FillBlanks':
        return {
          id: `quiz-${Date.now()}`,
          type: 'quiz',
          subtype: 'FillBlanks',
          title: 'Sample Fill in the Blanks',
          description: 'Test your knowledge by filling in the blanks',
          theme: {
            ...theme,
            primaryColor: '#f59e0b',
            secondaryColor: '#fbbf24'
          },
          questions: [
            {
              id: 'q1',
              question: 'The capital of France is ________.',
              options: ['Paris'],
              correctAnswer: 'Paris',
              explanation: 'Paris is the capital of France.'
            },
            {
              id: 'q2',
              question: 'The chemical symbol for gold is ________.',
              options: ['Au'],
              correctAnswer: 'Au',
              explanation: 'Au is the chemical symbol for gold from the Latin "aurum."'
            }
          ],
          createdAt: now,
          updatedAt: now
        };
      
      case 'MatchFollowing':
        return {
          id: `quiz-${Date.now()}`,
          type: 'quiz',
          subtype: 'MatchFollowing',
          title: 'Sample Matching Quiz',
          description: 'Test your knowledge by matching related items',
          theme: {
            ...theme,
            primaryColor: '#8b5cf6',
            secondaryColor: '#c4b5fd'
          },
          questions: [
            {
              id: 'q1',
              question: 'Match the countries with their capitals:',
              options: [
                'France', 'Germany', 'Italy',
                'Paris', 'Berlin', 'Rome'
              ],
              correctAnswer: ['France-Paris', 'Germany-Berlin', 'Italy-Rome'],
              explanation: 'Matching the correct capitals to their countries.'
            },
            {
              id: 'q2',
              question: 'Match the elements with their symbols:',
              options: ['Gold', 'Silver', 'Copper', 'Au', 'Ag', 'Cu'],
              correctAnswer: ['Gold-Au', 'Silver-Ag', 'Copper-Cu'],
              explanation: 'Matching elements with their chemical symbols.'
            },
            {
              id: 'q3',
              question: 'Match the following scientific terms with their definitions:',
              options: [
                'Mitochondria', 'DNA', 'Photosynthesis',
                'Powerhouse of the cell', 'Genetic material', 'Process plants use to make food'
              ],
              correctAnswer: [
                'Mitochondria-Powerhouse of the cell', 
                'DNA-Genetic material', 
                'Photosynthesis-Process plants use to make food'
              ],
              explanation: 'Mitochondria generate energy for cells, DNA carries genetic information, and photosynthesis is how plants produce food using sunlight.'
            }
          ]
        };

      default:
        return {
          id: `quiz-${Date.now()}`,
          type: 'quiz',
          subtype: 'MCQ',
          title: 'Default Quiz',
          description: 'A sample quiz',
          theme: {
            primaryColor: '#4f46e5',
            secondaryColor: '#818cf8',
            fontFamily: 'Inter, sans-serif'
          },
          questions: [
            {
              id: 'q1',
              question: 'This is a sample question?',
              options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
              correctAnswer: 'Option 1',
              explanation: 'This is the correct answer explanation.'
            }
          ],
          createdAt: now,
          updatedAt: now
        };
    }
  };

  const handleQuizClose = () => {
    setIsQuizOpen(false);
    setActiveQuiz(null);
  };

  const handleQuizComplete = (score: number, totalQuestions: number) => {
    // Quiz completion is now handled in-page by the quiz component
    // User will click "Home" button to close
  };

  // Helper function to render mindmap nodes recursively
  const renderMindmapNode = (node: MindmapNode, level = 0): JSX.Element => {
    const indent = level * 20;
    return (
      <div key={node.id} style={{ marginLeft: `${indent}px`, marginTop: '5px', padding: '5px', borderLeft: '2px solid #4a5568' }}>
        <div className="font-medium text-gray-100">{node.label}</div>
        {node.children?.map((child) => renderMindmapNode(child, level + 1))}
      </div>
    );
  };

  // Helper function to generate a simple mindmap structure
  const generateDummyMindmapJSON = (): MindmapData => ({
    id: '1',
    label: 'Main Topic',
    children: [
      { id: '2', label: 'Subtopic 1' },
      { 
        id: '3', 
        label: 'Subtopic 2', 
        children: [
          { id: '4', label: 'Detail 1' },
          { id: '5', label: 'Detail 2' }
        ]
      }
    ]
  });

  const generateDummyTimelineJSON = (): TimelineEvent[] => {
    // This function is now properly typed to return TimelineEvent[]
    return [
      {
        id: 1,
        title: 'Project Kickoff',
        description: 'Initial project planning and requirements gathering.',
        date: '2024-01-15'
      },
      {
        id: 2,
        title: 'UI/UX Design',
        description: 'Created wireframes and design mockups for the application.',
        date: '2024-02-01'
      },
      {
        id: 3,
        title: 'Development Started',
        description: 'Began implementation of core features and components.',
        date: '2024-02-15'
      },
      {
        id: 4,
        title: 'Alpha Release',
        description: 'First testable version released to internal team.',
        date: '2024-03-15'
      },
      {
        id: 5,
        title: 'Beta Testing',
        description: 'Beta version released to select users for testing.',
        date: '2024-04-01'
      },
      {
        id: 6,
        title: 'Official Launch',
        description: 'Application officially launched to the public.',
        date: '2024-05-01'
      }
    ];
  };

  const handleTimelineClose = () => {
    setIsTimelineOpen(false);
    setActiveTimeline([]);
  };

  const handleTimelineComplete = () => {
    // Timeline completion is now handled in-page by the timeline component
    // User will click "Home" button to close
  };

  // Interactive component options
  const interactiveComponents = [
    {
      id: 'quiz',
      name: 'quiz',
      label: 'Quiz',
      icon: '📝',
      description: 'Test your knowledge with interactive quizzes',
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => handleOptionClick('quiz' as InteractiveType)
    },
    {
      id: 'flashcards',
      name: 'flashcards',
      label: 'Flashcards',
      icon: '📚',
      description: 'Study with digital flashcards',
      color: 'bg-green-500 hover:bg-green-600',
      action: () => handleOptionClick('flashcards' as InteractiveType)
    },
    {
      id: 'mindmap',
      name: 'mindmap',
      label: 'Mind Map',
      icon: '🗺️',
      description: 'Visualize concepts with mind maps',
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => handleOptionClick('mindmap' as InteractiveType)
    },
    {
      id: 'timeline',
      name: 'timeline',
      label: 'Timeline',
      icon: '⏳',
      description: 'Explore events chronologically',
      color: 'bg-yellow-500 hover:bg-yellow-600',
      action: () => handleOptionClick('timeline' as InteractiveType)
    }
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            🧙‍♂️ WhizardLM
          </h1>
          <p className="text-center text-gray-400 mt-2">
            AI-Powered Interactive Learning Platform
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 20px',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        {/* Content Input */}
        <div style={{
          width: '100%',
          marginBottom: '30px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '15px',
          padding: '30px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h2 style={{ margin: '0 0 20px 0', color: '#64b5f6' }}>📝 Enter Your Learning Content</h2>
          
          {/* Text Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', color: '#64b5f6' }}>Option 1: Paste Text Content</label>
            <textarea
              value={userContent}
              onChange={(e) => {
                setUserContent(e.target.value);
                if (e.target.value.trim()) setSelectedFile(null); // Clear file if text is entered
              }}
              placeholder="Paste your text content here... (articles, documents, notes, etc.)"
              style={{
                width: '100%',
                height: '150px',
                background: 'rgba(0,0,0,0.3)',
                border: '2px solid #16213e',
                borderRadius: '10px',
                padding: '15px',
                color: '#e0dede',
                fontSize: '16px',
                fontFamily: 'Arial, sans-serif',
                resize: 'vertical'
              }}
            />
          </div>

          {/* OR Separator */}
          <div style={{ textAlign: 'center', margin: '20px 0', color: '#888' }}>
            <span style={{ background: 'rgba(255,255,255,0.05)', padding: '5px 15px', borderRadius: '15px' }}>OR</span>
          </div>

          {/* File Upload */}
          <div>
            <label style={{ display: 'block', marginBottom: '10px', color: '#64b5f6' }}>Option 2: Upload File (PDF, TXT)</label>
            <div style={{
              border: '2px dashed #16213e',
              borderRadius: '10px',
              padding: '20px',
              textAlign: 'center',
              background: 'rgba(0,0,0,0.2)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const files = e.dataTransfer.files;
              if (files.length > 0) {
                setSelectedFile(files[0]);
                setUserContent(''); // Clear text if file is uploaded
              }
            }}>
              <input
                type="file"
                id="file-upload"
                accept=".pdf,.txt"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                    setUserContent(''); // Clear text if file is uploaded
                  }
                }}
                style={{ display: 'none' }}
              />
              <label htmlFor="file-upload" style={{ cursor: 'pointer', color: '#64b5f6' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📄</div>
                {selectedFile ? (
                  <div>
                    <p>Selected file: {selectedFile.name}</p>
                    <p style={{ fontSize: '0.9rem', color: '#aaa' }}>Click to change file</p>
                  </div>
                ) : (
                  <div>
                    <p>Drag and drop a file here, or click to select a file</p>
                    <p style={{ fontSize: '0.9rem', color: '#aaa' }}>Supports PDF and TXT files</p>
                  </div>
                )}
              </label>
            </div>
          </div>
          
          {/* Generate Button */}
          <button
            onClick={handleGenerateElements}
            disabled={isLoading || (!userContent.trim() && !selectedFile)}
            style={{
              background: 'linear-gradient(45deg, #4a6cf7, #6a11cb)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '15px 30px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: (!userContent.trim() && !selectedFile) ? 'not-allowed' : 'pointer',
              opacity: (!userContent.trim() && !selectedFile) ? 0.6 : 1,
              marginTop: '20px',
              width: '100%',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              if (userContent.trim() || selectedFile) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {isLoading ? 'Generating...' : 'Generate Interactive Content'}
          </button>
        </div>
        
        {/* Interactive Options */}
        {isLoading && (
          <div style={{ textAlign: 'center', margin: '40px 0' }}>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p style={{ marginTop: '10px', color: '#64b5f6' }}>Generating your content...</p>
          </div>
        )}

        {/* Timeline Modal */}
        {isTimelineOpen && activeTimeline.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-6xl max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Project Timeline</h2>
                <button
                  onClick={handleTimelineClose}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Close timeline"
                >
                  <FiX size={28} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pr-2">
                <Timeline events={activeTimeline} />
              </div>
              <div className="mt-6 pt-4 border-t border-gray-700 flex justify-end">
                <button
                  onClick={handleTimelineClose}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  Close Timeline
                </button>
              </div>
            </div>
          </div>
        )}

        {!isLoading && (userContent || selectedFile) && (
          <div style={{ width: '100%', marginTop: '30px' }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#64b5f6' }}>🎯 Choose Interactive Content Type</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginTop: '20px'
            }}>
              {interactiveComponents.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option)}
                  style={{
                    background: `linear-gradient(45deg, ${option.color}, ${option.color}dd)`,
                    color: 'white',
                    border: 'none',
                    borderRadius: '15px',
                    padding: '20px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                    textAlign: 'center'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{option.icon}</div>
                  {option.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quiz Component */}
      {activeQuiz && (
        <QuizComponent
          quizData={activeQuiz}
          isOpen={isQuizOpen}
          onClose={handleQuizClose}
          onComplete={handleQuizComplete}
        />
      )}

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}; 