import React, { useState } from 'react';
import { Typography, Box, TextField, Button, Slider, Card, CardContent, Grid, LinearProgress } from '@mui/material';
import { optimizePortfolio } from '../services/api';

const Optimization = () => {
  const [budget, setBudget] = useState(10000);
  const [riskFactor, setRiskFactor] = useState(0.3);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const res = await optimizePortfolio({ budget, risk_factor: riskFactor });
      setResult(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <Box>
      <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#333', mb: 4 }}>🎯 Portfolio Optimization</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card sx={{ boxShadow: '0 8px 16px rgba(0,0,0,0.1)', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>Optimization Settings</Typography>
              <TextField
                label="Budget ($)"
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                fullWidth
                sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                inputProps={{ min: 0 }}
              />
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ fontWeight: 600 }}>Risk Factor</Typography>
                  <Typography sx={{ fontWeight: 'bold', color: '#667eea', fontSize: '1.1rem' }}>{(riskFactor * 100).toFixed(0)}%</Typography>
                </Box>
                <Slider
                  value={riskFactor}
                  onChange={(e, val) => setRiskFactor(val)}
                  min={0}
                  max={1}
                  step={0.1}
                  sx={{ '& .MuiSlider-thumb': { backgroundColor: '#667eea' }, '& .MuiSlider-track': { backgroundColor: '#667eea' } }}
                />
                <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 1 }}>Low risk = Stable assets • High risk = Growth assets</Typography>
              </Box>
              <Button 
                variant="contained" 
                onClick={handleOptimize} 
                disabled={loading}
                fullWidth
                sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', textTransform: 'none', fontWeight: 600, py: 1.5, fontSize: '1rem' }}
              >
                {loading ? 'Analyzing Portfolio...' : 'Optimize Now'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={7}>
          {loading && (
            <Card sx={{ boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <Typography sx={{ mb: 2 }}>Processing your portfolio...</Typography>
                <LinearProgress sx={{ '& .MuiLinearProgress-bar': { backgroundColor: '#667eea' } }} />
              </CardContent>
            </Card>
          )}
          {result && !loading && (
            <Card sx={{ boxShadow: '0 8px 16px rgba(0,0,0,0.1)', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>📊 Optimal Allocation Results</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {Object.entries(result.optimal_allocation || {}).map(([symbol, alloc]) => (
                    alloc.selected && (
                      <Box key={symbol} sx={{ backgroundColor: 'white', p: 2, borderRadius: 2, borderLeft: '4px solid #667eea' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{symbol}</Typography>\n                          <Typography sx={{ color: '#667eea', fontWeight: 'bold', fontSize: '1.1rem' }}>$ {alloc.allocation?.toFixed(2) || '0.00'}</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={alloc.percentage || 0} sx={{ mb: 1, height: 6, borderRadius: 3, backgroundColor: '#eee', '& .MuiLinearProgress-bar': { backgroundColor: '#667eea' } }} />\n                        <Typography variant="caption" sx={{ color: '#999' }}>{(alloc.percentage || 0).toFixed(1)}% of portfolio</Typography>
                      </Box>
                    )
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Optimization;