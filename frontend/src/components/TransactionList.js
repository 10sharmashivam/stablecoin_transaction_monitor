import React, { useState } from 'react';
import {
    List,
    ListItem,
    ListItemText,
    Typography,
    Box,
    Chip,
    Divider,
    Paper,
    IconButton,
    Collapse,
    Tooltip,
    TextField,
    InputAdornment
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import WarningIcon from '@mui/icons-material/Warning';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchIcon from '@mui/icons-material/Search';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const TransactionList = ({ transactions = [] }) => {
    const [expandedTx, setExpandedTx] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleExpandClick = (txHash) => {
        setExpandedTx(expandedTx === txHash ? null : txHash);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const formatDate = (dateStr) => {
        try {
            return format(parseISO(dateStr), 'MMM d, yyyy HH:mm:ss');
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
        }).format(value || 0);
    };

    const filteredTransactions = transactions.filter(tx => {
        if (!tx) return false;
        const searchLower = searchTerm.toLowerCase();
        return (
            tx.tx_hash?.toLowerCase().includes(searchLower) ||
            tx.from_address?.toLowerCase().includes(searchLower) ||
            tx.to_address?.toLowerCase().includes(searchLower)
        );
    });

    if (!Array.isArray(transactions) || transactions.length === 0) {
        return (
            <Box>
                <Typography variant="h6" gutterBottom>
                    Recent Transactions
                </Typography>
                <Typography variant="body1" color="textSecondary">
                    No transactions available yet.
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Recent Transactions
            </Typography>
            
            <TextField
                fullWidth
                size="small"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
            />

            <List>
                {filteredTransactions.map((tx, index) => {
                    if (!tx || !tx.tx_hash) return null;
                    
                    const isExpanded = expandedTx === tx.tx_hash;
                    
                    return (
                        <Paper 
                            key={tx.tx_hash}
                            elevation={1}
                            sx={{ 
                                mb: 1,
                                '&:hover': {
                                    backgroundColor: 'action.hover'
                                }
                            }}
                        >
                            <ListItem 
                                alignItems="flex-start"
                                sx={{ 
                                    cursor: 'pointer',
                                    '&:hover': {
                                        backgroundColor: 'action.hover'
                                    }
                                }}
                                onClick={() => handleExpandClick(tx.tx_hash)}
                            >
                                <ListItemText
                                    primary={
                                        <Box display="flex" alignItems="center" justifyContent="space-between">
                                            <Box display="flex" alignItems="center">
                                                <Typography
                                                    component="span"
                                                    variant="body2"
                                                    color="textPrimary"
                                                    sx={{ fontFamily: 'monospace' }}
                                                >
                                                    {tx.tx_hash.slice(0, 10)}...
                                                </Typography>
                                                <Tooltip title="Copy transaction hash">
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            copyToClipboard(tx.tx_hash);
                                                        }}
                                                    >
                                                        <ContentCopyIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                            <Box display="flex" alignItems="center">
                                                {tx.is_anomaly && (
                                                    <Chip
                                                        icon={<WarningIcon />}
                                                        label="Suspicious"
                                                        color="error"
                                                        size="small"
                                                        sx={{ mr: 1 }}
                                                    />
                                                )}
                                                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                            </Box>
                                        </Box>
                                    }
                                    secondary={
                                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                            <Box mt={1}>
                                                <Typography
                                                    component="span"
                                                    variant="body2"
                                                    color="textPrimary"
                                                    display="block"
                                                >
                                                    Amount: {formatCurrency(tx.amount)}
                                                </Typography>
                                                <Box display="flex" alignItems="center" mt={1}>
                                                    <Typography
                                                        component="span"
                                                        variant="body2"
                                                        color="textSecondary"
                                                        sx={{ mr: 1 }}
                                                    >
                                                        From:
                                                    </Typography>
                                                    <Typography
                                                        component="span"
                                                        variant="body2"
                                                        color="textPrimary"
                                                        sx={{ fontFamily: 'monospace' }}
                                                    >
                                                        {tx.from_address ? `${tx.from_address.slice(0, 10)}...` : 'Unknown'}
                                                    </Typography>
                                                    <Tooltip title="Copy address">
                                                        <IconButton 
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                copyToClipboard(tx.from_address);
                                                            }}
                                                        >
                                                            <ContentCopyIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                                <Box display="flex" alignItems="center" mt={1}>
                                                    <Typography
                                                        component="span"
                                                        variant="body2"
                                                        color="textSecondary"
                                                        sx={{ mr: 1 }}
                                                    >
                                                        To:
                                                    </Typography>
                                                    <Typography
                                                        component="span"
                                                        variant="body2"
                                                        color="textPrimary"
                                                        sx={{ fontFamily: 'monospace' }}
                                                    >
                                                        {tx.to_address ? `${tx.to_address.slice(0, 10)}...` : 'Unknown'}
                                                    </Typography>
                                                    <Tooltip title="Copy address">
                                                        <IconButton 
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                copyToClipboard(tx.to_address);
                                                            }}
                                                        >
                                                            <ContentCopyIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                                <Typography
                                                    component="span"
                                                    variant="body2"
                                                    color="textSecondary"
                                                    display="block"
                                                    mt={1}
                                                >
                                                    {formatDate(tx.timestamp)}
                                                </Typography>
                                            </Box>
                                        </Collapse>
                                    }
                                />
                            </ListItem>
                        </Paper>
                    );
                })}
            </List>
        </Box>
    );
};

export default TransactionList;
