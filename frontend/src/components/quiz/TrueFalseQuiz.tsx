import React, { useState } from 'react';
import { TrueFalseQuestion, Theme } from '../../types/quiz';

interface TrueFalseQuizProps {
  questions: TrueFalseQuestion[];
  theme: Theme;
  onComplete: (score: number, totalQuestions: number) => void;
}

interface QuestionState {
  answered: boolean;
  selectedAnswer: boolean | null;
  usedHint: boolean;
  score: number; // 1, 0.5, or 0
}

export const TrueFalseQuiz: React.FC<TrueFalseQuizProps> = ({ questions, theme, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>(
    questions.map(() => ({
      answered: false,
      selectedAnswer: null,
      usedHint: false,
      score: 0
    }))
  );
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [stars, setStars] = useState<number[]>([]);
  const [showStarAnimation, setShowStarAnimation] = useState(false);
  const [sadEmojis, setSadEmojis] = useState<number[]>([]);
  const [showSadAnimation, setShowSadAnimation] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const currentState = questionStates[currentQuestionIndex];
  const totalScore = questionStates.reduce((sum, state) => sum + state.score, 0);

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

  const handleAnswer = (answer: boolean) => {
    if (currentState.answered) return;

    const isCorrect = answer === currentQuestion.correctAnswer;
    let score = 0;

    if (isCorrect) {
      score = currentState.usedHint ? 0.5 : 1;
    }

    const newStates = [...questionStates];
    newStates[currentQuestionIndex] = {
      answered: true,
      selectedAnswer: answer,
      usedHint: currentState.usedHint,
      score: score
    };

    setQuestionStates(newStates);
    setShowHint(false);

    // Show animation
    if (isCorrect) {
      triggerStarAnimation();
    } else {
      triggerSadAnimation();
    }
  };

  const handleHint = () => {
    if (currentState.answered) return;
    
    setShowHint(true);
    const newStates = [...questionStates];
    newStates[currentQuestionIndex] = {
      ...newStates[currentQuestionIndex],
      usedHint: true
    };
    setQuestionStates(newStates);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowHint(false);
    } else {
      // Check if all questions are answered
      const allAnswered = questionStates.every(state => state.answered);
      if (allAnswered) {
        setIsCompleted(true);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowHint(false);
    }
  };

  const handleFinish = () => {
    setIsCompleted(true);
    onComplete(totalScore, questions.length);
  };

  if (isCompleted) {
    const percentage = Math.round((totalScore / questions.length) * 100);
    
    return (
      <div style={{
        background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)`,
        minHeight: '600px',
        borderRadius: '20px',
        padding: '40px',
        color: theme.textColor,
        fontFamily: theme.fontFamily,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ fontSize: '60px', marginBottom: '20px' }}>🎯</div>
        <h2 style={{ fontSize: '36px', margin: '0 0 20px 0' }}>True or False Completed!</h2>
        
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
            {percentage >= 80 ? '⭐⭐⭐ Outstanding!' : 
             percentage >= 60 ? '⭐⭐ Good Job!' : 
             percentage >= 40 ? '⭐ Keep Learning!' : 'Try Again!'}
          </div>
        </div>

        {/* Individual Question Scores */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '30px',
          backdropFilter: 'blur(10px)',
          maxWidth: '500px',
          width: '100%'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#ffed4e' }}>Question Breakdown:</h3>
          {questions.map((_, index) => {
            const state = questionStates[index];
            return (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: index < questions.length - 1 ? '1px solid rgba(255,255,255,0.2)' : 'none'
              }}>
                <span>Question {index + 1}</span>
                <span style={{
                  fontWeight: 'bold',
                  color: state.score === 1 ? '#4caf50' : state.score === 0.5 ? '#ff9800' : '#f44336'
                }}>
                  {state.score === 1 && '⭐ 1.0'}
                  {state.score === 0.5 && '⭐ 0.5'}
                  {state.score === 0 && '❌ 0.0'}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <button
            onClick={() => {
              setIsCompleted(false);
              setCurrentQuestionIndex(0);
              setQuestionStates(questions.map(() => ({
                answered: false,
                selectedAnswer: null,
                usedHint: false,
                score: 0
              })));
              setShowHint(false);
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
          True or False Quiz
        </h2>
        <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '30px' }}>
          <div style={{ fontSize: '16px' }}>
            Question: {currentQuestionIndex + 1} / {questions.length}
          </div>
          <div style={{ fontSize: '16px' }}>
            Score: {totalScore.toFixed(1)} / {questions.length}
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
          background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
          height: '100%',
          width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
          transition: 'width 0.3s ease'
        }} />
      </div>

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

      {/* Question Container */}
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: '15px',
        padding: '30px',
        marginBottom: '30px',
        backdropFilter: 'blur(10px)'
      }}>
        <h3 style={{
          fontSize: '22px',
          marginBottom: '25px',
          textAlign: 'center',
          lineHeight: '1.4'
        }}>
          {currentQuestion.statement}
        </h3>

        {/* Hint Section */}
        {showHint && currentQuestion.hint && (
          <div style={{
            backgroundColor: 'rgba(255, 193, 7, 0.2)',
            border: '2px solid #ffc107',
            borderRadius: '10px',
            padding: '15px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              color: '#ffc107',
              marginBottom: '8px'
            }}>
              💡 Hint:
            </div>
            <div style={{ fontSize: '16px' }}>
              {currentQuestion.hint}
            </div>
          </div>
        )}

        {/* Answer Buttons */}
        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          marginBottom: '25px'
        }}>
          <button
            onClick={() => handleAnswer(true)}
            disabled={currentState.answered}
            style={{
              background: currentState.answered && currentState.selectedAnswer === true
                ? (currentQuestion.correctAnswer === true ? 'linear-gradient(45deg, #4caf50, #66bb6a)' : 'linear-gradient(45deg, #f44336, #ef5350)')
                : 'linear-gradient(45deg, #2196f3, #42a5f5)',
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              padding: '20px 40px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: currentState.answered ? 'default' : 'pointer',
              boxShadow: '0 4px 15px rgba(33, 150, 243, 0.4)',
              transition: 'all 0.3s ease',
              opacity: currentState.answered ? 0.8 : 1
            }}
            onMouseEnter={(e) => {
              if (!currentState.answered) {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!currentState.answered) {
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            ✓ TRUE
          </button>

          <button
            onClick={() => handleAnswer(false)}
            disabled={currentState.answered}
            style={{
              background: currentState.answered && currentState.selectedAnswer === false
                ? (currentQuestion.correctAnswer === false ? 'linear-gradient(45deg, #4caf50, #66bb6a)' : 'linear-gradient(45deg, #f44336, #ef5350)')
                : 'linear-gradient(45deg, #f44336, #ef5350)',
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              padding: '20px 40px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: currentState.answered ? 'default' : 'pointer',
              boxShadow: '0 4px 15px rgba(244, 67, 54, 0.4)',
              transition: 'all 0.3s ease',
              opacity: currentState.answered ? 0.8 : 1
            }}
            onMouseEnter={(e) => {
              if (!currentState.answered) {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!currentState.answered) {
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            ✗ FALSE
          </button>
        </div>

        {/* Explanation */}
        {currentState.answered && currentQuestion.explanation && (
          <div style={{
            backgroundColor: currentState.selectedAnswer === currentQuestion.correctAnswer 
              ? 'rgba(76, 175, 80, 0.2)' 
              : 'rgba(244, 67, 54, 0.2)',
            border: `2px solid ${currentState.selectedAnswer === currentQuestion.correctAnswer ? '#4caf50' : '#f44336'}`,
            borderRadius: '10px',
            padding: '15px',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              marginBottom: '8px',
              color: currentState.selectedAnswer === currentQuestion.correctAnswer ? '#4caf50' : '#f44336'
            }}>
              {currentState.selectedAnswer === currentQuestion.correctAnswer ? '✅ Correct!' : '❌ Incorrect!'}
            </div>
            <div style={{ fontSize: '16px' }}>
              {currentQuestion.explanation}
            </div>
            {currentState.usedHint && (
              <div style={{ 
                fontSize: '14px', 
                marginTop: '8px', 
                fontStyle: 'italic',
                color: '#ffc107'
              }}>
                💡 Hint was used - Half points awarded
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px'
      }}>
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          style={{
            background: currentQuestionIndex === 0 
              ? 'linear-gradient(45deg, #666, #888)' 
              : 'linear-gradient(45deg, #9e9e9e, #bdbdbd)',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '12px 25px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
            opacity: currentQuestionIndex === 0 ? 0.5 : 1,
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (currentQuestionIndex !== 0) {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            if (currentQuestionIndex !== 0) {
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          ⬅ Previous
        </button>

        <button
          onClick={handleHint}
          disabled={currentState.answered || currentState.usedHint}
          style={{
            background: (currentState.answered || currentState.usedHint)
              ? 'linear-gradient(45deg, #666, #888)'
              : 'linear-gradient(45deg, #ff9800, #ffb74d)',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '12px 25px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: (currentState.answered || currentState.usedHint) ? 'not-allowed' : 'pointer',
            opacity: (currentState.answered || currentState.usedHint) ? 0.5 : 1,
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!currentState.answered && !currentState.usedHint) {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!currentState.answered && !currentState.usedHint) {
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          💡 Hint
        </button>

        {currentQuestionIndex === questions.length - 1 ? (
          <button
            onClick={handleFinish}
            disabled={!questionStates.every(state => state.answered)}
            style={{
              background: !questionStates.every(state => state.answered)
                ? 'linear-gradient(45deg, #666, #888)'
                : 'linear-gradient(45deg, #4caf50, #66bb6a)',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              padding: '12px 25px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: !questionStates.every(state => state.answered) ? 'not-allowed' : 'pointer',
              opacity: !questionStates.every(state => state.answered) ? 0.5 : 1,
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (questionStates.every(state => state.answered)) {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (questionStates.every(state => state.answered)) {
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            ✅ Finish
          </button>
        ) : (
          <button
            onClick={handleNext}
            style={{
              background: 'linear-gradient(45deg, #2196f3, #42a5f5)',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              padding: '12px 25px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Next ➡
          </button>
        )}
      </div>

      {/* Animation Styles */}
      <style>
        {`
          @keyframes starBurst {
            0% { transform: scale(0) rotate(0deg); opacity: 0; }
            50% { transform: scale(1.5) rotate(180deg); opacity: 1; }
            100% { transform: scale(1) rotate(360deg); opacity: 0; }
          }
          
          @keyframes sadShake {
            0%, 100% { transform: translateX(0) scale(0); opacity: 0; }
            10% { transform: translateX(-10px) scale(1); opacity: 1; }
            20% { transform: translateX(10px) scale(1); opacity: 1; }
            30% { transform: translateX(-10px) scale(1); opacity: 1; }
            40% { transform: translateX(10px) scale(1); opacity: 1; }
            50% { transform: translateX(0) scale(1); opacity: 1; }
            75% { transform: translateX(0) scale(1); opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
}; 