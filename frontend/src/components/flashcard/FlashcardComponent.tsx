import React, { useState } from 'react';
import { FlashcardComponentProps, FlashcardItem } from '../../types/flashcard';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Paper,
  Modal,
  Fade,
  Chip,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Lightbulb as HintIcon,
  Flip as FlipIcon,
} from '@mui/icons-material';

export const FlashcardComponent = ({
  flashcardData,
  isOpen,
  onClose,
  onComplete,
}: FlashcardComponentProps) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [studiedCards, setStudiedCards] = useState<Set<number>>(new Set());
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const currentCard = flashcardData.cards[currentCardIndex];
  const totalCards = flashcardData.cards.length;
  const progress = (studiedCards.size / totalCards) * 100;

  const handleNext = () => {
    if (currentCardIndex < totalCards - 1) {
      setCurrentCardIndex((prev) => prev + 1);
      setIsFlipped(false);
      setShowHint(false);
      setStudiedCards((prev) => {
        const newSet = new Set(prev);
        newSet.add(currentCard.id);
        return newSet;
      });
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setShowHint(false);
  };

  const handleShowHint = () => {
    setShowHint(!showHint);
  };

  const handleComplete = () => {
    setStudiedCards((prev) => {
      const newSet = new Set(prev);
      newSet.add(currentCard.id);
      return newSet;
    });
    setIsCompleted(true);
    if (onComplete) {
      onComplete();
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'warning';
      case 'hard':
        return 'error';
      default:
        return 'default';
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
            maxWidth: 1000,
            width: '95%',
            maxHeight: '80vh',
            overflow: 'auto',
            p: 4,
            bgcolor: 'background.paper',
            borderRadius: 4,
          }}
        >
          {/* Close Button */}
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

          {/* Progress Bar */}
          <Box sx={{ width: '100%', mb: 3 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mt: 1 }}
            >
              {studiedCards.size} of {totalCards} cards studied
            </Typography>
          </Box>

          {/* Completion Screen */}
          {isCompleted ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 4,
              }}
            >
              <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>
                🎉
              </Typography>
              <Typography
                variant="h4"
                color="primary"
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                Congratulations!
              </Typography>
              <Typography variant="h6" gutterBottom>
                You've completed all {totalCards} flashcards!
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 4 }}
              >
                Cards studied: {totalCards} / {totalCards}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={() => {
                    setIsCompleted(false);
                    setCurrentCardIndex(0);
                    setIsFlipped(false);
                    setShowHint(false);
                    setStudiedCards(new Set());
                  }}
                >
                  Study Again
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<HomeIcon />}
                  onClick={onClose}
                >
                  Return Home
                </Button>
              </Box>
            </Box>
          ) : (
            /* Flashcard Content */
            <Box sx={{ textAlign: 'center' }}>
              {/* Card Header */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {flashcardData.title}
                </Typography>
                <Chip
                  label={currentCard.difficulty}
                  color={getDifficultyColor(currentCard.difficulty)}
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Box>

              {/* Card Content */}
              <Paper
                elevation={2}
                onClick={handleFlip}
                sx={{
                  p: 4,
                  minHeight: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  },
                  bgcolor: isFlipped ? 'primary.light' : 'background.paper',
                }}
              >
                <Typography variant="h5">
                  {isFlipped ? currentCard.back : currentCard.front}
                </Typography>
                {showHint && !isFlipped && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 2 }}
                  >
                    Hint: {currentCard.hint}
                  </Typography>
                )}
              </Paper>

              {/* Controls */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 2,
                  mt: 3,
                }}
              >
                <Tooltip title="Previous Card">
                  <span>
                    <IconButton
                      onClick={handlePrevious}
                      disabled={currentCardIndex === 0}
                    >
                      <PrevIcon />
                    </IconButton>
                  </span>
                </Tooltip>

                <Tooltip title="Show Hint">
                  <IconButton
                    onClick={handleShowHint}
                    disabled={isFlipped || !currentCard.hint}
                  >
                    <HintIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Flip Card">
                  <IconButton onClick={handleFlip}>
                    <FlipIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Next Card">
                  <span>
                    <IconButton
                      onClick={handleNext}
                      disabled={currentCardIndex === totalCards - 1}
                    >
                      <NextIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>

              {/* Complete Button */}
              {currentCardIndex === totalCards - 1 && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleComplete}
                  sx={{ mt: 3 }}
                >
                  Complete
                </Button>
              )}
            </Box>
          )}
        </Paper>
      </Fade>
    </Modal>
  );
}; 