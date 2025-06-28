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

export const InteractivePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, token } = useAuth();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
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

  useEffect(() => {
    if (location.state && location.state.selectedTopics) {
      setSelectedTopics(location.state.selectedTopics);
    }
    if (location.state && location.state.conversationId) {
      setConversationId(location.state.conversationId);
    }
  }, [location.state]);

  const handleGenerateQuiz = async () => {
    if (selectedTopics.length === 0 || !conversationId) return;
    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append('conversation_id', conversationId);
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
    if (selectedTopics.length === 0 || !conversationId) return;
    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append('conversation_id', conversationId);
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
    if (selectedTopics.length === 0 || !conversationId) return;
    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append('conversation_id', conversationId);
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
    if (selectedTopics.length === 0 || !conversationId) return;
    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append('conversation_id', conversationId);
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
    if (option === 'quiz') await handleGenerateQuiz();
    else if (option === 'timeline') await handleGenerateTimeline();
    else if (option === 'mindmap') await handleGenerateMindmap();
    else if (option === 'flashcards') await handleGenerateFlashcard();
    else alert(`${option} is coming soon!`);
  };
  const handleQuizClose = () => { setIsQuizOpen(false); setActiveQuiz(null); };
  const handleTimelineClose = () => { setIsTimelineOpen(false); setActiveTimeline(null); };
  const handleMindmapClose = () => { setIsMindmapOpen(false); setActiveMindmap(null); };
  const handleFlashcardClose = () => { setIsFlashcardOpen(false); setActiveFlashcard(null); };
  const handleLogout = async () => { await logout(); navigate('/login'); };
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2d2d2d 100%)', color: '#fff', fontFamily: 'Arial, sans-serif', position: 'relative' }}>
      <button onClick={handleLogout} style={{ position: 'absolute', top: 20, right: 20, background: 'linear-gradient(45deg, #f44336, #e57373)', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(244,67,54,0.15)', zIndex: 10 }}>Logout</button>
      <div style={{ background: 'rgba(0,0,0,0.5)', padding: '20px', borderBottom: '2px solid #4caf50' }}>
        <h1 style={{ margin: 0, textAlign: 'center', fontSize: '2.5rem', background: 'linear-gradient(45deg, #4caf50, #66bb6a, #81c784)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 20px rgba(76, 175, 80, 0.3)' }}>🧙‍♂️ WhizardLM Interactive</h1>
        <p style={{ textAlign: 'center', margin: '10px 0 0 0', opacity: 0.8, fontSize: '1.1rem' }}>Generate interactive learning elements for your selected topics!</p>
      </div>
      {showOptions && (
        <div style={{ width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', padding: '30px', border: '1px solid rgba(255,255,255,0.1)', animation: 'fadeIn 0.5s ease-in', margin: '40px auto', maxWidth: 700 }}>
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
                style={{ background: `linear-gradient(45deg, ${option.color}, ${option.color}dd)`, color: 'white', border: 'none', borderRadius: '15px', padding: '20px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'transform 0.2s ease', textAlign: 'center' }}
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
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}; 