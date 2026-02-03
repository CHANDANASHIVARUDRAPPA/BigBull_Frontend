import React from 'react';
import { AppBar, Toolbar, Typography, Container, Box, Button } from '@mui/material';
import { Link, Outlet } from 'react-router-dom';

const Layout = () => (
  <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      <Toolbar sx={{ py: 2 }}>
        <Typography variant="h5" component={Link} to="/" sx={{ textDecoration: 'none', color: 'white', fontWeight: 'bold', fontSize: '1.8rem', letterSpacing: 1 }}>
          📈 BigBull
        </Typography>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          <Button component={Link} to="/portfolio" sx={{ color: 'white', textTransform: 'none', fontSize: '1rem', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>Portfolio</Button>
          <Button component={Link} to="/transactions" sx={{ color: 'white', textTransform: 'none', fontSize: '1rem', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>Transactions</Button>
          <Button component={Link} to="/optimization" sx={{ color: 'white', textTransform: 'none', fontSize: '1rem', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>Optimize</Button>
        </Box>
      </Toolbar>
    </AppBar>
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
      <Outlet />
    </Container>
  </Box>
);

export default Layout;