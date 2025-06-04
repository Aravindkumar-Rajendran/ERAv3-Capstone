import React from 'react';
import { QuizComponentProps, MCQQuestion, TrueFalseQuestion, FillBlanksQuestion, MatchFollowingQuestion } from '../types/quiz';
import { MCQQuiz } from './quiz/MCQQuiz';
import { TrueFalseQuiz } from './quiz/TrueFalseQuiz';
import { FillBlanksQuiz } from './quiz/FillBlanksQuiz';
import { MatchFollowingQuiz } from './quiz/MatchFollowingQuiz';

export const QuizComponent = ({ 
  quizData, 
  isOpen, 
  onClose, 
  onComplete 
}: QuizComponentProps) => {
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
            // @ts-ignore
            questions={quizData.questions}
            theme={quizData.theme}
            onComplete={handleComplete}
          />
        );
      case 'TrueFalse':
        return (
          <TrueFalseQuiz
            // @ts-ignore
            questions={quizData.questions}
            theme={quizData.theme}
            onComplete={handleComplete}
          />
        );
      case 'FillBlanks':
        return (
          <FillBlanksQuiz
            // @ts-ignore
            questions={quizData.questions}
            theme={quizData.theme}
            onComplete={handleComplete}
          />
        );
      case 'MatchFollowing':
        return (
          <MatchFollowingQuiz
            // @ts-ignore
            questions={quizData.questions}
            theme={quizData.theme}
            onComplete={handleComplete}
          />
        );
      default:
        return <div>Unsupported quiz type</div>;
    }
  };

  return (
    <div className="quiz-overlay" style={{
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
      <div className="quiz-modal" style={{
        backgroundColor: quizData.theme.backgroundColor,
        borderRadius: '10px',
        padding: '20px',
        maxWidth: '800px',
        maxHeight: '80vh',
        overflow: 'auto',
        position: 'relative',
        width: '90%'
      }}>
        <button 
          className="close-button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: quizData.theme.textColor
          }}
        >
          ×
        </button>
        
        <div className="quiz-title" style={{
          textAlign: 'center',
          marginBottom: '20px',
          fontFamily: quizData.theme.fontFamily,
          color: quizData.theme.textColor
        }}>
          <h2>{quizData.title}</h2>
          {quizData.description && <p>{quizData.description}</p>}
        </div>

        {renderQuizBySubtype()}
      </div>
    </div>
  );
}; 