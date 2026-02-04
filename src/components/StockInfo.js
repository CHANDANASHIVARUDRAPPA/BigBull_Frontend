import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Typography, Box, Grid, Card, CardContent, Button, Stack, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from "@mui/material";
import { getStockInfo, getStockHistory, createTransaction } from "../services/api";
import { createWebSocket } from "../services/websocket";
import TradingViewChart from "../components/stock/TradingViewChart";

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

  useEffect(() => {
    getStockInfo(symbol).then((res) => setInfo(res.data.info));
  }, [symbol]);

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
      let assetId = info.assetId || info.id;
      // If assetId is missing, fetch it from the assets endpoint
      if (!assetId) {
        const assetsRes = await import('../services/api').then(m => m.getAssets());
        const assets = assetsRes.data;
        const found = assets.find(a => a.symbol === symbol);
        assetId = found ? found.id : undefined;
      }
      if (!assetId) throw new Error('Asset ID not found for this symbol.');
      await createTransaction({
        assetId,
        type: actionType,
        quantity,
        price: liveData.price || info.currentPrice,
      });
      setDialogOpen(false);
      setQuantity(1);
      setSnackbarMsg(`${actionType} successful!`);
      setSnackbarOpen(true);
      // Optionally, trigger a refresh of transactions/portfolio here
    } catch (err) {
      setSnackbarMsg('Transaction failed.');
      setSnackbarOpen(true);
    }
    setLoading(false);
  };

  if (!info) return <Typography sx={{ fontFamily: 'Inter, Arial, sans-serif', fontSize: '1.2rem', color: '#232a36' }}>Loading...</Typography>;

  return (
    <Box>
      <Box sx={{ mb: 3, mt: 2 }}>
        <Typography variant="h3" sx={{ fontWeight: "bold", color: "#232a36", fontFamily: 'Inter, Arial, sans-serif', fontSize: '2.6rem', letterSpacing: 0.5, mb: 1 }}>
          {info.shortName}
        </Typography>
        <Typography variant="h6" sx={{ color: "#232a36", fontFamily: 'Inter, Arial, sans-serif', fontSize: '1.3rem', mb: 2 }}>
          ({symbol})
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={() => handleBuySell('BUY')} sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none', backgroundColor: '#1976d2', color: '#fff', fontFamily: 'Inter, Arial, sans-serif', fontSize: '1.1rem', px: 4, boxShadow: 'none', '&:hover': { backgroundColor: '#1565c0' } }}>Buy</Button>
          <Button variant="contained" onClick={() => handleBuySell('SELL')} sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none', backgroundColor: '#d32f2f', color: '#fff', fontFamily: 'Inter, Arial, sans-serif', fontSize: '1.1rem', px: 4, boxShadow: 'none', '&:hover': { backgroundColor: '#b71c1c' } }}>Sell</Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* LEFT CARD */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: "100%",
              backgroundColor: '#fff',
              color: "#232a36",
              borderRadius: 3,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", fontFamily: 'Inter, Arial, sans-serif', fontSize: '1.3rem', color: '#232a36' }}>
                Details
              </Typography>

              <Typography variant="body2" sx={{ opacity: 0.8, fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem' }}>
                Sector
              </Typography>
              <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Inter, Arial, sans-serif', fontSize: '1.1rem', color: '#232a36' }}>
                {info.sector || "N/A"}
              </Typography>

              <Typography variant="body2" sx={{ opacity: 0.8, fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem' }}>
                Market Cap
              </Typography>
              <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Inter, Arial, sans-serif', fontSize: '1.1rem', color: '#232a36' }}>
                {info.marketCap ? info.marketCap.toLocaleString() : "N/A"}
              </Typography>

              <Typography variant="body2" sx={{ opacity: 0.8, fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem' }}>
                PE Ratio
              </Typography>
              <Typography variant="h6" sx={{ mb: 3, fontFamily: 'Inter, Arial, sans-serif', fontSize: '1.1rem', color: '#232a36' }}>
                {info.trailingPE || "N/A"}
              </Typography>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "#f5f7fa",
                }}
              >
                <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem' }}>
                  Live Price
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: "bold", fontFamily: 'Inter, Arial, sans-serif', fontSize: '2rem', color: '#232a36' }}>
                  ${Number(liveData.price || info.currentPrice || 0).toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT CHART */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", backgroundColor: '#fff' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center", mb: 3, gap: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", fontFamily: 'Inter, Arial, sans-serif', fontSize: '1.5rem', color: '#232a36', mr: 3 }}>
                  TradingView Trendline
                </Typography>

                <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ ml: 2 }}>
                  {TIMEFRAMES.map((tf) => (
                    <Button
                      key={tf}
                      size="medium"
                      variant={tf === timeframe ? "contained" : "outlined"}
                      onClick={() => setTimeframe(tf)}
                      sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600, fontFamily: 'Inter, Arial, sans-serif', fontSize: '1.1rem', px: 2, backgroundColor: tf === timeframe ? '#11998e' : '#f5f7fa', color: tf === timeframe ? '#fff' : '#232a36', minWidth: 56, height: 40 }}
                    >
                      {tf}
                    </Button>
                  ))}
                </Stack>
              </Box>

              <TradingViewChart data={history} livePrice={liveData.price} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle sx={{ fontFamily: 'Inter, Arial, sans-serif', fontWeight: 600, color: '#232a36' }}>{actionType === 'BUY' ? 'Buy' : 'Sell'} {info.shortName}</DialogTitle>
        <DialogContent>
          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
            fullWidth
            sx={{ mt: 2, fontFamily: 'Inter, Arial, sans-serif' }}
            inputProps={{ min: 1 }}
          />
          <Typography sx={{ mt: 2, fontFamily: 'Inter, Arial, sans-serif', color: '#232a36' }}>
            Price per share: ${Number(liveData.price || info.currentPrice || 0).toFixed(2)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} sx={{ fontFamily: 'Inter, Arial, sans-serif', color: '#232a36' }}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={loading} sx={{ fontFamily: 'Inter, Arial, sans-serif', backgroundColor: actionType === 'BUY' ? '#1976d2' : '#d32f2f', color: '#fff', px: 3, borderRadius: 2, boxShadow: 'none', '&:hover': { backgroundColor: actionType === 'BUY' ? '#1565c0' : '#b71c1c' } }}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarMsg.includes('successful') ? 'success' : 'error'} sx={{ width: '100%' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StockInfo;
