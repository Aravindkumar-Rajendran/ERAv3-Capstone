import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { ROUTES } from '../services/routes';

interface Message {
  sender: 'user' | 'whizard';
  text: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at?: string;
  updated_at?: string;
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
  // Mobile view state
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 960);
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

  // Add refs to break circular dependencies
  const fetchConversationsRef = useRef<(() => Promise<void>) | null>(null);
  const handleNewChatRef = useRef<(() => Promise<void>) | null>(null);
  const handleConversationClickRef = useRef<((id: string) => Promise<void>) | null>(null);

  // Add resize listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 960);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch sources for this project/user
  const fetchSources = async () => {
    if (projectId && token) {
      try {
        const resp = await fetch(ROUTES.SOURCES(projectId), {
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

  // Debug effect to monitor conversation ID
  useEffect(() => {
    console.log('Current conversation ID:', conversationId);
  }, [conversationId]);

  // Define fetchConversations before using it
  const fetchConversations = useCallback(async () => {
    if (!token || !projectId) {
      console.log('Missing token or project ID for fetching conversations');
      setNotification('Authentication required to load chat history.');
      return;
    }

    try {
      // First check if we have any sources
      const sourcesResponse = await fetch(ROUTES.SOURCES(projectId), {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!sourcesResponse.ok) {
        throw new Error('Failed to fetch sources');
      }

      const sourcesData = await sourcesResponse.json();
      const hasSources = sourcesData.sources && sourcesData.sources.length > 0;
      setSources(sourcesData.sources || []);

      // Fetch conversations
      console.log('Fetching conversations for project:', projectId);
      const resp = await fetch(ROUTES.AUTH_CONVERSATIONS(projectId), {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(
          errorData.detail || 
          `Failed to fetch conversations: ${resp.status} ${resp.statusText}`
        );
      }

      const data = await resp.json();
      console.log('Fetched conversations:', data);
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response data received from server');
      }

      if (!data.conversations || !Array.isArray(data.conversations)) {
        console.warn('No conversations data received:', data);
        setConversations([]);
        
        // If we have sources but no conversations, create a new one
        if (hasSources && handleNewChatRef.current) {
          await handleNewChatRef.current();
        }
        return;
      }

      // Validate conversation objects and filter out invalid ones
      const validConversations = data.conversations.filter((conv: Conversation) => {
        if (!conv || typeof conv !== 'object') {
          console.warn('Invalid conversation object:', conv);
          return false;
        }
        if (!conv.id || typeof conv.id !== 'string') {
          console.warn('Conversation missing valid ID:', conv);
          return false;
        }
        return true;
      });

      // Sort conversations by date (newest first)
      const sortedConversations = validConversations.sort((a: Conversation, b: Conversation) => {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });

      setConversations(sortedConversations);

      // If we have no conversations but have sources, create a new one
      if (sortedConversations.length === 0 && hasSources && handleNewChatRef.current) {
        await handleNewChatRef.current();
        return;
      }

      // If we have a selected conversation, validate it exists
      if (conversationId) {
        const exists = sortedConversations.some((conv: Conversation) => conv.id === conversationId);
        if (!exists) {
          console.log('Selected conversation not found in list, selecting most recent');
          if (sortedConversations.length > 0 && handleConversationClickRef.current) {
            setConversationId(sortedConversations[0].id);
            await handleConversationClickRef.current(sortedConversations[0].id);
          } else {
            setConversationId(null);
          }
        }
      } else if (sortedConversations.length > 0 && handleConversationClickRef.current) {
        // Auto-select the most recent conversation if none is selected
        setConversationId(sortedConversations[0].id);
        await handleConversationClickRef.current(sortedConversations[0].id);
      }
    } catch (e) {
      console.error('Error fetching conversations:', e);
      setNotification(e instanceof Error ? e.message : 'Failed to load chat history.');
      setConversations([]);
    }
  }, [token, projectId, conversationId]);

  // Store fetchConversations in ref
  useEffect(() => {
    fetchConversationsRef.current = fetchConversations;
  }, [fetchConversations]);

  // Load conversations when component mounts or project changes
  useEffect(() => {
    if (token && projectId && fetchConversationsRef.current) {
      console.log('Initial conversations fetch for project:', projectId);
      fetchConversationsRef.current();
    }
  }, [token, projectId]);

  // Separate effect for handling conversation selection
  useEffect(() => {
    const loadSelectedConversation = async () => {
      if (conversationId && token) {
        console.log('Loading selected conversation:', conversationId);
        try {
          const response = await fetch(ROUTES.CONVERSATIONS(conversationId), {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (!response.ok) {
            throw new Error('Failed to load conversation');
          }

          const data = await response.json();
          if (data.messages) {
            const msgs = data.messages.map((msg: { type: string; content: string }) => ({
              sender: msg.type === 'user' ? 'user' as const : 'whizard' as const,
              text: msg.content
            }));

            setMessages([
              { sender: 'whizard', text: 'Hi! I am WhiZard. Ask me anything about your uploaded sources.' },
              ...msgs
            ]);
          }
        } catch (error) {
          console.error('Error loading conversation:', error);
          // Don't clear conversationId here, just show error
          setNotification('Failed to load conversation. Please try again.');
        }
      }
    };

    loadSelectedConversation();
  }, [conversationId, token]);

  const handleConversationClick = useCallback(async (selectedConversationId: string) => {
    if (!token) {
      setNotification('Authentication required.');
      return;
    }

    if (!selectedConversationId) {
      console.error('No conversation ID provided');
      setNotification('Invalid conversation selected.');
      return;
    }

    console.log('Loading conversation:', selectedConversationId);
    setIsChatLoading(true);

    try {
      const response = await fetch(ROUTES.CONVERSATIONS(selectedConversationId), {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || 
          `Failed to fetch conversation: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log('Conversation data:', data);
      
      if (!data.messages || !Array.isArray(data.messages)) {
        throw new Error('Invalid message data received from server');
      }

      const msgs = data.messages.map((msg: { type: string; content: string }) => ({
        sender: msg.type === 'user' ? 'user' as const : 'whizard' as const,
        text: msg.content
      }));

      setConversationId(selectedConversationId);
      setMessages([
        { sender: 'whizard', text: 'Hi! I am WhiZard. Ask me anything about your uploaded sources.' },
        ...msgs
      ]);
    } catch (err) {
      console.error('Error loading conversation:', err);
      setNotification(err instanceof Error ? err.message : 'Failed to load conversation messages.');
      setMessages([{ 
        sender: 'whizard', 
        text: 'Hi! I am WhiZard. Ask me anything about your uploaded sources.' 
      }]);
    } finally {
      setIsChatLoading(false);
    }
  }, [token]);

  const createNewConversation = useCallback(async () => {
    if (!projectId) {
      throw new Error('Project ID is required.');
    }

    const formData = new FormData();
    formData.append('project_id', projectId);
    
    const response = await fetch(ROUTES.NEW_CONVERSATION, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to start new chat');
    }

    const result = await response.json();
    
    if (!result.id) {
      throw new Error('No conversation ID received');
    }

    return result.id;
  }, [projectId, token]);

  const handleNewChat = useCallback(async () => {
    if (!projectId) {
      setNotification('Project ID is required.');
      return;
    }
    
    if (sources.length === 0) {
      setNotification('Please add at least one source before starting a new chat.');
      return;
    }

    try {
      console.log('Creating new chat for project:', projectId);
      const newConversationId = await createNewConversation();
      
      console.log('New chat created:', newConversationId);
      setConversationId(newConversationId);
      setMessages([{ sender: 'whizard', text: 'Hi! I am WhiZard. Ask me anything about your uploaded sources.' }]);
      
      // Refresh chat history sidebar immediately
      if (fetchConversationsRef.current) {
        await fetchConversationsRef.current();
      }
      
      // Select the newly created conversation
      if (handleConversationClickRef.current) {
        await handleConversationClickRef.current(newConversationId);
      }
    } catch (error) {
      console.error('New chat error:', error);
      setNotification(error instanceof Error ? error.message : 'Failed to start a new chat.');
    }
  }, [projectId, sources.length, createNewConversation]);

  // Update refs when functions change
  useEffect(() => {
    handleNewChatRef.current = handleNewChat;
  }, [handleNewChat]);

  useEffect(() => {
    handleConversationClickRef.current = handleConversationClick;
  }, [handleConversationClick]);

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
    if (!projectId) {
      setNotification('Project ID is required.');
      return;
    }

    setIsUploading(true);
    try {
      // First create a new conversation
      const newConvFormData = new FormData();
      newConvFormData.append('project_id', projectId);
      
      const newConvResponse = await fetch(ROUTES.NEW_CONVERSATION, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: newConvFormData
      });

      if (!newConvResponse.ok) {
        throw new Error('Failed to create new conversation');
      }

      const newConvResult = await newConvResponse.json();
      const newConversationId = newConvResult.id; // Using id instead of conversation_id

      // Now upload the content
      const formData = new FormData();
      if (selectedFile) formData.append('files', selectedFile);
      if (userContent.trim()) formData.append('text', userContent);
      if (youtubeUrl.trim()) formData.append('youtube_urls', youtubeUrl);
      formData.append('project_id', projectId);

      console.log('Uploading with project_id:', projectId);

      const uploadResponse = await fetch(ROUTES.UPLOAD, {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }

      const uploadResult = await uploadResponse.json();
      console.log('Upload result:', uploadResult);

      // Set conversation ID from the new conversation
      setConversationId(newConversationId);
      console.log('Set conversation ID to:', newConversationId);

      // Get topics
      const topicsResponse = await fetch(ROUTES.TOPICS(newConversationId), {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!topicsResponse.ok) {
        throw new Error(`Topics failed: ${topicsResponse.status}`);
      }

      const topicsResult = await topicsResponse.json();
      setTopics(topicsResult.topics);
      setShowTopics(true);

      // Reset the form
      setUserContent('');
      setSelectedFile(null);
      setYoutubeUrl('');
      
      // Set initial message and start chat
      setMessages([
        { sender: 'whizard', text: 'Hi! I am WhiZard. Ask me anything about your uploaded sources.' }
      ]);

      // Refresh sources after upload
      await fetchSources();
      
      // Refresh conversations list and select the new conversation
      await fetchConversations();
      
      // Load the conversation messages
      await handleConversationClick(newConversationId);
      
      // Close the modal
      setShowUploadModal(false);
      
      // Show success message
      setNotification('Content uploaded successfully!');
      setTimeout(() => setNotification(null), 3000);

    } catch (error) {
      console.error('Upload error:', error);
      setNotification(error instanceof Error ? error.message : 'Failed to process content. Please try again.');
      setConversationId(null);
      setTopics([]);
      setShowTopics(false);
    }
    setIsUploading(false);
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

    if (!conversationId) {
      setNotification('Please upload content or select a conversation first.');
      return;
    }

    if (!projectId) {
      setNotification('Project ID is required.');
      return;
    }

    const userMessage: Message = {
      sender: 'user',
      text: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsChatLoading(true);

    try {
      console.log('Sending chat message:', {
        conversationId,
        projectId,
        message: input.trim()
      });

      const formData = new FormData();
      formData.append('user_input', input.trim());
      formData.append('conversation_id', conversationId);
      formData.append('project_id', projectId);

      const response = await fetch(ROUTES.CHAT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || 
          `Chat request failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log('Chat response:', data);

      if (!data.response) {
        throw new Error('No response received from server');
      }

      const botMessage: Message = {
        sender: 'whizard',
        text: data.response
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Refresh conversations after new message
      await fetchConversations();
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        sender: 'whizard',
        text: 'Sorry, I encountered an error. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
      setNotification(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
    }

    setIsChatLoading(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
      <Box sx={{
        width: { xs: '100%', md: 300 },
        bgcolor: 'grey.100',
        borderRight: 1,
        borderColor: 'divider',
        p: 2,
        display: { xs: showTopics ? 'none' : 'flex', md: 'flex' },
        flexDirection: 'column',
        gap: 2,
        overflowY: 'auto',
        position: { xs: 'fixed', md: 'relative' },
        zIndex: { xs: 1200, md: 1 },
        height: '100%'
      }}>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => setShowUploadModal(true)}
          fullWidth
          sx={{
            borderRadius: 2,
            fontWeight: 600,
            textTransform: 'none',
            py: 1.5,
            fontSize: '1rem',
            mb: 1
          }}
        >
          Upload Sources
        </Button>
        <Box sx={{ px: 2 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Sources</Typography>
          <List dense sx={{
            flexGrow: 1,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 1,
            mb: 2,
            overflowY: 'auto',
            width: '100%'
          }}>
            {sources.length === 0 ? (
              <ListItemText primary="No sources yet." sx={{ px: 2, py: 1, color: 'text.secondary' }} />
            ) : (
              sources.map((src, idx) => (
                <ListItemButton key={src.id || idx} selected={false} sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  px: 2,
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}>
                  <ListItemText
                    primary={src.name || src.filename || `Source ${idx + 1}`}
                    secondary={src.type || ''}
                    primaryTypographyProps={{ noWrap: true }}
                    secondaryTypographyProps={{ noWrap: true }}
                  />
                </ListItemButton>
              ))
            )}
          </List>
        </Box>
      </Box>

      {/* Main Chat Area */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        minWidth: 0,
        height: '100vh',
        overflow: 'hidden',
        bgcolor: '#f8f9fa'
      }}>
        {/* Header with Back Button */}
        <Box sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          bgcolor: 'background.paper',
          position: 'relative'
        }}>
          <Button
            onClick={handleBack}
            variant="outlined"
            size="small"
            sx={{ 
              borderRadius: 2,
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          >
            Back
          </Button>
          {/* New Chat button at top right, only on md+ screens */}
          <Button
            variant="outlined"
            size="small"
            onClick={handleNewChat}
            sx={{
              borderRadius: 2,
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              display: { xs: 'none', md: 'inline-flex' }
            }}
          >
            New Chat
          </Button>
          <Typography variant="h6" sx={{ 
            fontWeight: 600,
            margin: '0 auto',
            textAlign: 'center',
            width: '100%'
          }}>
            Chat
          </Typography>
          <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1, ml: 'auto' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowTopics(!showTopics)}
              sx={{ borderRadius: 2 }}
            >
              {showTopics ? 'Chat' : 'History'}
            </Button>
          </Box>
        </Box>

        {/* Chat Messages */}
        <Box sx={{
          flexGrow: 1,
          overflowY: 'auto',
          pt: 2,
          pb: 10,
          px: { xs: 2, md: 3 },
          bgcolor: 'background.default',
          display: { xs: showTopics ? 'none' : 'block', md: 'block' },
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'background.paper',
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'grey.300',
            borderRadius: '4px',
            '&:hover': {
              bgcolor: 'grey.400',
            },
          },
          scrollBehavior: 'smooth',
        }}>
          {messages.map((message, index) => (
            <Box
              key={index}
              ref={(el: HTMLDivElement | null) => messageRefs.current[index] = el}
              sx={{
                opacity: 0,
                animation: 'fadeIn 0.3s ease-in-out forwards',
                '@keyframes fadeIn': {
                  from: { opacity: 0, transform: 'translateY(10px)' },
                  to: { opacity: 1, transform: 'translateY(0)' }
                },
                animationDelay: `${index * 0.1}s`
              }}
            >
              <ChatMessage message={message} />
            </Box>
          ))}
          <div ref={chatEndRef} style={{ height: '20px' }} />
        </Box>

        {/* Chat Input */}
        <Box sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          px: { xs: 2, md: 3 },
          pb: 2,
          pt: 1,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          backdropFilter: 'blur(8px)',
          boxShadow: '0px -4px 10px rgba(0, 0, 0, 0.05)',
          display: { xs: showTopics ? 'none' : 'block', md: 'block' },
          width: '100%'
        }}>
          <Box sx={{ 
            width: '100%',
            maxWidth: '100%',
            margin: '0 auto',
            '& > *': { 
              width: '100%'
            }
          }}>
            <ChatInput
              value={input}
              onChange={setInput}
              onSend={handleSend}
              isLoading={isChatLoading}
              onKeyDown={handleInputKeyDown}
            />
          </Box>
        </Box>
      </Box>

      {/* Right Sidebar: Interactive, Chat History & New Chat */}
      <Box sx={{
        width: { xs: '100%', md: 300 },
        bgcolor: 'grey.50',
        borderLeft: 1,
        borderColor: 'divider',
        p: 2,
        display: { xs: showTopics ? 'flex' : 'none', md: 'flex' },
        flexDirection: 'column',
        gap: 2,
        overflowY: 'auto',
        position: { xs: 'fixed', md: 'relative' },
        zIndex: { xs: 1200, md: 1 },
        height: '100%',
        right: 0
      }}>
        {/* Interactive Button at Top */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleGenerateMagic}
          fullWidth
          sx={{
            borderRadius: 2,
            fontWeight: 600,
            textTransform: 'none',
            py: 1.5,
            fontSize: '1rem',
            mb: 2
          }}
        >
          Interactive
        </Button>

        {/* Chat History Section */}
        <Box sx={{ px: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Chat History</Typography>
          </Box>
          <List dense sx={{
            flexGrow: 1,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 1,
            height: 'calc(100vh - 180px)',
            overflowY: 'auto',
            width: '100%',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: 'background.paper',
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: 'grey.300',
              borderRadius: '4px',
              '&:hover': {
                bgcolor: 'grey.400',
              },
            },
            pb: 2
          }}>
            {conversations.length === 0 ? (
              <ListItemText primary="No chat history yet." sx={{ px: 2, py: 1, color: 'text.secondary' }} />
            ) : (
              conversations.map((conv: any) => (
                <ListItemButton
                  key={conv.id}
                  onClick={() => {
                    if (conv.id) {
                      handleConversationClick(conv.id);
                    } else {
                      console.error('Conversation missing ID:', conv);
                      setNotification('Invalid conversation data.');
                    }
                  }}
                  selected={conv.id === conversationId}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    px: 2,
                    '&:hover': {
                      bgcolor: 'action.hover'
                    },
                    '&.Mui-selected': {
                      bgcolor: 'primary.light',
                      '&:hover': {
                        bgcolor: 'primary.light'
                      }
                    }
                  }}
                >
                  <ListItemText
                    primary={conv.title || `Conversation ${conv.id.slice(0, 8)}`}
                    secondary={conv.created_at ? new Date(conv.created_at).toLocaleString() : ''}
                    primaryTypographyProps={{ noWrap: true }}
                    secondaryTypographyProps={{ noWrap: true }}
                  />
                </ListItemButton>
              ))
            )}
          </List>
        </Box>
      </Box>

      {/* Upload Modal */}
      <Dialog
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 3
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          px: 3,
          py: 2
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Upload Content</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Text Content
                <Typography component="span" color="error" sx={{ ml: 1 }}>
                  (Max 5000 characters)
                </Typography>
              </Typography>
              <TextField
                multiline
                rows={4}
                placeholder="Enter text content..."
                value={userContent}
                onChange={(e) => setUserContent(e.target.value)}
                fullWidth
                variant="outlined"
                error={userContent.length > 5000}
                helperText={`${userContent.length}/5000 characters`}
              />
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                PDF Upload
                <Typography component="span" color="error" sx={{ ml: 1 }}>
                  (Max 5MB)
                </Typography>
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                sx={{ width: 'fit-content' }}
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
                <Typography 
                  variant="body2" 
                  color={selectedFile.size > 5 * 1024 * 1024 ? 'error' : 'text.secondary'}
                  sx={{ mt: 1 }}
                >
                  Selected file: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  {selectedFile.size > 5 * 1024 * 1024 && (
                    <Typography component="span" color="error">
                      {' '}(File size exceeds 5MB limit)
                    </Typography>
                  )}
                </Typography>
              )}
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                YouTube URL
              </Typography>
              <TextField
                placeholder="Enter YouTube URL..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                fullWidth
                variant="outlined"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: 1, 
          borderColor: 'divider',
          px: 3,
          py: 2
        }}>
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