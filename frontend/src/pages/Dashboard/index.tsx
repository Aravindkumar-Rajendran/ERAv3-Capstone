import { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  Button,
  CircularProgress,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  ListItemAvatar,
  Chip,
} from '@mui/material';
import {
  Book as BookIcon,
  Quiz as QuizIcon,
  Timeline as TimelineIcon,
  Chat as ChatIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

// Mock data - replace with actual API calls
const recentActivities = [
  { id: 1, type: 'quiz', title: 'Science Quiz', subject: 'Physics', time: '2 hours ago', score: '85%' },
  { id: 2, type: 'chapter', title: 'Chapter 5: Light', subject: 'Science', time: '1 day ago' },
  { id: 3, type: 'chat', title: 'Chat with AI Tutor', subject: 'Mathematics', time: '2 days ago' },
];

const recommendedContent = [
  { id: 1, title: 'Algebra Basics', subject: 'Mathematics', type: 'chapter', progress: 65 },
  { id: 2, title: 'Indian History Timeline', subject: 'History', type: 'timeline', progress: 30 },
  { id: 3, title: 'Chemical Reactions', subject: 'Chemistry', type: 'quiz', progress: 0 },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    completedQuizzes: 0,
    chaptersRead: 0,
    totalXP: 0,
    streak: 0,
  });

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setStats({
        completedQuizzes: 12,
        chaptersRead: 24,
        totalXP: 2450,
        streak: 5,
      });
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'quiz':
        return <QuizIcon color="primary" />;
      case 'chapter':
        return <BookIcon color="secondary" />;
      case 'timeline':
        return <TimelineIcon color="action" />;
      case 'chat':
        return <ChatIcon color="info" />;
      default:
        return <SchoolIcon />;
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }


  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
              <QuizIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">{stats.completedQuizzes}</Typography>
              <Typography variant="body2" color="text.secondary">
                Quizzes Completed
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'secondary.light', mr: 2 }}>
              <BookIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">{stats.chaptersRead}</Typography>
              <Typography variant="body2" color="text.secondary">
                Chapters Read
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'success.light', mr: 2 }}>
              <TrendingUpIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">{stats.totalXP} XP</Typography>
              <Typography variant="body2" color="text.secondary">
                Total XP
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'warning.light', mr: 2 }}>
              <CheckCircleIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">{stats.streak} days</Typography>
              <Typography variant="body2" color="text.secondary">
                Current Streak
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recommended Content */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            Continue Learning
          </Typography>
          <Grid container spacing={2}>
            {recommendedContent.map((item) => (
              <Grid item xs={12} sm={6} key={item.id}>
                <Card>
                  <CardActionArea onClick={() => navigate(`/${item.type}s/${item.id}`)}>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={1}>
                        {getIcon(item.type)}
                        <Chip
                          label={item.subject}
                          size="small"
                          sx={{ ml: 1 }}
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                      <Typography variant="h6" component="div">
                        {item.title}
                      </Typography>
                      {item.progress > 0 ? (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Progress: {item.progress}%
                          </Typography>
                          <Box
                            sx={{
                              width: '100%',
                              height: 4,
                              bgcolor: 'grey.200',
                              borderRadius: 2,
                              mt: 1,
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              sx={{
                                width: `${item.progress}%`,
                                height: '100%',
                                bgcolor: 'primary.main',
                              }}
                            />
                          </Box>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          New content
                        </Typography>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => navigate('/ncert')}
          >
            Browse All Content
          </Button>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {recentActivities.map((activity) => (
                <Fragment key={activity.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'action.hover' }}>
                        {getIcon(activity.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1">
                          {activity.title}
                          {activity.score && (
                            <Chip
                              label={activity.score}
                              size="small"
                              color="primary"
                              sx={{ ml: 1, verticalAlign: 'middle' }}
                            />
                          )}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary" display="block">
                            {activity.subject}
                          </Typography>
                          <Typography component="span" variant="body2" color="text.secondary">
                            {activity.time}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </Fragment>
              ))}
            </List>
            <Button
              fullWidth
              sx={{ mt: 1 }}
              onClick={() => navigate('/activity')}
            >
              View All Activity
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
