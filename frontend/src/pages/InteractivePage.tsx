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
import { Box, Paper, Typography, Button, Grid, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, Card, CardContent, CardActions, Chip, Container, TextField, CircularProgress, IconButton, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { ListItemButton } from '@mui/material';
import { 
  Quiz as QuizIcon,
  Style as StyleIcon,
  AccountTree,
  Timeline,
  Add as AddIcon,
  History as HistoryIcon,
  GridView as GridViewIcon,
} from '@mui/icons-material';
import { Snackbar } from '@mui/material';
import { Alert } from '@mui/material';
import { ROUTES } from '../services/routes';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topicsLoading, setTopicsLoading] = useState(false);
  // Add state for mobile view
  const [mobileView, setMobileView] = useState<'grid' | 'history'>('grid');

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
        const resp = await fetch(ROUTES.INTERACT_HISTORY(projectId), {
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
    // Generate the selected interactive type with selected topics
    if (selectedInteractiveType === 'quiz') await handleGenerateQuiz();
    else if (selectedInteractiveType === 'timeline') await handleGenerateTimeline();
    else if (selectedInteractiveType === 'mindmap') await handleGenerateMindmap();
    else if (selectedInteractiveType === 'flashcard') await handleGenerateFlashcard();
    setShowTopicModal(false);
  };

  const fetchTopics = async () => {
    if (!projectId || !token) return;
    setTopicsLoading(true);
    try {
      const response = await fetch(ROUTES.TOPICS(projectId), {
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
    setTopicsLoading(false);
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
      const resp = await fetch(ROUTES.INTERACT_CONTENT(entry.interact_id), {
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

  const handleInteractiveClick = async (type: 'quiz' | 'flashcard' | 'mindmap' | 'timeline') => {
    if (!projectId) {
      setError('Project ID is required');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('project_id', projectId);
      formData.append('content_type', type);

      // Map type to the correct route
      const routeMap: Record<string, string> = {
        quiz: ROUTES.INTERACT_QUIZ,
        timeline: ROUTES.INTERACT_TIMELINE,
        mindmap: ROUTES.INTERACT_MINDMAP,
        flashcard: ROUTES.INTERACT_FLASHCARD,
      };
      const endpoint = routeMap[type];

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Failed to generate ${type}`);
      }

      const data = await response.json();
      navigate(`/${type}`, { state: { data, projectId } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate interactive content');
    } finally {
      setIsLoading(false);
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
      const response = await fetch(ROUTES.INTERACT_QUIZ, {
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
      const response = await fetch(ROUTES.INTERACT_TIMELINE, {
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
      const response = await fetch(ROUTES.INTERACT_MINDMAP, {
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
      const response = await fetch(ROUTES.INTERACT_FLASHCARD, {
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
    setShowTopicModal(true);
    await fetchTopics();
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
  const handleBack = () => { navigate(-1); };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{
        p: 2,
        borderBottom: 1,
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: 'background.paper'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            onClick={handleBack}
            variant="outlined"
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Back
          </Button>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Interactive Learning</Typography>
        </Box>

        {/* Mobile View Toggle Buttons */}
        <ToggleButtonGroup
          value={mobileView}
          exclusive
          onChange={(_, newView) => {
            if (newView !== null) {
              setMobileView(newView);
            }
          }}
          size="small"
          sx={{ 
            display: { xs: 'flex', md: 'none' },
            '& .MuiToggleButton-root': {
              border: 'none',
              borderRadius: 1,
              px: 1,
            }
          }}
        >
          <ToggleButton value="grid" aria-label="main grid">
            <GridViewIcon />
          </ToggleButton>
          <ToggleButton value="history" aria-label="history">
            <HistoryIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Main Content with Right Sidebar */}
      <Box sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'row',
        minHeight: 0,
        height: '100%',
        overflow: 'hidden',
      }}>
        {/* Main Cards Section */}
        <Box sx={{
          flex: 1,
          p: { xs: 2, sm: 3 },
          display: { 
            xs: mobileView === 'grid' ? 'grid' : 'none',
            md: 'grid'
          },
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(2, 1fr)'
          },
          gap: 3,
          overflowY: 'auto',
        }}>
          {/* Quiz Card */}
          <Card sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: 200
          }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <QuizIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>Quiz</Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Test your knowledge with interactive quizzes
              </Typography>
            </CardContent>
            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => handleOptionClick('quiz')}
                disabled={isLoading}
              >
                Start Quiz
              </Button>
            </CardActions>
          </Card>
          {/* Flashcard Card */}
          <Card sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: 200
          }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <StyleIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>Flashcards</Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Review key concepts with flashcards
              </Typography>
            </CardContent>
            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => handleOptionClick('flashcard')}
                disabled={isLoading}
              >
                Start Flashcards
              </Button>
            </CardActions>
          </Card>
          {/* Mindmap Card */}
          <Card sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: 200
          }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <AccountTree sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>Mindmap</Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Visualize connections with mindmaps
              </Typography>
            </CardContent>
            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => handleOptionClick('mindmap')}
                disabled={isLoading}
              >
                View Mindmap
              </Button>
            </CardActions>
          </Card>
          {/* Timeline Card */}
          <Card sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: 200
          }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <Timeline sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>Timeline</Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Explore events in chronological order
              </Typography>
            </CardContent>
            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => handleOptionClick('timeline')}
                disabled={isLoading}
              >
                View Timeline
              </Button>
            </CardActions>
          </Card>
        </Box>
        {/* Interactive History Sidebar - Modified for mobile */}
        <Box sx={{
          width: { xs: '100%', md: 340 },
          minWidth: { md: 280 },
          maxWidth: 400,
          bgcolor: 'background.paper',
          p: 2,
          display: { 
            xs: mobileView === 'history' ? 'flex' : 'none',
            md: 'flex'
          },
          flexDirection: 'column',
          overflowY: 'auto',
          height: '100%',
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Interactive History</Typography>
          {historyLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : interactiveHistory.length === 0 ? (
            <Typography color="text.secondary">No interactive history yet.</Typography>
          ) : (
            <List>
              {interactiveHistory.map((entry) => (
                <ListItemButton key={entry.id} onClick={() => handleHistoryClick(entry)} sx={{ borderRadius: 2, mb: 1, alignItems: 'flex-start' }}>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 0.5 }}>
                      {entry.content_type.charAt(0).toUpperCase() + entry.content_type.slice(1)}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {entry.topics.map((topic) => (
                        <Chip key={topic} label={topic} size="small" color="primary" sx={{ fontSize: 12 }} />
                      ))}
                    </Box>
                  </Box>
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>
      </Box>

      {/* Loading Dialog */}
      <Dialog open={isLoading} sx={{ '& .MuiDialog-paper': { bgcolor: 'background.default' } }}>
        <DialogContent sx={{ textAlign: 'center', p: 4 }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography>Generating interactive content...</Typography>
        </DialogContent>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      {/* Topic Selection Modal */}
      <Dialog open={showTopicModal} onClose={() => setShowTopicModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Select Topics</DialogTitle>
        <DialogContent>
          {topicsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
              <CircularProgress />
            </Box>
          ) : topics.length === 0 ? (
            <Typography color="text.secondary">No topics available for this project.</Typography>
          ) : (
            <List>
              {topics.map((topic) => (
                <ListItem key={topic} disablePadding>
                  <ListItemButton
                    selected={selectedTopics.includes(topic)}
                    onClick={() => handleTopicSelect(topic)}
                    sx={{
                      borderRadius: 1,
                      m: 0.5,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'secondary.dark',
                        },
                        '& .MuiListItemText-primary': {
                          color: 'white',
                        }
                      }
                    }}
                  >
                    <ListItemText primary={topic} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTopicModal(false)} color="secondary" disabled={isGenerating || topicsLoading}>Cancel</Button>
          <Button
            onClick={handleTopicModalProceed}
            variant="contained"
            disabled={selectedTopics.length === 0 || topicsLoading || isGenerating}
            startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isGenerating ? 'Generating...' : 'Proceed'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Render Interactive Content Modals */}
      {activeQuiz && (
        <QuizComponent
          quizData={activeQuiz}
          isOpen={isQuizOpen}
          onClose={handleQuizClose}
        />
      )}
      {activeTimeline && (
        <TimelineComponent
          timelineData={activeTimeline}
          isOpen={isTimelineOpen}
          onClose={handleTimelineClose}
        />
      )}
      {activeMindmap && (
        <MindmapComponent
          mindmapData={activeMindmap}
          isOpen={isMindmapOpen}
          onClose={handleMindmapClose}
        />
      )}
      {activeFlashcard && (
        <FlashcardComponent
          flashcardData={activeFlashcard}
          isOpen={isFlashcardOpen}
          onClose={handleFlashcardClose}
        />
      )}
    </Box>
  );
}; 