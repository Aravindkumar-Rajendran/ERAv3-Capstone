import React, { useState } from 'react';
import { FlashcardComponentProps, FlashcardItem } from '../../types/flashcard';

export const FlashcardComponent = ({ 
  flashcardData, 
  isOpen, 
  onClose, 
  onComplete 
}: FlashcardComponentProps) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [studiedCards, setStudiedCards] = useState<Set<number>>(new Set());
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const currentCard = flashcardData.cards[currentCardIndex];
  const totalCards = flashcardData.cards.length;

  const handleNext = () => {
    if (currentCardIndex < totalCards - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
      setShowHint(false);
      setStudiedCards(prev => {
      const newSet = new Set(prev);
      newSet.add(currentCard.id);
      return newSet;
    });
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
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
    setStudiedCards(prev => {
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
      case 'easy': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'hard': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  return (
    <div className="flashcard-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="flashcard-modal" style={{
        backgroundColor: flashcardData.theme.backgroundColor,
        borderRadius: '20px',
        padding: '30px',
        maxWidth: '1000px',
        maxHeight: '80vh',
        overflow: 'auto',
        position: 'relative',
        width: '95%',
        color: flashcardData.theme.textColor,
        fontFamily: flashcardData.theme.fontFamily
      }}>
        <button 
          className="close-button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '20px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: flashcardData.theme.textColor
          }}
        >
          ×
        </button>

        {/* Completion Screen */}
        {isCompleted && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: '60px', marginBottom: '20px' }}>🎉</div>
              <h2 style={{ fontSize: '32px', marginBottom: '15px', color: '#4caf50' }}>
                Congratulations!
              </h2>
              <p style={{ fontSize: '18px', marginBottom: '10px' }}>
                You've completed all {totalCards} flashcards!
              </p>
              <p style={{ fontSize: '16px', marginBottom: '30px', opacity: 0.8 }}>
                Cards studied: {totalCards} / {totalCards}
              </p>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button
                  onClick={() => {
                    setIsCompleted(false);
                    setCurrentCardIndex(0);
                    setIsFlipped(false);
                    setShowHint(false);
                    setStudiedCards(new Set());
                  }}
                  style={{
                    background: 'linear-gradient(45deg, #2196f3, #42a5f5)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '15px 25px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  🔄 Study Again
                </button>
                <button
                  onClick={onClose}
                  style={{
                    background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '15px 25px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  🏠 Return Home
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '28px', 
            background: `linear-gradient(45deg, ${flashcardData.theme.primaryColor}, #66bb6a)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 20px rgba(76, 175, 80, 0.3)'
          }}>
            📚 {flashcardData.title}
          </h2>
          {flashcardData.description && (
            <p style={{ margin: '10px 0', opacity: 0.8 }}>{flashcardData.description}</p>
          )}
          <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '30px' }}>
            <div style={{ fontSize: '16px' }}>
              Card: {currentCardIndex + 1} / {totalCards}
            </div>
            <div style={{ fontSize: '16px' }}>
              Studied: {studiedCards.size} / {totalCards}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: '10px',
          height: '8px',
          marginBottom: '30px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: `linear-gradient(45deg, ${flashcardData.theme.primaryColor}, #66bb6a)`,
            height: '100%',
            width: `${((currentCardIndex + 1) / totalCards) * 100}%`,
            transition: 'width 0.3s ease'
          }} />
        </div>

        {/* Flashcard */}
        <div style={{
          perspective: '1000px',
          marginBottom: '30px',
          height: '180px',
          maxWidth: '700px',
          margin: '0 auto 30px auto'
        }}>
          <div
            onClick={handleFlip}
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              transformStyle: 'preserve-3d',
              transition: 'transform 0.6s',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              cursor: 'pointer'
            }}
          >
            {/* Front of card */}
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              backgroundColor: 'rgba(30,30,50,0.9)',
              border: `3px solid ${flashcardData.theme.primaryColor}`,
              borderRadius: '15px',
              padding: '15px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '14px', marginBottom: '20px', opacity: 0.7, color: 'white' }}>
                FRONT - Click to flip
              </div>
              <h3 style={{
                fontSize: '18px',
                textAlign: 'center',
                margin: 0,
                lineHeight: '1.4',
                color: 'white'
              }}>
                {currentCard.front}
              </h3>
              
              {/* Difficulty Badge */}
              <div style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                backgroundColor: getDifficultyColor(currentCard.difficulty),
                color: 'white',
                padding: '5px 12px',
                borderRadius: '15px',
                fontSize: '12px',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                {currentCard.difficulty}
              </div>

              {/* Tags */}
              <div style={{
                position: 'absolute',
                bottom: '15px',
                left: '15px',
                display: 'flex',
                gap: '5px',
                flexWrap: 'wrap'
              }}>
                {currentCard.tags.map((tag, index) => (
                  <span key={index} style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    padding: '3px 8px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    opacity: 0.8
                  }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Back of card */}
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              backgroundColor: 'rgba(30,50,30,0.9)',
              border: `3px solid #4caf50`,
              borderRadius: '15px',
              padding: '15px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              transform: 'rotateY(180deg)',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '14px', marginBottom: '20px', opacity: 0.7, color: 'white' }}>
                BACK - Click to flip
              </div>
              <h3 style={{
                fontSize: '20px',
                textAlign: 'center',
                margin: 0,
                lineHeight: '1.4',
                color: '#4caf50',
                fontWeight: 'bold'
              }}>
                {currentCard.back}
              </h3>
            </div>
          </div>
        </div>

        {/* Hint Section - Moved to navigation area */}
        
        {/* Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '20px',
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <button
            onClick={handlePrevious}
            disabled={currentCardIndex === 0}
            style={{
              background: currentCardIndex === 0 
                ? 'linear-gradient(45deg, #666, #888)' 
                : 'linear-gradient(45deg, #9e9e9e, #bdbdbd)',
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              padding: '12px 24px',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: currentCardIndex === 0 ? 'not-allowed' : 'pointer',
              opacity: currentCardIndex === 0 ? 0.5 : 1,
              transition: 'transform 0.2s ease',
              minWidth: '110px'
            }}
            onMouseEnter={(e) => {
              if (currentCardIndex !== 0) {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentCardIndex !== 0) {
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            ⬅ Previous
          </button>

          {/* Hint Button - Repositioned here */}
          {currentCard.hint && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {!showHint ? (
                <button
                  onClick={handleShowHint}
                  style={{
                    backgroundColor: '#ff9800',
                    color: 'white',
                    border: 'none',
                    padding: '8px 15px',
                    borderRadius: '15px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  💡 Hint
                </button>
              ) : (
                <div style={{
                  backgroundColor: 'rgba(255, 193, 7, 0.9)',
                  border: '2px solid #ffc107',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#000',
                  maxWidth: '150px',
                  textAlign: 'center',
                  position: 'absolute',
                  bottom: '70px',
                  zIndex: 10
                }}>
                  💡 {currentCard.hint}
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleFlip}
            style={{
              background: 'linear-gradient(45deg, #2196f3, #42a5f5)',
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              padding: '12px 24px',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              minWidth: '130px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            🔄 Flip Card
          </button>

          {currentCardIndex === totalCards - 1 ? (
            <button
              onClick={handleComplete}
              style={{
                background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                color: 'white',
                border: 'none',
                borderRadius: '15px',
                padding: '12px 24px',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                minWidth: '110px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              ✅ Complete
            </button>
          ) : (
            <button
              onClick={handleNext}
              style={{
                background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                color: 'white',
                border: 'none',
                borderRadius: '15px',
                padding: '12px 24px',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                minWidth: '110px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Next ➡
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 