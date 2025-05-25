import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, Tooltip, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import WarningIcon from '@mui/icons-material/Warning';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import InfoIcon from '@mui/icons-material/Info';
import { motion } from 'framer-motion';

const StatPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'hidden',
    flexDirection: 'column',
    height: '100%',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.1)',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
    }
}));

const StatBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2),
    borderRadius: '12px',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
        zIndex: 1,
    }
}));

const IconBox = styled(Box)(({ theme, color }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
    borderRadius: '16px',
    background: `linear-gradient(135deg, ${color} 0%, ${color}80 100%)`,
    color: '#fff',
    marginRight: theme.spacing(2),
    boxShadow: `0 4px 12px ${color}40`,
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        transform: 'scale(1.1)',
    }
}));

const ValueTypography = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.primary,
    fontWeight: 'bold',
    fontSize: '1.5rem',
    marginBottom: theme.spacing(0.5),
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
}));

const TitleTypography = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontWeight: 500,
    fontSize: '0.875rem',
    marginBottom: theme.spacing(0.5),
}));

const Statistics = ({ data }) => {
    const [animatedValues, setAnimatedValues] = useState({
        total_volume: 0,
        transaction_count: 0,
        avg_transaction: 0,
        fraud_count: 0
    });

    useEffect(() => {
        const duration = 2000; // 2 seconds
        const steps = 60;
        const interval = duration / steps;

        const animateValue = (start, end, key) => {
            let current = start;
            const increment = (end - start) / steps;
            const timer = setInterval(() => {
                current += increment;
                if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                    current = end;
                    clearInterval(timer);
                }
                setAnimatedValues(prev => ({
                    ...prev,
                    [key]: current
                }));
            }, interval);
        };

        // Start animations
        animateValue(0, data.total_volume || 0, 'total_volume');
        animateValue(0, data.transaction_count || 0, 'transaction_count');
        animateValue(0, (data.total_volume || 0) / (data.transaction_count || 1), 'avg_transaction');
        animateValue(0, data.fraud_count || 0, 'fraud_count');

        // Cleanup intervals on unmount
        return () => {
            clearInterval(interval);
        };
    }, [data]);

    const stats = [
        {
            title: 'Total Volume (24h)',
            value: `$${animatedValues.total_volume.toFixed(2)}`,
            icon: <AccountBalanceIcon />,
            color: '#2196f3',
            gradient: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
            description: 'Total transaction volume in the last 24 hours'
        },
        {
            title: 'Transaction Count',
            value: Math.round(animatedValues.transaction_count),
            icon: <TrendingUpIcon />,
            color: '#4caf50',
            gradient: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
            description: 'Number of transactions processed in the last 24 hours'
        },
        {
            title: 'Average Transaction',
            value: `$${animatedValues.avg_transaction.toFixed(2)}`,
            icon: <ShowChartIcon />,
            color: '#ff9800',
            gradient: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
            description: 'Average transaction value in the last 24 hours'
        },
        {
            title: 'Suspicious Transactions',
            value: Math.round(animatedValues.fraud_count),
            icon: <WarningIcon />,
            color: '#f44336',
            gradient: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
            description: 'Number of suspicious transactions detected'
        }
    ];

    return (
        <Grid container spacing={3}>
            {stats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <StatPaper>
                            <StatBox>
                                <IconBox color={stat.color}>
                                    {stat.icon}
                                </IconBox>
                                <Box sx={{ position: 'relative', zIndex: 2 }}>
                                    <Box display="flex" alignItems="center">
                                        <TitleTypography>
                                            {stat.title}
                                        </TitleTypography>
                                        <Tooltip title={stat.description}>
                                            <IconButton size="small" sx={{ color: 'text.secondary' }}>
                                                <InfoIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                    <ValueTypography>
                                        {stat.value}
                                    </ValueTypography>
                                </Box>
                            </StatBox>
                        </StatPaper>
                    </motion.div>
                </Grid>
            ))}
        </Grid>
    );
};

export default Statistics;
