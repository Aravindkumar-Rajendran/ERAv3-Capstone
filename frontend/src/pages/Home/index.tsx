import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Book, Chat, Quiz, Timeline } from '@mui/icons-material';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Book sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: 'NCERT Books',
      description: 'Access and explore all NCERT textbooks in one place',
      action: () => navigate('/ncert')
    },
    {
      icon: <Chat sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: 'AI Chat',
      description: 'Get instant answers to your questions from our AI assistant',
      action: () => navigate('/chat')
    },
    {
      icon: <Quiz sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: 'Interactive Quizzes',
      description: 'Test your knowledge with our interactive quizzes',
      action: () => navigate('/quizzes')
    },
    {
      icon: <Timeline sx={{ fontSize: 60, color: 'primary.main' }} />,
      title: 'Timeline',
      description: 'Visualize historical events with our interactive timeline',
      action: () => navigate('/timeline')
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to WhiZardLM
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Your interactive learning companion for NCERT content
        </Typography>
      </Box>

      <Box
        display="grid"
        gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
        gap={4}
        mt={4}
      >
        {features.map((feature, index) => (
          <Box
            key={index}
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: 'background.paper',
              boxShadow: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3,
              },
            }}
          >
            <Box mb={2}>{feature.icon}</Box>
            <Typography variant="h6" gutterBottom>
              {feature.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              {feature.description}
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={feature.action}
              fullWidth
              sx={{ mt: 'auto' }}
            >
              Explore
            </Button>
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default Home;
