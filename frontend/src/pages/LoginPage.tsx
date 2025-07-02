import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  Paper,
  Link,
  CircularProgress,
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';

export const LoginPage: React.FC = () => {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signInWithGoogle, currentUser, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: { xs: 2, sm: 4 },
        bgcolor: 'background.default'
      }}
    >
      <Paper elevation={3} sx={{
        p: { xs: 3, sm: 4 },
        width: '100%',
        maxWidth: 400,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: 2
      }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            textAlign: 'center',
            mb: 4,
            color: 'primary.main'
          }}
        >
          Welcome to WhiZardLM
        </Typography>

        <Typography
          variant="h6"
          sx={{
            color: 'text.secondary',
            mb: 4,
            textAlign: 'center',
          }}
        >
          Your AI Study Companion
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{
              width: '100%',
              mb: 3,
            }}
          >
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          size="large"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleSignIn}
          disabled={loading}
          sx={{
            py: 1.5,
            px: 4,
            borderRadius: 3,
            textTransform: 'none',
            fontSize: '1.1rem',
            width: '100%',
            mb: 3,
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Sign in with Google'
          )}
        </Button>

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
        >
          By signing in, you agree to our{' '}
          <Link href="#" color="primary">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="#" color="primary">
            Privacy Policy
          </Link>
          .
        </Typography>
      </Paper>
    </Box>
  );
}; 