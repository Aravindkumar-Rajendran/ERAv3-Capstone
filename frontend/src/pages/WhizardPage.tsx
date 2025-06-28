import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { QuizComponent } from '../components/QuizComponent';
import { TimelineComponent } from '../components/timeline/TimelineComponent';
import { MindmapComponent } from '../components/mindmap/MindmapComponent';
import { FlashcardComponent } from '../components/flashcard/FlashcardComponent';
import { QuizData, QuizSubtype } from '../types/quiz';
import { TimelineData } from '../types/timeline';
import { MindmapData } from '../types/mindmap';
import { FlashcardData } from '../types/flashcard';

export const WhizardPage = () => {
  const [userContent, setUserContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<QuizData | null>(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [activeTimeline, setActiveTimeline] = useState<TimelineData | null>(null);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [activeMindmap, setActiveMindmap] = useState<MindmapData | null>(null);
  const [isMindmapOpen, setIsMindmapOpen] = useState(false);
  const [activeFlashcard, setActiveFlashcard] = useState<FlashcardData | null>(null);
  const [isFlashcardOpen, setIsFlashcardOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [showTopics, setShowTopics] = useState(false);
  const navigate = useNavigate();
  const { logout, token } = useAuth();

  const handleGenerateElements = async () => {
    if (!userContent.trim() && !selectedFile && !youtubeUrl.trim()) {
      alert('Please enter some content, upload a file, or provide a YouTube URL first!');
      return;
    }
    setIsGenerating(true);
    
    try {
      // Step 1: Upload content to backend
      const formData = new FormData();
      
      if (selectedFile) {
        formData.append('files', selectedFile);
      }
      if (userContent.trim()) {
        formData.append('text', userContent);
      }
      if (youtubeUrl.trim()) {
        formData.append('youtube_urls', youtubeUrl);
      }
      
      const uploadResponse = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }
      
      const uploadResult = await uploadResponse.json();
      const convId = uploadResult.conversation_id;
      setConversationId(convId);
      
      // Step 2: Get topics
      const topicsResponse = await fetch('http://localhost:8000/topics/' + convId, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!topicsResponse.ok) {
        throw new Error(`Topics failed: ${topicsResponse.status}`);
      }
      
      const topicsResult = await topicsResponse.json();
      setTopics(topicsResult.topics);
      setShowTopics(true);
      setIsGenerating(false);
      
    } catch (error) {
      console.error('Failed to process content:', error);
      alert('Failed to process content. Using demo mode.');
      setIsGenerating(false);
      setShowOptions(true);
    }
  };

  const handleTopicSelection = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleGenerateQuiz = async () => {
    if (selectedTopics.length === 0) {
      alert('Please select at least one topic!');
      return;
    }
    
    if (!conversationId) {
      alert('No conversation ID found. Please upload content first.');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Step 3: Generate quiz with selected topics
      const formData = new FormData();
      formData.append('conversation_id', conversationId);
      selectedTopics.forEach(topic => {
        formData.append('topics', topic);
      });
      
      const response = await fetch('http://localhost:8000/interact', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // The API returns: { quiz_data: {...}, status: "success", message: "..." }
      setActiveQuiz(result.quiz_data);
      setIsQuizOpen(true);
      
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      alert('Failed to generate quiz. Using demo mode.');
      
      // Fallback to dummy data for testing
      const dummyQuizResponse = generateDummyQuizJSON();
      setActiveQuiz(dummyQuizResponse);
      setIsQuizOpen(true);
    }
    
    setIsGenerating(false);
  };

  const handleGenerateTimeline = async () => {
    if (selectedTopics.length === 0) {
      alert('Please select at least one topic!');
      return;
    }
    
    if (!conversationId) {
      alert('No conversation ID found. Please upload content first.');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const formData = new FormData();
      formData.append('conversation_id', conversationId);
      selectedTopics.forEach(topic => {
        formData.append('topics', topic);
      });
      
      const response = await fetch('http://localhost:8000/interact-timeline', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.status === "rejected") {
        // Timeline was rejected - still show component with rejection message
        setActiveTimeline(result.timeline_data);
        setIsTimelineOpen(true);
      } else {
        setActiveTimeline(result.timeline_data);
        setIsTimelineOpen(true);
      }
      
    } catch (error) {
      console.error('Failed to generate timeline:', error);
      alert('Failed to generate timeline. Please try again.');
    }
    
    setIsGenerating(false);
  };

  const handleGenerateMindmap = async () => {
    if (selectedTopics.length === 0) {
      alert('Please select at least one topic!');
      return;
    }
    
    if (!conversationId) {
      alert('No conversation ID found. Please upload content first.');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const formData = new FormData();
      formData.append('conversation_id', conversationId);
      selectedTopics.forEach(topic => {
        formData.append('topics', topic);
      });
      
      const response = await fetch('http://localhost:8000/interact-mindmap', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setActiveMindmap(result.mindmap_data);
      setIsMindmapOpen(true);
      
    } catch (error) {
      console.error('Failed to generate mindmap:', error);
      alert('Failed to generate mindmap. Please try again.');
    }
    
    setIsGenerating(false);
  };

  const handleGenerateFlashcard = async () => {
    if (selectedTopics.length === 0) {
      alert('Please select at least one topic!');
      return;
    }
    
    if (!conversationId) {
      alert('No conversation ID found. Please upload content first.');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const formData = new FormData();
      formData.append('conversation_id', conversationId);
      selectedTopics.forEach(topic => {
        formData.append('topics', topic);
      });
      
      const response = await fetch('http://localhost:8000/interact-flashcard', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setActiveFlashcard(result.flashcard_data);
      setIsFlashcardOpen(true);
      
    } catch (error) {
      console.error('Failed to generate flashcard:', error);
      alert('Failed to generate flashcard. Please try again.');
    }
    
    setIsGenerating(false);
  };

  const handleOptionClick = async (option: string) => {
    if (option === 'quiz') {
      await handleGenerateQuiz();
    } else if (option === 'timeline') {
      await handleGenerateTimeline();
    } else if (option === 'mindmap') {
      await handleGenerateMindmap();
    } else if (option === 'flashcards') {
      await handleGenerateFlashcard();
    } else {
      alert(`${option} is currently in development. Coming soon!`);
    }
  };

  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  
  const generateDummyQuizJSON = (): QuizData => {
    // Demo: cycle through quiz types one by one for easy testing
    const subtypes: QuizSubtype[] = ['MCQ', 'TrueFalse', 'FillBlanks', 'MatchFollowing'];
    const currentSubtype = subtypes[currentQuizIndex];
    
    // Move to next quiz type for next time
    setCurrentQuizIndex((prev) => (prev + 1) % subtypes.length);
    
    const baseTheme = {
      primaryColor: '#16213e',
      secondaryColor: '#0f3460',
      backgroundColor: '#1a1a2e',
      textColor: '#e0dede',
      fontFamily: 'Arial',
      animation: 'slide-in'
    };

    switch (currentSubtype) {
      case 'MCQ':
        return {
          subtype: 'MCQ',
          theme: baseTheme,
          title: 'Multiple Choice Quiz',
          description: 'Choose the best answer for each question.',
          questions: [
            {
              id: 1,
              question: "What is the capital of Japan?",
              options: ["Seoul", "Tokyo", "Beijing", "Bangkok"],
              correctAnswer: 1,
              explanation: "Tokyo is the capital and largest city of Japan."
            },
            {
              id: 2,
              question: "Which planet is known as the Red Planet?",
              options: ["Venus", "Mars", "Jupiter", "Saturn"],
              correctAnswer: 1,
              explanation: "Mars is called the Red Planet due to iron oxide on its surface."
            },
            {
              id: 3,
              question: "Who wrote 'Romeo and Juliet'?",
              options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
              correctAnswer: 1,
              explanation: "Romeo and Juliet is a tragedy written by William Shakespeare."
            },
            {
              id: 4,
              question: "What is the largest ocean on Earth?",
              options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
              correctAnswer: 3,
              explanation: "The Pacific Ocean covers about 46% of the water surface of Earth."
            },
            {
              id: 5,
              question: "Which gas makes up most of Earth's atmosphere?",
              options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
              correctAnswer: 2,
              explanation: "Nitrogen makes up about 78% of Earth's atmosphere."
            }
          ]
        };

      case 'TrueFalse':
        return {
          subtype: 'TrueFalse',
          theme: { ...baseTheme, backgroundColor: '#0f0f0f', textColor: '#d0f0ff' },
          title: 'True or False Quiz',
          description: 'Determine whether each statement is true or false.',
          questions: [
            {
              id: 1,
              statement: "The Earth is the third planet from the Sun.",
              correctAnswer: true,
              hint: "Think about the order: Mercury, Venus, then what?",
              explanation: "Yes, Earth is the third planet from the Sun after Mercury and Venus."
            },
            {
              id: 2,
              statement: "Water boils at 90°C at sea level.",
              correctAnswer: false,
              hint: "Remember the temperature when water bubbles on your stove.",
              explanation: "False. Water boils at 100°C (212°F) at sea level."
            },
            {
              id: 3,
              statement: "Humans have five senses.",
              correctAnswer: true,
              hint: "Count them: sight, hearing, taste, smell, and one more.",
              explanation: "True. The five senses are sight, hearing, taste, smell, and touch."
            },
            {
              id: 4,
              statement: "Lightning never strikes the same place twice.",
              correctAnswer: false,
              hint: "Think about tall buildings and lightning rods.",
              explanation: "False. Lightning can and often does strike the same place multiple times."
            },
            {
              id: 5,
              statement: "The Great Wall of China is visible from space.",
              correctAnswer: false,
              hint: "Consider how wide the wall actually is compared to the distance from space.",
              explanation: "False. The Great Wall is not visible from space with the naked eye."
            }
          ]
        };

      case 'FillBlanks':
        return {
          subtype: 'FillBlanks',
          theme: { ...baseTheme, backgroundColor: '#1c1c1c', textColor: '#f0e6d2' },
          title: 'Fill in the Blanks',
          description: 'Complete each sentence by filling in the missing word.',
          questions: [
            {
              id: 1,
              sentence: "The first man to walk on the moon was Neil [BLANK].",
              correctAnswers: ["Armstrong"],
              hint: "His last name is also a word meaning strong arm.",
              explanation: "Neil Armstrong was the first person to walk on the moon in 1969."
            },
            {
              id: 2,
              sentence: "World War II ended in the year [BLANK].",
              correctAnswers: ["1945"],
              hint: "It was in the mid-1940s, after lasting about 6 years.",
              explanation: "World War II officially ended in 1945 with Japan's surrender."
            },
            {
              id: 3,
              sentence: "The largest continent by area is [BLANK].",
              correctAnswers: ["Asia"],
              hint: "It's home to countries like China, India, and Russia.",
              explanation: "Asia is the largest continent covering about 30% of Earth's land area."
            },
            {
              id: 4,
              sentence: "The currency used in Japan is the [BLANK].",
              correctAnswers: ["Yen"],
              hint: "It's a three-letter word starting with Y.",
              explanation: "The Japanese Yen is the official currency of Japan."
            },
            {
              id: 5,
              sentence: "The study of earthquakes is called [BLANK].",
              correctAnswers: ["Seismology"],
              hint: "It starts with 'seismo' which relates to shaking or vibration.",
              explanation: "Seismology is the scientific study of earthquakes and seismic waves."
            }
          ]
        };

      case 'MatchFollowing':
        return {
          subtype: 'MatchFollowing',
          theme: { ...baseTheme, backgroundColor: '#202020', textColor: '#ffffff' },
          title: 'Match the Following',
          description: 'Match items from the left column with their corresponding items on the right.',
          questions: [
                          {
                id: 1,
                instruction: "Match each person/place with their correct category:",
                              pairs: [
                { id: 1, left: "Shakespeare", right: "Writer" },
                { id: 2, left: "Paris", right: "Capital" },
                { id: 3, left: "Einstein", right: "Scientist" },
                { id: 4, left: "Piano", right: "Instrument" },
                { id: 5, left: "Pacific", right: "Ocean" }
              ]
              }
          ]
        };

      default:
        // Fallback to MCQ
        return {
          subtype: 'MCQ',
          theme: baseTheme,
          title: 'Quiz',
          questions: []
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

  const handleTimelineClose = () => {
    setIsTimelineOpen(false);
    setActiveTimeline(null);
  };

  const handleTimelineComplete = () => {
    // Timeline completion logic (optional)
  };

  const handleMindmapClose = () => {
    setIsMindmapOpen(false);
    setActiveMindmap(null);
  };

  const handleMindmapComplete = () => {
    // Mindmap completion logic (optional)
  };

  const handleFlashcardClose = () => {
    setIsFlashcardOpen(false);
    setActiveFlashcard(null);
  };

  const handleFlashcardComplete = () => {
    // Flashcard completion logic (optional)
  };

  const handleReset = () => {
    // Reset all state to initial values
    setUserContent('');
    setSelectedFile(null);
    setYoutubeUrl('');
    setShowOptions(false);
    setActiveQuiz(null);
    setIsQuizOpen(false);
    setActiveTimeline(null);
    setIsTimelineOpen(false);
    setActiveMindmap(null);
    setIsMindmapOpen(false);
    setActiveFlashcard(null);
    setIsFlashcardOpen(false);
    setIsGenerating(false);
    setConversationId(null);
    setTopics([]);
    setSelectedTopics([]);
    setShowTopics(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2d2d2d 100%)',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      position: 'relative'
    }}>
      {/* Logout Button */}
      <button
        onClick={handleLogout}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          background: 'linear-gradient(45deg, #f44336, #e57373)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 20px',
          fontWeight: 'bold',
          fontSize: '16px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(244,67,54,0.15)',
          zIndex: 10
        }}
      >
        Logout
      </button>

      {/* Header */}
      <div style={{
        background: 'rgba(0,0,0,0.5)',
        padding: '20px',
        borderBottom: '2px solid #4caf50'
      }}>
        <h1 style={{
          margin: 0,
          textAlign: 'center',
          fontSize: '2.5rem',
          background: 'linear-gradient(45deg, #4caf50, #66bb6a, #81c784)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 20px rgba(76, 175, 80, 0.3)'
        }}>
          🧙‍♂️ WhizardLM
        </h1>
        <p style={{
          textAlign: 'center',
          margin: '10px 0 0 0',
          opacity: 0.8,
          fontSize: '1.1rem'
        }}>
          AI-Powered Interactive Learning Platform
        </p>
      </div>

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
          <h2 style={{ margin: '0 0 20px 0', color: '#4caf50' }}>📝 Enter Your Learning Content</h2>
          
          {/* Text Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', color: '#4caf50' }}>Option 1: Paste Text Content</label>
            <textarea
              value={userContent}
              onChange={(e) => {
                setUserContent(e.target.value);
                if (e.target.value.trim()) {
                  setSelectedFile(null); // Clear file if text is entered
                  setYoutubeUrl(''); // Clear URL if text is entered
                }
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
            <label style={{ display: 'block', marginBottom: '10px', color: '#4caf50' }}>Option 2: Upload File (PDF, TXT)</label>
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
                setYoutubeUrl(''); // Clear URL if file is uploaded
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
                    setYoutubeUrl(''); // Clear URL if file is uploaded
                  }
                }}
                style={{ display: 'none' }}
              />
              <label htmlFor="file-upload" style={{ cursor: 'pointer', color: '#4caf50' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📄</div>
                {selectedFile ? (
                  <div>
                    <div style={{ color: '#4caf50', fontWeight: 'bold' }}>✅ {selectedFile.name}</div>
                    <div style={{ color: '#888', fontSize: '14px' }}>Click to change file</div>
                  </div>
                ) : (
                  <div>
                    <div>Click to upload or drag & drop</div>
                    <div style={{ color: '#888', fontSize: '14px' }}>Supported: PDF, TXT files</div>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* OR Separator */}
          <div style={{ textAlign: 'center', margin: '20px 0', color: '#888' }}>
            <span style={{ background: 'rgba(255,255,255,0.05)', padding: '5px 15px', borderRadius: '15px' }}>OR</span>
          </div>

          {/* YouTube URL Input */}
          <div>
            <label style={{ display: 'block', marginBottom: '10px', color: '#4caf50' }}>Option 3: YouTube Video URL</label>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => {
                setYoutubeUrl(e.target.value);
                if (e.target.value.trim()) {
                  setUserContent(''); // Clear text if URL is entered
                  setSelectedFile(null); // Clear file if URL is entered
                }
              }}
              placeholder="Paste YouTube video URL here... (e.g., https://www.youtube.com/watch?v=...)"
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.3)',
                border: '2px solid #16213e',
                borderRadius: '10px',
                padding: '15px',
                color: '#e0dede',
                fontSize: '16px',
                fontFamily: 'Arial, sans-serif'
              }}
            />
            {youtubeUrl && (
              <div style={{ marginTop: '10px', color: '#4caf50', fontSize: '14px' }}>
                ✅ YouTube URL ready for processing
              </div>
            )}
          </div>
        </div>

        {/* Generate and Reset Buttons */}
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '40px' }}>
          <button
            onClick={handleGenerateElements}
            disabled={isGenerating}
            style={{
              background: isGenerating 
                ? 'linear-gradient(45deg, #666, #888)' 
                : 'linear-gradient(45deg, #4caf50, #66bb6a)',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              padding: '15px 40px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)'
            }}
          >
            {isGenerating ? '🔄 Processing Content...' : '✨ Topics'}
          </button>

          {(showTopics || showOptions) && (
            <button
              onClick={handleReset}
              style={{
                background: 'linear-gradient(45deg, #ff5722, #ff7043)',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                padding: '15px 30px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(255, 87, 34, 0.3)'
              }}
            >
              🔄 Reset
            </button>
          )}
        </div>

        {/* Topic Selection */}
        {showTopics && (
          <div style={{
            width: '100%',
            marginBottom: '30px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '15px',
            padding: '30px',
            border: '1px solid rgba(255,255,255,0.1)',
            animation: 'fadeIn 0.5s ease-in'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#4caf50' }}>🎯 Select Topics for Interactive Generation</h3>
            <p style={{ color: '#888', marginBottom: '20px' }}>
              Choose one or more topics from your content to generate a focused quiz:
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              marginBottom: '20px'
            }}>
              {topics.map((topic, index) => (
                <button
                  key={index}
                  onClick={() => handleTopicSelection(topic)}
                  style={{
                    background: selectedTopics.includes(topic) 
                      ? 'linear-gradient(45deg, #4caf50, #66bb6a)' 
                      : 'rgba(255,255,255,0.1)',
                    color: selectedTopics.includes(topic) ? 'white' : '#e0dede',
                    border: selectedTopics.includes(topic) 
                      ? '2px solid #4caf50' 
                      : '2px solid #16213e',
                    borderRadius: '10px',
                    padding: '15px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'center'
                  }}
                >
                  {selectedTopics.includes(topic) && '✅ '}
                  {topic}
                </button>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => setShowOptions(true)}
                disabled={selectedTopics.length === 0}
                style={{
                  background: selectedTopics.length === 0 
                    ? 'linear-gradient(45deg, #666, #888)' 
                    : 'linear-gradient(45deg, #ff9800, #ffb74d)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '12px 30px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: selectedTopics.length === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                🎯 Proceed to Interactive Elements ({selectedTopics.length} topics selected)
              </button>
            </div>
          </div>
        )}

        {/* Options */}
        {showOptions && (
          <div style={{
            width: '100%',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '15px',
            padding: '30px',
            border: '1px solid rgba(255,255,255,0.1)',
            animation: 'fadeIn 0.5s ease-in'
          }}>
            <h3 style={{ textAlign: 'center', marginBottom: '30px', color: '#4caf50' }}>
              🎯 Choose an Interactive Element:
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              {[
                { name: 'Quiz', icon: '🧠', color: '#4caf50', id: 'quiz' },
                { name: 'Timeline', icon: '⏰', color: '#ff9800', id: 'timeline' },
                { name: 'Mind Map', icon: '🗺️', color: '#9c27b0', id: 'mindmap' },
                { name: 'Flashcards', icon: '📚', color: '#f44336', id: 'flashcards' }
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option.id)}
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
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
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

      {/* Timeline Component */}
      {activeTimeline && (
        <TimelineComponent
          timelineData={activeTimeline}
          isOpen={isTimelineOpen}
          onClose={handleTimelineClose}
          onComplete={handleTimelineComplete}
        />
      )}

      {/* Mindmap Component */}
      {activeMindmap && (
        <MindmapComponent
          mindmapData={activeMindmap}
          isOpen={isMindmapOpen}
          onClose={handleMindmapClose}
          onComplete={handleMindmapComplete}
        />
      )}

      {/* Flashcard Component */}
      {activeFlashcard && (
        <FlashcardComponent
          flashcardData={activeFlashcard}
          isOpen={isFlashcardOpen}
          onClose={handleFlashcardClose}
          onComplete={handleFlashcardComplete}
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