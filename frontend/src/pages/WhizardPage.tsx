import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItemButton,
  ListItemText,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { ChatMessage, ChatInput } from '../components/chat';
import { Upload as UploadIcon } from '@mui/icons-material';

interface Message {
  sender: 'user' | 'whizard';
  text: string;
}

export const WhizardPage = () => {
  // Upload state
  const [userContent, setUserContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [showTopics, setShowTopics] = useState(false);
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'whizard', text: 'Hi! I am WhiZard. Ask me anything about your uploaded sources.' }
  ]);
  const [input, setInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  // Topic selection modal
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { logout, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const projectId = location.state?.projectId;
  const messageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // New: Sources state and upload modal
  const [sources, setSources] = useState<any[]>([]); // TODO: type properly
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [sourcePreview, setSourcePreview] = useState<any | null>(null);

  // New: Conversations state for chat history sidebar
  const [conversations, setConversations] = useState<any[]>([]);

  // Notification state
  const [notification, setNotification] = useState<string | null>(null);

  // Fetch sources for this project/user
  const fetchSources = async () => {
    if (projectId && token) {
      try {
        const resp = await fetch(`http://localhost:8000/sources?project_id=${projectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await resp.json();
        setSources(data.sources || []);
      } catch (e) {
        setSources([]);
      }
    }
  };

  useEffect(() => {
    fetchSources();
  }, [projectId, token]);

  useEffect(() => {
    if (!projectId) {
      navigate('/projects');
    }
  }, [projectId, navigate]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chat history from backend
  useEffect(() => {
    if (projectId && conversationId) {
      const fetchChatHistory = async () => {
        try {
          const response = await fetch(`http://localhost:8000/conversations/${conversationId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!response.ok) throw new Error('Failed to fetch chat history');
          const data = await response.json();
          const msgs = (data.messages || []).map((msg: { type: string; content: string }) => ({
            sender: msg.type === 'user' ? 'user' as const : 'whizard' as const,
            text: msg.content
          }));
          const welcomeMsg: Message = {
            sender: 'whizard',
            text: 'Hi! I am WhiZard. Ask me anything about your uploaded sources.'
          };
          const last10 = msgs.slice(-10);
          setMessages([welcomeMsg, ...last10]);
        } catch (err) {
          const defaultMsg: Message = {
            sender: 'whizard',
            text: 'Hi! I am WhiZard. Ask me anything about your uploaded sources.'
          };
          setMessages([defaultMsg]);
        }
      };
      fetchChatHistory();
    } else if (!conversationId) {
      const defaultMsg: Message = {
        sender: 'whizard',
        text: 'Hi! I am WhiZard. Ask me anything about your uploaded sources.'
      };
      setMessages([defaultMsg]);
    }
  }, [projectId, conversationId, token]);

  // Fetch conversations for chat history sidebar
  const fetchConversations = async () => {
    if (token && projectId) {
      try {
        const resp = await fetch(`http://localhost:8000/auth/conversations?project_id=${projectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await resp.json();
        setConversations(data.conversations || []);
      } catch (e) {
        setConversations([]);
      }
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [token, projectId]);

  // Load messages for a selected conversation
  const handleConversationClick = async (conversationId: string) => {
    setConversationId(conversationId);
    try {
      const response = await fetch(`http://localhost:8000/conversations/${conversationId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch chat history');
      const data = await response.json();
      const msgs = (data.messages || []).map((msg: { type: string; content: string }) => ({
        sender: msg.type === 'user' ? 'user' as const : 'whizard' as const,
        text: msg.content
      }));
      const welcomeMsg: Message = {
        sender: 'whizard',
        text: 'Hi! I am WhiZard. Ask me anything about your uploaded sources.'
      };
      const last10 = msgs.slice(-10);
      setMessages([welcomeMsg, ...last10]);
    } catch (err) {
      const defaultMsg: Message = {
        sender: 'whizard',
        text: 'Hi! I am WhiZard. Ask me anything about your uploaded sources.'
      };
      setMessages([defaultMsg]);
    }
  };

  // Upload handler (used in both inline and modal)
  const handleUpload = async () => {
    // File size check (PDF)
    if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
      setNotification('PDF file size must be 5 MB or less.');
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    // Text length check
    if (userContent && userContent.length > 5000) {
      setNotification('Text input must be 5000 characters or less.');
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    if (!userContent.trim() && !selectedFile && !youtubeUrl.trim()) {
      alert('Please enter some content, upload a file, or provide a YouTube URL first!');
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      if (selectedFile) formData.append('files', selectedFile);
      if (userContent.trim()) formData.append('text', userContent);
      if (youtubeUrl.trim()) formData.append('youtube_urls', youtubeUrl);
      if (projectId) formData.append('project_id', projectId);
      const uploadResponse = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!uploadResponse.ok) throw new Error(`Upload failed: ${uploadResponse.status}`);
      const uploadResult = await uploadResponse.json();
      setConversationId(uploadResult.conversation_id);
      // Get topics
      const topicsResponse = await fetch('http://localhost:8000/topics/' + uploadResult.conversation_id, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!topicsResponse.ok) throw new Error(`Topics failed: ${topicsResponse.status}`);
      const topicsResult = await topicsResponse.json();
      setTopics(topicsResult.topics);
      setShowTopics(true);
      setMessages([
        { sender: 'whizard', text: 'Hi! I am WhiZard. Ask me anything about your uploaded sources.' }
      ]);
      // Refresh sources after upload
      await fetchSources();
    } catch (error) {
      alert('Failed to process content. Please try again.');
      setConversationId(null);
      setTopics([]);
      setShowTopics(false);
    }
    setIsUploading(false);
    setShowUploadModal(false);
  };

  // Reset handler
  const handleReset = () => {
    setUserContent('');
    setSelectedFile(null);
    setYoutubeUrl('');
    setIsUploading(false);
    setConversationId(null);
    setTopics([]);
    setShowTopics(false);
    setMessages([{ sender: 'whizard', text: 'Hi! I am WhiZard. Ask me anything about your uploaded sources.' }]);
    setInput('');
    setShowTopicModal(false);
    setSelectedTopics([]);
  };

  // Chat send handler
  const handleSend = async () => {
    if (!input.trim() || isChatLoading) return;

    const userMessage: Message = {
      sender: 'user',
      text: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsChatLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: input.trim(),
          conversation_id: conversationId
        })
      });

      if (!response.ok) throw new Error('Chat request failed');
      const data = await response.json();

      const botMessage: Message = {
        sender: 'whizard',
        text: data.response
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        sender: 'whizard',
        text: 'Sorry, I encountered an error. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsChatLoading(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handler for starting a new chat
  const handleNewChat = async () => {
    if (!projectId) return;
    if (sources.length === 0) {
      setNotification('Please add at least one source before starting a new chat.');
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    try {
      const formData = new FormData();
      formData.append('project_id', projectId);
      const response = await fetch('http://localhost:8000/conversations/new', {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to start new chat');
      const uploadResult = await response.json();
      setConversationId(uploadResult.conversation_id);
      setMessages([{ sender: 'whizard', text: 'Hi! I am WhiZard. Ask me anything about your uploaded sources.' }]);
      setTopics([]);
      setShowTopics(false);
      setInput('');
      // Refresh chat history sidebar
      await fetchConversations();
    } catch (e) {
      alert('Failed to start a new chat.');
    }
  };

  // Handler to open topic selection modal (moved to sidebar)
  const handleGenerateMagic = async () => {
    if (!projectId) return;
    if (sources.length === 0) {
      setNotification('Please add at least one source to create interactives.');
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    navigate('/interactive', { state: { projectId } });
  };

  // Topic selection
  const handleTopicSelect = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic]
    );
  };

  // Proceed to interactive page
  const handleTopicModalProceed = () => {
    setShowTopicModal(false);
    if (selectedTopics.length > 0 && projectId) {
      navigate('/interactive', { state: { selectedTopics, projectId } });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Scroll to a specific message
  const handleSidebarMessageClick = (idx: number) => {
    messageRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleBack = () => {
    navigate('/projects');
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', bgcolor: 'background.default' }}>
      {/* Left Sidebar: Sources & Upload */}
      <Box sx={{ width: 280, bgcolor: 'grey.100', borderRight: 1, borderColor: 'divider', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Sources</Typography>
        <List dense sx={{ flexGrow: 1, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1, mb: 2 }}>
          {sources.length === 0 ? (
            <ListItemText primary="No sources yet." sx={{ px: 2, py: 1, color: 'text.secondary' }} />
          ) : (
            sources.map((src, idx) => (
              <ListItemButton key={src.id || idx} selected={false} sx={{ borderRadius: 1, mb: 0.5 }}>
                <ListItemText primary={src.name || src.filename || `Source ${idx + 1}`} secondary={src.type || ''} />
              </ListItemButton>
            ))
          )}
        </List>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => setShowUploadModal(true)}
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          Upload Sources
        </Button>
      </Box>

      {/* Main Chat Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', minWidth: 0 }}>
        {/* Chat Messages */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            pt: 2,
            pb: 10,
            px: 3,
            bgcolor: 'background.default',
          }}
        >
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message}
            />
          ))}
          <div ref={chatEndRef} />
        </Box>

        {/* Chat Input */}
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, px: 3, pb: 2, bgcolor: 'background.default' }}>
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={handleSend}
            isLoading={isChatLoading}
            onKeyDown={handleInputKeyDown}
          />
        </Box>
      </Box>

      {/* Right Sidebar: Chat History & Interactive */}
      <Box sx={{ width: 320, bgcolor: 'grey.50', borderLeft: 1, borderColor: 'divider', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Chat History</Typography>
        <List dense sx={{ flexGrow: 1, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1, mb: 2, maxHeight: 320, overflowY: 'auto' }}>
          {conversations.length === 0 ? (
            <ListItemText primary="No chat history yet." sx={{ px: 2, py: 1, color: 'text.secondary' }} />
          ) : (
            conversations.map((conv, idx) => (
              <ListItemButton key={conv.id || idx} onClick={() => handleConversationClick(conv.id)} sx={{ borderRadius: 1, mb: 0.5 }}>
                <ListItemText primary={conv.title || `Conversation ${idx + 1}`} secondary={conv.created_at ? new Date(conv.created_at).toLocaleString() : ''} />
              </ListItemButton>
            ))
          )}
        </List>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleGenerateMagic}
          sx={{ borderRadius: 2, fontWeight: 600, mt: 2 }}
        >
          Interactive
        </Button>
      </Box>

      {/* Upload Modal */}
      <Dialog
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload Content</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              multiline
              rows={4}
              placeholder="Enter text content..."
              value={userContent}
              onChange={(e) => setUserContent(e.target.value)}
              fullWidth
            />
            
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
            >
              Upload PDF
              <input
                type="file"
                hidden
                accept=".pdf"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </Button>
            
            {selectedFile && (
              <Typography variant="body2" color="text.secondary">
                Selected file: {selectedFile.name}
              </Typography>
            )}

            <TextField
              placeholder="Enter YouTube URL..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUploadModal(false)}>Cancel</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={isUploading}
          >
            {isUploading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Topics Modal */}
      <Dialog
        open={showTopicModal}
        onClose={() => setShowTopicModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Select Topics</DialogTitle>
        <DialogContent>
          <List>
            {topics.map((topic, index) => (
              <ListItemButton
                key={index}
                selected={selectedTopics.includes(topic)}
                onClick={() => handleTopicSelect(topic)}
              >
                <ListItemText primary={topic} />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTopicModal(false)}>Cancel</Button>
          <Button
            onClick={handleTopicModalProceed}
            variant="contained"
            disabled={selectedTopics.length === 0}
          >
            Proceed
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <Snackbar
        open={!!notification}
        autoHideDuration={3000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setNotification(null)}>
          {notification}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 