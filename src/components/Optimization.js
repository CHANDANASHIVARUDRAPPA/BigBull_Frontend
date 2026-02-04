import React, { useState } from 'react';
import { Typography, Box, TextField, Button, Slider, Card, CardContent, Grid, LinearProgress, Container, Chip } from '@mui/material';
import { optimizePortfolio } from '../services/api';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useOutletContext } from 'react-router-dom';

const Optimization = () => {
  const [budget, setBudget] = useState(10000);
  const [riskFactor, setRiskFactor] = useState(0.3);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { darkMode, themeColors } = useOutletContext();

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

  const getRiskLevel = (risk) => {
    if (risk <= 0.3) return { label: 'Conservative', color: '#059669' };
    if (risk <= 0.7) return { label: 'Moderate', color: '#d97706' };
    return { label: 'Aggressive', color: '#dc2626' };
  };

  const riskLevel = getRiskLevel(riskFactor);

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <AnalyticsIcon sx={{ fontSize: 40, color: themeColors.accent }} />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 'bold',
              color: themeColors.text,
              fontFamily: 'Inter, Arial, sans-serif',
              letterSpacing: -0.5,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Portfolio Optimization
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Settings Panel */}
          <Grid item xs={12} lg={5}>
            <Card sx={{
              height: '100%',
              backgroundColor: themeColors.card,
              borderRadius: 3,
              border: `1px solid ${themeColors.border}`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    mb: 4,
                    fontFamily: 'Inter, Arial, sans-serif',
                    fontSize: '1.3rem',
                    color: themeColors.text
                  }}
                >
                  Optimization Settings
                </Typography>

                {/* Budget Input */}
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: themeColors.secondary,
                      fontFamily: 'Inter, Arial, sans-serif',
                      fontSize: '0.9rem',
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      mb: 2
                    }}
                  >
                    Investment Budget
                  </Typography>
                  <TextField
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    fullWidth
                    InputProps={{
                      startAdornment: <Typography sx={{ color: themeColors.accent, mr: 1 }}>$</Typography>
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                        borderRadius: 2,
                        '& fieldset': { borderColor: themeColors.border },
                        '&:hover fieldset': { borderColor: themeColors.accent },
                        '&.Mui-focused fieldset': { borderColor: themeColors.accent }
                      },
                      '& .MuiOutlinedInput-input': {
                        color: themeColors.text,
                        fontSize: '1.1rem',
                        fontFamily: 'Inter, Arial, sans-serif'
                      }
                    }}
                    inputProps={{ min: 0, step: 100 }}
                  />
                </Box>

                {/* Risk Factor Slider */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: themeColors.text,
                        fontFamily: 'Inter, Arial, sans-serif',
                        fontSize: '1rem'
                      }}
                    >
                      Risk Tolerance
                    </Typography>
                    <Chip
                      label={`${riskLevel.label} (${(riskFactor * 100).toFixed(0)}%)`}
                      sx={{
                        backgroundColor: riskLevel.color,
                        color: '#ffffff',
                        fontWeight: 'bold',
                        fontFamily: 'Inter, Arial, sans-serif',
                        fontSize: '0.8rem'
                      }}
                      size="small"
                    />
                  </Box>
                  <Slider
                    value={riskFactor}
                    onChange={(e, val) => setRiskFactor(val)}
                    min={0}
                    max={1}
                    step={0.1}
                    sx={{
                      '& .MuiSlider-thumb': {
                        backgroundColor: themeColors.accent,
                        '&:hover, &.Mui-focusVisible': {
                          boxShadow: `0 0 0 8px ${themeColors.accent}20`
                        }
                      },
                      '& .MuiSlider-track': { backgroundColor: themeColors.accent },
                      '& .MuiSlider-rail': { backgroundColor: themeColors.border }
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: themeColors.secondary,
                      fontFamily: 'Inter, Arial, sans-serif',
                      fontSize: '0.85rem',
                      mt: 1,
                      display: 'block'
                    }}
                  >
                    Low risk = Stable assets • High risk = Growth assets
                  </Typography>
                </Box>

                {/* Optimize Button */}
                <Button
                  variant="contained"
                  onClick={handleOptimize}
                  disabled={loading}
                  fullWidth
                  sx={{
                    backgroundColor: themeColors.accent,
                    color: '#ffffff',
                    textTransform: 'none',
                    fontWeight: 600,
                    py: 2,
                    fontSize: '1.1rem',
                    borderRadius: 2,
                    fontFamily: 'Inter, Arial, sans-serif',
                    boxShadow: `0 4px 12px ${themeColors.accent}30`,
                    '&:hover': {
                      backgroundColor: themeColors.accent,
                      opacity: 0.9,
                      boxShadow: `0 6px 16px ${themeColors.accent}40`
                    },
                    '&:disabled': {
                      backgroundColor: themeColors.secondary,
                      color: themeColors.text
                    }
                  }}
                >
                  {loading ? 'Analyzing Portfolio...' : 'Optimize Portfolio'}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Results Panel */}
          <Grid item xs={12} lg={7}>
            {loading && (
              <Card sx={{
                backgroundColor: themeColors.card,
                borderRadius: 3,
                border: `1px solid ${themeColors.border}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
              }}>
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                  <AnalyticsIcon sx={{ fontSize: 48, color: themeColors.accent, mb: 2 }} />
                  <Typography
                    sx={{
                      mb: 3,
                      color: themeColors.text,
                      fontFamily: 'Inter, Arial, sans-serif',
                      fontSize: '1.2rem',
                      fontWeight: 500
                    }}
                  >
                    Processing your portfolio optimization...
                  </Typography>
                  <LinearProgress
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: themeColors.border,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: themeColors.accent,
                        borderRadius: 4
                      }
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {result && !loading && (
              <Card sx={{
                backgroundColor: themeColors.card,
                borderRadius: 3,
                border: `1px solid ${themeColors.border}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <AccountBalanceIcon sx={{ color: themeColors.accent, fontSize: 28 }} />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 'bold',
                        fontFamily: 'Inter, Arial, sans-serif',
                        fontSize: '1.4rem',
                        color: themeColors.text
                      }}
                    >
                      Optimal Allocation Results
                    </Typography>
                  </Box>

                  {result.optimal_allocation && Object.keys(result.optimal_allocation).length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {Object.entries(result.optimal_allocation).map(([symbol, alloc]) => (
                        alloc.selected && (
                          <Box
                            key={symbol}
                            sx={{
                              backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                              p: 3,
                              borderRadius: 2,
                              border: `1px solid ${themeColors.border}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                backgroundColor: themeColors.hover,
                                transform: 'translateX(4px)'
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography
                                sx={{
                                  fontWeight: 'bold',
                                  fontSize: '1.2rem',
                                  color: themeColors.accent,
                                  fontFamily: 'Inter, Arial, sans-serif',
                                  minWidth: 60
                                }}
                              >
                                {symbol}
                              </Typography>
                              <Chip
                                label="Recommended"
                                sx={{
                                  backgroundColor: '#059669',
                                  color: '#ffffff',
                                  fontSize: '0.75rem',
                                  fontFamily: 'Inter, Arial, sans-serif'
                                }}
                                size="small"
                              />
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography
                                sx={{
                                  color: themeColors.text,
                                  fontWeight: 600,
                                  fontSize: '1.1rem',
                                  fontFamily: 'Inter, Arial, sans-serif'
                                }}
                              >
                                ${alloc.live_value?.toFixed(2) || alloc.current_value?.toFixed(2) || '0.00'}
                              </Typography>
                              <Typography
                                sx={{
                                  color: themeColors.secondary,
                                  fontSize: '0.9rem',
                                  fontFamily: 'Inter, Arial, sans-serif'
                                }}
                              >
                                Current Value
                              </Typography>
                            </Box>
                          </Box>
                        )
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <AnalyticsIcon sx={{ fontSize: 48, color: themeColors.secondary, mb: 2 }} />
                      <Typography
                        sx={{
                          color: themeColors.secondary,
                          fontFamily: 'Inter, Arial, sans-serif',
                          fontSize: '1.1rem'
                        }}
                      >
                        No optimal allocation found. Try adjusting your risk tolerance or budget.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}

            {!loading && !result && (
              <Card sx={{
                backgroundColor: themeColors.card,
                borderRadius: 3,
                border: `1px solid ${themeColors.border}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                height: '100%',
                minHeight: 300
              }}>
                <CardContent sx={{ textAlign: 'center', py: 8, px: 4 }}>
                  <AnalyticsIcon sx={{ fontSize: 64, color: themeColors.secondary, mb: 3 }} />
                  <Typography
                    variant="h6"
                    sx={{
                      color: themeColors.text,
                      fontFamily: 'Inter, Arial, sans-serif',
                      fontSize: '1.3rem',
                      fontWeight: 500,
                      mb: 2
                    }}
                  >
                    Ready to Optimize
                  </Typography>
                  <Typography
                    sx={{
                      color: themeColors.secondary,
                      fontFamily: 'Inter, Arial, sans-serif',
                      fontSize: '1rem',
                      lineHeight: 1.6,
                      maxWidth: 400,
                      mx: 'auto'
                    }}
                  >
                    Set your investment budget and risk tolerance, then click "Optimize Portfolio" to get AI-powered recommendations for your investment strategy.
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Optimization;