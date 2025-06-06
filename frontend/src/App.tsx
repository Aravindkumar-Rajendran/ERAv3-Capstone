import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Temporarily disabled due to build issues
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools/development';
import { Toaster } from 'react-hot-toast';
import theme from './theme';
import AppRoutes from './routes';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
        <Toaster position="top-right" />
        {/* Temporarily disabled due to build issues
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} position="bottom-right" toggleButtonProps={{ style: { bottom: 60 }}} />
        )}
        */}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;