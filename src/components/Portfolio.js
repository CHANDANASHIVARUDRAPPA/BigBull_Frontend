import React, { useState, useEffect } from 'react';
import { Typography, Box, Grid, Card, CardContent, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getAssets, getTransactionsByAssetId } from '../services/api';

const Portfolio = () => {
  const [assets, setAssets] = useState([]);
  const [portfolioMetrics, setPortfolioMetrics] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    getAssets().then(res => {
      setAssets(res.data);
      // Calculate metrics (simplified)
      const totalInvested = res.data.reduce((sum, asset) => sum + (asset.invested || 0), 0);
      const totalValue = res.data.reduce((sum, asset) => sum + (asset.currentValue || 0), 0);
      setPortfolioMetrics({ totalInvested, totalValue, totalPNL: totalValue - totalInvested });
    });
  }, []);

  return (
    <Box>
      <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#333', mb: 4 }}>💼 Portfolio Overview</Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Invested</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1 }}>${portfolioMetrics.totalInvested?.toFixed(2) || '0.00'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Value</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1 }}>${portfolioMetrics.totalValue?.toFixed(2) || '0.00'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Total P&L</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1, color: portfolioMetrics.totalPNL >= 0 ? '#fff' : '#ffcccc' }}>${portfolioMetrics.totalPNL?.toFixed(2) || '0.00'}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        {assets.map(asset => (
          <Grid item xs={12} md={6} lg={4} key={asset.id}>
            <Card sx={{ height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.15)', transform: 'translateY(-4px)' }, transition: 'all 0.3s' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>{asset.name}</Typography>
                <Typography variant="body2" sx={{ color: '#667eea', fontWeight: 600, mb: 1 }}>{asset.symbol}</Typography>
                <Box sx={{ my: 2, p: 1.5, backgroundColor: '#f5f7fa', borderRadius: 1 }}>
                  <Typography variant="body2">Invested: <Typography component="span" sx={{ fontWeight: 'bold' }}>${asset.invested?.toFixed(2) || '0.00'}</Typography></Typography>
                  <Typography variant="body2">Current: <Typography component="span" sx={{ fontWeight: 'bold', color: '#667eea' }}>${asset.currentValue?.toFixed(2) || '0.00'}</Typography></Typography>
                  <Typography variant="body2">P&L: <Typography component="span" sx={{ fontWeight: 'bold', color: asset.pnl >= 0 ? '#4caf50' : '#f44336' }}>${asset.pnl?.toFixed(2) || '0.00'}</Typography></Typography>
                </Box>
                <Button variant="contained" fullWidth onClick={() => navigate(`/stock/${asset.symbol}`)} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', textTransform: 'none', fontWeight: 600 }}>View Details</Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Portfolio;