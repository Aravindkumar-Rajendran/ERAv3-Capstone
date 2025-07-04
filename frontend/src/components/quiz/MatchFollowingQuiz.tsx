import React, { useState } from 'react';
import { MatchFollowingQuestion, Theme } from '../../types/quiz';
import {
  Box,
  Button,
  Typography,
  Paper,
  Stack,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Refresh as RetryIcon,
  EmojiEvents as TrophyIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';

interface MatchFollowingQuizProps {
  questions: MatchFollowingQuestion[];
  theme: Theme;
  onComplete: (score: number, totalQuestions: number) => void;
  onClose: () => void;
}

interface MatchPair {
  leftId: number;
  rightId: number;
  leftText: string;
  rightText: string;
  isCorrect: boolean;
}

export const MatchFollowingQuiz: React.FC<MatchFollowingQuizProps> = ({
  questions,
  theme,
  onComplete,
  onClose,
}) => {
  const muiTheme = useTheme();
  const [selectedPairs, setSelectedPairs] = useState<MatchPair[]>([]);
  const [lockedLeftItems, setLockedLeftItems] = useState<number[]>([]);
  const [lockedRightItems, setLockedRightItems] = useState<number[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // For demo, we'll use the first question's pairs
  const currentQuestion = questions[0];
  const leftItems = currentQuestion.pairs;

  // Create shuffled right options but keep them FIXED during gameplay
  const [rightItems] = useState(() => {
    const shuffledOptions = [...currentQuestion.pairs].sort(() => Math.random() - 0.5);
    return shuffledOptions;
  });

  const handleLeftClick = (leftItem: any) => {
    if (lockedLeftItems.includes(leftItem.id)) return;
    setSelectedLeft(leftItem.id);
  };

  const handleRightClick = (rightItem: any) => {
    if (lockedRightItems.includes(rightItem.id) || selectedLeft === null) return;

    const leftItem = leftItems.find((item) => item.id === selectedLeft);
    if (!leftItem) return;

    const newPair: MatchPair = {
      leftId: leftItem.id,
      rightId: rightItem.id,
      leftText: leftItem.left,
      rightText: rightItem.right,
      isCorrect: leftItem.right === rightItem.right,
    };

    setSelectedPairs((prev) => [...prev, newPair]);
    setLockedLeftItems((prev) => [...prev, selectedLeft]);
    setLockedRightItems((prev) => [...prev, rightItem.id]);
    setSelectedLeft(null);
  };

  const handleSubmit = () => {
    if (selectedPairs.length !== leftItems.length) return;

    const correctPairs = selectedPairs.filter((pair) => pair.isCorrect).length;
    setScore(correctPairs);
    setIsSubmitted(true);
    setShowResults(true);
  };

  const handleRetry = () => {
    setSelectedPairs([]);
    setLockedLeftItems([]);
    setLockedRightItems([]);
    setSelectedLeft(null);
    setIsSubmitted(false);
    setShowResults(false);
    setScore(0);
  };

  const handleFinish = () => {
    setIsCompleted(true);
    onComplete(score, leftItems.length);
  };

  if (isCompleted) {
    const percentage = Math.round((score / leftItems.length) * 100);

    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <TrophyIcon
          sx={{ fontSize: 80, color: 'primary.main', mb: 2 }}
        />
        <Typography variant="h3" gutterBottom>
          Match Following Completed!
        </Typography>

        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 4,
            maxWidth: 500,
            mx: 'auto',
            bgcolor: 'primary.light',
            color: 'primary.contrastText',
          }}
        >
          <Typography variant="h4" gutterBottom>
            Final Score: {score} / {leftItems.length}
          </Typography>
          <Typography variant="h5" gutterBottom>
            Percentage: {percentage}%
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {percentage >= 80
              ? '⭐⭐⭐ Outstanding!'
              : percentage >= 60
              ? '⭐⭐ Good Job!'
              : percentage >= 40
              ? '⭐ Keep Learning!'
              : 'Try Again!'}
          </Typography>
        </Paper>

        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={onClose}
        >
          Close Quiz
        </Button>
      </Box>
    );
  }

  const progress = (selectedPairs.length / leftItems.length) * 100;

  return (
    <Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ mb: 4, height: 8, borderRadius: 4 }}
      />

      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Match the Following
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {currentQuestion.instruction}
        </Typography>
        <Typography variant="subtitle1">
          Pairs Matched: {selectedPairs.length} / {leftItems.length}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mb: 4 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" gutterBottom align="center" color="primary">
            Questions
          </Typography>
          <Stack spacing={2}>
            {leftItems.map((item) => {
              const isLocked = lockedLeftItems.includes(item.id);
              const isSelected = selectedLeft === item.id;
              const matchedPair = selectedPairs.find((p) => p.leftId === item.id);

              return (
                <Paper
                  key={item.id}
                  elevation={isSelected ? 4 : 1}
                  onClick={() => handleLeftClick(item)}
                  sx={{
                    p: 2,
                    cursor: isLocked ? 'default' : 'pointer',
                    bgcolor: isLocked
                      ? matchedPair?.isCorrect
                        ? 'success.light'
                        : 'error.light'
                      : isSelected
                      ? 'primary.light'
                      : 'background.paper',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: isLocked ? 'none' : 'translateX(8px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography variant="body1">{item.left}</Typography>
                    {isLocked && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ArrowIcon sx={{ mx: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {matchedPair?.rightText}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" gutterBottom align="center" color="primary">
            Answers
          </Typography>
          <Stack spacing={2}>
            {rightItems.map((item) => {
              const isLocked = lockedRightItems.includes(item.id);
              const matchedPair = selectedPairs.find((p) => p.rightId === item.id);

              return (
                <Paper
                  key={item.id}
                  elevation={1}
                  onClick={() => handleRightClick(item)}
                  sx={{
                    p: 2,
                    cursor:
                      isLocked || !selectedLeft ? 'default' : 'pointer',
                    bgcolor: isLocked
                      ? matchedPair?.isCorrect
                        ? 'success.light'
                        : 'error.light'
                      : 'background.paper',
                    opacity: isLocked ? 0.8 : 1,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform:
                        isLocked || !selectedLeft ? 'none' : 'translateX(-8px)',
                    },
                  }}
                >
                  <Typography variant="body1">{item.right}</Typography>
                </Paper>
              );
            })}
          </Stack>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 2,
          mt: 4,
        }}
      >
        <Button
          variant="outlined"
          color="warning"
          startIcon={<RetryIcon />}
          onClick={handleRetry}
          disabled={selectedPairs.length === 0}
        >
          Reset
        </Button>

        {showResults ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleFinish}
            startIcon={<CheckIcon />}
          >
            Complete Quiz
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={selectedPairs.length !== leftItems.length}
            startIcon={<CheckIcon />}
          >
            Check Answers
          </Button>
        )}
      </Box>
    </Box>
  );
}; 