import React from 'react';
import { Box, Typography } from '@mui/material';

const Chat = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        AI Chat
      </Typography>
      <Box sx={{ mt: 3, p: 2, border: '1px solid #ddd', borderRadius: 1, minHeight: '60vh' }}>
        <Typography>Chat interface will be implemented here</Typography>
      </Box>
    </Box>
  );
};

export default Chat;
