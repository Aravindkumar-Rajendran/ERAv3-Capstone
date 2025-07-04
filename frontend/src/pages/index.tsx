import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const handleStart = () => {
    navigate('/login');
  };
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
      fontFamily: `'Comic Neue', 'Nunito', Arial, sans-serif`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '0',
    }}>
      {/* Hero Section */}
      <div style={{
        marginTop: 48,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}>
        <div style={{
          background: 'white',
          borderRadius: '50%',
          boxShadow: '0 4px 24px rgba(80, 80, 180, 0.12)',
          width: 120,
          height: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}>
          <span style={{ fontSize: 64, filter: 'drop-shadow(0 2px 6px #b4b4e0)' }}>🧙‍♂️</span>
        </div>
        <h1 style={{
          fontFamily: 'Comic Neue, Nunito, Arial, sans-serif',
          fontWeight: 700,
          fontSize: 40,
          color: '#5b21b6',
          margin: 0,
        }}>
          Meet WhiZardLM
        </h1>
        <p style={{
          fontFamily: 'Nunito, Comic Neue, Arial, sans-serif',
          fontSize: 20,
          color: '#312e81',
          margin: '16px 0 0 0',
          maxWidth: 500,
        }}>
          <span role="img" aria-label="wizard">🧙</span> Your magical guide to learning! Whether it's solving a tricky math problem, exploring the wonders of space, or writing an awesome story — WhiZardLM helps you think, ask, explore, and learn like a real wizard!
        </p>
      </div>

      {/* Features Section */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 32,
        marginTop: 48,
        maxWidth: 1100,
      }}>
        {/* Feature Tile */}
        <FeatureTile
          icon="📤"
          title="Upload & Learn"
          description={[
            'Upload classroom material: Text, PDF, or even YouTube videos',
            'WhiZardLM will convert it into an interactive learning playground',
          ]}
        />
        <FeatureTile
          icon="🤖"
          title="AI-Powered Q&A"
          description={[
            'Ask questions about what you uploaded',
            'Get guided answers, not spoon-fed ones',
            'Powered by LLM — like a smart wizard who teaches you, not just tells you',
          ]}
        />
        <FeatureTile
          icon="🧠"
          title="Socratic Style Learning"
          description={[
            'WhiZardLM helps you think through the answer',
            'Prompts with clues and questions to build critical thinking skills',
            'Like a wise teacher: "What do you think happens if…?"',
          ]}
        />
        <FeatureTile
          icon="🎮"
          title="Interactive Learning Playground"
          description={[
            'Engaging tools built by coding agents',
            "Personalized and dynamic content based on the student's input",
            'Types of elements: Quizzes, Flashcards, Timelines, Mindmaps',
          ]}
        />
        <FeatureTile
          icon="🛡️"
          title="Reduced Hallucinations"
          description={[
            'Answers are grounded in the resources you upload',
            'Less chance of AI making things up',
            'Context-aware: more accurate, relevant, and trustworthy',
          ]}
        />
      </div>

      {/* Call to Action */}
      <div style={{ marginTop: 56, marginBottom: 32 }}>
        <button
          style={{
            background: 'linear-gradient(90deg, #818cf8 0%, #a5b4fc 100%)',
            color: 'white',
            fontFamily: 'Comic Neue, Nunito, Arial, sans-serif',
            fontWeight: 700,
            fontSize: 22,
            border: 'none',
            borderRadius: 32,
            padding: '18px 48px',
            boxShadow: '0 2px 12px rgba(80, 80, 180, 0.18)',
            cursor: 'pointer',
            transition: 'transform 0.1s',
          }}
          onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
          onClick={handleStart}
        >
          Start Exploring with WhiZardLM!
        </button>
      </div>
    </div>
  );
};

interface FeatureTileProps {
  icon: string;
  title: string;
  description: string[];
}

const FeatureTile: React.FC<FeatureTileProps> = ({ icon, title, description }) => (
  <div style={{
    background: 'white',
    borderRadius: 24,
    boxShadow: '0 4px 24px rgba(80, 80, 180, 0.10)',
    padding: '32px 28px',
    minWidth: 260,
    maxWidth: 320,
    flex: '1 1 260px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '0 8px',
    position: 'relative',
    overflow: 'hidden',
  }}>
    <span style={{ fontSize: 48, marginBottom: 12, filter: 'drop-shadow(0 2px 6px #b4b4e0)' }}>{icon}</span>
    <h2 style={{
      fontFamily: 'Comic Neue, Nunito, Arial, sans-serif',
      fontWeight: 700,
      fontSize: 24,
      color: '#5b21b6',
      margin: '0 0 8px 0',
      textAlign: 'center',
    }}>{title}</h2>
    <ul style={{
      fontFamily: 'Nunito, Comic Neue, Arial, sans-serif',
      fontSize: 16,
      color: '#312e81',
      padding: 0,
      margin: 0,
      listStyle: 'none',
      textAlign: 'left',
    }}>
      {description.map((line, idx) => (
        <li key={idx} style={{ marginBottom: 6, position: 'relative', paddingLeft: 16 }}>
          <span style={{ position: 'absolute', left: 0, top: 0 }}>✨</span> {line}
        </li>
      ))}
    </ul>
  </div>
);

export default LandingPage;