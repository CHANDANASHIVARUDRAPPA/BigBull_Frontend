import React, { useState, useEffect, createContext, useContext } from 'react';
import { AppBar, Toolbar, Typography, Container, Box, Button, IconButton, CssBaseline, Chip, Drawer, List, ListItem, ListItemIcon, ListItemText, useMediaQuery, useTheme } from '@mui/material';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HomeIcon from '@mui/icons-material/Home';
import PortfolioIcon from '@mui/icons-material/AccountBalance';
import TransactionsIcon from '@mui/icons-material/Receipt';
import OptimizeIcon from '@mui/icons-material/TrendingUp';
import MenuIcon from '@mui/icons-material/Menu';
import { getWallet } from '../services/api';

// Create Theme Context
export const ThemeContext = createContext();

// Custom hook to use theme context
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

const Layout = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Professional color scheme - green, blue, black combinations (no gradients)
  const themeColors = darkMode
    ? {
        background: '#0f1419', // Dark background
        appBar: '#1a1a1a', // Dark gray/black
        text: '#ffffff', // White text
        card: '#1a1a1a', // Dark gray cards
        button: '#2563eb', // Blue buttons
        buttonText: '#ffffff', // White button text
        accent: '#059669', // Green accent
        secondary: '#6b7280', // Gray secondary text
        border: '#374151', // Dark borders
        hover: '#374151', // Dark hover
        success: '#059669', // Green for positive
        error: '#dc2626' // Red for negative
      }
    : {
        background: '#f8fafc', // Light background
        appBar: '#ffffff', // White app bar
        text: '#1f2937', // Dark gray text
        card: '#ffffff', // White cards
        button: '#2563eb', // Blue buttons
        buttonText: '#ffffff', // White button text
        accent: '#059669', // Green accent
        secondary: '#6b7280', // Gray secondary text
        border: '#d1d5db', // Light borders
        hover: '#f3f4f6', // Light hover
        success: '#059669', // Green for positive
        error: '#dc2626' // Red for negative
      };

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await getWallet();
        setWalletBalance(res.data.balance);
      } catch (err) {
        console.error('Failed to fetch wallet balance:', err);
      }
    };
    fetchWallet();
    // Refresh wallet balance every 30 seconds
    const interval = setInterval(fetchWallet, 30000);
    return () => clearInterval(interval);
  }, []);

  const navigationItems = [
    { path: '/', label: 'Home', icon: HomeIcon },
    { path: '/portfolio', label: 'Portfolio', icon: PortfolioIcon },
    { path: '/transactions', label: 'Transactions', icon: TransactionsIcon },
    { path: '/optimization', label: 'Optimize', icon: OptimizeIcon }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) setMobileMenuOpen(false);
  };

  const drawerContent = (
    <Box sx={{ width: 280, pt: 2 }}>
      <Typography variant="h6" sx={{
        px: 3,
        py: 2,
        fontWeight: 'bold',
        color: themeColors.text,
        fontFamily: 'Inter, Arial, sans-serif',
        borderBottom: `1px solid ${themeColors.border}`
      }}>
        BigBull
      </Typography>
      <List sx={{ pt: 2 }}>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <ListItem
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                mx: 2,
                mb: 1,
                borderRadius: 2,
                cursor: 'pointer',
                backgroundColor: isActive ? themeColors.accent : 'transparent',
                color: isActive ? themeColors.buttonText : themeColors.text,
                '&:hover': {
                  backgroundColor: isActive ? themeColors.accent : themeColors.hover,
                },
                transition: 'all 0.2s ease'
              }}
            >
              <ListItemIcon sx={{ color: isActive ? themeColors.buttonText : themeColors.secondary, minWidth: 40 }}>
                <Icon />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontFamily: 'Inter, Arial, sans-serif',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '1rem'
                }}
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  const contextValue = {
    darkMode,
    setDarkMode,
    themeColors,
    walletBalance
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: themeColors.background,
        fontFamily: 'Inter, Arial, sans-serif',
        color: themeColors.text
      }}>
        <CssBaseline />

        {/* App Bar */}
        <AppBar
          position="static"
          sx={{
            background: themeColors.appBar,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderBottom: `1px solid ${themeColors.border}`
          }}
        >
          <Toolbar sx={{ py: 1.5, minHeight: 64, display: 'flex', alignItems: 'center' }}>
            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                edge="start"
                sx={{ mr: 2, color: themeColors.text }}
                onClick={() => setMobileMenuOpen(true)}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Logo */}
            <Typography
              variant="h5"
              component={Link}
              to="/"
              sx={{
                textDecoration: 'none',
                color: themeColors.text,
                fontWeight: 'bold',
                fontSize: '1.8rem',
                letterSpacing: 0.5,
                fontFamily: 'Inter, Arial, sans-serif',
                mr: 4,
                '&:hover': { color: themeColors.accent }
              }}
            >
              BigBull
            </Typography>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ ml: 2, display: 'flex', gap: 1 }}>
                {navigationItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Button
                      key={item.path}
                      component={Link}
                      to={item.path}
                      sx={{
                        color: isActive ? themeColors.buttonText : themeColors.text,
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: isActive ? 600 : 500,
                        fontFamily: 'Inter, Arial, sans-serif',
                        backgroundColor: isActive ? themeColors.accent : 'transparent',
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        minHeight: 40,
                        boxShadow: 'none',
                        '&:hover': {
                          backgroundColor: isActive ? themeColors.accent : themeColors.hover,
                          color: isActive ? themeColors.buttonText : themeColors.text
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </Box>
            )}

            {/* Right Side */}
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                icon={<AccountBalanceWalletIcon sx={{ color: themeColors.buttonText + ' !important' }} />}
                label={`$${walletBalance.toFixed(2)}`}
                sx={{
                  backgroundColor: themeColors.accent,
                  color: themeColors.buttonText,
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  fontFamily: 'Inter, Arial, sans-serif',
                  px: 2,
                  height: 40,
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  '& .MuiChip-label': { px: 1 }
                }}
              />

              {/* Dark Mode Toggle */}
              <IconButton
                sx={{
                  color: themeColors.text,
                  backgroundColor: themeColors.card,
                  border: `1px solid ${themeColors.border}`,
                  borderRadius: 2,
                  p: 1,
                  '&:hover': {
                    backgroundColor: themeColors.hover,
                  }
                }}
                onClick={() => setDarkMode((prev) => !prev)}
              >
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Mobile Drawer */}
        <Drawer
          anchor="left"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              backgroundColor: themeColors.card,
              borderRight: `1px solid ${themeColors.border}`
            }
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Main Content */}
        <Container
          maxWidth="xl"
          sx={{
            mt: 3,
            mb: 4,
            flex: 1,
            color: themeColors.text,
            px: { xs: 2, md: 3 }
          }}
        >
          <Outlet context={contextValue} />

          {/* Back Button */}
          {location.pathname !== '/' && (
            <Box sx={{ mt: 4, mb: 2, textAlign: 'left' }}>
              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                sx={{
                  fontFamily: 'Inter, Arial, sans-serif',
                  fontWeight: 500,
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  color: themeColors.text,
                  borderColor: themeColors.border,
                  backgroundColor: themeColors.card,
                  '&:hover': {
                    backgroundColor: themeColors.hover,
                    borderColor: themeColors.accent
                  },
                  textTransform: 'none',
                  fontSize: '1rem'
                }}
              >
                ← Back
              </Button>
            </Box>
          )}
        </Container>
      </Box>
    </ThemeContext.Provider>
  );
};

export default Layout;