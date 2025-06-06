import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { Timeline as MuiTimeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab';

interface TimelineEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  icon?: React.ReactNode;
}

interface TimelineProps {
  events: TimelineEvent[];
}

const Timeline: React.FC<TimelineProps> = ({ events }) => {
  const theme = useTheme();

  return (
    <Box sx={{ maxWidth: '800px', margin: '0 auto', padding: 2 }}>
      <MuiTimeline position="alternate">
        {events.map((event, index) => (
          <TimelineItem key={event.id}>
            <TimelineSeparator>
              <TimelineDot color="primary" variant={index % 2 === 0 ? 'outlined' : 'filled'}>
                {event.icon || null}
              </TimelineDot>
              {index < events.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent sx={{ py: '12px', px: 2 }}>
              <Paper elevation={3} sx={{ p: 2, backgroundColor: theme.palette.background.paper }}>
                <Typography variant="h6" component="h2">
                  {event.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {event.date}
                </Typography>
                <Typography variant="body1">
                  {event.description}
                </Typography>
              </Paper>
            </TimelineContent>
          </TimelineItem>
        ))}
      </MuiTimeline>
    </Box>
  );
};

export default Timeline;
