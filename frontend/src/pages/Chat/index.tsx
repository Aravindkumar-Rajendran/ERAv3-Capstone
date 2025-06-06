import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  IconButton, 
  List, 
  ListItem, 
  ListItemText, 
  Avatar, 
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Hello! How can I assist you today?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Simulate API call to AI
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add AI response
      const aiResponse: Message = {
        id: messages.length + 2,
        text: `I received your message: "${input}". This is a simulated response. In a real application, this would be connected to an AI service.`,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: 'calc(100vh - 64px)',
      p: 2
    }}>
      <Typography variant="h4" component="h1" gutterBottom>
        AI Chat Assistant
      </Typography>
      
      <Paper 
        elevation={3} 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: 2,
          overflow: 'hidden',
          mb: 2
        }}
      >
        {/* Messages Area */}
        <Box 
          sx={{ 
            flexGrow: 1, 
            p: 2, 
            overflowY: 'auto',
            bgcolor: 'background.default'
          }}
        >
          <List>
            {messages.map((message) => (
              <React.Fragment key={message.id}>
                <ListItem 
                  sx={{
                    justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                    alignItems: 'flex-start',
                    mb: 1
                  }}
                >
                  {message.sender === 'ai' && (
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                      <SmartToyIcon />
                    </Avatar>
                  )}
                  <Box
                    sx={{
                      maxWidth: '70%',
                      bgcolor: message.sender === 'user' ? 'primary.main' : 'background.paper',
                      color: message.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                      p: 2,
                      borderRadius: 2,
                      boxShadow: 1,
                      position: 'relative',
                    }}
                  >
                    <Typography variant="body1">{message.text}</Typography>
                    <Typography 
                      variant="caption" 
                      sx={{
                        display: 'block',
                        textAlign: 'right',
                        mt: 0.5,
                        color: message.sender === 'user' ? 'primary.contrastText' : 'text.secondary',
                        opacity: 0.8
                      }}
                    >
                      {formatTime(message.timestamp)}
                    </Typography>
                  </Box>
                  {message.sender === 'user' && (
                    <Avatar sx={{ bgcolor: 'secondary.main', ml: 1 }}>
                      <PersonIcon />
                    </Avatar>
                  )}
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
            <div ref={messagesEndRef} />
          </List>
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </Box>
        
        {/* Input Area */}
        <Box 
          component="form" 
          onSubmit={handleSendMessage}
          sx={{ 
            p: 2, 
            borderTop: '1px solid', 
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            sx={{ 
              mr: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 4,
                bgcolor: 'background.default'
              }
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <IconButton 
            color="primary" 
            type="submit" 
            disabled={!input.trim() || isLoading}
            sx={{ 
              p: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              '&:disabled': {
                bgcolor: 'action.disabledBackground',
                color: 'action.disabled'
              }
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default Chat;
