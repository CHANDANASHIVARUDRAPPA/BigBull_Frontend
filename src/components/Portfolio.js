import React, { useState, useEffect } from 'react';
import { Typography, Box, Grid, Card, CardContent, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getPortfolioSummary } from '../services/portfolioApi';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useThemeContext } from './Layout';

const Portfolio = () => {
  const [assets, setAssets] = useState([]);
  const [portfolioMetrics, setPortfolioMetrics] = useState({});
  const navigate = useNavigate();
  const { darkMode, themeColors } = useThemeContext();

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

  // Prepare data for investment type pie chart
  const investmentTypeData = [
    { name: 'Stocks', value: 45, color: '#059669' },
    { name: 'Crypto', value: 25, color: '#f59e0b' },
    { name: 'Mutual Funds', value: 15, color: '#3b82f6' },
    { name: 'Gold', value: 10, color: '#ec4899' },
    { name: 'Bitcoin', value: 5, color: '#8b5cf6' },
  ];

  // Prepare data for individual company investments bar chart
  const companyInvestmentData = assets.slice(0, 8).map(asset => ({
    name: asset.symbol,
    invested: asset.invested || 0,
    currentValue: asset.currentValue || 0,
    pnl: asset.pnl || 0,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{
          backgroundColor: themeColors.card,
          border: `1px solid ${themeColors.border}`,
          borderRadius: 2,
          p: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <Typography sx={{ color: themeColors.text, fontWeight: 'bold', mb: 1 }}>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography key={index} sx={{ color: entry.color, fontSize: '0.9rem' }}>
              {entry.name}: ${entry.value?.toFixed(2)}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 'bold',
            color: themeColors.text,
            mb: 4,
            fontFamily: 'Inter, Arial, sans-serif',
            letterSpacing: -0.5,
            fontSize: { xs: '2rem', md: '2.5rem' }
          }}
        >
          Portfolio Overview
        </Typography>

        {/* Portfolio Metrics & Charts Layout */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Metrics Column - Left Side */}
          <Grid item xs={12} lg={3} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Total Invested */}
            <Card sx={{
              backgroundColor: themeColors.card,
              color: themeColors.text,
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              borderRadius: 3,
              border: `1px solid ${themeColors.border}`,
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 16px 48px rgba(0,0,0,0.12)' }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" sx={{
                  opacity: 0.8,
                  fontFamily: 'Inter, Arial, sans-serif',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  mb: 1
                }}>
                  Total Invested
                </Typography>
                <Typography variant="h4" sx={{
                  fontWeight: 'bold',
                  fontFamily: 'Inter, Arial, sans-serif',
                  fontSize: '1.8rem'
                }}>
                  ${portfolioMetrics.totalInvested?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </Typography>
              </CardContent>
            </Card>

            {/* Current Value */}
            <Card sx={{
              backgroundColor: themeColors.card,
              color: themeColors.text,
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              borderRadius: 3,
              border: `1px solid ${themeColors.border}`,
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 16px 48px rgba(0,0,0,0.12)' }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" sx={{
                  opacity: 0.8,
                  fontFamily: 'Inter, Arial, sans-serif',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  mb: 1
                }}>
                  Current Value
                </Typography>
                <Typography variant="h4" sx={{
                  fontWeight: 'bold',
                  fontFamily: 'Inter, Arial, sans-serif',
                  fontSize: '1.8rem'
                }}>
                  ${portfolioMetrics.totalValue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </Typography>
              </CardContent>
            </Card>

            {/* Total P&L */}
            <Card sx={{
              backgroundColor: themeColors.card,
              color: themeColors.text,
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              borderRadius: 3,
              border: `1px solid ${themeColors.border}`,
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 16px 48px rgba(0,0,0,0.12)' }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" sx={{
                  opacity: 0.8,
                  fontFamily: 'Inter, Arial, sans-serif',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  mb: 1
                }}>
                  Total P&L
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  {portfolioMetrics.totalPNL >= 0 ? (
                    <TrendingUpIcon sx={{ color: '#059669', fontSize: '1.2rem' }} />
                  ) : (
                    <TrendingDownIcon sx={{ color: '#dc2626', fontSize: '1.2rem' }} />
                  )}
                  <Typography variant="h4" sx={{
                    fontWeight: 'bold',
                    fontFamily: 'Inter, Arial, sans-serif',
                    fontSize: '1.8rem',
                    color: portfolioMetrics.totalPNL >= 0 ? '#059669' : '#dc2626'
                  }}>
                    ${portfolioMetrics.totalPNL?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* P&L Percentage */}
            <Card sx={{
              backgroundColor: themeColors.card,
              color: themeColors.text,
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              borderRadius: 3,
              border: `1px solid ${themeColors.border}`,
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 16px 48px rgba(0,0,0,0.12)' }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" sx={{
                  opacity: 0.8,
                  fontFamily: 'Inter, Arial, sans-serif',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  mb: 1
                }}>
                  P&L Percentage
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  {portfolioMetrics.totalPnlPercentage >= 0 ? (
                    <TrendingUpIcon sx={{ color: '#059669', fontSize: '1.2rem' }} />
                  ) : (
                    <TrendingDownIcon sx={{ color: '#dc2626', fontSize: '1.2rem' }} />
                  )}
                  <Typography variant="h4" sx={{
                    fontWeight: 'bold',
                    fontFamily: 'Inter, Arial, sans-serif',
                    fontSize: '1.8rem',
                    color: portfolioMetrics.totalPnlPercentage >= 0 ? '#059669' : '#dc2626'
                  }}>
                    {portfolioMetrics.totalPnlPercentage?.toFixed(2) || '0.00'}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Charts Section - Right Side */}
          <Grid item xs={12} lg={9}>
            <Grid container spacing={4}>
              {/* Investment Type Distribution Pie Chart */}
              <Grid item xs={12} lg={6}>
                <Card sx={{
                  backgroundColor: themeColors.card,
                  borderRadius: 3,
                  border: `1px solid ${themeColors.border}`,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              height: '100%'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 'bold',
                    color: themeColors.text,
                    mb: 3,
                    fontFamily: 'Inter, Arial, sans-serif',
                    textAlign: 'center'
                  }}
                >
                  Investment Distribution
                </Typography>
                <Box sx={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={investmentTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {investmentTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={<CustomTooltip />}
                        formatter={(value) => [`${value}%`, 'Allocation']}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => (
                          <span style={{ color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                            {value}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
              </Grid>

              {/* Individual Company Investments Bar Chart */}
              <Grid item xs={12} lg={6}>
                <Card sx={{
                  backgroundColor: themeColors.card,
            borderRadius: 3,
            border: `1px solid ${themeColors.border}`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            width: '100%'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 'bold',
                  color: themeColors.text,
                  mb: 3,
                  fontFamily: 'Inter, Arial, sans-serif',
                  textAlign: 'center'
                }}
              >
                Company Investments
              </Typography>
              <Box sx={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={companyInvestmentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={themeColors.border} />
                    <XAxis
                      dataKey="name"
                      stroke={themeColors.secondary}
                      fontSize={12}
                      fontFamily="Inter, Arial, sans-serif"
                    />
                    <YAxis
                      stroke={themeColors.secondary}
                      fontSize={12}
                      fontFamily="Inter, Arial, sans-serif"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(value) => (
                        <span style={{ color: themeColors.text, fontFamily: 'Inter, Arial, sans-serif' }}>
                          {value}
                        </span>
                      )}
                    />
                    <Bar dataKey="invested" fill={themeColors.accent} name="Invested Amount" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="currentValue" fill="#059669" name="Current Value" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Holdings Cards */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            color: themeColors.text,
            mb: 4,
            fontFamily: 'Inter, Arial, sans-serif',
            fontSize: '1.8rem'
          }}
        >
          Your Holdings
        </Typography>
        <Grid container spacing={3}>
          {assets.map((asset, index) => (
            <Grid item xs={12} md={6} lg={4} key={asset.symbol + index}>
              <Card sx={{
                height: '100%',
                backgroundColor: themeColors.card,
                borderRadius: 3,
                border: `1px solid ${themeColors.border}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.12)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      mb: 1,
                      fontFamily: 'Inter, Arial, sans-serif',
                      fontSize: '1.2rem',
                      color: themeColors.text
                    }}
                  >
                    {asset.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: themeColors.accent,
                      fontWeight: 600,
                      mb: 2,
                      fontFamily: 'Inter, Arial, sans-serif',
                      fontSize: '0.9rem'
                    }}
                  >
                    {asset.symbol}
                  </Typography>
                  <Box sx={{
                    backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    borderRadius: 2,
                    p: 2,
                    mb: 2
                  }}>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{
                          color: themeColors.secondary,
                          fontFamily: 'Inter, Arial, sans-serif',
                          fontSize: '0.85rem',
                          mb: 0.5
                        }}>
                          Quantity
                        </Typography>
                        <Typography variant="body2" sx={{
                          fontWeight: 'bold',
                          color: themeColors.text,
                          fontFamily: 'Inter, Arial, sans-serif'
                        }}>
                          {asset.quantity || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{
                          color: themeColors.secondary,
                          fontFamily: 'Inter, Arial, sans-serif',
                          fontSize: '0.85rem',
                          mb: 0.5
                        }}>
                          Avg Price
                        </Typography>
                        <Typography variant="body2" sx={{
                          fontWeight: 'bold',
                          color: themeColors.text,
                          fontFamily: 'Inter, Arial, sans-serif'
                        }}>
                          ${asset.avgPrice?.toFixed(2) || '0.00'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{
                          color: themeColors.secondary,
                          fontFamily: 'Inter, Arial, sans-serif',
                          fontSize: '0.85rem',
                          mb: 0.5
                        }}>
                          Current
                        </Typography>
                        <Typography variant="body2" sx={{
                          fontWeight: 'bold',
                          color: themeColors.text,
                          fontFamily: 'Inter, Arial, sans-serif'
                        }}>
                          ${asset.currentPrice?.toFixed(2) || '0.00'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{
                          color: themeColors.secondary,
                          fontFamily: 'Inter, Arial, sans-serif',
                          fontSize: '0.85rem',
                          mb: 0.5
                        }}>
                          Invested
                        </Typography>
                        <Typography variant="body2" sx={{
                          fontWeight: 'bold',
                          color: themeColors.text,
                          fontFamily: 'Inter, Arial, sans-serif'
                        }}>
                          ${asset.invested?.toFixed(2) || '0.00'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mt: 1,
                          pt: 1,
                          borderTop: `1px solid ${themeColors.border}`
                        }}>
                          <Typography variant="body2" sx={{
                            color: themeColors.secondary,
                            fontFamily: 'Inter, Arial, sans-serif',
                            fontSize: '0.85rem'
                          }}>
                            P&L
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {asset.pnl >= 0 ? (
                              <TrendingUpIcon sx={{ color: '#059669', fontSize: '1rem' }} />
                            ) : (
                              <TrendingDownIcon sx={{ color: '#dc2626', fontSize: '1rem' }} />
                            )}
                            <Typography variant="body2" sx={{
                              fontWeight: 'bold',
                              color: asset.pnl >= 0 ? '#059669' : '#dc2626',
                              fontFamily: 'Inter, Arial, sans-serif'
                            }}>
                              ${asset.pnl?.toFixed(2) || '0.00'} ({asset.pnlPercentage?.toFixed(2) || '0.00'}%)
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate(`/stock/${asset.symbol}`)}
                    sx={{
                      backgroundColor: themeColors.accent,
                      color: '#ffffff',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontFamily: 'Inter, Arial, sans-serif',
                      fontSize: '0.95rem',
                      borderRadius: 2,
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: themeColors.accent,
                        opacity: 0.9
                      }
                    }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Portfolio;