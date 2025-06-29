import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signInWithGoogle, currentUser, loading: authLoading } = useAuth();

  if (authLoading) return <div>Loading...</div>;
  if (currentUser) return <Navigate to="/projects" replace />;

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      navigate('/projects');
    } catch (error) {
      setError('Failed to sign in with Google');
      console.error('Google sign-in error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #4caf50 0%, #2196f3 100%)',
      fontFamily: 'Arial, sans-serif',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '24px',
        boxShadow: '0 8px 32px rgba(44,62,80,0.18)',
        padding: '48px 36px 36px 36px',
        maxWidth: 400,
        width: '100%',
        textAlign: 'center',
        position: 'relative',
      }}>
        {/* Mascot/Icon */}
        <div style={{ fontSize: 56, marginBottom: 12 }}>🧙‍♂️</div>
        {/* Welcome Header */}
        <h1 style={{
          fontSize: '2.1rem',
          fontWeight: 800,
          margin: 0,
          background: 'linear-gradient(90deg, #4caf50, #2196f3, #ff9800)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '1px',
        }}>
          Welcome to WhiZardLM
        </h1>
        <p style={{
          margin: '12px 0 28px 0',
          color: '#333',
          fontSize: '1.1rem',
          fontWeight: 500,
          opacity: 0.85,
        }}>
          Your AI Study Companion
        </p>
        <div style={{ marginBottom: 18 }}>
          <h2 style={{
            fontSize: '1.3rem',
            fontWeight: 700,
            color: '#2196f3',
            margin: 0,
            letterSpacing: '0.5px',
          }}>
            Sign in to get started
          </h2>
        </div>
        {error && (
          <div style={{
            background: '#ffeaea',
            border: '1px solid #f44336',
            color: '#d32f2f',
            borderRadius: 8,
            padding: '10px 0',
            marginBottom: 18,
            fontWeight: 500,
            fontSize: '1rem',
          }}>
            {error}
          </div>
        )}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: '14px 0',
            fontSize: '1.1rem',
            fontWeight: 700,
            border: 'none',
            borderRadius: 10,
            background: loading
              ? 'linear-gradient(90deg, #bdbdbd, #90caf9)'
              : 'linear-gradient(90deg, #4285f4, #34a853, #fbbc05, #ea4335)',
            color: '#fff',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px rgba(66,133,244,0.12)',
            transition: 'all 0.2s',
            marginTop: 8,
            marginBottom: 8,
            letterSpacing: '0.5px',
          }}
        >
          {loading ? (
            'Signing in...'
          ) : (
            <>
              <svg width="24" height="24" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
                <g>
                  <path fill="#4285F4" d="M21.35 11.1h-9.18v2.92h5.98c-.26 1.4-1.56 4.1-5.98 4.1-3.6 0-6.54-2.97-6.54-6.62s2.94-6.62 6.54-6.62c2.05 0 3.43.87 4.22 1.61l2.88-2.8C17.1 2.7 14.9 1.6 12.17 1.6 6.7 1.6 2.1 6.18 2.1 11.6s4.6 10 10.07 10c5.8 0 9.63-4.07 9.63-9.8 0-.66-.07-1.16-.15-1.7z"/>
                  <path fill="#34A853" d="M3.55 7.68l2.44 1.79c.66-1.3 2.02-3.13 6.18-3.13 1.78 0 3.37.7 4.6 1.93l2.9-2.82C17.1 2.7 14.9 1.6 12.17 1.6c-4.5 0-8.1 3.68-8.1 8.2 0 1.3.3 2.54.85 3.68z"/>
                  <path fill="#FBBC05" d="M12.17 21.6c2.7 0 4.97-.9 6.62-2.44l-3.06-2.51c-.85.6-2.02 1.02-3.56 1.02-3.42 0-5.72-2.7-5.98-4.1H3.55c1.1 2.2 3.6 5.03 8.62 5.03z"/>
                  <path fill="#EA4335" d="M21.35 11.1h-9.18v2.92h5.98c-.26 1.4-1.56 4.1-5.98 4.1-3.6 0-6.54-2.97-6.54-6.62s2.94-6.62 6.54-6.62c2.05 0 3.43.87 4.22 1.61l2.88-2.8C17.1 2.7 14.9 1.6 12.17 1.6 6.7 1.6 2.1 6.18 2.1 11.6s4.6 10 10.07 10c5.8 0 9.63-4.07 9.63-9.8 0-.66-.07-1.16-.15-1.7z"/>
                </g>
              </svg>
              Sign in with Google
            </>
          )}
        </button>
        <div style={{ marginTop: 24, color: '#888', fontSize: '0.98rem', opacity: 0.8 }}>
          <span>By signing in, you agree to our <a href="#" style={{ color: '#2196f3', textDecoration: 'underline' }}>Terms</a> and <a href="#" style={{ color: '#2196f3', textDecoration: 'underline' }}>Privacy Policy</a>.</span>
        </div>
      </div>
    </div>
  );
}; 