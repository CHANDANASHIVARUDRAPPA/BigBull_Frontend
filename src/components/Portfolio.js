import React, { useState, useEffect } from 'react';
import { Typography, Box, Grid, Card, CardContent, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getPortfolioSummary } from '../services/portfolioApi';
import { getStockQuote } from '../services/api';

const Portfolio = () => {

  const [assets, setAssets] = useState([]);
  const [portfolioMetrics, setPortfolioMetrics] = useState({});
  const [livePrices, setLivePrices] = useState({});
  const [loadingLive, setLoadingLive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getPortfolioSummary().then(res => {
      const data = res.data;
      setPortfolioMetrics({
        totalInvested: data.totalInvested,
        totalValue: data.totalValue,
        totalPNL: data.totalPNL,
        diversificationScore: data.diversificationScore || 0,
        riskLevel: data.riskLevel || 'Moderate',
        assetAllocation: data.assetAllocation || {},
      });
      setAssets(data.assets || []);
    });
  }, []);

  // Fetch live prices for all asset symbols
  useEffect(() => {
    const fetchLivePrices = async () => {
      if (!assets.length) return;
      setLoadingLive(true);
      const prices = {};
      await Promise.all(
        assets.map(async (asset) => {
          try {
            const res = await getStockQuote(asset.symbol);
            prices[asset.symbol] = res.data.price || res.data.currentPrice || null;
          } catch {
            prices[asset.symbol] = null;
          }
        })
      );
      setLivePrices(prices);
      setLoadingLive(false);
    };
    fetchLivePrices();
  }, [assets]);

  return (
    <Box>
      <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#232a36', mb: 4, fontFamily: 'Inter, Arial, sans-serif', letterSpacing: 0.5, fontSize: '2.2rem' }}>Portfolio Overview</Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={12}>
          <Card sx={{ backgroundColor: '#fff', color: '#232a36', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: 3, mb: 2 }}>
            <CardContent sx={{ textAlign: 'left' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: 'Inter, Arial, sans-serif', fontSize: '1.2rem', color: '#232a36', mb: 1 }}>Portfolio Insights</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem', mb: 1 }}>Diversification Score: <span style={{ fontWeight: 'bold' }}>{portfolioMetrics.diversificationScore}</span></Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem', mb: 1 }}>Risk Level: <span style={{ fontWeight: 'bold' }}>{portfolioMetrics.riskLevel}</span></Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem', mb: 1 }}>Asset Allocation:</Typography>
              <Box sx={{ ml: 2 }}>
                {portfolioMetrics.assetAllocation && Object.entries(portfolioMetrics.assetAllocation).map(([symbol, percent]) => (
                  <Typography key={symbol} variant="body2" sx={{ fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem' }}>{symbol}: <span style={{ fontWeight: 'bold' }}>{percent}%</span></Typography>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ backgroundColor: '#fff', color: '#232a36', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem' }}>Total Invested</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1, fontFamily: 'Inter, Arial, sans-serif', fontSize: '2rem' }}>${portfolioMetrics.totalInvested?.toFixed(2) || '0.00'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ backgroundColor: '#fff', color: '#232a36', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem' }}>Total Value</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1, fontFamily: 'Inter, Arial, sans-serif', fontSize: '2rem' }}>${portfolioMetrics.totalValue?.toFixed(2) || '0.00'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ backgroundColor: '#fff', color: '#232a36', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem' }}>Total P&L</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1, fontFamily: 'Inter, Arial, sans-serif', fontSize: '2rem', color: portfolioMetrics.totalPNL >= 0 ? '#11998e' : '#fc5c7d' }}>${portfolioMetrics.totalPNL?.toFixed(2) || '0.00'}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        {assets.map(asset => (
          <Grid item xs={12} md={6} lg={4} key={asset.id}>
            <Card sx={{ height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', backgroundColor: '#fff', borderRadius: 3, '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.15)', transform: 'translateY(-4px)' }, transition: 'all 0.3s' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, fontFamily: 'Inter, Arial, sans-serif', fontSize: '1.3rem', color: '#232a36' }}>{asset.name}</Typography>
                <Typography variant="body2" sx={{ color: '#232a36', fontWeight: 600, mb: 1, fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem' }}>{asset.symbol}</Typography>
                <Box sx={{ my: 2, p: 2, backgroundColor: '#f5f7fa', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem', mb: 1 }}>Invested: <span style={{ fontWeight: 'bold' }}>${asset.invested?.toFixed(2) || '0.00'}</span></Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem', mb: 1 }}>Current: <span style={{ fontWeight: 'bold', color: '#232a36' }}>${asset.currentValue?.toFixed(2) || '0.00'}</span></Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem', mb: 1 }}>P&L: <span style={{ fontWeight: 'bold', color: asset.pnl >= 0 ? '#11998e' : '#fc5c7d' }}>${asset.pnl?.toFixed(2) || '0.00'}</span></Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem', mb: 1 }}>
                    Live Value: {loadingLive ? <CircularProgress size={14} /> : (livePrices[asset.symbol] !== undefined && livePrices[asset.symbol] !== null ? `$${Number(livePrices[asset.symbol]).toFixed(2)}` : 'N/A')}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem', mt: 2 }}>Sector: <span style={{ fontWeight: 'bold' }}>{asset.sector || 'N/A'}</span></Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem', mt: 1 }}>Exchange: <span style={{ fontWeight: 'bold' }}>{asset.exchange || 'N/A'}</span></Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem', mt: 1 }}>Description: <span style={{ fontWeight: 'bold' }}>{asset.description || 'No description available.'}</span></Typography>
                </Box>
                <Button variant="contained" fullWidth onClick={() => navigate(`/stock/${asset.symbol}`)} sx={{ backgroundColor: '#232a36', color: '#fff', textTransform: 'none', fontWeight: 600, fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem', borderRadius: 2, mt: 2 }}>View Details</Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Portfolio;