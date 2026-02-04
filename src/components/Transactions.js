
import React, { useState, useEffect } from 'react';
import { Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Modal, Button, Divider } from '@mui/material';
import { getAllTransactions } from '../services/api';


const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

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
    <Box>
      <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#232a36', mb: 4, fontFamily: 'Inter, Arial, sans-serif', letterSpacing: 0.5, fontSize: '2.2rem' }}>Transaction History</Typography>
      <TableContainer component={Paper} sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: 3, backgroundColor: '#fff' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#232a36' }}>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold', fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem' }}>Symbol</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold', fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem' }}>Type</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold', fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem' }}>Quantity</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold', fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem' }}>Price</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 'bold', fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem' }}>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((tx, index) => (
              <TableRow
                key={tx.id}
                sx={{
                  backgroundColor: index % 2 === 0 ? '#fff' : '#f5f7fa',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#e2e8f0' },
                  transition: 'background-color 0.2s',
                }}
                onClick={() => handleRowClick(tx)}
              >
                <TableCell sx={{ fontWeight: 'bold', color: '#232a36', fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem' }}>{tx.asset?.symbol}</TableCell>
                <TableCell><Typography sx={{ fontWeight: 600, color: tx.type === 'BUY' ? '#11998e' : '#fc5c7d', fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem' }}>{tx.type}</Typography></TableCell>
                <TableCell sx={{ fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem' }}>{tx.quantity}</TableCell>
                <TableCell sx={{ fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem' }}>${tx.price?.toFixed(2)}</TableCell>
                <TableCell sx={{ fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem' }}>{new Date(tx.transactionDate).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={modalOpen} onClose={handleClose} aria-labelledby="tx-details-modal" >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: '#fff',
          boxShadow: 24,
          borderRadius: 3,
          p: 4,
          minWidth: 340,
          maxWidth: 400,
        }}>
          {selectedTx && (
            <>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, fontFamily: 'Inter, Arial, sans-serif', fontSize: '1.3rem', color: '#232a36' }}>{selectedTx.asset?.name || selectedTx.asset?.symbol}</Typography>
              <Typography variant="subtitle1" sx={{ color: '#232a36', mb: 2, fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem' }}>{selectedTx.asset?.symbol}</Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ mb: 1, fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem' }}><b>Transaction Type:</b> {selectedTx.type}</Typography>
              <Typography variant="body1" sx={{ mb: 1, fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem' }}><b>Quantity:</b> {selectedTx.quantity}</Typography>
              <Typography variant="body1" sx={{ mb: 1, fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem' }}><b>Price:</b> ${selectedTx.price?.toFixed(2)}</Typography>
              <Typography variant="body1" sx={{ mb: 1, fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem' }}><b>Date:</b> {new Date(selectedTx.transactionDate).toLocaleString()}</Typography>
              {selectedTx.asset && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" sx={{ color: '#232a36', mb: 1, fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem' }}><b>Company Info:</b></Typography>
                  <Typography variant="body2" sx={{ color: '#232a36', mb: 1, fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem' }}>{selectedTx.asset.name}</Typography>
                  <Typography variant="body2" sx={{ color: '#232a36', mb: 1, fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem' }}>{selectedTx.asset.description || 'No description available.'}</Typography>
                  <Typography variant="body2" sx={{ color: '#232a36', mb: 1, fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem' }}>Exchange: {selectedTx.asset.exchange || 'N/A'}</Typography>
                  <Typography variant="body2" sx={{ color: '#232a36', mb: 1, fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem' }}>Sector: {selectedTx.asset.sector || 'N/A'}</Typography>
                </>
              )}
              <Box sx={{ mt: 3, textAlign: 'right' }}>
                <Button variant="contained" onClick={handleClose} sx={{ borderRadius: 2, fontWeight: 600, backgroundColor: '#232a36', color: '#fff', fontFamily: 'Inter, Arial, sans-serif', fontSize: '1rem' }}>Close</Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default Transactions;