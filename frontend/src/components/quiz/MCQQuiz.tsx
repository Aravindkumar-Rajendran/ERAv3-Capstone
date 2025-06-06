import React, { useState, useEffect } from 'react';
import { MCQQuestion, Theme } from '../../types/quiz';

interface QuestionState {
  selectedAnswer: number | null;
  isAnswered: boolean;
  showFeedback: boolean;
  isCorrect: boolean;
  showHint: boolean;
  isFirstAttempt: boolean;
  score: number;
}

interface MCQQuizProps {
  questions: MCQQuestion[];
  theme: Theme;
  onComplete: (score: number, totalQuestions: number) => void;
}

export const MCQQuiz: React.FC<MCQQuizProps> = ({ questions, theme, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>(() => 
    questions.map(() => ({
      selectedAnswer: null,
      isAnswered: false,
      showFeedback: false,
      isCorrect: false,
      showHint: false,
      isFirstAttempt: true,
      score: 0
    }))
  );
  const [stars, setStars] = useState<number[]>([]);
  const [showStarAnimation, setShowStarAnimation] = useState(false);
  const [sadEmojis, setSadEmojis] = useState<number[]>([]);
  const [showSadAnimation, setShowSadAnimation] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const currentState = questionStates[currentQuestionIndex];

  const updateQuestionState = (updates: Partial<QuestionState>) => {
    setQuestionStates(prev => {
      const newStates = [...prev];
      newStates[currentQuestionIndex] = { ...newStates[currentQuestionIndex], ...updates };
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
      showFeedback: true
    });
    
    if (correct) {
      // Correct answer - give points based on attempt
      const points = currentState.isFirstAttempt ? 1 : 0.5;
      updateQuestionState({ score: points });
      triggerStarAnimation();
    } else {
      // Wrong answer - trigger sad animation
      triggerSadAnimation();
      if (currentState.isFirstAttempt) {
        // First wrong attempt - show hint and allow retry
        updateQuestionState({ showHint: true });
      } else {
        // Second wrong attempt - give 0 points
        updateQuestionState({ score: 0 });
      }
    }
  };

  const triggerStarAnimation = () => {
    setShowStarAnimation(true);
    const newStars = Array.from({ length: 5 }, (_, i) => Math.random() * 100);
    setStars(newStars);
    setTimeout(() => setShowStarAnimation(false), 2000);
  };

  const triggerSadAnimation = () => {
    setShowSadAnimation(true);
    const newSadEmojis = Array.from({ length: 4 }, (_, i) => Math.random() * 100);
    setSadEmojis(newSadEmojis);
    setTimeout(() => setShowSadAnimation(false), 2000);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Quiz completed
      const totalScore = questionStates.reduce((sum, state) => sum + state.score, 0);
      setIsCompleted(true);
      onComplete(totalScore, questions.length);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const retryAfterHint = () => {
    updateQuestionState({
      showHint: false,
      isAnswered: false,
      selectedAnswer: null,
      showFeedback: false,
      isFirstAttempt: false
    });
  };

  // Generate indirect hints based on the question
  const getIndirectHint = () => {
    const questionText = currentQuestion.question.toLowerCase();
    if (questionText.includes('ocean')) {
      return "Think about the ocean that covers the largest area on our planet.";
    } else if (questionText.includes('japan')) {
      return "This city is known for its bustling streets and neon lights.";
    } else if (questionText.includes('planet') && questionText.includes('red')) {
      return "This planet appears reddish due to iron oxide on its surface.";
    } else if (questionText.includes('romeo')) {
      return "This famous playwright wrote many tragedies and comedies.";
    } else if (questionText.includes('atmosphere')) {
      return "This gas makes up the majority of the air we breathe.";
    } else {
      return "Think carefully about the most logical answer.";
    }
  };

  const calculateTotalScore = () => {
    return questionStates.reduce((sum, state) => sum + state.score, 0);
  };

  const getScoreRating = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return "⭐⭐⭐ Outstanding!";
    if (percentage >= 80) return "⭐⭐ Excellent!";
    if (percentage >= 70) return "⭐ Good Job!";
    return "Keep Learning!";
  };

  if (isCompleted) {
    const totalScore = calculateTotalScore();
    const percentage = Math.round((totalScore / questions.length) * 100);
    
    return (
      <div style={{
        background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
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
        <div style={{ fontSize: '60px', marginBottom: '20px' }}>🎉</div>
        <h2 style={{ fontSize: '36px', margin: '0 0 20px 0' }}>Quiz Completed!</h2>
        
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: '15px',
          padding: '30px',
          marginBottom: '30px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>
            Final Score: {totalScore} / {questions.length}
          </div>
          <div style={{ fontSize: '20px', marginBottom: '15px' }}>
            Percentage: {percentage}%
          </div>
          <div style={{ fontSize: '22px', fontWeight: 'bold' }}>
            {getScoreRating(totalScore, questions.length)}
          </div>
        </div>

        <div style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '20px',
          width: '100%',
          maxWidth: '400px',
          marginBottom: '30px'
        }}>
          <h4 style={{ margin: '0 0 15px 0' }}>Question Breakdown:</h4>
          {questions.map((q, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: index < questions.length - 1 ? '1px solid rgba(255,255,255,0.2)' : 'none'
            }}>
              <span>Question {index + 1}</span>
              <span style={{ fontWeight: 'bold' }}>
                {questionStates[index].score === 1 ? '1.0 ⭐' : 
                 questionStates[index].score === 0.5 ? '0.5 ⭐' : '0.0'}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <button
            onClick={() => {
              setIsCompleted(false);
              setCurrentQuestionIndex(0);
              setQuestionStates(questions.map(() => ({
                selectedAnswer: null,
                isAnswered: false,
                showFeedback: false,
                isCorrect: false,
                showHint: false,
                isFirstAttempt: true,
                score: 0
              })));
            }}
            style={{
              backgroundColor: '#4caf50',
              background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
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
            🔄 Try Again
          </button>
          
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#2196f3',
              background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
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
      fontFamily: theme.fontFamily,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Star Animation */}
      {showStarAnimation && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
          {stars.map((left, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${left}%`,
                top: '20%',
                fontSize: '30px',
                animation: 'starFall 2s ease-out forwards',
                color: '#ffd700'
              }}
            >
              ⭐
            </div>
          ))}
        </div>
      )}

      {/* Sad Animation */}
      {showSadAnimation && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
          {sadEmojis.map((left, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${left}%`,
                top: '20%',
                fontSize: '30px',
                animation: 'sadShake 2s ease-out forwards',
                color: '#ff6b6b'
              }}
            >
              😢
            </div>
          ))}
        </div>
      )}

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
          Multiple Choice Quiz
        </h2>
        <p style={{ margin: '10px 0', opacity: 0.9 }}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
        
        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: '4px',
          overflow: 'hidden',
          margin: '15px 0'
        }}>
          <div style={{
            width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #4facfe, #00f2fe)',
            borderRadius: '4px',
            transition: 'width 0.3s ease'
          }} />
        </div>

        {/* Score Display */}
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
          Score: {calculateTotalScore()} / {questions.length} ⭐
        </div>
      </div>

      {/* Question */}
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: '25px',
        borderRadius: '15px',
        marginBottom: '25px',
        backdropFilter: 'blur(10px)'
      }}>
        <h3 style={{ 
          fontSize: '22px', 
          marginBottom: '25px',
          lineHeight: '1.4',
          color: '#ffffff',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}>
          {currentQuestion.question}
        </h3>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {currentQuestion.options.map((option, index) => {
            let optionStyle: any = {
              padding: '18px 25px',
              borderRadius: '12px',
              cursor: currentState.isAnswered ? 'default' : 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              fontSize: '16px',
              fontWeight: '500',
              border: '2px solid transparent',
              position: 'relative'
            };

            if (!currentState.isAnswered) {
              // Before answering
              optionStyle = {
                ...optionStyle,
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.3)'
              };
            } else {
              // After answering - handle different cases
              if (currentState.showHint && currentState.isFirstAttempt) {
                // First wrong attempt - only highlight selected wrong answer
                if (index === currentState.selectedAnswer) {
                  optionStyle = {
                    ...optionStyle,
                    backgroundColor: '#f44336',
                    border: '2px solid #ef5350',
                    boxShadow: '0 4px 15px rgba(244, 67, 54, 0.4)'
                  };
                } else {
                  // Other options - dimmed
                  optionStyle = {
                    ...optionStyle,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '2px solid rgba(255,255,255,0.1)',
                    opacity: 0.6
                  };
                }
              } else {
                // Show correct answer when: correct answer given, or second wrong attempt
                if (index === currentQuestion.correctAnswer) {
                  // Correct answer - always green when revealed
                  optionStyle = {
                    ...optionStyle,
                    backgroundColor: '#4caf50',
                    border: '2px solid #66bb6a',
                    boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)'
                  };
                } else if (index === currentState.selectedAnswer) {
                  // User's wrong selection - red
                  optionStyle = {
                    ...optionStyle,
                    backgroundColor: '#f44336',
                    border: '2px solid #ef5350',
                    boxShadow: '0 4px 15px rgba(244, 67, 54, 0.4)'
                  };
                } else {
                  // Other options - dimmed
                  optionStyle = {
                    ...optionStyle,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '2px solid rgba(255,255,255,0.1)',
                    opacity: 0.6
                  };
                }
              }
            }

            return (
              <div
                key={index}
                style={optionStyle}
                onClick={() => handleAnswerSelect(index)}
                onMouseEnter={(e) => {
                  if (!currentState.isAnswered) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!currentState.isAnswered) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                <span style={{
                  minWidth: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: currentState.isAnswered && !currentState.showHint && index === currentQuestion.correctAnswer ? '#fff' : 
                                   currentState.isAnswered && index === currentState.selectedAnswer ? '#fff' :
                                   'rgba(255,255,255,0.2)',
                  color: currentState.isAnswered && ((!currentState.showHint && index === currentQuestion.correctAnswer) || index === currentState.selectedAnswer) ? '#333' : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  marginRight: '15px'
                }}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{option}</span>
                {currentState.isAnswered && !currentState.showHint && index === currentQuestion.correctAnswer && (
                  <span style={{ marginLeft: 'auto', fontSize: '20px' }}>✅</span>
                )}
                {currentState.isAnswered && index === currentState.selectedAnswer && index !== currentQuestion.correctAnswer && (
                  <span style={{ marginLeft: 'auto', fontSize: '20px' }}>❌</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Feedback Section */}
      {currentState.showFeedback && (
        <div style={{
          backgroundColor: currentState.isCorrect ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '20px',
          border: `2px solid ${currentState.isCorrect ? '#4caf50' : '#f44336'}`
        }}>
          {currentState.isCorrect ? (
            <div>
              <h4 style={{ color: '#4caf50', margin: '0 0 10px 0', fontSize: '18px' }}>
                🎉 {currentState.isFirstAttempt ? 'Perfect! +1 Point!' : 'Correct! +0.5 Point!'}
              </h4>
              <p style={{ margin: '0', lineHeight: '1.4' }}>
                <strong>Explanation:</strong> {currentQuestion.explanation}
              </p>
            </div>
          ) : currentState.showHint ? (
            <div>
              <h4 style={{ color: '#ff9800', margin: '0 0 10px 0', fontSize: '18px' }}>
                💡 Need a Hint?
              </h4>
              <p style={{ margin: '0 0 15px 0', lineHeight: '1.4' }}>
                {currentQuestion.hint || getIndirectHint()}
              </p>
              <button
                onClick={retryAfterHint}
                style={{
                  backgroundColor: '#ff9800',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Try Again
              </button>
            </div>
          ) : (
            <div>
              <h4 style={{ color: '#f44336', margin: '0 0 10px 0', fontSize: '18px' }}>
                ❌ Incorrect Answer - 0 Points
              </h4>
              <p style={{ margin: '0', lineHeight: '1.4' }}>
                <strong>Explanation:</strong> {currentQuestion.explanation}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Navigation - Always Available */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          style={{
            backgroundColor: currentQuestionIndex === 0 ? 'rgba(255,255,255,0.2)' : '#6c757d',
            color: 'white',
            border: 'none',
            padding: '12px 25px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
            opacity: currentQuestionIndex === 0 ? 0.5 : 1
          }}
        >
          ← Previous
        </button>

        <button
          onClick={handleNext}
          disabled={!currentState.isAnswered || currentState.showHint}
          style={{
            backgroundColor: (!currentState.isAnswered || currentState.showHint) ? 'rgba(255,255,255,0.2)' : '#4facfe',
            background: (!currentState.isAnswered || currentState.showHint) ? 'rgba(255,255,255,0.2)' : 'linear-gradient(45deg, #4facfe, #00f2fe)',
            color: 'white',
            border: 'none',
            padding: '15px 40px',
            borderRadius: '25px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: (!currentState.isAnswered || currentState.showHint) ? 'not-allowed' : 'pointer',
            boxShadow: (!currentState.isAnswered || currentState.showHint) ? 'none' : '0 4px 15px rgba(79, 172, 254, 0.4)',
            transition: 'transform 0.2s ease',
            opacity: (!currentState.isAnswered || currentState.showHint) ? 0.5 : 1
          }}
          onMouseEnter={(e) => {
            if (currentState.isAnswered && !currentState.showHint) {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            if (currentState.isAnswered && !currentState.showHint) {
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'} →
        </button>
      </div>

      <style>
        {`
          @keyframes starFall {
            0% {
              transform: translateY(-50px) scale(0);
              opacity: 1;
            }
            50% {
              transform: translateY(100px) scale(1);
              opacity: 1;
            }
            100% {
              transform: translateY(200px) scale(0);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
}; 