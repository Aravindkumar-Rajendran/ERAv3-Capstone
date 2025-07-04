import React, { useState } from 'react';
import { TrueFalseQuestion, Theme } from '../../types/quiz';
import {
  Box,
  Button,
  Typography,
  Paper,
  Stack,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Lightbulb as HintIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  EmojiEvents as TrophyIcon,
  Refresh as RetryIcon,
} from '@mui/icons-material';

interface TrueFalseQuizProps {
  questions: TrueFalseQuestion[];
  theme: Theme;
  onComplete: (score: number, totalQuestions: number) => void;
  onClose: () => void;
}

interface QuestionState {
  answered: boolean;
  selectedAnswer: boolean | null;
  usedHint: boolean;
  score: number;
}

export const TrueFalseQuiz: React.FC<TrueFalseQuizProps> = ({
  questions,
  theme,
  onComplete,
  onClose,
}) => {
  const muiTheme = useTheme();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>(
    questions.map(() => ({
      answered: false,
      selectedAnswer: null,
      usedHint: false,
      score: 0,
    }))
  );
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const currentState = questionStates[currentQuestionIndex];
  const totalScore = questionStates.reduce((sum, state) => sum + state.score, 0);

  const handleAnswer = (answer: boolean) => {
    if (currentState.answered) return;

    const isCorrect = answer === currentQuestion.correctAnswer;
    const score = isCorrect ? (currentState.usedHint ? 0.5 : 1) : 0;

    const newStates = [...questionStates];
    newStates[currentQuestionIndex] = {
      answered: true,
      selectedAnswer: answer,
      usedHint: currentState.usedHint,
      score: score,
    };

    setQuestionStates(newStates);
    setShowHint(false);
  };

  const handleHint = () => {
    if (currentState.answered) return;

    setShowHint(true);
    const newStates = [...questionStates];
    newStates[currentQuestionIndex] = {
      ...newStates[currentQuestionIndex],
      usedHint: true,
    };
    setQuestionStates(newStates);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowHint(false);
    } else {
      const allAnswered = questionStates.every((state) => state.answered);
      if (allAnswered) {
        setIsCompleted(true);
        onComplete(totalScore, questions.length);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowHint(false);
    }
  };

  if (isCompleted) {
    const percentage = Math.round((totalScore / questions.length) * 100);

    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <TrophyIcon
          sx={{ fontSize: 80, color: 'primary.main', mb: 2 }}
        />
        <Typography variant="h3" gutterBottom>
          True or False Completed!
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
            Final Score: {totalScore} / {questions.length}
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

        <Card sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Question Breakdown:
            </Typography>
            {questions.map((_, index) => {
              const state = questionStates[index];
              return (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1,
                    p: 1,
                    borderRadius: 1,
                    bgcolor:
                      state.score === 1
                        ? 'success.light'
                        : state.score === 0.5
                        ? 'warning.light'
                        : 'error.light',
                  }}
                >
                  <Typography variant="body1">
                    Question {index + 1}
                  </Typography>
                  <Chip
                    label={state.score.toFixed(1)}
                    color={
                      state.score === 1
                        ? 'success'
                        : state.score === 0.5
                        ? 'warning'
                        : 'error'
                    }
                  />
                </Box>
              );
            })}
          </CardContent>
        </Card>

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

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ mb: 4, height: 8, borderRadius: 4 }}
      />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Question {currentQuestionIndex + 1} of {questions.length}
        </Typography>
        <Typography variant="h5" gutterBottom>
          {currentQuestion.statement}
        </Typography>
      </Box>

      <Stack spacing={2} direction="row" justifyContent="center" sx={{ mb: 4 }}>
        <Button
          variant="contained"
          color="success"
          size="large"
          startIcon={<CheckIcon />}
          onClick={() => handleAnswer(true)}
          disabled={currentState.answered}
          sx={{ minWidth: 120 }}
        >
          True
        </Button>
        <Button
          variant="contained"
          color="error"
          size="large"
          startIcon={<CloseIcon />}
          onClick={() => handleAnswer(false)}
          disabled={currentState.answered}
          sx={{ minWidth: 120 }}
        >
          False
        </Button>
      </Stack>

      {currentState.answered && (
        <Paper
          elevation={2}
          sx={{
            p: 2,
            mb: 4,
            bgcolor: currentState.score > 0 ? 'success.light' : 'error.light',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {currentState.score > 0 ? (
            <CheckIcon color="success" />
          ) : (
            <CloseIcon color="error" />
          )}
          <Typography variant="body1">
            {currentState.score > 0
              ? `Correct! ${currentState.usedHint ? '+0.5 points' : '+1 point'}`
              : 'Incorrect. Try the next question!'}
          </Typography>
        </Paper>
      )}

      {showHint && !currentState.answered && (
        <Paper
          elevation={2}
          sx={{
            p: 2,
            mb: 4,
            bgcolor: 'warning.light',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <HintIcon color="warning" />
          <Typography variant="body1">{currentQuestion.hint}</Typography>
        </Paper>
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 4,
        }}
      >
        <Box>
          <Tooltip title="Previous Question">
            <span>
              <IconButton
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                <PrevIcon />
              </IconButton>
            </span>
          </Tooltip>
          {!currentState.answered && !currentState.usedHint && (
            <Tooltip title="Show Hint">
              <IconButton
                onClick={handleHint}
                color="warning"
                sx={{ ml: 1 }}
              >
                <HintIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {currentState.answered && (
          <Button
            variant="contained"
            color="primary"
            endIcon={<NextIcon />}
            onClick={handleNext}
          >
            {currentQuestionIndex === questions.length - 1
              ? 'Complete Quiz'
              : 'Next Question'}
          </Button>
        )}
      </Box>
    </Box>
  );
}; 