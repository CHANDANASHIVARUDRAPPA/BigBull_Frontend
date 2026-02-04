import React, { useState, useEffect } from 'react';
import { Typography, Box, Grid, Card, CardContent, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getPortfolioSummary } from '../services/portfolioApi';
import { getAssets } from '../services/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useThemeContext } from './Layout';

// Generate a vibrant random color
const generateColor = (index) => {
  const colors = [
    '#059669', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6',
    '#6366f1', '#14b8a6', '#f97316', '#a855f7', '#ef4444',
    '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'
  ];
  return colors[index % colors.length];
};

const Portfolio = () => {
  const [assets, setAssets] = useState([]);
  const [portfolioMetrics, setPortfolioMetrics] = useState({});
  const [investmentTypeData, setInvestmentTypeData] = useState([]);
  const navigate = useNavigate();
  const { darkMode, themeColors } = useThemeContext();

  useEffect(() => {
    // Fetch portfolio summary
    getPortfolioSummary().then(res => {
      const data = res.data;
      setPortfolioMetrics({
        totalInvested: data.totalInvested || 0,
        totalValue: data.totalCurrentValue || 0,
        totalPNL: data.totalPnl || 0,
        totalPnlPercentage: data.totalPnlPercentage || 0,
      });
      const holdings = data.holdings || [];
      setAssets(holdings);
      
      // Fetch all assets to get type information
      getAssets().then(assetsRes => {
        const allAssetsData = assetsRes.data;
        
        console.log('Holdings:', holdings);
        console.log('All Assets:', allAssetsData);
        
        // Map holdings to their types
        const typeGroups = {};
        let totalValue = 0;

        holdings.forEach(holding => {
          // Find corresponding asset to get type
          const assetInfo = allAssetsData.find(a => 
            a.symbol?.toLowerCase() === holding.symbol?.toLowerCase()
          );
          
          console.log(`Matching ${holding.symbol}:`, assetInfo);
          
          const type = assetInfo?.type || 'Unknown';
          const value = holding.currentValue || 0;
          
          console.log(`Type: ${type}, Value: ${value}`);
          
          if (!typeGroups[type]) {
            typeGroups[type] = 0;
          }
          typeGroups[type] += value;
          totalValue += value;
        });

        console.log('Type Groups:', typeGroups);
        console.log('Total Value:', totalValue);

        // Convert to percentage and format for pie chart
        const pieData = Object.entries(typeGroups)
          .map(([type, value], index) => ({
            name: type,
            value: totalValue > 0 ? parseFloat(((value / totalValue) * 100).toFixed(2)) : 0,
            absoluteValue: value,
            color: generateColor(index)
          }))
          .filter(item => item.value > 0); // Only show types with value

        console.log('Pie chart data:', pieData);
        setInvestmentTypeData(pieData);
      }).catch(err => {
        console.error('Failed to fetch assets for type distribution:', err);
      });
    });
  }, []);

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
                  Investment Distribution by Type
                </Typography>
                {investmentTypeData.length > 0 ? (
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
                          label={(entry) => `${entry.name}: ${entry.value}%`}
                        >
                          {investmentTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <Box sx={{
                                  backgroundColor: themeColors.card,
                                  border: `1px solid ${themeColors.border}`,
                                  borderRadius: 2,
                                  p: 2,
                                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                                }}>
                                  <Typography sx={{ color: themeColors.text, fontWeight: 'bold', mb: 1 }}>
                                    {data.name}
                                  </Typography>
                                  <Typography sx={{ color: data.color, fontSize: '0.9rem' }}>
                                    Value: ${data.absoluteValue?.toFixed(2) || '0.00'}
                                  </Typography>
                                  <Typography sx={{ color: data.color, fontSize: '0.9rem' }}>
                                    Percentage: {data.value}%
                                  </Typography>
                                </Box>
                              );
                            }
                            return null;
                          }}
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
                ) : (
                  <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ color: themeColors.secondary, fontFamily: 'Inter, Arial, sans-serif' }}>
                      No investment data available
                    </Typography>
                  </Box>
                )}
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