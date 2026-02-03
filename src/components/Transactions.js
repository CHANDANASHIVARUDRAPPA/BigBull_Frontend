import React, { useState, useEffect } from 'react';
import { Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { getAllTransactions } from '../services/api';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    getAllTransactions().then(res => setTransactions(res.data));
  }, []);

  return (
    <Box>
      <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#333', mb: 4 }}>📋 Transaction History</Typography>
      <TableContainer component={Paper} sx={{ boxShadow: '0 8px 16px rgba(0,0,0,0.1)', borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Symbol</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Quantity</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Price</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((tx, index) => (
              <TableRow key={tx.id} sx={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9ff', '&:hover': { backgroundColor: '#f0f4ff' }, transition: 'background-color 0.2s' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#667eea' }}>{tx.asset?.symbol}</TableCell>
                <TableCell><Typography sx={{ fontWeight: 600, color: tx.type === 'BUY' ? '#4caf50' : '#f44336' }}>{tx.type}</Typography></TableCell>
                <TableCell>{tx.quantity}</TableCell>
                <TableCell>${tx.price?.toFixed(2)}</TableCell>
                <TableCell>{new Date(tx.transactionDate).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Transactions;