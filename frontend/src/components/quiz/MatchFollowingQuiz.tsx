import React, { useState } from 'react';
import { MatchFollowingQuestion, Theme } from '../../types/quiz';

interface MatchFollowingQuizProps {
  questions: MatchFollowingQuestion[];
  theme: Theme;
  onComplete: (score: number, totalQuestions: number) => void;
}

interface MatchPair {
  leftId: number;
  rightId: number;
  leftText: string;
  rightText: string;
  isCorrect: boolean;
}

export const MatchFollowingQuiz: React.FC<MatchFollowingQuizProps> = ({ questions, theme, onComplete }) => {
  const [selectedPairs, setSelectedPairs] = useState<MatchPair[]>([]);
  const [lockedLeftItems, setLockedLeftItems] = useState<number[]>([]);
  const [lockedRightItems, setLockedRightItems] = useState<number[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // For demo, we'll use the first question's pairs (normally would have multiple questions)
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

    const leftItem = leftItems.find(item => item.id === selectedLeft);
    if (!leftItem) return;

    const newPair: MatchPair = {
      leftId: leftItem.id,
      rightId: rightItem.id,
      leftText: leftItem.left,
      rightText: rightItem.right,
      isCorrect: leftItem.right === rightItem.right
    };

    setSelectedPairs(prev => [...prev, newPair]);
    setLockedLeftItems(prev => [...prev, selectedLeft]);
    setLockedRightItems(prev => [...prev, rightItem.id]);
    setSelectedLeft(null);
  };

  const handleSubmit = () => {
    if (selectedPairs.length !== leftItems.length) return;

    const correctPairs = selectedPairs.filter(pair => pair.isCorrect).length;
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
      <div style={{
        background: 'linear-gradient(135deg, #9C27B0 0%, #8E24AA 100%)',
        minHeight: '600px',
        borderRadius: '20px',
        padding: '40px',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ fontSize: '60px', marginBottom: '20px' }}>🎯</div>
        <h2 style={{ fontSize: '36px', margin: '0 0 20px 0' }}>Match Following Completed!</h2>
        
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: '15px',
          padding: '30px',
          marginBottom: '30px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>
            Final Score: {score} / {leftItems.length}
          </div>
          <div style={{ fontSize: '20px', marginBottom: '15px' }}>
            Percentage: {percentage}%
          </div>
          <div style={{ fontSize: '22px', fontWeight: 'bold' }}>
            {percentage >= 80 ? '⭐⭐⭐ Outstanding!' : 
             percentage >= 60 ? '⭐⭐ Good Job!' : 
             percentage >= 40 ? '⭐ Keep Learning!' : 'Try Again!'}
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: '#2196f3',
            background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
            color: 'white',
            border: 'none',
            padding: '15px 40px',
            borderRadius: '25px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(33, 150, 243, 0.4)',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          🏠 Back to Home
        </button>
      </div>
    );
  }

  return (
    <div style={{
      background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)`,
      minHeight: '600px',
      borderRadius: '20px',
      padding: '30px',
      color: theme.textColor,
      fontFamily: theme.fontFamily
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: '28px', 
          background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
        }}>
          Match the Following
        </h2>
        <p style={{ margin: '10px 0', opacity: 0.9 }}>
          {currentQuestion.instruction}
        </p>
        <div style={{ fontSize: '16px', marginTop: '10px' }}>
          Pairs Matched: {selectedPairs.length} / {leftItems.length}
        </div>
      </div>

      {/* Matching Area */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '40px',
        marginBottom: '30px',
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: '30px',
        borderRadius: '15px',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Left Column */}
        <div>
          <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#ffed4e' }}>
            Questions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {leftItems.map((item, index) => {
              const isLocked = lockedLeftItems.includes(item.id);
              const isSelected = selectedLeft === item.id;
              
              return (
                <div
                  key={item.id}
                  onClick={() => handleLeftClick(item)}
                  style={{
                    padding: '15px 20px',
                    borderRadius: '10px',
                    border: '2px solid',
                    borderColor: isLocked ? '#4caf50' : isSelected ? '#ffd700' : 'rgba(255,255,255,0.3)',
                    backgroundColor: isLocked ? '#4caf50' : isSelected ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.1)',
                    cursor: isLocked ? 'default' : 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: isLocked ? 0.7 : 1,
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '16px'
                  }}
                >
                  <span style={{
                    minWidth: '25px',
                    height: '25px',
                    borderRadius: '50%',
                    backgroundColor: isLocked ? '#fff' : isSelected ? '#ffd700' : 'rgba(255,255,255,0.3)',
                    color: isLocked || isSelected ? '#333' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    marginRight: '12px',
                    fontSize: '14px'
                  }}>
                    {index + 1}
                  </span>
                  <span>{item.left}</span>
                  {isLocked && <span style={{ marginLeft: 'auto', fontSize: '18px' }}>🔒</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column */}
        <div>
          <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#ffed4e' }}>
            Options
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {rightItems.map((item, index) => {
              const isLocked = lockedRightItems.includes(item.id);
              const canSelect = selectedLeft !== null && !isLocked;
              
              return (
                <div
                  key={item.id}
                  onClick={() => handleRightClick(item)}
                  style={{
                    padding: '15px 20px',
                    borderRadius: '10px',
                    border: '2px solid',
                    borderColor: isLocked ? '#4caf50' : canSelect ? '#ff9800' : 'rgba(255,255,255,0.3)',
                    backgroundColor: isLocked ? '#4caf50' : canSelect ? 'rgba(255,152,0,0.2)' : 'rgba(255,255,255,0.1)',
                    cursor: isLocked ? 'default' : canSelect ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s ease',
                    opacity: isLocked ? 0.7 : canSelect ? 1 : 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '16px'
                  }}
                  onMouseEnter={(e) => {
                    if (canSelect) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (canSelect) {
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <span style={{
                    minWidth: '25px',
                    height: '25px',
                    borderRadius: '50%',
                    backgroundColor: isLocked ? '#fff' : canSelect ? '#ff9800' : 'rgba(255,255,255,0.3)',
                    color: isLocked || canSelect ? '#333' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    marginRight: '12px',
                    fontSize: '14px'
                  }}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{item.right}</span>
                  {isLocked && <span style={{ marginLeft: 'auto', fontSize: '18px' }}>🔒</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Instructions */}
      {!isSubmitted && selectedPairs.length < leftItems.length && (
        <div style={{
          backgroundColor: 'rgba(255,215,0,0.2)',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '20px',
          border: '1px solid rgba(255,215,0,0.3)',
          textAlign: 'center'
        }}>
          {selectedLeft ? 
            "Now click an option from the right column to create a pair" : 
            "Click a question from the left column first"}
        </div>
      )}

      {/* Results */}
      {showResults && (
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          padding: '25px',
          borderRadius: '15px',
          marginBottom: '20px',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#ffed4e' }}>
            Results: {score} / {leftItems.length} Correct
          </h3>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
             {selectedPairs.map((pair, index) => {
               // Find the correct answer for this left item
               const correctItem = leftItems.find(item => item.id === pair.leftId);
               const correctAnswer = correctItem ? correctItem.right : '';
               
               return (
                 <div key={index} style={{
                   padding: '15px',
                   borderRadius: '10px',
                   backgroundColor: pair.isCorrect ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)',
                   border: `2px solid ${pair.isCorrect ? '#4caf50' : '#f44336'}`,
                   display: 'flex',
                   flexDirection: 'column',
                   gap: '8px'
                 }}>
                   <div style={{
                     display: 'flex',
                     justifyContent: 'space-between',
                     alignItems: 'center'
                   }}>
                     <span style={{ fontWeight: 'bold' }}>{pair.leftText}</span>
                     <span style={{ 
                       fontSize: '20px',
                       color: pair.isCorrect ? '#4caf50' : '#f44336'
                     }}>
                       {pair.isCorrect ? '✅' : '❌'}
                     </span>
                     <span style={{
                       color: pair.isCorrect ? '#4caf50' : '#f44336',
                       fontWeight: pair.isCorrect ? 'normal' : 'bold'
                     }}>
                       {pair.rightText}
                     </span>
                   </div>
                   {!pair.isCorrect && (
                     <div style={{
                       fontSize: '14px',
                       color: '#4caf50',
                       fontStyle: 'italic',
                       textAlign: 'center',
                       backgroundColor: 'rgba(76, 175, 80, 0.2)',
                       padding: '8px',
                       borderRadius: '5px'
                     }}>
                       Correct Answer: {correctAnswer}
                     </div>
                   )}
                 </div>
               );
             })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ textAlign: 'center' }}>
        {!isSubmitted && selectedPairs.length === leftItems.length && (
          <button
            onClick={handleSubmit}
            style={{
              backgroundColor: '#4caf50',
              background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
              color: 'white',
              border: 'none',
              padding: '15px 40px',
              borderRadius: '25px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            ✓ Submit Answers
          </button>
        )}

        {showResults && (
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <button
              onClick={handleRetry}
              style={{
                backgroundColor: '#ff9800',
                background: 'linear-gradient(45deg, #ff9800, #ffb74d)',
                color: 'white',
                border: 'none',
                padding: '12px 30px',
                borderRadius: '20px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(255, 152, 0, 0.4)',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              🔄 Retry
            </button>

            <button
              onClick={handleFinish}
              style={{
                backgroundColor: '#2196f3',
                background: 'linear-gradient(45deg, #2196f3, #42a5f5)',
                color: 'white',
                border: 'none',
                padding: '12px 30px',
                borderRadius: '20px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(33, 150, 243, 0.4)',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              ✓ Finish
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 