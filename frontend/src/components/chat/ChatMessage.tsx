import React from 'react';
import { Box, Typography, Paper, Avatar } from '@mui/material';
import { SmartToy as BotIcon } from '@mui/icons-material';

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
      }}
    >
      {isBot ? (
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            width: 32,
            height: 32,
          }}
        >
          <BotIcon sx={{ fontSize: 20 }} />
        </Avatar>
      ) : (
        <Avatar
          sx={{
            bgcolor: 'grey.400',
            width: 32,
            height: 32,
          }}
        />
      )}

      <Paper
        elevation={0}
        sx={{
          p: 2,
          maxWidth: '80%',
          bgcolor: isBot ? 'background.paper' : 'primary.light',
          borderRadius: 2,
        }}
      >
        <Typography
          variant="body1"
          sx={{
            color: 'text.primary',
            whiteSpace: 'pre-wrap',
          }}
        >
          {message.text}
        </Typography>
      </Paper>
    </Box>
  );
}; 