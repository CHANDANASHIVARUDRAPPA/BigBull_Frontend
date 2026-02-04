
import React, { useState, useEffect } from 'react';
import { Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Modal, Button, Divider, Container, Chip } from '@mui/material';
import { getAllTransactions } from '../services/api';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useThemeContext } from './Layout';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { darkMode, themeColors } = useThemeContext();

  useEffect(() => {
    getAllTransactions().then(res => setTransactions(res.data));
  }, []);

  const handleRowClick = (tx) => {
    setSelectedTx(tx);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setSelectedTx(null);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <ReceiptIcon sx={{ fontSize: 40, color: themeColors.accent }} />
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
            Transaction History
          </Typography>
        </Box>

        <TableContainer
          component={Paper}
          sx={{
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            borderRadius: 3,
            backgroundColor: themeColors.card,
            border: `1px solid ${themeColors.border}`,
            overflow: 'hidden'
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{
                backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                borderBottom: `2px solid ${themeColors.border}`
              }}>
                <TableCell sx={{
                  color: themeColors.text,
                  fontWeight: 'bold',
                  fontFamily: 'Inter, Arial, sans-serif',
                  fontSize: '0.95rem',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  py: 2
                }}>
                  Symbol
                </TableCell>
                <TableCell sx={{
                  color: themeColors.text,
                  fontWeight: 'bold',
                  fontFamily: 'Inter, Arial, sans-serif',
                  fontSize: '0.95rem',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  py: 2
                }}>
                  Type
                </TableCell>
                <TableCell sx={{
                  color: themeColors.text,
                  fontWeight: 'bold',
                  fontFamily: 'Inter, Arial, sans-serif',
                  fontSize: '0.95rem',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  py: 2
                }}>
                  Quantity
                </TableCell>
                <TableCell sx={{
                  color: themeColors.text,
                  fontWeight: 'bold',
                  fontFamily: 'Inter, Arial, sans-serif',
                  fontSize: '0.95rem',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  py: 2
                }}>
                  Price
                </TableCell>
                <TableCell sx={{
                  color: themeColors.text,
                  fontWeight: 'bold',
                  fontFamily: 'Inter, Arial, sans-serif',
                  fontSize: '0.95rem',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  py: 2
                }}>
                  Total
                </TableCell>
                <TableCell sx={{
                  color: themeColors.text,
                  fontWeight: 'bold',
                  fontFamily: 'Inter, Arial, sans-serif',
                  fontSize: '0.95rem',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  py: 2
                }}>
                  Date
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    sx={{
                      textAlign: 'center',
                      py: 6,
                      color: themeColors.secondary,
                      fontFamily: 'Inter, Arial, sans-serif'
                    }}
                  >
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx, index) => (
                  <TableRow
                    key={tx.id}
                    sx={{
                      backgroundColor: index % 2 === 0 ? themeColors.card : darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                      cursor: 'pointer',
                      borderBottom: `1px solid ${themeColors.border}`,
                      '&:hover': {
                        backgroundColor: themeColors.hover,
                        transform: 'translateX(2px)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => handleRowClick(tx)}
                  >
                    <TableCell sx={{
                      fontWeight: 'bold',
                      color: themeColors.accent,
                      fontFamily: 'Inter, Arial, sans-serif',
                      fontSize: '1rem',
                      py: 2
                    }}>
                      {tx.asset?.symbol}
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Chip
                        icon={tx.type === 'BUY' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                        label={tx.type}
                        sx={{
                          fontWeight: 600,
                          backgroundColor: tx.type === 'BUY' ? '#059669' : '#dc2626',
                          color: '#ffffff',
                          fontFamily: 'Inter, Arial, sans-serif',
                          fontSize: '0.85rem',
                          '& .MuiChip-icon': {
                            color: '#ffffff'
                          }
                        }}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{
                      color: themeColors.text,
                      fontFamily: 'Inter, Arial, sans-serif',
                      fontSize: '1rem',
                      py: 2
                    }}>
                      {tx.quantity?.toLocaleString()}
                    </TableCell>
                    <TableCell sx={{
                      color: themeColors.text,
                      fontFamily: 'Inter, Arial, sans-serif',
                      fontSize: '1rem',
                      py: 2
                    }}>
                      ${tx.price?.toFixed(2)}
                    </TableCell>
                    <TableCell sx={{
                      fontWeight: 'bold',
                      color: themeColors.text,
                      fontFamily: 'Inter, Arial, sans-serif',
                      fontSize: '1rem',
                      py: 2
                    }}>
                      ${(tx.price * tx.quantity)?.toFixed(2)}
                    </TableCell>
                    <TableCell sx={{
                      color: themeColors.secondary,
                      fontFamily: 'Inter, Arial, sans-serif',
                      fontSize: '0.9rem',
                      py: 2
                    }}>
                      {new Date(tx.transactionDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Transaction Details Modal */}
        <Modal
          open={modalOpen}
          onClose={handleClose}
          aria-labelledby="transaction-details-modal"
        >
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: themeColors.card,
            border: `1px solid ${themeColors.border}`,
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            p: 0,
            minWidth: { xs: 320, sm: 400 },
            maxWidth: 500,
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            {selectedTx && (
              <>
                <Box sx={{
                  backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  p: 3,
                  borderBottom: `1px solid ${themeColors.border}`,
                  borderRadius: '12px 12px 0 0'
                }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 'bold',
                      color: themeColors.text,
                      fontFamily: 'Inter, Arial, sans-serif',
                      fontSize: '1.4rem',
                      mb: 1
                    }}
                  >
                    {selectedTx.asset?.name || selectedTx.asset?.symbol}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: themeColors.accent,
                      fontFamily: 'Inter, Arial, sans-serif',
                      fontSize: '1.1rem',
                      fontWeight: 500
                    }}
                  >
                    {selectedTx.asset?.symbol}
                  </Typography>
                </Box>

                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Chip
                      icon={selectedTx.type === 'BUY' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      label={selectedTx.type}
                      sx={{
                        fontWeight: 600,
                        backgroundColor: selectedTx.type === 'BUY' ? '#059669' : '#dc2626',
                        color: '#ffffff',
                        fontFamily: 'Inter, Arial, sans-serif',
                        fontSize: '0.9rem',
                        px: 2,
                        '& .MuiChip-icon': {
                          color: '#ffffff'
                        }
                      }}
                    />
                    <Typography
                      sx={{
                        color: themeColors.secondary,
                        fontFamily: 'Inter, Arial, sans-serif',
                        fontSize: '0.9rem'
                      }}
                    >
                      {new Date(selectedTx.transactionDate).toLocaleString()}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                    <Box sx={{
                      backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      p: 2,
                      borderRadius: 2,
                      border: `1px solid ${themeColors.border}`
                    }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: themeColors.secondary,
                          fontFamily: 'Inter, Arial, sans-serif',
                          fontSize: '0.85rem',
                          textTransform: 'uppercase',
                          letterSpacing: 1,
                          mb: 1
                        }}
                      >
                        Quantity
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 'bold',
                          color: themeColors.text,
                          fontFamily: 'Inter, Arial, sans-serif',
                          fontSize: '1.1rem'
                        }}
                      >
                        {selectedTx.quantity?.toLocaleString()}
                      </Typography>
                    </Box>

                    <Box sx={{
                      backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      p: 2,
                      borderRadius: 2,
                      border: `1px solid ${themeColors.border}`
                    }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: themeColors.secondary,
                          fontFamily: 'Inter, Arial, sans-serif',
                          fontSize: '0.85rem',
                          textTransform: 'uppercase',
                          letterSpacing: 1,
                          mb: 1
                        }}
                      >
                        Price per Share
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 'bold',
                          color: themeColors.text,
                          fontFamily: 'Inter, Arial, sans-serif',
                          fontSize: '1.1rem'
                        }}
                      >
                        ${selectedTx.price?.toFixed(2)}
                      </Typography>
                    </Box>

                    <Box sx={{
                      backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      p: 2,
                      borderRadius: 2,
                      border: `1px solid ${themeColors.border}`,
                      gridColumn: 'span 2'
                    }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: themeColors.secondary,
                          fontFamily: 'Inter, Arial, sans-serif',
                          fontSize: '0.85rem',
                          textTransform: 'uppercase',
                          letterSpacing: 1,
                          mb: 1
                        }}
                      >
                        Total Amount
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 'bold',
                          color: themeColors.accent,
                          fontFamily: 'Inter, Arial, sans-serif',
                          fontSize: '1.3rem'
                        }}
                      >
                        ${(selectedTx.price * selectedTx.quantity)?.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>

                  {selectedTx.asset && (
                    <>
                      <Divider sx={{
                        my: 3,
                        borderColor: themeColors.border
                      }} />
                      <Typography
                        variant="h6"
                        sx={{
                          color: themeColors.text,
                          fontFamily: 'Inter, Arial, sans-serif',
                          fontSize: '1.1rem',
                          fontWeight: 'bold',
                          mb: 2
                        }}
                      >
                        Company Information
                      </Typography>
                      <Box sx={{ display: 'grid', gap: 1 }}>
                        <Typography sx={{
                          color: themeColors.secondary,
                          fontFamily: 'Inter, Arial, sans-serif',
                          fontSize: '0.95rem',
                          lineHeight: 1.5
                        }}>
                          <strong>Name:</strong> {selectedTx.asset.name}
                        </Typography>
                        {selectedTx.asset.description && (
                          <Typography sx={{
                            color: themeColors.secondary,
                            fontFamily: 'Inter, Arial, sans-serif',
                            fontSize: '0.95rem',
                            lineHeight: 1.5
                          }}>
                            <strong>Description:</strong> {selectedTx.asset.description}
                          </Typography>
                        )}
                        <Typography sx={{
                          color: themeColors.secondary,
                          fontFamily: 'Inter, Arial, sans-serif',
                          fontSize: '0.95rem',
                          lineHeight: 1.5
                        }}>
                          <strong>Exchange:</strong> {selectedTx.asset.exchange || 'N/A'}
                        </Typography>
                        <Typography sx={{
                          color: themeColors.secondary,
                          fontFamily: 'Inter, Arial, sans-serif',
                          fontSize: '0.95rem',
                          lineHeight: 1.5
                        }}>
                          <strong>Sector:</strong> {selectedTx.asset.sector || 'N/A'}
                        </Typography>
                      </Box>
                    </>
                  )}

                  <Box sx={{
                    mt: 4,
                    pt: 3,
                    borderTop: `1px solid ${themeColors.border}`,
                    textAlign: 'right'
                  }}>
                    <Button
                      variant="contained"
                      onClick={handleClose}
                      sx={{
                        borderRadius: 2,
                        fontWeight: 600,
                        backgroundColor: themeColors.accent,
                        color: '#ffffff',
                        fontFamily: 'Inter, Arial, sans-serif',
                        fontSize: '1rem',
                        px: 4,
                        py: 1.5,
                        '&:hover': {
                          backgroundColor: themeColors.accent,
                          opacity: 0.9
                        }
                      }}
                    >
                      Close
                    </Button>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Modal>
      </Box>
    </Container>
  );
};

export default Transactions;