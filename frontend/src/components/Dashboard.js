import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Grid, 
    Paper, 
    Typography, 
    Box,
    CircularProgress,
    Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import TransactionList from './TransactionList';
import Statistics from './Statistics';
import Charts from './Charts';
import api from '../services/api';

const DashboardPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    height: '100%',
}));

const TitleBox = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(4),
    padding: theme.spacing(3),
    background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)',
    borderRadius: '16px',
    border: '1px solid rgba(33, 150, 243, 0.1)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(45deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0) 100%)',
        zIndex: 1,
    }
}));

const TitleTypography = styled(Typography)(({ theme }) => ({
    color: theme.palette.primary.main,
    fontWeight: 700,
    fontSize: '2.5rem',
    textAlign: 'center',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
    position: 'relative',
    zIndex: 2,
    [theme.breakpoints.down('sm')]: {
        fontSize: '2rem',
    }
}));

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState({
        total_volume: 0,
        transaction_count: 0,
        avg_transaction: 0,
        fraud_count: 0,
        transactions: []
    });

    const validateDashboardData = (data) => {
        if (!data) return false;
        
        // Ensure all required fields exist and are of correct type
        const requiredFields = {
            total_volume: 'number',
            transaction_count: 'number',
            avg_transaction: 'number',
            fraud_count: 'number',
            transactions: 'object'
        };

        for (const [field, type] of Object.entries(requiredFields)) {
            if (data[field] === undefined || typeof data[field] !== type) {
                console.error(`Invalid or missing field: ${field}`);
                return false;
            }
        }

        // Ensure transactions is an array
        if (!Array.isArray(data.transactions)) {
            console.error('Transactions field is not an array');
            return false;
        }

        return true;
    };

    useEffect(() => {
        console.log('Dashboard component mounted');
        const fetchData = async () => {
            try {
                console.log('Fetching dashboard data...');
                setLoading(true);
                const data = await api.getDashboardData();
                console.log('Received dashboard data:', data);

                if (!validateDashboardData(data)) {
                    throw new Error('Invalid dashboard data received from server');
                }

                setDashboardData(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError(err.message || 'Failed to fetch dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // Refresh data every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
                <Typography variant="h6" sx={{ ml: 2 }}>
                    Loading dashboard data...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Typography variant="body1" color="textSecondary">
                    Please try refreshing the page or contact support if the problem persists.
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <TitleBox>
                <TitleTypography variant="h4" component="h1">
                    Stablecoin Transaction Monitor
                </TitleTypography>
            </TitleBox>
            
            <Grid container spacing={3}>
                {/* Statistics Cards */}
                <Grid item xs={12}>
                    <Statistics data={dashboardData} />
                </Grid>

                {/* Charts */}
                <Grid item xs={12} md={8}>
                    <DashboardPaper>
                        <Charts data={dashboardData} />
                    </DashboardPaper>
                </Grid>

                {/* Recent Transactions */}
                <Grid item xs={12} md={4}>
                    <DashboardPaper>
                        <TransactionList transactions={dashboardData.transactions} />
                    </DashboardPaper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Dashboard;
