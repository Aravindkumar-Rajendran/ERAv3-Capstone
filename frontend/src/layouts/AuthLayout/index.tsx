import { Box, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        p: 2,
      }}
    >
      <CssBaseline />
      <Box
        sx={{
          width: '100%',
          maxWidth: 450,
          bgcolor: 'background.paper',
          p: 4,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AuthLayout;
