import React, { useState, useEffect } from 'react';
import { Typography, Box, Grid, Card, CardContent, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getPortfolioSummary } from '../services/portfolioApi';

const Portfolio = () => {

  const [assets, setAssets] = useState([]);
  const [portfolioMetrics, setPortfolioMetrics] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    getPortfolioSummary().then(res => {
      const data = res.data;
      setPortfolioMetrics({
        totalInvested: data.totalInvested || 0,
        totalValue: data.totalCurrentValue || 0,
        totalPNL: data.totalPnl || 0,
        totalPnlPercentage: data.totalPnlPercentage || 0,
      });
      setAssets(data.holdings || []);
    });
  }, []);

  return (
    <Box>
      <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#232a36', mb: 4, fontFamily: 'Inter, Arial, sans-serif', letterSpacing: 0.5, fontSize: '2.2rem' }}>Portfolio Overview</Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={3}>
          <Card sx={{ backgroundColor: '#fff', color: '#232a36', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem' }}>Total Invested</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1, fontFamily: 'Inter, Arial, sans-serif', fontSize: '2rem' }}>${portfolioMetrics.totalInvested?.toFixed(2) || '0.00'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ backgroundColor: '#fff', color: '#232a36', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem' }}>Current Value</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1, fontFamily: 'Inter, Arial, sans-serif', fontSize: '2rem' }}>${portfolioMetrics.totalValue?.toFixed(2) || '0.00'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ backgroundColor: '#fff', color: '#232a36', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem' }}>Total P&L</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1, fontFamily: 'Inter, Arial, sans-serif', fontSize: '2rem', color: portfolioMetrics.totalPNL >= 0 ? '#11998e' : '#fc5c7d' }}>${portfolioMetrics.totalPNL?.toFixed(2) || '0.00'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ backgroundColor: '#fff', color: '#232a36', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem' }}>P&L Percentage</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1, fontFamily: 'Inter, Arial, sans-serif', fontSize: '2rem', color: portfolioMetrics.totalPnlPercentage >= 0 ? '#11998e' : '#fc5c7d' }}>{portfolioMetrics.totalPnlPercentage?.toFixed(2) || '0.00'}%</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {assets.map((asset, index) => (
          <Grid item xs={12} md={6} lg={4} key={asset.symbol + index}>
            <Card sx={{ height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', backgroundColor: '#fff', borderRadius: 3, '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.15)', transform: 'translateY(-4px)' }, transition: 'all 0.3s' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, fontFamily: 'Inter, Arial, sans-serif', fontSize: '1.3rem', color: '#232a36' }}>{asset.name}</Typography>
                <Typography variant="body2" sx={{ color: '#232a36', fontWeight: 600, mb: 1, fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem' }}>{asset.symbol}</Typography>
                <Box sx={{ my: 2, p: 2, backgroundColor: '#f5f7fa', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem', mb: 1 }}>Quantity: <span style={{ fontWeight: 'bold' }}>{asset.quantity || 0}</span></Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem', mb: 1 }}>Avg Price: <span style={{ fontWeight: 'bold' }}>${asset.avgPrice?.toFixed(2) || '0.00'}</span></Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem', mb: 1 }}>Current Price: <span style={{ fontWeight: 'bold' }}>${asset.currentPrice?.toFixed(2) || '0.00'}</span></Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem', mb: 1 }}>Invested: <span style={{ fontWeight: 'bold' }}>${asset.invested?.toFixed(2) || '0.00'}</span></Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem', mb: 1 }}>Current Value: <span style={{ fontWeight: 'bold', color: '#232a36' }}>${asset.currentValue?.toFixed(2) || '0.00'}</span></Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem', mb: 1 }}>P&L: <span style={{ fontWeight: 'bold', color: asset.pnl >= 0 ? '#11998e' : '#fc5c7d' }}>${asset.pnl?.toFixed(2) || '0.00'} ({asset.pnlPercentage?.toFixed(2) || '0.00'}%)</span></Typography>
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