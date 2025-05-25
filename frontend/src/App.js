import React, { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Dashboard from './components/Dashboard';
import Login from './components/Login';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#2e7d32',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {isAuthenticated ? (
        <Dashboard />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </ThemeProvider>
  );
}

export default App;
