import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Dashboard = () => {
  return (
    <Box p={4}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Upload & Input
        </Typography>
        {/* Upload features will be implemented here */}
        <Typography variant="body1">Upload PDF, paste text, or enter a YouTube URL to get started.</Typography>
      </Paper>
    </Box>
  );
};

export default Dashboard; 