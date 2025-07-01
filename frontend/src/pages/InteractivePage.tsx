import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { QuizComponent } from '../components/QuizComponent';
import { TimelineComponent } from '../components/timeline/TimelineComponent';
import { MindmapComponent } from '../components/mindmap/MindmapComponent';
import { FlashcardComponent } from '../components/flashcard/FlashcardComponent';
import { QuizData } from '../types/quiz';
import { TimelineData } from '../types/timeline';
import { MindmapData } from '../types/mindmap';
import { FlashcardData } from '../types/flashcard';
import { CSSProperties } from 'react';

// Add type for interactive history entry
interface InteractiveHistoryEntry {
  id: string;
  interact_id: string; // UUID from interactive_content table
  content_type: 'quiz' | 'timeline' | 'mindmap' | 'flashcard';
  topics: string[];
  created_at: string; // ISO string
}

export const InteractivePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, token } = useAuth();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState<QuizData | null>(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [activeTimeline, setActiveTimeline] = useState<TimelineData | null>(null);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [activeMindmap, setActiveMindmap] = useState<MindmapData | null>(null);
  const [isMindmapOpen, setIsMindmapOpen] = useState(false);
  const [activeFlashcard, setActiveFlashcard] = useState<FlashcardData | null>(null);
  const [isFlashcardOpen, setIsFlashcardOpen] = useState(false);
  // Interactive history state
  const [interactiveHistory, setInteractiveHistory] = useState<InteractiveHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  // Topic selection state
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedInteractiveType, setSelectedInteractiveType] = useState<string | null>(null);

  useEffect(() => {
    if (location.state && location.state.selectedTopics) {
      setSelectedTopics(location.state.selectedTopics);
    }
    if (location.state && location.state.projectId) {
      setProjectId(location.state.projectId);
    }
  }, [location.state]);

  // Fetch interactive history
  useEffect(() => {
    const fetchHistory = async () => {
      if (!projectId || !token) return;
      setHistoryLoading(true);
      try {
        const resp = await fetch(`http://localhost:8000/interact-history?project_id=${projectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await resp.json();
        setInteractiveHistory(data.interactive_history || []);
      } catch (e) {
        setInteractiveHistory([]);
      }
      setHistoryLoading(false);
    };
    fetchHistory();
  }, [projectId, token, activeQuiz, activeTimeline, activeMindmap, activeFlashcard]);

  // Topic selection handlers
  const handleTopicSelect = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic]
    );
  };

  const handleTopicModalProceed = async () => {
    if (selectedTopics.length === 0) {
      alert('Please select at least one topic.');
      return;
    }
    setShowTopicModal(false);
    
    // Generate the selected interactive type with selected topics
    if (selectedInteractiveType === 'quiz') await handleGenerateQuiz();
    else if (selectedInteractiveType === 'timeline') await handleGenerateTimeline();
    else if (selectedInteractiveType === 'mindmap') await handleGenerateMindmap();
    else if (selectedInteractiveType === 'flashcards') await handleGenerateFlashcard();
  };

  const fetchTopics = async () => {
    if (!projectId || !token) return;
    try {
      const response = await fetch(`http://localhost:8000/topics/${projectId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch topics');
      const data = await response.json();
      setTopics(data.topics || []);
      if (!data.topics || data.topics.length === 0) {
        alert('No topics found for this project. Please upload content or try another project.');
      }
    } catch (e) {
      alert('Failed to fetch topics for this project.');
    }
  };

  // Helper to format date (no date-fns)
  function formatDate(iso: string) {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  // Handler to open interactive element from history
  const handleHistoryClick = async (entry: InteractiveHistoryEntry) => {
    if (!projectId || !token) return;
    
    setIsGenerating(true);
    
    try {
      const resp = await fetch(`http://localhost:8000/interact-content/${entry.interact_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!resp.ok) {
        throw new Error(`Failed to fetch ${entry.content_type} data`);
      }
      
      const data = await resp.json();
      const content = data.interactive_content;
      
      switch (entry.content_type) {
        case 'quiz':
          setActiveQuiz(content.content_json);
          setIsQuizOpen(true);
          break;
        case 'timeline':
          setActiveTimeline(content.content_json);
          setIsTimelineOpen(true);
          break;
        case 'mindmap':
          setActiveMindmap(content.content_json);
          setIsMindmapOpen(true);
          break;
        case 'flashcard':
          setActiveFlashcard(content.content_json);
          setIsFlashcardOpen(true);
          break;
      }
    } catch (e) {
      console.error('Error fetching interactive content:', e);
      alert(`Failed to load ${entry.content_type} content.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (selectedTopics.length === 0 || !projectId) return;
    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append('project_id', projectId);
      selectedTopics.forEach(topic => formData.append('topics', topic));
      const response = await fetch('http://localhost:8000/interact', {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Quiz generation failed');
      const result = await response.json();
      setActiveQuiz(result.quiz_data);
      setIsQuizOpen(true);
    } catch (e) {
      alert('Failed to generate quiz.');
    }
    setIsGenerating(false);
  };

  const handleGenerateTimeline = async () => {
    if (selectedTopics.length === 0 || !projectId) return;
    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append('project_id', projectId);
      selectedTopics.forEach(topic => formData.append('topics', topic));
      const response = await fetch('http://localhost:8000/interact-timeline', {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Timeline generation failed');
      const result = await response.json();
      setActiveTimeline(result.timeline_data);
      setIsTimelineOpen(true);
    } catch (e) {
      alert('Failed to generate timeline.');
    }
    setIsGenerating(false);
  };
  const handleGenerateMindmap = async () => {
    if (selectedTopics.length === 0 || !projectId) return;
    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append('project_id', projectId);
      selectedTopics.forEach(topic => formData.append('topics', topic));
      const response = await fetch('http://localhost:8000/interact-mindmap', {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Mindmap generation failed');
      const result = await response.json();
      setActiveMindmap(result.mindmap_data);
      setIsMindmapOpen(true);
    } catch (e) {
      alert('Failed to generate mindmap.');
    }
    setIsGenerating(false);
  };
  const handleGenerateFlashcard = async () => {
    if (selectedTopics.length === 0 || !projectId) return;
    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append('project_id', projectId);
      selectedTopics.forEach(topic => formData.append('topics', topic));
      const response = await fetch('http://localhost:8000/interact-flashcard', {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Flashcard generation failed');
      const result = await response.json();
      setActiveFlashcard(result.flashcard_data);
      setIsFlashcardOpen(true);
    } catch (e) {
      alert('Failed to generate flashcards.');
    }
    setIsGenerating(false);
  };
  const handleOptionClick = async (option: string) => {
    setSelectedInteractiveType(option);
    setSelectedTopics([]); // Reset selected topics
    await fetchTopics();
    setShowTopicModal(true);
  };
  const handleQuizClose = () => { setIsQuizOpen(false); setActiveQuiz(null); };
  const handleTimelineClose = () => { setIsTimelineOpen(false); setActiveTimeline(null); };
  const handleMindmapClose = () => { setIsMindmapOpen(false); setActiveMindmap(null); };
  const handleFlashcardClose = () => { setIsFlashcardOpen(false); setActiveFlashcard(null); };
  const handleLogout = async () => { await logout(); navigate('/login'); };
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2d2d2d 100%)', color: '#fff', fontFamily: 'Arial, sans-serif', position: 'relative', display: 'flex', flexDirection: 'row' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header Section */}
        <div style={{ 
          background: 'rgba(0,0,0,0.5)', 
          padding: '20px', 
          borderBottom: '2px solid #4caf50',
          textAlign: 'center',
          width: '100%'
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '2.5rem', 
            background: 'linear-gradient(45deg, #4caf50, #66bb6a, #81c784)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent', 
            textShadow: '0 0 20px rgba(76, 175, 80, 0.3)'
          }}>
            🧙‍♂️ WhizardLM Interactive
          </h1>
          <p style={{ 
            margin: '10px 0 0 0', 
            opacity: 0.8, 
            fontSize: '1.1rem' 
          }}>
            Generate interactive learning elements for your selected topics!
          </p>
        </div>

        {/* Navigation Buttons */}
        <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'linear-gradient(45deg, #2196f3, #64b5f6)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(33,150,243,0.15)'
            }}
          >
            ← Back
          </button>
        </div>

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

        {/* Interactive Type Selector */}
        {showOptions && (
          <div style={{ 
            flex: 1,
            background: 'rgba(255,255,255,0.05)', 
            borderRadius: '15px', 
            padding: '30px', 
            border: '1px solid rgba(255,255,255,0.1)', 
            animation: 'fadeIn 0.5s ease-in', 
            margin: '20px auto',
            maxWidth: 700,
            width: '100%'
          }}>
            <h3 style={{ textAlign: 'center', marginBottom: '30px', color: '#4caf50' }}>🎯 Choose an Interactive Element:</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
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
                  onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{option.icon}</div>
                  {option.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Components */}
        {activeQuiz && (
          <QuizComponent quizData={activeQuiz} isOpen={isQuizOpen} onClose={handleQuizClose} onComplete={() => {}} />
        )}
        {activeTimeline && (
          <TimelineComponent timelineData={activeTimeline} isOpen={isTimelineOpen} onClose={handleTimelineClose} onComplete={() => {}} />
        )}
        {activeMindmap && (
          <MindmapComponent mindmapData={activeMindmap} isOpen={isMindmapOpen} onClose={handleMindmapClose} onComplete={() => {}} />
        )}
        {activeFlashcard && (
          <FlashcardComponent flashcardData={activeFlashcard} isOpen={isFlashcardOpen} onClose={handleFlashcardClose} onComplete={() => {}} />
        )}
      </div>

      {/* Right Sidebar: Interactive History */}
      <div style={{ width: 320, background: 'rgba(30,30,30,0.98)', borderLeft: '1px solid #222', minHeight: '100vh', position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 16px 0 16px', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontWeight: 'bold', color: '#ff9800', marginBottom: 18, fontSize: 20 }}>Interactive History</div>
          {historyLoading ? (
            <div style={{ color: '#bbb', fontSize: 15 }}>Loading...</div>
          ) : interactiveHistory.length === 0 ? (
            <div style={{ color: '#bbb', fontSize: 15 }}>No interactive history yet.</div>
          ) : (
            <>
              {interactiveHistory.map((entry, idx) => (
                <div key={entry.id} style={{ padding: '10px 8px', borderRadius: 8, marginBottom: 8, background: '#181818', color: '#fff', fontWeight: 500, fontSize: 15, display: 'flex', flexDirection: 'column', gap: 2, cursor: 'pointer', borderLeft: `3px solid ${entry.content_type === 'quiz' ? '#4caf50' : entry.content_type === 'timeline' ? '#ff9800' : entry.content_type === 'mindmap' ? '#9c27b0' : '#f44336'}` }} onClick={() => handleHistoryClick(entry)}>
                  <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{entry.content_type}</span>
                  <span style={{ color: '#bbb', fontSize: 13 }}>Topics: {entry.topics.join(', ')}</span>
                  <span style={{ color: '#888', fontSize: 12 }}>{formatDate(entry.created_at)}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Topic Selection Modal */}
      {showTopicModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#222', borderRadius: '18px', padding: '40px 30px', minWidth: 340, maxWidth: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.25)', color: '#fff', textAlign: 'center', position: 'relative' }}>
            <h2 style={{ color: '#ff9800', marginBottom: 18 }}>🎯 Select Topics</h2>
            <p style={{ color: '#bbb', marginBottom: 24 }}>Choose one or more topics to generate {selectedInteractiveType}:</p>
            {topics.length === 0 ? (
              <div style={{ color: '#ff9800', marginBottom: 24 }}>No topics found for this project.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24, maxHeight: 260, overflowY: 'auto', paddingRight: 4 }}>
                {topics.map((topic, idx) => (
                  <button key={idx} onClick={() => handleTopicSelect(topic)} style={{ background: selectedTopics.includes(topic) ? 'linear-gradient(45deg, #4caf50, #66bb6a)' : 'rgba(255,255,255,0.08)', color: selectedTopics.includes(topic) ? 'white' : '#e0dede', border: selectedTopics.includes(topic) ? '2px solid #4caf50' : '2px solid #16213e', borderRadius: 10, padding: '12px', fontSize: 15, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'left' }}>{selectedTopics.includes(topic) && '✅ '}{topic}</button>
                ))}
              </div>
            )}
            <button onClick={handleTopicModalProceed} disabled={selectedTopics.length === 0} style={{ background: selectedTopics.length === 0 ? 'linear-gradient(45deg, #666, #888)' : 'linear-gradient(45deg, #ff9800, #ffb74d)', color: 'white', border: 'none', borderRadius: 12, padding: '14px 32px', fontSize: 16, fontWeight: 'bold', cursor: selectedTopics.length === 0 ? 'not-allowed' : 'pointer', marginTop: 10, transition: 'all 0.2s' }}>Generate {selectedInteractiveType}</button>
            <button onClick={() => setShowTopicModal(false)} style={{ background: 'none', color: '#bbb', border: 'none', fontSize: 15, marginTop: 18, cursor: 'pointer', textDecoration: 'underline' }}>Cancel</button>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}; 