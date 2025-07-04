import React from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  CircularProgress,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading?: boolean;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  isLoading = false,
  onKeyDown,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        backgroundColor: 'background.default',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          width: '100%'
        }}
      >
        <TextField
          fullWidth
          placeholder="Ask and Learn with WhiZard"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={isLoading}
          multiline
          maxRows={4}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: 'background.paper',
            },
          }}
        />
        <IconButton
          color="primary"
          onClick={onSend}
          disabled={!value.trim() || isLoading}
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
            '&.Mui-disabled': {
              bgcolor: 'action.disabledBackground',
              color: 'action.disabled',
            },
          }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <SendIcon />
          )}
        </IconButton>
      </Box>
    </Paper>
  );
}; 