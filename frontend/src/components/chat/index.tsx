import React from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Avatar,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { SmartToy as BotIcon, Person as UserIcon } from '@mui/icons-material';

interface Message {
  sender: 'user' | 'whizard';
  text: string;
}

interface ChatMessageProps {
  message: Message;
}

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        alignItems: 'flex-start',
        mb: 2,
        gap: 1,
      }}
    >
      {!isUser && (
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            width: 32,
            height: 32,
          }}
        >
          <BotIcon fontSize="small" />
        </Avatar>
      )}
      <Paper
        elevation={1}
        sx={{
          maxWidth: '70%',
          p: 2,
          bgcolor: isUser ? 'primary.main' : 'background.paper',
          borderRadius: 2,
          borderTopLeftRadius: !isUser ? 0 : 2,
          borderTopRightRadius: isUser ? 0 : 2,
          boxShadow: 2,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            [isUser ? 'right' : 'left']: -10,
            borderStyle: 'solid',
            borderWidth: '10px 10px 0 0',
            borderColor: `${isUser ? 'primary.main' : 'background.paper'} transparent transparent transparent`,
            transform: isUser ? 'scaleX(-1)' : 'none',
          },
        }}
      >
        <Typography
          variant="body1"
          sx={{
            color: isUser ? 'white' : 'text.primary',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            lineHeight: 1.6,
          }}
        >
          {message.text}
        </Typography>
      </Paper>
      {isUser && (
        <Avatar
          sx={{
            bgcolor: 'grey.400',
            width: 32,
            height: 32,
          }}
        >
          <UserIcon fontSize="small" />
        </Avatar>
      )}
    </Box>
  );
};

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  isLoading,
  onKeyDown,
}) => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        bgcolor: 'background.paper',
        borderRadius: 2,
        transition: 'box-shadow 0.3s ease',
        '&:hover': {
          boxShadow: 4,
        },
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Type your message..."
        variant="outlined"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            bgcolor: 'background.paper',
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: 'grey.50',
            },
            '&.Mui-focused': {
              bgcolor: 'grey.50',
            },
          },
        }}
      />
      <IconButton
        color="primary"
        onClick={onSend}
        disabled={isLoading || !value.trim()}
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          transition: 'all 0.3s ease',
          '&:hover': {
            bgcolor: 'primary.dark',
            transform: 'scale(1.05)',
          },
          '&.Mui-disabled': {
            bgcolor: 'grey.300',
            color: 'grey.500',
          },
          width: 48,
          height: 48,
          borderRadius: 2,
        }}
      >
        {isLoading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          <SendIcon />
        )}
      </IconButton>
    </Paper>
  );
}; 