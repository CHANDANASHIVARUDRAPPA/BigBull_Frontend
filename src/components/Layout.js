import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Container, Box, Button, IconButton, CssBaseline } from '@mui/material';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const Layout = () => {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const themeColors = darkMode
    ? {
        background: '#181c24',
        appBar: '#232a36',
        text: '#f5f6fa',
        card: '#232a36',
        button: '#1976d2',
        buttonText: '#fff',
      }
    : {
        background: '#f5f7fa',
        appBar: '#232a36',
        text: '#232a36',
        card: '#fff',
        button: '#1976d2',
        buttonText: '#fff',
      };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: themeColors.background, fontFamily: 'Inter, Arial, sans-serif' }}>
      <CssBaseline />
      <AppBar position="static" sx={{ background: themeColors.appBar, boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
        <Toolbar sx={{ py: 2, minHeight: 72, display: 'flex', alignItems: 'center' }}>
          <Typography variant="h5" component={Link} to="/" sx={{ textDecoration: 'none', color: 'white', fontWeight: 'bold', fontSize: '2rem', letterSpacing: 1, fontFamily: 'Inter, Arial, sans-serif', mr: 4 }}>
            BigBull
          </Typography>
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button component={Link} to="/" sx={{ color: themeColors.buttonText, textTransform: 'none', fontSize: '1rem', fontWeight: 500, fontFamily: 'Inter, Arial, sans-serif', backgroundColor: themeColors.button, borderRadius: 2, px: 2, boxShadow: 'none', '&:hover': { backgroundColor: '#1565c0' } }}>Home</Button>
            <Button component={Link} to="/portfolio" sx={{ color: themeColors.buttonText, textTransform: 'none', fontSize: '1rem', fontWeight: 500, fontFamily: 'Inter, Arial, sans-serif', backgroundColor: themeColors.button, borderRadius: 2, px: 2, boxShadow: 'none', '&:hover': { backgroundColor: '#1565c0' } }}>Portfolio</Button>
            <Button component={Link} to="/transactions" sx={{ color: themeColors.buttonText, textTransform: 'none', fontSize: '1rem', fontWeight: 500, fontFamily: 'Inter, Arial, sans-serif', backgroundColor: themeColors.button, borderRadius: 2, px: 2, boxShadow: 'none', '&:hover': { backgroundColor: '#1565c0' } }}>Transactions</Button>
            <Button component={Link} to="/optimization" sx={{ color: themeColors.buttonText, textTransform: 'none', fontSize: '1rem', fontWeight: 500, fontFamily: 'Inter, Arial, sans-serif', backgroundColor: themeColors.button, borderRadius: 2, px: 2, boxShadow: 'none', '&:hover': { backgroundColor: '#1565c0' } }}>Optimize</Button>
            <IconButton sx={{ ml: 2 }} onClick={() => setDarkMode((prev) => !prev)} color="inherit">
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1, color: themeColors.text }}>
        <Outlet context={{ darkMode, themeColors }} />
        {location.pathname !== '/' && (
          <Box sx={{ mt: 4, mb: 2, textAlign: 'left' }}>
            <Button variant="outlined" onClick={() => navigate(-1)} sx={{ fontFamily: 'Inter, Arial, sans-serif', fontWeight: 500, borderRadius: 2, px: 3, py: 1, color: themeColors.text, borderColor: themeColors.text }}>
              Back
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Layout;