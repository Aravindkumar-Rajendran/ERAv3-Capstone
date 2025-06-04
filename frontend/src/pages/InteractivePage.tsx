import React, { useState } from 'react';
import { QuizComponent } from '../components/QuizComponent';
import { QuizData, MCQQuestion, TrueFalseQuestion, FillBlanksQuestion, MatchFollowingQuestion } from '../types/quiz';

export const InteractivePage: React.FC = () => {
  const [activeQuiz, setActiveQuiz] = useState<QuizData | null>(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  // Dummy quiz data for testing
  const mcqQuizData: QuizData = {
    subtype: 'MCQ',
    title: 'Nature Quiz - Multiple Choice',
    description: 'Test your knowledge about nature and wildlife',
    theme: {
      primaryColor: '#4CAF50',
      secondaryColor: '#81C784',
      backgroundColor: '#E8F5E8',
      textColor: '#2E7D32',
      fontFamily: 'Georgia, serif',
      animation: 'nature',
      iconSet: 'leaf'
    },
    questions: [
      {
        id: 1,
        question: 'Which is the largest mammal in the world?',
        options: ['Elephant', 'Blue Whale', 'Giraffe', 'Hippopotamus'],
        correctAnswer: 1,
        explanation: 'The Blue Whale is the largest mammal and largest animal that has ever lived on Earth.'
      },
      {
        id: 2,
        question: 'What process do plants use to make their own food?',
        options: ['Respiration', 'Photosynthesis', 'Transpiration', 'Pollination'],
        correctAnswer: 1,
        explanation: 'Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to create glucose and oxygen.'
      }
    ]
  };

  const trueFalseQuizData: QuizData = {
    subtype: 'TrueFalse',
    title: 'Science Facts - True or False',
    description: 'Determine if these scientific statements are true or false',
    theme: {
      primaryColor: '#2196F3',
      secondaryColor: '#64B5F6',
      backgroundColor: '#E3F2FD',
      textColor: '#1565C0',
      fontFamily: 'Arial, sans-serif',
      animation: 'science',
      iconSet: 'atom'
    },
    questions: [
      {
        id: 1,
        statement: 'The Earth revolves around the Sun.',
        correctAnswer: true,
        explanation: 'This is true. The Earth orbits the Sun, taking approximately 365.25 days to complete one revolution.'
      },
      {
        id: 2,
        statement: 'Water boils at 90 degrees Celsius at sea level.',
        correctAnswer: false,
        explanation: 'This is false. Water boils at 100 degrees Celsius (212°F) at sea level under standard atmospheric pressure.'
      }
    ]
  };

  const fillBlanksQuizData: QuizData = {
    subtype: 'FillBlanks',
    title: 'History Fill in the Blanks',
    description: 'Complete these historical sentences',
    theme: {
      primaryColor: '#FF9800',
      secondaryColor: '#FFB74D',
      backgroundColor: '#FFF3E0',
      textColor: '#EF6C00',
      fontFamily: 'Times New Roman, serif',
      animation: 'history',
      iconSet: 'scroll'
    },
    questions: [
      {
        id: 1,
        sentence: 'The [BLANK] War lasted from 1939 to [BLANK].',
        correctAnswers: ['World', '1945'],
        explanation: 'World War II was a global conflict that lasted from 1939 to 1945.'
      },
      {
        id: 2,
        sentence: 'The [BLANK] of [BLANK] was signed in 1776.',
        correctAnswers: ['Declaration', 'Independence'],
        explanation: 'The Declaration of Independence was signed on July 4, 1776.'
      }
    ]
  };

  const matchFollowingQuizData: QuizData = {
    subtype: 'MatchFollowing',
    title: 'Geography Match the Following',
    description: 'Match countries with their capitals',
    theme: {
      primaryColor: '#9C27B0',
      secondaryColor: '#BA68C8',
      backgroundColor: '#F3E5F5',
      textColor: '#7B1FA2',
      fontFamily: 'Verdana, sans-serif',
      animation: 'geography',
      iconSet: 'globe'
    },
    questions: [
      {
        id: 1,
        instruction: 'Match each country with its capital city:',
        pairs: [
          { id: 1, left: 'France', right: 'Paris' },
          { id: 2, left: 'Japan', right: 'Tokyo' },
          { id: 3, left: 'Australia', right: 'Canberra' },
          { id: 4, left: 'Brazil', right: 'Brasília' }
        ]
      }
    ]
  };

  const handleQuizSelect = (quizData: QuizData) => {
    setActiveQuiz(quizData);
    setIsQuizOpen(true);
  };

  const handleQuizClose = () => {
    setIsQuizOpen(false);
    setActiveQuiz(null);
  };

  const handleQuizComplete = (score: number, totalQuestions: number) => {
    alert(`Quiz completed! Your score: ${score}/${totalQuestions}`);
    handleQuizClose();
  };

  return (
    <div className="interactive-page" style={{ 
      padding: '40px 20px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px', color: '#333' }}>
        Interactive Learning Components - Phase 1 Demo
      </h1>
      
      <p style={{ textAlign: 'center', marginBottom: '40px', fontSize: '18px', color: '#666' }}>
        Click on any quiz type below to test the Quiz Component with dummy data:
      </p>

      <div className="quiz-buttons" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <button
          onClick={() => handleQuizSelect(mcqQuizData)}
          style={{
            padding: '20px',
            fontSize: '16px',
            backgroundColor: mcqQuizData.theme.primaryColor,
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <h3 style={{ margin: '0 0 10px 0' }}>🌿 Nature MCQ Quiz</h3>
          <p style={{ margin: 0, opacity: 0.9 }}>Multiple Choice Questions about nature and wildlife</p>
        </button>

        <button
          onClick={() => handleQuizSelect(trueFalseQuizData)}
          style={{
            padding: '20px',
            fontSize: '16px',
            backgroundColor: trueFalseQuizData.theme.primaryColor,
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <h3 style={{ margin: '0 0 10px 0' }}>🔬 Science True/False</h3>
          <p style={{ margin: 0, opacity: 0.9 }}>Test your knowledge of scientific facts</p>
        </button>

        <button
          onClick={() => handleQuizSelect(fillBlanksQuizData)}
          style={{
            padding: '20px',
            fontSize: '16px',
            backgroundColor: fillBlanksQuizData.theme.primaryColor,
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <h3 style={{ margin: '0 0 10px 0' }}>📜 History Fill Blanks</h3>
          <p style={{ margin: 0, opacity: 0.9 }}>Complete historical sentences</p>
        </button>

        <button
          onClick={() => handleQuizSelect(matchFollowingQuizData)}
          style={{
            padding: '20px',
            fontSize: '16px',
            backgroundColor: matchFollowingQuizData.theme.primaryColor,
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <h3 style={{ margin: '0 0 10px 0' }}>🌍 Geography Matching</h3>
          <p style={{ margin: 0, opacity: 0.9 }}>Match countries with their capitals</p>
        </button>
      </div>

      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '10px',
        border: '1px solid #dee2e6'
      }}>
        <h3 style={{ color: '#495057', marginTop: 0 }}>Phase 1 Demo Features:</h3>
        <ul style={{ color: '#6c757d', lineHeight: '1.6' }}>
          <li>✅ All 4 quiz subtypes: MCQ, True/False, Fill Blanks, Match Following</li>
          <li>✅ Dynamic theming based on content (colors, fonts, styles)</li>
          <li>✅ Overlay modal rendering</li>
          <li>✅ Progress tracking and navigation</li>
          <li>✅ Score calculation and results display</li>
          <li>✅ Responsive design and hover effects</li>
        </ul>
        <p style={{ color: '#495057', margin: '10px 0 0 0', fontStyle: 'italic' }}>
          Next: Phase 2 will integrate with backend and LLM for dynamic quiz generation!
        </p>
      </div>

      {activeQuiz && (
        <QuizComponent
          quizData={activeQuiz}
          isOpen={isQuizOpen}
          onClose={handleQuizClose}
          onComplete={handleQuizComplete}
        />
      )}
    </div>
  );
}; 