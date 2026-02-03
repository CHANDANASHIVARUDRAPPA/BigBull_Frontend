import React, { useState, useEffect } from 'react';
import { TextField, List, ListItem, ListItemText, Paper, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { searchStocks } from '../services/api';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.length > 1) {
      searchStocks(query).then(res => {
        setResults(res.data.results.quotes || []);
        setShowResults(true);
      }).catch(() => setResults([]));
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [query]);

  const handleSelect = (symbol) => {
    setQuery('');
    setShowResults(false);
    navigate(`/stock/${symbol}`);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 500, mx: 'auto', mb: 4 }}>
      <TextField
        fullWidth
        placeholder="Search stocks by name or symbol..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        variant="outlined"
        sx={{
          '& .MuiOutlinedInput-root': {
            fontSize: '1.1rem',
            borderRadius: 3,
            backgroundColor: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            '&:hover fieldset': { borderColor: '#667eea' },
            '&.Mui-focused fieldset': { borderColor: '#667eea' },
          },
          '& .MuiOutlinedInput-input::placeholder': {
            color: '#999',
            opacity: 1,
          },
        }}
      />
      {showResults && results.length > 0 && (
        <Paper sx={{ position: 'absolute', top: 'calc(100% + 8px)', width: '100%', zIndex: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', borderRadius: 2 }}>
          <List>
            {results.map((stock, index) => (
              <ListItem key={stock.symbol} onClick={() => handleSelect(stock.symbol)} sx={{ cursor: 'pointer', py: 1.5, borderBottom: index !== results.length - 1 ? '1px solid #eee' : 'none', '&:hover': { backgroundColor: '#f0f4ff' }, transition: 'all 0.2s' }}>
                <ListItemText primary={<Typography sx={{ fontWeight: 600, color: '#333' }}>{stock.shortname}</Typography>} secondary={<Typography sx={{ color: '#667eea', fontWeight: 500 }}>{stock.symbol}</Typography>} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default SearchBar;