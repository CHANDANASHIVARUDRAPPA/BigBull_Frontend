import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Typography, Box, Grid, Card, CardContent, Button, Stack, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, Container } from "@mui/material";
import { getStockInfo, getStockHistory, buyStock, sellStock, getWallet, withdrawWallet, depositWallet } from "../services/api";
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
  const { darkMode, themeColors } = useThemeContext();

  useEffect(() => {
    getStockInfo(symbol).then((res) => setInfo(res.data.info));
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
  const priceChange = liveData.change || 0;
  const priceChangePercent = liveData.changePercent || 0;

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

          {/* RIGHT SIDE - Chart */}
          <Grid item xs={12} lg={8}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              backgroundColor: themeColors.card,
              border: `1px solid ${themeColors.border}`,
              height: '100%'
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
