import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { QuizComponent } from '../components/QuizComponent';
import { TimelineComponent } from '../components/timeline/TimelineComponent';
import MindmapComponent from '../components/mindmap/MindmapComponent';
import { FlashcardComponent } from '../components/flashcard/FlashcardComponent';
import { QuizData } from '../types/quiz';
import { TimelineData } from '../types/timeline';
import { MindmapData } from '../types/mindmap';
import { FlashcardData } from '../types/flashcard';
import { Box, Paper, Typography, Button, Grid, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { ListItemButton } from '@mui/material';

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
    if (!projectId || !token || !entry.interact_id) {
      alert('Invalid interactive entry.');
      return;
    }
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
    console.log("DEBUG: projectId =", projectId);
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
      setShowOptions(false); // Hide options after successful generation
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
      
      if (!response.ok) {
        throw new Error('Timeline generation failed');
      }
      
      const result = await response.json();
      
      // Handle both successful and rejected timelines
      if (result.status === 'rejected' || (result.timeline_data && result.timeline_data.error === 'TIMELINE_NOT_SUITABLE')) {
        // Still show the timeline component, but it will display rejection message
        setActiveTimeline(result.timeline_data);
        setIsTimelineOpen(true);
        setShowOptions(false); // Hide options after generation
      } else {
        // Normal successful timeline
        setActiveTimeline(result.timeline_data);
        setIsTimelineOpen(true);
        setShowOptions(false); // Hide options after successful generation
      }
    } catch (e) {
      alert('Failed to generate timeline. Please try again.');
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
      setShowOptions(false); // Hide options after successful generation
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
      setShowOptions(false); // Hide options after successful generation
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
  const handleQuizClose = () => { 
    setIsQuizOpen(false); 
    setActiveQuiz(null); 
    setShowOptions(true);
  };
  const handleTimelineClose = () => { 
    setIsTimelineOpen(false); 
    setActiveTimeline(null); 
    setShowOptions(true);
  };
  const handleMindmapClose = () => { 
    setIsMindmapOpen(false); 
    setActiveMindmap(null); 
    setShowOptions(true);
  };
  const handleFlashcardClose = () => { 
    setIsFlashcardOpen(false); 
    setActiveFlashcard(null); 
    setShowOptions(true);
  };
  const handleLogout = async () => { await logout(); navigate('/login'); };
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.paper', color: 'text.primary', display: 'flex', flexDirection: 'row' }}>
      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Header Section */}
        <Paper elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 2, borderColor: 'primary.main', py: 3, px: 2, textAlign: 'center', borderRadius: 0 }}>
          <Typography variant="h4" fontWeight={700} color="primary">
            WhizardLM Interactive
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.8 }}>
            Generate interactive learning elements for your selected topics!
          </Typography>
        </Paper>
        {/* Navigation Buttons */}
        <Box sx={{ position: 'absolute', top: 24, left: 24, zIndex: 10 }}>
          <Button variant="outlined" color="primary" onClick={() => navigate(-1)} sx={{ borderRadius: 2, fontWeight: 600 }}>
            ← Back
          </Button>
        </Box>
        <Box sx={{ position: 'absolute', top: 24, right: 24, zIndex: 10 }}>
          <Button variant="outlined" color="error" onClick={handleLogout} sx={{ borderRadius: 2, fontWeight: 600 }}>
            Logout
          </Button>
        </Box>
        {/* Interactive Type Selector */}
        {showOptions && (
          <Paper elevation={2} sx={{ flex: 1, bgcolor: 'background.default', borderRadius: 3, p: 4, border: 1, borderColor: 'divider', m: '32px auto', maxWidth: 700, width: '100%' }}>
            <Typography variant="h6" align="center" sx={{ mb: 3, color: 'primary.main', fontWeight: 700 }}>Choose an Interactive Element:</Typography>
            <Grid container spacing={3} justifyContent="center">
              {[
                { name: 'Quiz', icon: '🧠', color: 'success.main', id: 'quiz' },
                { name: 'Timeline', icon: '⏰', color: 'warning.main', id: 'timeline' },
                { name: 'Mind Map', icon: '🗺️', color: 'secondary.main', id: 'mindmap' },
                { name: 'Flashcards', icon: '📚', color: 'error.main', id: 'flashcards' }
              ].map((option) => (
                <Grid item xs={12} sm={6} md={3} key={option.id}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleOptionClick(option.id)}
                    sx={{
                      borderRadius: 3,
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      py: 3,
                      bgcolor: option.color,
                      color: '#fff',
                      boxShadow: 2,
                      '&:hover': { bgcolor: option.color, opacity: 0.9 },
                      display: 'flex', flexDirection: 'column', gap: 1
                    }}
                  >
                    <span style={{ fontSize: '2rem' }}>{option.icon}</span>
                    {option.name}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Paper>
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
      </Box>
      {/* Right Sidebar: Interactive History */}
      <Box sx={{ width: 320, bgcolor: 'background.default', borderLeft: 1, borderColor: 'divider', minHeight: '100vh', position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'warning.main', mb: 2 }}>Interactive History</Typography>
          {historyLoading ? (
            <Typography color="text.secondary">Loading...</Typography>
          ) : interactiveHistory.length === 0 ? (
            <Typography color="text.secondary">No interactive history yet.</Typography>
          ) : (
            <List>
              {interactiveHistory.map((entry, idx) => (
                <ListItem
                  key={entry.id}
                  button
                  onClick={() => handleHistoryClick(entry)}
                  sx={{
                    borderLeft: 3,
                    borderColor:
                      entry.content_type === 'quiz'
                        ? 'success.main'
                        : entry.content_type === 'timeline'
                        ? 'warning.main'
                        : entry.content_type === 'mindmap'
                        ? 'secondary.main'
                        : 'error.main',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    mb: 1,
                  }}
                >
                  <ListItemText
                    primary={<Typography fontWeight={600} textTransform="capitalize">{entry.content_type}</Typography>}
                    secondary={<>
                      <Typography variant="body2" color="text.secondary">Topics: {entry.topics.join(', ')}</Typography>
                      <Typography variant="caption" color="text.disabled">{formatDate(entry.created_at)}</Typography>
                    </>}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Box>
      {/* Topic Selection Modal */}
      <Dialog open={showTopicModal} onClose={() => setShowTopicModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Select Topics</DialogTitle>
        <DialogContent>
          {topics.length === 0 ? (
            <Typography color="warning.main" sx={{ mb: 2 }}>No topics found for this project.</Typography>
          ) : (
            <List>
              {topics.map((topic, idx) => (
                <ListItemButton
                  key={idx}
                  selected={selectedTopics.includes(topic)}
                  onClick={() => handleTopicSelect(topic)}
                  sx={{ borderRadius: 2, mb: 1 }}
                >
                  <ListItemText primary={selectedTopics.includes(topic) ? `✅ ${topic}` : topic} />
                </ListItemButton>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTopicModal(false)}>Cancel</Button>
          <Button
            onClick={handleTopicModalProceed}
            variant="contained"
            disabled={selectedTopics.length === 0}
            color="primary"
          >
            Generate {selectedInteractiveType}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 