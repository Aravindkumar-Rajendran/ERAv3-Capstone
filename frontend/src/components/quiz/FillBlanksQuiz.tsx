import React, { useState } from 'react';
import { FillBlanksQuestion, Theme } from '../../types/quiz';

interface FillBlanksQuizProps {
  questions: FillBlanksQuestion[];
  theme: Theme;
  onComplete: (score: number, totalQuestions: number) => void;
}

interface QuestionState {
  answered: boolean;
  userAnswer: string;
  usedHint: boolean;
  score: number; // 1, 0.5, or 0
  isCorrect: boolean;
}

export const FillBlanksQuiz: React.FC<FillBlanksQuizProps> = ({ questions, theme, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>(
    questions.map(() => ({
      answered: false,
      userAnswer: '',
      usedHint: false,
      score: 0,
      isCorrect: false
    }))
  );
  const [currentInput, setCurrentInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [stars, setStars] = useState<number[]>([]);
  const [showStarAnimation, setShowStarAnimation] = useState(false);
  const [sadEmojis, setSadEmojis] = useState<number[]>([]);
  const [showSadAnimation, setShowSadAnimation] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const currentState = questionStates[currentQuestionIndex];
  const totalScore = questionStates.reduce((sum, state) => sum + state.score, 0);

  // Advanced validation function
  const validateAnswer = (userInput: string, correctAnswers: string[]): boolean => {
    const normalizedInput = userInput.toLowerCase().trim();
    
    return correctAnswers.some(correctAnswer => {
      const normalizedCorrect = correctAnswer.toLowerCase().trim();
      
      // Exact match (case-insensitive)
      if (normalizedInput === normalizedCorrect) return true;
      
      // Handle number vs word variations
      const numberWordMap: { [key: string]: string[] } = {
        '1': ['one', 'first'],
        '2': ['two', 'second'],
        '3': ['three', 'third'],
        '4': ['four', 'fourth'],
        '5': ['five', 'fifth'],
        '6': ['six', 'sixth'],
        '7': ['seven', 'seventh'],
        '8': ['eight', 'eighth'],
        '9': ['nine', 'ninth'],
        '10': ['ten', 'tenth'],
        '1945': ['nineteen forty-five', 'nineteen forty five'],
        '100': ['hundred', 'one hundred'],
        '1000': ['thousand', 'one thousand']
      };
      
      // Check if input is a number and correct answer has word equivalent
      for (const [num, words] of Object.entries(numberWordMap)) {
        if (normalizedInput === num && words.includes(normalizedCorrect)) return true;
        if (words.includes(normalizedInput) && normalizedCorrect === num) return true;
        if (words.includes(normalizedInput) && words.includes(normalizedCorrect)) return true;
      }
      
      // Handle partial matches for long answers (80% similarity)
      if (normalizedCorrect.length > 5) {
        const similarity = calculateSimilarity(normalizedInput, normalizedCorrect);
        if (similarity >= 0.8) return true;
      }
      
      return false;
    });
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
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

  const handleSubmit = () => {
    if (currentState.answered || !currentInput.trim()) return;

    const isCorrect = validateAnswer(currentInput, currentQuestion.correctAnswers);
    let score = 0;

    if (isCorrect) {
      score = currentState.usedHint ? 0.5 : 1;
    }

    const newStates = [...questionStates];
    newStates[currentQuestionIndex] = {
      answered: true,
      userAnswer: currentInput,
      usedHint: currentState.usedHint,
      score: score,
      isCorrect: isCorrect
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
      setCurrentInput(questionStates[currentQuestionIndex + 1].userAnswer);
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
      setCurrentInput(questionStates[currentQuestionIndex - 1].userAnswer);
      setShowHint(false);
    }
  };

  const handleFinish = () => {
    setIsCompleted(true);
    onComplete(totalScore, questions.length);
  };

  // Update input when navigating to answered questions
  React.useEffect(() => {
    setCurrentInput(currentState.userAnswer);
  }, [currentQuestionIndex, currentState.userAnswer]);

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
        <h2 style={{ fontSize: '36px', margin: '0 0 20px 0' }}>Fill in the Blanks Completed!</h2>
        
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: '15px',
          padding: '30px',
          marginBottom: '30px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>
            Final Score: {totalScore.toFixed(1)} / {questions.length}
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
          maxWidth: '600px',
          width: '100%'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#ffed4e' }}>Question Breakdown:</h3>
          {questions.map((question, index) => {
            const state = questionStates[index];
            return (
              <div key={index} style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '12px 0',
                borderBottom: index < questions.length - 1 ? '1px solid rgba(255,255,255,0.2)' : 'none'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '4px' }}>
                  Your answer: "{state.userAnswer}"
                  {!state.isCorrect && (
                    <span style={{ color: '#4caf50', marginLeft: '10px' }}>
                      Correct: {question.correctAnswers[0]}
                    </span>
                  )}
                </div>
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
                userAnswer: '',
                usedHint: false,
                score: 0,
                isCorrect: false
              })));
              setCurrentInput('');
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

  // Render sentence with blank highlighted
  const renderSentenceWithBlank = (sentence: string) => {
    const parts = sentence.split('[BLANK]');
    return (
      <span>
        {parts[0]}
        <span style={{
          color: '#ffd700',
          fontWeight: 'bold',
          textDecoration: 'underline',
          padding: '0 5px'
        }}>
          ________
        </span>
        {parts[1]}
      </span>
    );
  };

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
          Fill in the Blanks
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
          lineHeight: '1.4',
          color: '#ffffff',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}>
          {renderSentenceWithBlank(currentQuestion.sentence)}
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

        {/* Input and Submit */}
        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          marginBottom: '25px',
          flexWrap: 'wrap'
        }}>
          <input
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            disabled={currentState.answered}
            placeholder="Type your answer here..."
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            style={{
              padding: '15px 20px',
              borderRadius: '10px',
              border: currentState.answered 
                ? `3px solid ${currentState.isCorrect ? '#4caf50' : '#f44336'}`
                : '2px solid rgba(255,255,255,0.3)',
              backgroundColor: currentState.answered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.1)',
              color: currentState.answered ? '#333' : 'white',
              fontSize: '16px',
              minWidth: '250px',
              textAlign: 'center',
              outline: 'none'
            }}
          />
          
          <button
            onClick={handleSubmit}
            disabled={currentState.answered || !currentInput.trim()}
            style={{
              background: (currentState.answered || !currentInput.trim())
                ? 'linear-gradient(45deg, #666, #888)'
                : 'linear-gradient(45deg, #4caf50, #66bb6a)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '15px 30px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: (currentState.answered || !currentInput.trim()) ? 'not-allowed' : 'pointer',
              opacity: (currentState.answered || !currentInput.trim()) ? 0.5 : 1,
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!currentState.answered && currentInput.trim()) {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!currentState.answered && currentInput.trim()) {
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            ✓ Submit
          </button>
        </div>

        {/* Explanation */}
        {currentState.answered && currentQuestion.explanation && (
          <div style={{
            backgroundColor: currentState.isCorrect 
              ? 'rgba(76, 175, 80, 0.2)' 
              : 'rgba(244, 67, 54, 0.2)',
            border: `2px solid ${currentState.isCorrect ? '#4caf50' : '#f44336'}`,
            borderRadius: '10px',
            padding: '15px',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              marginBottom: '8px',
              color: currentState.isCorrect ? '#4caf50' : '#f44336'
            }}>
              {currentState.isCorrect ? '✅ Correct!' : '❌ Incorrect!'}
            </div>
            <div style={{ fontSize: '16px', marginBottom: '8px' }}>
              {currentQuestion.explanation}
            </div>
            {!currentState.isCorrect && (
              <div style={{ fontSize: '14px', fontStyle: 'italic', color: '#4caf50' }}>
                Correct answer(s): {currentQuestion.correctAnswers.join(', ')}
              </div>
            )}
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