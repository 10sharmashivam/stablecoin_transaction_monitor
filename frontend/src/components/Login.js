import React, { useState } from 'react';
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Container,
    Alert,
    Fade
} from '@mui/material';
import { styled } from '@mui/material/styles';

const LoginContainer = styled(Container)(({ theme }) => ({
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)'
}));

const LoginPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: 16,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
}));

const Logo = styled('div')(({ theme }) => ({
    width: 80,
    height: 80,
    marginBottom: theme.spacing(3),
    background: 'linear-gradient(45deg, #1976d2 30%, #64b5f6 90%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold'
}));

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Simulate API call
        setTimeout(() => {
            if (username === 'admin' && password === 'demo123') {
                onLogin();
            } else {
                setError('Invalid credentials. Try admin/demo123');
            }
            setLoading(false);
        }, 1000);
    };

    return (
        <LoginContainer>
            <LoginPaper elevation={3}>
                <Logo>SM</Logo>
                <Typography variant="h4" gutterBottom>
                    Welcome Back
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                    Stablecoin Transaction Monitor
                </Typography>
                
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, width: '100%' }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoFocus
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    
                    <Fade in={!!error}>
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    </Fade>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, py: 1.5 }}
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </Button>

                    <Typography variant="body2" color="textSecondary" align="center">
                        Demo credentials: admin / demo123
                    </Typography>
                </Box>
            </LoginPaper>
        </LoginContainer>
    );
};

export default Login; 