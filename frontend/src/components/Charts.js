import React, { useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    ScatterChart,
    Scatter,
    ReferenceLine,
    Brush,
    RadialBarChart,
    RadialBar
} from 'recharts';
import { Typography, Box, ToggleButtonGroup, ToggleButton, Paper, Grid } from '@mui/material';
import { format, parseISO, getHours, getDay } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Charts = ({ data }) => {
    const [timeRange, setTimeRange] = useState('24h');
    const [activeIndex, setActiveIndex] = useState(null);

    // Process data for charts
    const processChartData = () => {
        if (!data.transactions || !Array.isArray(data.transactions)) {
            return {
                hourlyData: [],
                anomalyData: [],
                hourlyDistribution: [],
                dailyDistribution: [],
                topAddresses: []
            };
        }

        const hourlyData = {};
        const anomalyData = [];
        const hourlyDistribution = Array(24).fill(0);
        const dailyDistribution = Array(7).fill(0);
        const addressData = {};
        
        data.transactions.forEach(tx => {
            if (!tx || !tx.timestamp) return;
            
            const date = parseISO(tx.timestamp);
            const hour = format(date, 'yyyy-MM-dd HH:00');
            const hourOfDay = getHours(date);
            const dayOfWeek = getDay(date);
            
            // Process hourly data
            if (!hourlyData[hour]) {
                hourlyData[hour] = {
                    hour,
                    volume: 0,
                    count: 0,
                    anomalies: 0,
                    timestamp: date.getTime()
                };
            }
            hourlyData[hour].volume += tx.amount || 0;
            hourlyData[hour].count += 1;
            
            // Process hourly distribution
            hourlyDistribution[hourOfDay] += tx.amount || 0;
            
            // Process daily distribution
            dailyDistribution[dayOfWeek] += tx.amount || 0;
            
            // Process address data
            if (!addressData[tx.from_address]) {
                addressData[tx.from_address] = {
                    address: tx.from_address,
                    volume: 0,
                    count: 0
                };
            }
            addressData[tx.from_address].volume += tx.amount || 0;
            addressData[tx.from_address].count += 1;
            
            if (tx.is_anomaly) {
                hourlyData[hour].anomalies += 1;
                anomalyData.push({
                    amount: tx.amount,
                    timestamp: date.getTime(),
                    score: tx.anomaly_score || 0.5
                });
            }
        });

        // Get top addresses by volume
        const topAddresses = Object.values(addressData)
            .sort((a, b) => b.volume - a.volume)
            .slice(0, 5)
            .map((addr, index) => ({
                ...addr,
                fill: COLORS[index % COLORS.length]
            }));

        return {
            hourlyData: Object.values(hourlyData)
                .sort((a, b) => a.timestamp - b.timestamp)
                .slice(-24),
            anomalyData,
            hourlyDistribution: hourlyDistribution.map((value, index) => ({
                hour: `${index}:00`,
                value
            })),
            dailyDistribution: dailyDistribution.map((value, index) => ({
                day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index],
                value
            })),
            topAddresses
        };
    };

    const { hourlyData: chartData, anomalyData, hourlyDistribution, dailyDistribution, topAddresses } = processChartData();

    const formatDate = (dateStr) => {
        try {
            return format(parseISO(dateStr), 'MMM d, HH:mm');
        } catch (e) {
            return dateStr;
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };

    const formatAddress = (address) => {
        if (!address) return 'Unknown';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const onPieEnter = (_, index) => {
        setActiveIndex(index);
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Paper elevation={3} sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                    <Typography variant="subtitle2">{label}</Typography>
                    {payload.map((entry, index) => (
                        <Typography key={index} variant="body2" sx={{ color: entry.color }}>
                            {entry.name}: {entry.name === 'Volume' ? formatCurrency(entry.value) : entry.value}
                        </Typography>
                    ))}
                </Paper>
            );
        }
        return null;
    };

    if (chartData.length === 0) {
        return (
            <Box>
                <Typography variant="h6" gutterBottom>
                    Transaction Analytics
                </Typography>
                <Typography variant="body1" color="textSecondary">
                    No transaction data available yet.
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">
                    Transaction Analytics
                </Typography>
                <ToggleButtonGroup
                    value={timeRange}
                    exclusive
                    onChange={(e, value) => value && setTimeRange(value)}
                    size="small"
                >
                    <ToggleButton value="24h">24h</ToggleButton>
                    <ToggleButton value="7d">7d</ToggleButton>
                    <ToggleButton value="30d">30d</ToggleButton>
                </ToggleButtonGroup>
            </Box>
            
            <Grid container spacing={3}>
                {/* Volume Chart */}
                <Grid item xs={12}>
                    <Paper elevation={0} sx={{ p: 2, backgroundColor: 'background.default' }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Transaction Volume Over Time
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#1976d2" stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#666" />
                                <XAxis 
                                    dataKey="hour" 
                                    tickFormatter={formatDate}
                                    stroke="#666"
                                />
                                <YAxis 
                                    tickFormatter={formatCurrency}
                                    stroke="#666"
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Area 
                                    type="monotone" 
                                    dataKey="volume" 
                                    stroke="#1976d2" 
                                    fillOpacity={1}
                                    fill="url(#colorVolume)"
                                    name="Volume"
                                />
                                <Brush dataKey="hour" height={30} stroke="#1976d2" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Hourly Distribution */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2, backgroundColor: 'background.default' }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Hourly Transaction Distribution
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={hourlyDistribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#666" />
                                <XAxis dataKey="hour" stroke="#666" />
                                <YAxis 
                                    tickFormatter={formatCurrency}
                                    stroke="#666"
                                />
                                <Tooltip 
                                    formatter={(value) => [formatCurrency(value), 'Volume']}
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px'
                                    }}
                                />
                                <Bar 
                                    dataKey="value" 
                                    fill="#00C49F"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Daily Distribution */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2, backgroundColor: 'background.default' }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Daily Transaction Distribution
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={dailyDistribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#666" />
                                <XAxis dataKey="day" stroke="#666" />
                                <YAxis 
                                    tickFormatter={formatCurrency}
                                    stroke="#666"
                                />
                                <Tooltip 
                                    formatter={(value) => [formatCurrency(value), 'Volume']}
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px'
                                    }}
                                />
                                <Bar 
                                    dataKey="value" 
                                    fill="#FFBB28"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Top Addresses */}
                <Grid item xs={12}>
                    <Paper elevation={0} sx={{ p: 2, backgroundColor: 'background.default' }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Top Addresses by Volume
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <RadialBarChart 
                                innerRadius="10%" 
                                outerRadius="80%" 
                                data={topAddresses}
                                startAngle={180} 
                                endAngle={0}
                            >
                                <RadialBar 
                                    minAngle={15} 
                                    label={{ 
                                        fill: '#666', 
                                        position: 'insideStart',
                                        formatter: (value) => formatAddress(value?.address)
                                    }} 
                                    background 
                                    dataKey="volume" 
                                />
                                <Legend 
                                    formatter={(value) => formatCurrency(value)}
                                    layout="vertical" 
                                    verticalAlign="middle" 
                                    align="right"
                                />
                                <Tooltip 
                                    formatter={(value, name, props) => {
                                        if (name === 'address') {
                                            return [formatAddress(value), 'Address'];
                                        }
                                        return [formatCurrency(value), 'Volume'];
                                    }}
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px'
                                    }}
                                />
                            </RadialBarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Charts;
