import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Typography, Box, Grid, Card, CardContent, Button, Stack, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, Container, Tabs, Tab, Divider, Chip } from "@mui/material";
import { getStockInfo, getStockHistory, buyStock, sellStock, getWallet, withdrawWallet, depositWallet, getStockRisk } from "../services/api";
import { createWebSocket } from "../services/websocket";
import TradingViewChart from "../components/stock/TradingViewChart";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useThemeContext } from './Layout';

const TIMEFRAMES = ["1D", "5D", "1M", "3M", "6M", "1Y", "5Y", "MAX"];

const StockInfo = () => {
  const { symbol } = useParams();
  const [info, setInfo] = useState(null);
  const [history, setHistory] = useState([]);
  const [timeframe, setTimeframe] = useState("1M");
  const [liveData, setLiveData] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('BUY');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [riskData, setRiskData] = useState(null);
  const { darkMode, themeColors } = useThemeContext();

  useEffect(() => {
    getStockInfo(symbol).then((res) => setInfo(res.data.info));
    getStockRisk(symbol, '1y').then((res) => {
      setRiskData(res.data);
    }).catch((err) => {
      console.error('Failed to fetch risk data:', err);
    });
  }, [symbol]);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await getWallet();
        setWalletBalance(res.data.balance);
      } catch (err) {
        console.error('Failed to fetch wallet balance:', err);
      }
    };
    fetchWallet();
  }, []);

  useEffect(() => {
    getStockHistory(symbol, timeframe).then((res) => {
      setHistory(res.data.data);
    });
  }, [symbol, timeframe]);

  useEffect(() => {
    const ws = createWebSocket([symbol], (data) => {
      if (data.type === "data") setLiveData(data.data[symbol] || {});
    });
    return () => ws.close();
  }, [symbol]);

  const handleBuySell = (type) => {
    setActionType(type);
    setDialogOpen(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const price = liveData.price || info.currentPrice;
      const qty = Number(quantity) || 1;

      // Validate inputs
      if (!qty || qty < 1) {
        setSnackbarMsg('Please enter a valid quantity.');
        setSnackbarOpen(true);
        setLoading(false);
        return;
      }

      const totalAmount = price * qty;

      // For BUY: Check wallet balance (but don't withdraw yet)
      if (actionType === 'BUY') {
        if (walletBalance < totalAmount) {
          setSnackbarMsg('Insufficient wallet balance!');
          setSnackbarOpen(true);
          setLoading(false);
          return;
        }
      }

      // Create payload with correct structure
      const transactionPayload = {
        symbol: symbol,
        name: info.shortName || info.name || symbol,
        quantity: qty,
        price: price
      };

      console.log('Transaction type:', actionType);
      console.log('Transaction payload:', JSON.stringify(transactionPayload, null, 2));

      // Use correct endpoint based on action type
      // Backend automatically handles wallet deduction/credit
      if (actionType === 'BUY') {
        await buyStock(transactionPayload);
      } else {
        await sellStock(transactionPayload);
      }

      // Refresh wallet balance to get updated amount from backend
      const walletRes = await getWallet();
      setWalletBalance(walletRes.data.balance);

      setDialogOpen(false);
      setQuantity(1);
      setSnackbarMsg(`${actionType} successful!`);
      setSnackbarOpen(true);
      // Optionally, trigger a refresh of transactions/portfolio here
    } catch (err) {
      console.error('Transaction error:', err.response || err);
      console.error('Error data:', err.response?.data);
      console.error('Error message:', err.response?.data?.message);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || JSON.stringify(err.response?.data) || err.message || 'Transaction failed.';
      setSnackbarMsg(errorMsg);
      setSnackbarOpen(true);
    }
    setLoading(false);
  };

  if (!info) return (
    <Container maxWidth="lg">
      <Typography sx={{
        fontFamily: 'Inter, Arial, sans-serif',
        fontSize: '1.2rem',
        color: themeColors?.text || '#232a36',
        textAlign: 'center',
        py: 8
      }}>
        Loading...
      </Typography>
    </Container>
  );

  const currentPrice = Number(liveData.price || info.currentPrice || 0);
  
  // Calculate price change from previous close or opening price
  const referencePrice = info.previousClose || info.regularMarketPreviousClose || info.open || info.regularMarketOpen || currentPrice;
  const priceChange = currentPrice - referencePrice;
  const priceChangePercent = referencePrice > 0 ? ((priceChange / referencePrice) * 100) : 0;

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              color: themeColors.text,
              fontFamily: 'Inter, Arial, sans-serif',
              fontSize: { xs: '2rem', md: '2.5rem' },
              letterSpacing: -0.5,
              mb: 1
            }}
          >
            {info.shortName}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: themeColors.accent,
              fontFamily: 'Inter, Arial, sans-serif',
              fontSize: '1.2rem',
              mb: 2,
              fontWeight: 500
            }}
          >
            {symbol}
          </Typography>

          {/* Price Display */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3,
            flexWrap: 'wrap'
          }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                fontFamily: 'Inter, Arial, sans-serif',
                fontSize: '2.2rem',
                color: themeColors.text
              }}
            >
              ${currentPrice.toFixed(2)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {priceChange >= 0 ? (
                <TrendingUpIcon sx={{ color: '#059669', fontSize: '1.5rem' }} />
              ) : (
                <TrendingDownIcon sx={{ color: '#dc2626', fontSize: '1.5rem' }} />
              )}
              <Typography
                sx={{
                  fontWeight: 'bold',
                  color: priceChange >= 0 ? '#059669' : '#dc2626',
                  fontFamily: 'Inter, Arial, sans-serif',
                  fontSize: '1.1rem'
                }}
              >
                {priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={() => handleBuySell('BUY')}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                backgroundColor: '#059669',
                color: '#ffffff',
                fontFamily: 'Inter, Arial, sans-serif',
                fontSize: '1rem',
                px: 4,
                py: 1.5,
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                '&:hover': {
                  backgroundColor: '#047857',
                  boxShadow: '0 6px 16px rgba(5, 150, 105, 0.4)'
                }
              }}
            >
              Buy
            </Button>
            <Button
              variant="contained"
              onClick={() => handleBuySell('SELL')}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                fontFamily: 'Inter, Arial, sans-serif',
                fontSize: '1rem',
                px: 4,
                py: 1.5,
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                '&:hover': {
                  backgroundColor: '#b91c1c',
                  boxShadow: '0 6px 16px rgba(220, 38, 38, 0.4)'
                }
              }}
            >
              Sell
            </Button>
          </Box>
        </Box>

        {/* Main Content - Left-Right Layout */}
        <Grid container spacing={4}>
          {/* LEFT SIDE - Stock Details */}
          <Grid item xs={12} lg={4}>
            <Card
              sx={{
                height: "100%",
                backgroundColor: themeColors.card,
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                border: `1px solid ${themeColors.border}`,
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    fontWeight: "bold",
                    fontFamily: 'Inter, Arial, sans-serif',
                    fontSize: '1.3rem',
                    color: themeColors.text
                  }}
                >
                  Stock Details
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        opacity: 0.7,
                        fontFamily: 'Inter, Arial, sans-serif',
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        mb: 1,
                        color: themeColors.secondary
                      }}
                    >
                      Sector
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'Inter, Arial, sans-serif',
                        fontSize: '1.1rem',
                        color: themeColors.text,
                        fontWeight: 500
                      }}
                    >
                      {info.sector || "N/A"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        opacity: 0.7,
                        fontFamily: 'Inter, Arial, sans-serif',
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        mb: 1,
                        color: themeColors.secondary
                      }}
                    >
                      Market Cap
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'Inter, Arial, sans-serif',
                        fontSize: '1.1rem',
                        color: themeColors.text,
                        fontWeight: 500
                      }}
                    >
                      {info.marketCap ? `$${(info.marketCap / 1000000000).toFixed(2)}B` : "N/A"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        opacity: 0.7,
                        fontFamily: 'Inter, Arial, sans-serif',
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        mb: 1,
                        color: themeColors.secondary
                      }}
                    >
                      PE Ratio
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'Inter, Arial, sans-serif',
                        fontSize: '1.1rem',
                        color: themeColors.text,
                        fontWeight: 500
                      }}
                    >
                      {info.trailingPE ? info.trailingPE.toFixed(2) : "N/A"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        opacity: 0.7,
                        fontFamily: 'Inter, Arial, sans-serif',
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        mb: 1,
                        color: themeColors.secondary
                      }}
                    >
                      Volume
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'Inter, Arial, sans-serif',
                        fontSize: '1.1rem',
                        color: themeColors.text,
                        fontWeight: 500
                      }}
                    >
                      {info.volume ? info.volume.toLocaleString() : "N/A"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        opacity: 0.7,
                        fontFamily: 'Inter, Arial, sans-serif',
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        mb: 1,
                        color: themeColors.secondary
                      }}
                    >
                      52 Week Range
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'Inter, Arial, sans-serif',
                        fontSize: '1.1rem',
                        color: themeColors.text,
                        fontWeight: 500
                      }}
                    >
                      {info.fiftyTwoWeekLow && info.fiftyTwoWeekHigh ?
                        `$${info.fiftyTwoWeekLow.toFixed(2)} - $${info.fiftyTwoWeekHigh.toFixed(2)}` :
                        "N/A"}
                    </Typography>
                  </Box>
                </Box>

                {/* Wallet Balance */}
                <Box sx={{
                  mt: 4,
                  p: 3,
                  borderRadius: 2,
                  backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${themeColors.border}`
                }}>
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.7,
                      fontFamily: 'Inter, Arial, sans-serif',
                      fontSize: '0.9rem',
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      mb: 1,
                      color: themeColors.secondary
                    }}
                  >
                    Wallet Balance
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: "bold",
                      fontFamily: 'Inter, Arial, sans-serif',
                      color: themeColors.accent
                    }}
                  >
                    ${walletBalance.toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* RIGHT SIDE - Risk Analysis & Chart */}
          <Grid item xs={12} lg={8}>
            {/* Risk Analysis Card */}
            {riskData && (
              <Card sx={{
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                backgroundColor: themeColors.card,
                border: `1px solid ${themeColors.border}`,
                mb: 3
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{
                    p: 3,
                    borderRadius: 2,
                    background: darkMode 
                      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)'
                      : 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
                    border: `2px solid ${
                      riskData.risk_score < 30 ? '#059669' : 
                      riskData.risk_score < 60 ? '#f59e0b' : 
                      '#dc2626'
                    }`
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'Inter, Arial, sans-serif',
                          fontSize: '0.9rem',
                          textTransform: 'uppercase',
                          letterSpacing: 1,
                          color: themeColors.secondary,
                          fontWeight: 600
                        }}
                      >
                        Risk Analysis
                      </Typography>
                      <Chip
                        label={riskData.risk_rating || 'N/A'}
                        sx={{
                          backgroundColor: 
                            riskData.risk_score < 30 ? '#059669' : 
                            riskData.risk_score < 60 ? '#f59e0b' : 
                            '#dc2626',
                          color: '#ffffff',
                          fontWeight: 'bold',
                          fontFamily: 'Inter, Arial, sans-serif',
                          fontSize: '0.75rem'
                        }}
                        size="small"
                      />
                    </Box>

                    {/* Risk Score - Prominent Display */}
                    <Box sx={{ 
                      textAlign: 'center', 
                      mb: 3, 
                      p: 2, 
                      borderRadius: 2,
                      backgroundColor: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)'
                    }}>
                      <Typography variant="caption" sx={{ 
                        color: themeColors.secondary, 
                        fontFamily: 'Inter, Arial, sans-serif', 
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: 1
                      }}>
                        Risk Score
                      </Typography>
                      <Typography variant="h3" sx={{ 
                        fontWeight: 'bold', 
                        fontFamily: 'Inter, Arial, sans-serif',
                        fontSize: '2.5rem',
                        background: riskData.risk_score < 30 
                          ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                          : riskData.risk_score < 60 
                          ? 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
                          : 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}>
                        {riskData.risk_score ? riskData.risk_score.toFixed(1) : 'N/A'}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: themeColors.secondary, 
                        fontFamily: 'Inter, Arial, sans-serif',
                        fontSize: '0.7rem'
                      }}>
                        {riskData.interpretation?.risk_assessment || ''}
                      </Typography>
                    </Box>

                    {/* Metrics Grid */}
                    <Grid container spacing={2}>
                      <Grid item xs={6} md={3}>
                        <Box sx={{ 
                          p: 1.5, 
                          borderRadius: 1, 
                          backgroundColor: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)'
                        }}>
                          <Typography variant="caption" sx={{ 
                            color: themeColors.secondary, 
                            fontFamily: 'Inter, Arial, sans-serif', 
                            fontSize: '0.75rem',
                            display: 'block',
                            mb: 0.5
                          }}>
                            Beta
                          </Typography>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 'bold', 
                            color: themeColors.text, 
                            fontFamily: 'Inter, Arial, sans-serif',
                            fontSize: '1.1rem'
                          }}>
                            {riskData.metrics?.beta ? riskData.metrics.beta.toFixed(2) : 'N/A'}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: themeColors.secondary, 
                            fontFamily: 'Inter, Arial, sans-serif',
                            fontSize: '0.65rem',
                            display: 'block',
                            mt: 0.5
                          }}>
                            {riskData.interpretation?.beta || ''}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box sx={{ 
                          p: 1.5, 
                          borderRadius: 1, 
                          backgroundColor: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)'
                        }}>
                          <Typography variant="caption" sx={{ 
                            color: themeColors.secondary, 
                            fontFamily: 'Inter, Arial, sans-serif', 
                            fontSize: '0.75rem',
                            display: 'block',
                            mb: 0.5
                          }}>
                            Volatility Score
                          </Typography>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 'bold', 
                            color: riskData.metrics?.volatility_score > 20 ? '#dc2626' : themeColors.text, 
                            fontFamily: 'Inter, Arial, sans-serif',
                            fontSize: '1.1rem'
                          }}>
                            {riskData.metrics?.volatility_score ? `${riskData.metrics.volatility_score.toFixed(1)}%` : 'N/A'}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: themeColors.secondary, 
                            fontFamily: 'Inter, Arial, sans-serif',
                            fontSize: '0.65rem',
                            display: 'block',
                            mt: 0.5
                          }}>
                            52-week change
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box sx={{ 
                          p: 1.5, 
                          borderRadius: 1, 
                          backgroundColor: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)'
                        }}>
                          <Typography variant="caption" sx={{ 
                            color: themeColors.secondary, 
                            fontFamily: 'Inter, Arial, sans-serif', 
                            fontSize: '0.75rem',
                            display: 'block',
                            mb: 0.5
                          }}>
                            Beta Score
                          </Typography>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 'bold', 
                            color: themeColors.text, 
                            fontFamily: 'Inter, Arial, sans-serif',
                            fontSize: '1.1rem'
                          }}>
                            {riskData.metrics?.beta_score ? riskData.metrics.beta_score.toFixed(1) : 'N/A'}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: themeColors.secondary, 
                            fontFamily: 'Inter, Arial, sans-serif',
                            fontSize: '0.65rem',
                            display: 'block',
                            mt: 0.5
                          }}>
                            Market correlation
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box sx={{ 
                          p: 1.5, 
                          borderRadius: 1, 
                          backgroundColor: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)'
                        }}>
                          <Typography variant="caption" sx={{ 
                            color: themeColors.secondary, 
                            fontFamily: 'Inter, Arial, sans-serif', 
                            fontSize: '0.75rem',
                            display: 'block',
                            mb: 0.5
                          }}>
                            52-Week Change
                          </Typography>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 'bold', 
                            color: riskData.metrics?.fifty_two_week_change >= 0 ? '#059669' : '#dc2626', 
                            fontFamily: 'Inter, Arial, sans-serif',
                            fontSize: '1.1rem'
                          }}>
                            {riskData.metrics?.fifty_two_week_change 
                              ? `${(riskData.metrics.fifty_two_week_change * 100).toFixed(1)}%` 
                              : 'N/A'}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: themeColors.secondary, 
                            fontFamily: 'Inter, Arial, sans-serif',
                            fontSize: '0.65rem',
                            display: 'block',
                            mt: 0.5
                          }}>
                            Annual performance
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Data Source */}
                    <Typography variant="caption" sx={{ 
                      color: themeColors.secondary, 
                      fontFamily: 'Inter, Arial, sans-serif',
                      fontSize: '0.65rem',
                      display: 'block',
                      mt: 2,
                      textAlign: 'center',
                      opacity: 0.6
                    }}>
                      {riskData.risk_type} • {riskData.data_source}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Chart Card */}
            <Card sx={{
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              backgroundColor: themeColors.card,
              border: `1px solid ${themeColors.border}`
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                  flexWrap: 'wrap',
                  gap: 2
                }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      fontFamily: 'Inter, Arial, sans-serif',
                      fontSize: '1.4rem',
                      color: themeColors.text
                    }}
                  >
                    Price Chart
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    sx={{
                      '& .MuiButton-root': {
                        minWidth: 'auto',
                        px: 2,
                        py: 1,
                        fontSize: '0.85rem'
                      }
                    }}
                  >
                    {TIMEFRAMES.map((tf) => (
                      <Button
                        key={tf}
                        size="small"
                        variant={tf === timeframe ? "contained" : "outlined"}
                        onClick={() => setTimeframe(tf)}
                        sx={{
                          textTransform: "none",
                          borderRadius: 2,
                          fontWeight: 600,
                          fontFamily: 'Inter, Arial, sans-serif',
                          backgroundColor: tf === timeframe ? themeColors.accent : 'transparent',
                          color: tf === timeframe ? '#ffffff' : themeColors.text,
                          borderColor: tf === timeframe ? themeColors.accent : themeColors.border,
                          '&:hover': {
                            backgroundColor: tf === timeframe ? themeColors.accent : themeColors.hover,
                            borderColor: themeColors.accent
                          }
                        }}
                      >
                        {tf}
                      </Button>
                    ))}
                  </Stack>
                </Box>

                <Box sx={{
                  height: 500,
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: `1px solid ${themeColors.border}`
                }}>
                  <TradingViewChart data={history} livePrice={liveData.price} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs Section - Stock Information (Full Width) */}
        <Card sx={{
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          backgroundColor: themeColors.card,
          border: `1px solid ${themeColors.border}`,
          mt: 4
        }}>
              <Box sx={{ borderBottom: 1, borderColor: themeColors.border }}>
                <Tabs
                  value={tabValue}
                  onChange={(e, newValue) => setTabValue(newValue)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    '& .MuiTab-root': {
                      fontFamily: 'Inter, Arial, sans-serif',
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '1rem',
                      color: themeColors.secondary,
                      '&.Mui-selected': {
                        color: themeColors.accent
                      }
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: themeColors.accent
                    }
                  }}
                >
                  <Tab label="Overview" />
                  <Tab label="Company Info" />
                  <Tab label="Financial Metrics" />
                  <Tab label="Trading Info" />
                  <Tab label="Dividends & Splits" />
                </Tabs>
              </Box>

              {/* Tab Panel 0 - Overview */}
              {tabValue === 0 && (
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, fontFamily: 'Inter, Arial, sans-serif', color: themeColors.text }}>
                    Key Statistics
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ color: themeColors.secondary, mb: 1, fontFamily: 'Inter, Arial, sans-serif' }}>Market Cap</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                          {info.marketCap ? `$${(info.marketCap / 1e9).toFixed(2)}B` : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ color: themeColors.secondary, mb: 1, fontFamily: 'Inter, Arial, sans-serif' }}>PE Ratio (TTM)</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                          {info.trailingPE ? info.trailingPE.toFixed(2) : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ color: themeColors.secondary, mb: 1, fontFamily: 'Inter, Arial, sans-serif' }}>Forward PE</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                          {info.forwardPE ? info.forwardPE.toFixed(2) : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ color: themeColors.secondary, mb: 1, fontFamily: 'Inter, Arial, sans-serif' }}>EPS (TTM)</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                          {info.trailingEps ? `$${info.trailingEps.toFixed(2)}` : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ color: themeColors.secondary, mb: 1, fontFamily: 'Inter, Arial, sans-serif' }}>Beta</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                          {info.beta ? info.beta.toFixed(3) : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ color: themeColors.secondary, mb: 1, fontFamily: 'Inter, Arial, sans-serif' }}>Price to Book</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                          {info.priceToBook ? info.priceToBook.toFixed(2) : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ color: themeColors.secondary, mb: 1, fontFamily: 'Inter, Arial, sans-serif' }}>52 Week High</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                          {info.fiftyTwoWeekHigh ? `$${info.fiftyTwoWeekHigh.toFixed(2)}` : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ color: themeColors.secondary, mb: 1, fontFamily: 'Inter, Arial, sans-serif' }}>52 Week Low</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                          {info.fiftyTwoWeekLow ? `$${info.fiftyTwoWeekLow.toFixed(2)}` : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ color: themeColors.secondary, mb: 1, fontFamily: 'Inter, Arial, sans-serif' }}>Analyst Rating</Typography>
                        <Chip 
                          label={info.averageAnalystRating || 'N/A'} 
                          sx={{ 
                            backgroundColor: themeColors.accent, 
                            color: '#ffffff',
                            fontFamily: 'Inter, Arial, sans-serif',
                            fontWeight: 600
                          }} 
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              )}

              {/* Tab Panel 1 - Company Info */}
              {tabValue === 1 && (
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, fontFamily: 'Inter, Arial, sans-serif', color: themeColors.text }}>
                    Company Information
                  </Typography>
                  
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle2" sx={{ color: themeColors.secondary, mb: 1, fontFamily: 'Inter, Arial, sans-serif', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                      About {info.shortName}
                    </Typography>
                    <Typography variant="body1" sx={{ color: themeColors.text, lineHeight: 1.8, fontFamily: 'Inter, Arial, sans-serif', textAlign: 'justify' }}>
                      {info.longBusinessSummary || 'No description available'}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 3, borderColor: themeColors.border }} />

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: themeColors.secondary, mb: 1, fontFamily: 'Inter, Arial, sans-serif' }}>Industry</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                        {info.industry || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: themeColors.secondary, mb: 1, fontFamily: 'Inter, Arial, sans-serif' }}>Sector</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                        {info.sector || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: themeColors.secondary, mb: 1, fontFamily: 'Inter, Arial, sans-serif' }}>Employees</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                        {info.fullTimeEmployees ? info.fullTimeEmployees.toLocaleString() : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: themeColors.secondary, mb: 1, fontFamily: 'Inter, Arial, sans-serif' }}>Headquarters</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                        {info.city && info.state ? `${info.city}, ${info.state}` : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: themeColors.secondary, mb: 1, fontFamily: 'Inter, Arial, sans-serif' }}>Website</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: themeColors.accent, fontFamily: 'Inter, Arial, sans-serif' }}>
                        {info.website ? <a href={info.website} target="_blank" rel="noopener noreferrer" style={{ color: themeColors.accent }}>{info.website}</a> : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" sx={{ color: themeColors.secondary, mb: 1, fontFamily: 'Inter, Arial, sans-serif' }}>Phone</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                        {info.phone || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>

                  {info.companyOfficers && info.companyOfficers.length > 0 && (
                    <>
                      <Divider sx={{ my: 4, borderColor: themeColors.border }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, fontFamily: 'Inter, Arial, sans-serif', color: themeColors.text }}>
                        Key Executives
                      </Typography>
                      <Grid container spacing={2}>
                        {info.companyOfficers.slice(0, 5).map((officer, idx) => (
                          <Grid item xs={12} key={idx}>
                            <Box sx={{ p: 2, borderRadius: 2, backgroundColor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${themeColors.border}` }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                                {officer.name}
                              </Typography>
                              <Typography variant="body2" sx={{ color: themeColors.secondary, fontFamily: 'Inter, Arial, sans-serif' }}>
                                {officer.title}
                              </Typography>
                              {officer.totalPay && (
                                <Typography variant="body2" sx={{ color: themeColors.accent, fontFamily: 'Inter, Arial, sans-serif', mt: 0.5 }}>
                                  Compensation: ${(officer.totalPay / 1e6).toFixed(2)}M
                                </Typography>
                              )}
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </>
                  )}
                </CardContent>
              )}

              {/* Tab Panel 2 - Financial Metrics */}
              {tabValue === 2 && (
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, fontFamily: 'Inter, Arial, sans-serif', color: themeColors.text }}>
                    Financial Performance
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 3, borderRadius: 2, backgroundColor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${themeColors.border}`, height: '100%' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, fontFamily: 'Inter, Arial, sans-serif', color: themeColors.text }}>
                          Revenue & Profitability
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box>
                            <Typography variant="body2" sx={{ color: themeColors.secondary, fontFamily: 'Inter, Arial, sans-serif' }}>Total Revenue</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                              {info.totalRevenue ? `$${(info.totalRevenue / 1e9).toFixed(2)}B` : 'N/A'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ color: themeColors.secondary, fontFamily: 'Inter, Arial, sans-serif' }}>Revenue Per Share</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                              {info.revenuePerShare ? `$${info.revenuePerShare.toFixed(2)}` : 'N/A'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ color: themeColors.secondary, fontFamily: 'Inter, Arial, sans-serif' }}>Revenue Growth</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: info.revenueGrowth >= 0 ? '#059669' : '#dc2626', fontFamily: 'Inter, Arial, sans-serif' }}>
                              {info.revenueGrowth ? `${(info.revenueGrowth * 100).toFixed(2)}%` : 'N/A'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ color: themeColors.secondary, fontFamily: 'Inter, Arial, sans-serif' }}>Gross Profit</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                              {info.grossProfits ? `$${(info.grossProfits / 1e9).toFixed(2)}B` : 'N/A'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ color: themeColors.secondary, fontFamily: 'Inter, Arial, sans-serif' }}>Net Income</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                              {info.netIncomeToCommon ? `$${(info.netIncomeToCommon / 1e9).toFixed(2)}B` : 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 3, borderRadius: 2, backgroundColor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${themeColors.border}`, height: '100%' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, fontFamily: 'Inter, Arial, sans-serif', color: themeColors.text }}>
                          Margins & Returns
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box>
                            <Typography variant="body2" sx={{ color: themeColors.secondary, fontFamily: 'Inter, Arial, sans-serif' }}>Gross Margin</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                              {info.grossMargins ? `${(info.grossMargins * 100).toFixed(2)}%` : 'N/A'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ color: themeColors.secondary, fontFamily: 'Inter, Arial, sans-serif' }}>Operating Margin</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                              {info.operatingMargins ? `${(info.operatingMargins * 100).toFixed(2)}%` : 'N/A'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ color: themeColors.secondary, fontFamily: 'Inter, Arial, sans-serif' }}>Profit Margin</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                              {info.profitMargins ? `${(info.profitMargins * 100).toFixed(2)}%` : 'N/A'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ color: themeColors.secondary, fontFamily: 'Inter, Arial, sans-serif' }}>Return on Assets</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                              {info.returnOnAssets ? `${(info.returnOnAssets * 100).toFixed(2)}%` : 'N/A'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ color: themeColors.secondary, fontFamily: 'Inter, Arial, sans-serif' }}>Return on Equity</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                              {info.returnOnEquity ? `${(info.returnOnEquity * 100).toFixed(2)}%` : 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 3, borderRadius: 2, backgroundColor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${themeColors.border}`, height: '100%' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, fontFamily: 'Inter, Arial, sans-serif', color: themeColors.text }}>
                          Cash Flow
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box>
                            <Typography variant="body2" sx={{ color: themeColors.secondary, fontFamily: 'Inter, Arial, sans-serif' }}>Operating Cash Flow</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                              {info.operatingCashflow ? `$${(info.operatingCashflow / 1e9).toFixed(2)}B` : 'N/A'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ color: themeColors.secondary, fontFamily: 'Inter, Arial, sans-serif' }}>Free Cash Flow</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                              {info.freeCashflow ? `$${(info.freeCashflow / 1e9).toFixed(2)}B` : 'N/A'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ color: themeColors.secondary, fontFamily: 'Inter, Arial, sans-serif' }}>EBITDA</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                              {info.ebitda ? `$${(info.ebitda / 1e9).toFixed(2)}B` : 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 3, borderRadius: 2, backgroundColor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${themeColors.border}`, height: '100%' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, fontFamily: 'Inter, Arial, sans-serif', color: themeColors.text }}>
                          Balance Sheet
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box>
                            <Typography variant="body2" sx={{ color: themeColors.secondary, fontFamily: 'Inter, Arial, sans-serif' }}>Total Cash</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                              {info.totalCash ? `$${(info.totalCash / 1e9).toFixed(2)}B` : 'N/A'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ color: themeColors.secondary, fontFamily: 'Inter, Arial, sans-serif' }}>Total Debt</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                              {info.totalDebt ? `$${(info.totalDebt / 1e9).toFixed(2)}B` : 'N/A'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ color: themeColors.secondary, fontFamily: 'Inter, Arial, sans-serif' }}>Debt to Equity</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                              {info.debtToEquity ? info.debtToEquity.toFixed(2) : 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              )}

              {/* Tab Panel 3 - Trading Info */}
              {tabValue === 3 && (
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, fontFamily: 'Inter, Arial, sans-serif', color: themeColors.text }}>
                    Trading Information
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ color: themeColors.secondary, mb: 1, fontFamily: 'Inter, Arial, sans-serif' }}>Today's Open</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                          {info.open ? `$${info.open.toFixed(2)}` : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ color: themeColors.secondary, mb: 1, fontFamily: 'Inter, Arial, sans-serif' }}>Previous Close</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                          {info.previousClose ? `$${info.previousClose.toFixed(2)}` : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ color: themeColors.secondary, mb: 1, fontFamily: 'Inter, Arial, sans-serif' }}>Day's Range</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                          {info.dayLow && info.dayHigh ? `$${info.dayLow.toFixed(2)} - $${info.dayHigh.toFixed(2)}` : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ color: themeColors.secondary, mb: 1, fontFamily: 'Inter, Arial, sans-serif' }}>Volume</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                          {info.volume ? info.volume.toLocaleString() : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ color: themeColors.secondary, mb: 1, fontFamily: 'Inter, Arial, sans-serif' }}>Average Volume</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                          {info.averageVolume ? info.averageVolume.toLocaleString() : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ color: themeColors.secondary, mb: 1, fontFamily: 'Inter, Arial, sans-serif' }}>Average Volume (10 days)</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                          {info.averageVolume10days ? info.averageVolume10days.toLocaleString() : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ color: themeColors.secondary, mb: 1, fontFamily: 'Inter, Arial, sans-serif' }}>Bid</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                          {info.bid ? `$${info.bid.toFixed(2)} x ${info.bidSize || 0}` : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ color: themeColors.secondary, mb: 1, fontFamily: 'Inter, Arial, sans-serif' }}>Ask</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                          {info.ask ? `$${info.ask.toFixed(2)} x ${info.askSize || 0}` : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ color: themeColors.secondary, mb: 1, fontFamily: 'Inter, Arial, sans-serif' }}>50 Day Average</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                          {info.fiftyDayAverage ? `$${info.fiftyDayAverage.toFixed(2)}` : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ color: themeColors.secondary, mb: 1, fontFamily: 'Inter, Arial, sans-serif' }}>200 Day Average</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                          {info.twoHundredDayAverage ? `$${info.twoHundredDayAverage.toFixed(2)}` : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ color: themeColors.secondary, mb: 1, fontFamily: 'Inter, Arial, sans-serif' }}>Shares Outstanding</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                          {info.sharesOutstanding ? (info.sharesOutstanding / 1e9).toFixed(2) + 'B' : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ color: themeColors.secondary, mb: 1, fontFamily: 'Inter, Arial, sans-serif' }}>Float Shares</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                          {info.floatShares ? (info.floatShares / 1e9).toFixed(2) + 'B' : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 4, borderColor: themeColors.border }} />

                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, fontFamily: 'Inter, Arial, sans-serif', color: themeColors.text }}>
                    Analyst Targets
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ color: themeColors.secondary, mb: 1, fontFamily: 'Inter, Arial, sans-serif' }}>Target Low</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#dc2626', fontFamily: 'Inter, Arial, sans-serif' }}>
                          {info.targetLowPrice ? `$${info.targetLowPrice.toFixed(2)}` : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ color: themeColors.secondary, mb: 1, fontFamily: 'Inter, Arial, sans-serif' }}>Target Mean</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.accent, fontFamily: 'Inter, Arial, sans-serif' }}>
                          {info.targetMeanPrice ? `$${info.targetMeanPrice.toFixed(2)}` : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ color: themeColors.secondary, mb: 1, fontFamily: 'Inter, Arial, sans-serif' }}>Target High</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#059669', fontFamily: 'Inter, Arial, sans-serif' }}>
                          {info.targetHighPrice ? `$${info.targetHighPrice.toFixed(2)}` : 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              )}

              {/* Tab Panel 4 - Dividends & Splits */}
              {tabValue === 4 && (
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, fontFamily: 'Inter, Arial, sans-serif', color: themeColors.text }}>
                    Dividends & Stock Splits
                  </Typography>
                  
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 3, borderRadius: 2, backgroundColor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${themeColors.border}` }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, fontFamily: 'Inter, Arial, sans-serif', color: themeColors.text }}>
                          Dividend Information
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box>
                            <Typography variant="body2" sx={{ color: themeColors.secondary, fontFamily: 'Inter, Arial, sans-serif' }}>Dividend Rate (Annual)</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                              {info.dividendRate ? `$${info.dividendRate.toFixed(2)}` : 'N/A'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ color: themeColors.secondary, fontFamily: 'Inter, Arial, sans-serif' }}>Dividend Yield</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                              {info.dividendYield ? `${(info.dividendYield * 100).toFixed(2)}%` : 'N/A'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ color: themeColors.secondary, fontFamily: 'Inter, Arial, sans-serif' }}>5 Year Avg Yield</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                              {info.fiveYearAvgDividendYield ? `${(info.fiveYearAvgDividendYield * 100).toFixed(2)}%` : 'N/A'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ color: themeColors.secondary, fontFamily: 'Inter, Arial, sans-serif' }}>Payout Ratio</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                              {info.payoutRatio ? `${(info.payoutRatio * 100).toFixed(2)}%` : 'N/A'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ color: themeColors.secondary, fontFamily: 'Inter, Arial, sans-serif' }}>Ex-Dividend Date</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                              {info.exDividendDate ? new Date(info.exDividendDate * 1000).toLocaleDateString() : 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 3, borderRadius: 2, backgroundColor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${themeColors.border}` }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, fontFamily: 'Inter, Arial, sans-serif', color: themeColors.text }}>
                          Stock Split History
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box>
                            <Typography variant="body2" sx={{ color: themeColors.secondary, fontFamily: 'Inter, Arial, sans-serif' }}>Last Split Factor</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                              {info.lastSplitFactor || 'N/A'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ color: themeColors.secondary, fontFamily: 'Inter, Arial, sans-serif' }}>Last Split Date</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                              {info.lastSplitDate ? new Date(info.lastSplitDate * 1000).toLocaleDateString() : 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Box sx={{ p: 3, borderRadius: 2, backgroundColor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${themeColors.border}`, mt: 3 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, fontFamily: 'Inter, Arial, sans-serif', color: themeColors.text }}>
                          Historical Highs/Lows
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box>
                            <Typography variant="body2" sx={{ color: themeColors.secondary, fontFamily: 'Inter, Arial, sans-serif' }}>All Time High</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#059669', fontFamily: 'Inter, Arial, sans-serif' }}>
                              {info.allTimeHigh ? `$${info.allTimeHigh.toFixed(2)}` : 'N/A'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ color: themeColors.secondary, fontFamily: 'Inter, Arial, sans-serif' }}>All Time Low</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#dc2626', fontFamily: 'Inter, Arial, sans-serif' }}>
                              {info.allTimeLow ? `$${info.allTimeLow.toFixed(2)}` : 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              )}
            </Card>

        {/* Transaction Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 3,
              backgroundColor: themeColors.card,
              border: `1px solid ${themeColors.border}`
            }
          }}
        >
          <DialogTitle sx={{
            fontFamily: 'Inter, Arial, sans-serif',
            fontWeight: 600,
            color: themeColors.text,
            borderBottom: `1px solid ${themeColors.border}`,
            pb: 2
          }}>
            {actionType === 'BUY' ? 'Buy' : 'Sell'} {info.shortName}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <TextField
              label="Quantity"
              type="number"
              value={quantity}
              onChange={e => {
                const val = e.target.value;
                setQuantity(val === '' ? '' : Math.max(1, Number(val)));
              }}
              fullWidth
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: themeColors.background,
                  '& fieldset': { borderColor: themeColors.border },
                  '&:hover fieldset': { borderColor: themeColors.accent },
                  '&.Mui-focused fieldset': { borderColor: themeColors.accent }
                },
                '& .MuiInputLabel-root': { color: themeColors.secondary },
                '& .MuiOutlinedInput-input': { color: themeColors.text }
              }}
              inputProps={{ min: 1, step: 1 }}
            />
            <Box sx={{ mt: 3, p: 2, borderRadius: 2, backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
              <Typography sx={{
                fontFamily: 'Inter, Arial, sans-serif',
                color: themeColors.secondary,
                mb: 1
              }}>
                Price per share: ${currentPrice.toFixed(2)}
              </Typography>
              <Typography sx={{
                fontFamily: 'Inter, Arial, sans-serif',
                color: themeColors.text,
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}>
                Total Amount: ${(currentPrice * (quantity || 0)).toFixed(2)}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{
            borderTop: `1px solid ${themeColors.border}`,
            p: 3,
            gap: 1
          }}>
            <Button
              onClick={() => setDialogOpen(false)}
              sx={{
                fontFamily: 'Inter, Arial, sans-serif',
                color: themeColors.secondary,
                '&:hover': { backgroundColor: themeColors.hover }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading}
              sx={{
                fontFamily: 'Inter, Arial, sans-serif',
                backgroundColor: actionType === 'BUY' ? '#059669' : '#dc2626',
                color: '#ffffff',
                px: 3,
                borderRadius: 2,
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: actionType === 'BUY' ? '#047857' : '#b91c1c'
                },
                '&:disabled': {
                  backgroundColor: themeColors.secondary,
                  color: themeColors.text
                }
              }}
            >
              {loading ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={typeof snackbarMsg === 'string' && snackbarMsg.includes('successful') ? 'success' : 'error'}
            sx={{
              width: '100%',
              backgroundColor: typeof snackbarMsg === 'string' && snackbarMsg.includes('successful') ? '#059669' : '#dc2626',
              color: '#ffffff',
              '& .MuiAlert-icon': {
                color: '#ffffff'
              }
            }}
          >
            {typeof snackbarMsg === 'string' ? snackbarMsg : JSON.stringify(snackbarMsg)}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default StockInfo;
