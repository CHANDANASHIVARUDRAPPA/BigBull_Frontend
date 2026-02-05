import React, { useState, useEffect } from 'react';
import { TextField, List, ListItem, ListItemText, Paper, Box, Typography, Container, Grid, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { searchStocks } from '../services/api';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useThemeContext } from './Layout';
import Chatbot from './Chatbot';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const { darkMode, themeColors } = useThemeContext();

  useEffect(() => {
    if (query.length > 1) {
      searchStocks(query).then(res => {
        console.log('Search response:', res.data);
        // Handle different possible response structures
        const quotes = res.data.results?.quotes || res.data.quotes || res.data.results || res.data || [];
        console.log('Parsed quotes:', quotes);
        setResults(Array.isArray(quotes) ? quotes : []);
        setShowResults(true);
      }).catch((err) => {
        console.error('Search error:', err);
        setResults([]);
        setShowResults(false);
      });
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [query]);

  const handleSelect = (symbol) => {
    setQuery('');
    setShowResults(false);
    navigate(`/stock/${symbol}`);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        py: 6
      }}>
        {/* Hero Section */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 'bold',
              color: themeColors.text,
              mb: 2,
              fontFamily: 'Inter, Arial, sans-serif',
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              letterSpacing: -1
            }}
          >
            Smart Investment Decisions
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: themeColors.secondary,
              mb: 4,
              fontFamily: 'Inter, Arial, sans-serif',
              fontSize: { xs: '1.1rem', md: '1.3rem' },
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            Discover, analyze, and invest in stocks with real-time data and advanced analytics
          </Typography>
        </Box>

        {/* Search Section */}
        <Box sx={{ position: 'relative', width: '100%', maxWidth: 600, mx: 'auto', mb: 6 }}>
          <TextField
            fullWidth
            placeholder="Search for stocks, ETFs, or companies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            variant="outlined"
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: themeColors.secondary, mr: 1 }} />,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '1.2rem',
                borderRadius: 3,
                backgroundColor: themeColors.card,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: `2px solid ${themeColors.border}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: themeColors.accent,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                },
                '&.Mui-focused': {
                  borderColor: themeColors.accent,
                  boxShadow: `0 12px 40px ${themeColors.accent}20`,
                },
                '& fieldset': { border: 'none' }
              },
              '& .MuiOutlinedInput-input': {
                color: themeColors.text,
                padding: '16px 20px',
                '&::placeholder': {
                  color: themeColors.secondary,
                  opacity: 0.8,
                },
              },
            }}
          />
          {showResults && results.length > 0 && (
            <Paper
              sx={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                width: '100%',
                zIndex: 10,
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                borderRadius: 3,
                border: `1px solid ${themeColors.border}`,
                backgroundColor: themeColors.card,
                maxHeight: 300,
                overflow: 'auto'
              }}
            >
              <List>
                {results.slice(0, 8).map((stock, index) => (
                  <ListItem
                    key={stock.symbol}
                    onClick={() => handleSelect(stock.symbol)}
                    sx={{
                      cursor: 'pointer',
                      py: 2,
                      px: 3,
                      borderBottom: index !== results.length - 1 ? `1px solid ${themeColors.border}` : 'none',
                      '&:hover': {
                        backgroundColor: themeColors.hover,
                        transform: 'translateX(4px)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: themeColors.text,
                            fontSize: '1.1rem'
                          }}
                        >
                          {stock.shortname}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          sx={{
                            color: themeColors.accent,
                            fontWeight: 500,
                            fontSize: '0.9rem'
                          }}
                        >
                          {stock.symbol} • {stock.exchange || 'NASDAQ'}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>

        {/* Feature Cards */}
        <Grid container spacing={2} sx={{ maxWidth: '100%', mx: 'auto', display: 'flex', flexWrap: 'nowrap' }}>
          <Grid item xs={4}>
            <Card
              sx={{
                height: '100%',
                backgroundColor: themeColors.card,
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                border: `1px solid ${themeColors.border}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <TrendingUpIcon sx={{ fontSize: 48, color: themeColors.accent, mb: 2 }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    color: themeColors.text,
                    mb: 2,
                    fontFamily: 'Inter, Arial, sans-serif'
                  }}
                >
                  Real-time Data
                </Typography>
                <Typography
                  sx={{
                    color: themeColors.secondary,
                    fontFamily: 'Inter, Arial, sans-serif',
                    lineHeight: 1.6
                  }}
                >
                  Get live stock prices and market data with instant updates
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card
              sx={{
                height: '100%',
                backgroundColor: themeColors.card,
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                border: `1px solid ${themeColors.border}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <AnalyticsIcon sx={{ fontSize: 48, color: themeColors.accent, mb: 2 }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    color: themeColors.text,
                    mb: 2,
                    fontFamily: 'Inter, Arial, sans-serif'
                  }}
                >
                  Advanced Analytics
                </Typography>
                <Typography
                  sx={{
                    color: themeColors.secondary,
                    fontFamily: 'Inter, Arial, sans-serif',
                    lineHeight: 1.6
                  }}
                >
                  Comprehensive analysis with charts, trends, and insights
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card
              sx={{
                height: '100%',
                backgroundColor: themeColors.card,
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                border: `1px solid ${themeColors.border}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <AccountBalanceWalletIcon sx={{ fontSize: 48, color: themeColors.accent, mb: 2 }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    color: themeColors.text,
                    mb: 2,
                    fontFamily: 'Inter, Arial, sans-serif'
                  }}
                >
                  Portfolio Management
                </Typography>
                <Typography
                  sx={{
                    color: themeColors.secondary,
                    fontFamily: 'Inter, Arial, sans-serif',
                    lineHeight: 1.6
                  }}
                >
                  Track your investments and manage your portfolio effectively
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Chatbot Component */}
      <Chatbot />
    </Container>
  );
};

export default SearchBar;