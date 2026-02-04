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
      <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#232a36', mb: 4, fontFamily: 'Inter, Arial, sans-serif', letterSpacing: 0.5, fontSize: '2.2rem' }}>Portfolio Optimization</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)', height: '100%', backgroundColor: '#fff', borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, fontFamily: 'Inter, Arial, sans-serif', fontSize: '1.3rem', color: '#232a36' }}>Optimization Settings</Typography>
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
                <Typography variant="caption" sx={{ color: '#999', displinay: 'block', mt: 1 }}>Low risk = Stable assets • High risk = Growth assets</Typography>
              </Box>
              <Button 
                variant="contained" 
                onClick={handleOptimize} 
                disabled={loading}
                fullWidth
                sx={{ backgroundColor: '#232a36', color: '#fff', textTransform: 'none', fontWeight: 600, py: 1.5, fontSize: '1.1rem', borderRadius: 2, fontFamily: 'Inter, Arial, sans-serif' }}
              >
                {loading ? 'Analyzing Portfolio...' : 'Optimize Now'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={7}>
          {loading && (
            <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)', backgroundColor: '#fff', borderRadius: 3 }}>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <Typography sx={{ mb: 2 }}>Processing your portfolio...</Typography>
                <LinearProgress sx={{ '& .MuiLinearProgress-bar': { backgroundColor: '#667eea' } }} />
              </CardContent>
            </Card>
          )}
          {result && !loading && (
            <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)', backgroundColor: '#fff', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, fontFamily: 'Inter, Arial, sans-serif', fontSize: '1.3rem', color: '#232a36' }}>Optimal Allocation Results</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {Object.entries(result.optimal_allocation || {}).map(([symbol, alloc]) => (
                    alloc.selected && (
                      <Box key={symbol} sx={{ backgroundColor: '#f5f7fa', p: 2.5, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'Inter, Arial, sans-serif', fontSize: '1.1rem', mb: 1 }}>
                        <Typography sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#232a36', letterSpacing: 0.5 }}>{symbol}</Typography>
                        <Typography sx={{ color: '#232a36', fontWeight: 500, fontSize: '1.1rem', ml: 2 }}>Current Value: ${alloc.live_value?.toFixed(2) || alloc.current_value?.toFixed(2) || '0.00'}</Typography>
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