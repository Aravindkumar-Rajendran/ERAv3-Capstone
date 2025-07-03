import React from 'react';
import { Box, Typography, Paper, Avatar } from '@mui/material';
import { AutoFixHigh as WizardIcon, Person as UserIcon } from '@mui/icons-material';

interface ChatMessageProps {
  message: {
    sender: 'user' | 'whizard';
    text: string;
  };
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.sender === 'whizard';

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        mb: 3,
        px: 2,
        flexDirection: isBot ? 'row' : 'row-reverse',
        justifyContent: isBot ? 'flex-start' : 'flex-end',
        alignItems: 'flex-start',
      }}
    >
      <Avatar
        sx={{
          bgcolor: isBot ? 'primary.main' : '#6366f1',
          width: 32,
          height: 32,
        }}
      >
        {isBot ? (
          <WizardIcon sx={{ fontSize: 20 }} />
        ) : (
          <UserIcon sx={{ fontSize: 20 }} />
        )}
      </Avatar>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          maxWidth: '80%',
          bgcolor: isBot ? 'background.paper' : '#e0e7ff',
          borderRadius: 2,
          boxShadow: isBot ? 1 : 'none',
          borderWidth: isBot ? 0 : 1,
          borderStyle: 'solid',
          borderColor: isBot ? 'transparent' : '#c7d2fe',
          ml: isBot ? 0 : 'auto',
          mr: isBot ? 'auto' : 0,
        }}
      >
        <Typography
          variant="body1"
          sx={{
            color: isBot ? 'text.primary' : '#1e1b4b',
            whiteSpace: 'pre-wrap',
            fontWeight: isBot ? 'normal' : 500
          }}
        >
          {message.text}
        </Typography>
      </Paper>
    </Box>
  );
}; 