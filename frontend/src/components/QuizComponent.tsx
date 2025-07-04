import React from 'react';
import {
  QuizComponentProps,
  MCQQuestion,
  TrueFalseQuestion,
  FillBlanksQuestion,
  MatchFollowingQuestion,
} from '../types/quiz';
import { MCQQuiz } from './quiz/MCQQuiz';
import { TrueFalseQuiz } from './quiz/TrueFalseQuiz';
import { FillBlanksQuiz } from './quiz/FillBlanksQuiz';
import { MatchFollowingQuiz } from './quiz/MatchFollowingQuiz';
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Modal,
  Fade,
  useTheme,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

export const QuizComponent = ({
  quizData,
  isOpen,
  onClose,
  onComplete,
}: QuizComponentProps) => {
  const theme = useTheme();

  if (!isOpen) return null;

  const handleComplete = (score: number, totalQuestions: number) => {
    if (onComplete) {
      onComplete(score, totalQuestions);
    }
  };

  const renderQuizBySubtype = () => {
    switch (quizData.subtype) {
      case 'MCQ':
        return (
          <MCQQuiz
            questions={quizData.questions as MCQQuestion[]}
            theme={quizData.theme}
            onComplete={handleComplete}
            onClose={onClose}
          />
        );
      case 'TrueFalse':
        return (
          <TrueFalseQuiz
            questions={quizData.questions as TrueFalseQuestion[]}
            theme={quizData.theme}
            onComplete={handleComplete}
            onClose={onClose}
          />
        );
      case 'FillBlanks':
        return (
          <FillBlanksQuiz
            questions={quizData.questions as FillBlanksQuestion[]}
            theme={quizData.theme}
            onComplete={handleComplete}
            onClose={onClose}
          />
        );
      case 'MatchFollowing':
        return (
          <MatchFollowingQuiz
            questions={quizData.questions as MatchFollowingQuestion[]}
            theme={quizData.theme}
            onComplete={handleComplete}
            onClose={onClose}
          />
        );
      default:
        return (
          <Typography variant="body1" color="error">
            Unsupported quiz type
          </Typography>
        );
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      closeAfterTransition
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Fade in={isOpen}>
        <Paper
          elevation={8}
          sx={{
            position: 'relative',
            width: '90%',
            maxWidth: 800,
            maxHeight: '80vh',
            overflow: 'auto',
            borderRadius: 2,
            bgcolor: 'background.paper',
            p: 3,
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
            }}
          >
            <CloseIcon />
          </IconButton>

          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              {quizData.title}
            </Typography>
            {quizData.description && (
              <Typography variant="body1" color="text.secondary">
                {quizData.description}
              </Typography>
            )}
          </Box>

          {renderQuizBySubtype()}
        </Paper>
      </Fade>
    </Modal>
  );
}; 