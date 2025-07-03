import React, { useState } from 'react';
import { MCQQuestion, Theme } from '../../types/quiz';
import {
  Box,
  Button,
  Typography,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  LinearProgress,
  Card,
  CardContent,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Lightbulb as HintIcon,
  Refresh as RetryIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';

interface QuestionState {
  selectedAnswer: number | null;
  isAnswered: boolean;
  showFeedback: boolean;
  isCorrect: boolean;
  showHint: boolean;
  isFirstAttempt: boolean;
  showCorrectAnswer: boolean;
  score: number;
}

interface MCQQuizProps {
  questions: MCQQuestion[];
  theme: Theme;
  onComplete: (score: number, totalQuestions: number) => void;
  onClose: () => void;
}

export const MCQQuiz: React.FC<MCQQuizProps> = ({
  questions,
  theme,
  onComplete,
  onClose,
}) => {
  const muiTheme = useTheme();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>(() =>
    questions.map(() => ({
      selectedAnswer: null,
      isAnswered: false,
      showFeedback: false,
      isCorrect: false,
      showHint: false,
      isFirstAttempt: true,
      showCorrectAnswer: false,
      score: 0,
    }))
  );
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const currentState = questionStates[currentQuestionIndex];

  const updateQuestionState = (updates: Partial<QuestionState>) => {
    setQuestionStates((prev) => {
      const newStates = [...prev];
      newStates[currentQuestionIndex] = {
        ...newStates[currentQuestionIndex],
        ...updates,
      };
      return newStates;
    });
  };

  const handleAnswerSelect = (optionIndex: number) => {
    if (currentState.isAnswered) return;

    const correct = optionIndex === currentQuestion.correctAnswer;

    updateQuestionState({
      selectedAnswer: optionIndex,
      isAnswered: true,
      isCorrect: correct,
      showFeedback: true,
      score: correct ? (currentState.isFirstAttempt ? 1 : 0.5) : 0,
    });

    if (!correct) {
      if (currentState.isFirstAttempt) {
        // First wrong attempt - show hint
        updateQuestionState({ showHint: true });
      } else {
        // Second wrong attempt - show correct answer
        updateQuestionState({ showCorrectAnswer: true });
      }
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      const totalScore = questionStates.reduce((sum, state) => sum + state.score, 0);
      setIsCompleted(true);
      onComplete(totalScore, questions.length);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const retryAfterHint = () => {
    updateQuestionState({
      showHint: false,
      isAnswered: false,
      selectedAnswer: null,
      showFeedback: false,
      isFirstAttempt: false,
      showCorrectAnswer: false,
    });
  };

  const getIndirectHint = () => {
    return currentQuestion.hint || 'Think carefully about the most logical answer.';
  };

  const calculateTotalScore = () => {
    return questionStates.reduce((sum, state) => sum + state.score, 0);
  };

  const getScoreRating = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return '⭐⭐⭐ Outstanding!';
    if (percentage >= 80) return '⭐⭐ Excellent!';
    if (percentage >= 70) return '⭐ Good Job!';
    return 'Keep Learning!';
  };

  if (isCompleted) {
    const totalScore = calculateTotalScore();
    const percentage = Math.round((totalScore / questions.length) * 100);

    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <TrophyIcon
          sx={{ fontSize: 80, color: 'primary.main', mb: 2 }}
        />
        <Typography variant="h3" gutterBottom>
          Quiz Completed!
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
            {getScoreRating(totalScore, questions.length)}
          </Typography>
        </Paper>

        <Card sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Question Breakdown:
            </Typography>
            {questions.map((q, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1,
                  p: 1,
                  borderRadius: 1,
                  bgcolor: questionStates[index].isCorrect
                    ? 'success.light'
                    : 'error.light',
                }}
              >
                <Typography variant="body1">
                  Question {index + 1}
                </Typography>
                <Chip
                  label={questionStates[index].score.toFixed(1)}
                  color={questionStates[index].isCorrect ? 'success' : 'error'}
                />
              </Box>
            ))}
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
          {currentQuestion.question}
        </Typography>
      </Box>

      <FormControl component="fieldset" sx={{ width: '100%', mb: 4 }}>
        <RadioGroup
          value={currentState.selectedAnswer ?? ''}
          onChange={(e) => handleAnswerSelect(Number(e.target.value))}
        >
          <Stack spacing={2}>
            {currentQuestion.options.map((option, index) => (
              <Paper
                key={index}
                elevation={1}
                sx={{
                  p: 2,
                  bgcolor:
                    currentState.isAnswered &&
                    currentState.selectedAnswer === index
                      ? currentState.isCorrect
                        ? 'success.light'
                        : 'error.light'
                      : 'background.paper',
                  transition: 'background-color 0.3s ease',
                }}
              >
                <FormControlLabel
                  value={index}
                  control={<Radio />}
                  label={option}
                  disabled={currentState.isAnswered}
                  sx={{ width: '100%' }}
                />
              </Paper>
            ))}
          </Stack>
        </RadioGroup>
      </FormControl>

      {currentState.showHint && (
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
          <Typography variant="body1">{getIndirectHint()}</Typography>
          <Button
            variant="contained"
            color="warning"
            startIcon={<RetryIcon />}
            onClick={retryAfterHint}
          >
            Try Again
          </Button>
        </Paper>
      )}

      {currentState.showCorrectAnswer && (
        <Paper
          elevation={2}
          sx={{
            p: 2,
            mb: 4,
            bgcolor: 'error.light',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TrophyIcon color="error" />
            <Typography variant="body1" fontWeight="bold">
              Correct Answer: {currentQuestion.options[currentQuestion.correctAnswer]}
            </Typography>
          </Box>
          {currentQuestion.explanation && (
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              Explanation: {currentQuestion.explanation}
            </Typography>
          )}
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

        {currentState.isAnswered && (
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