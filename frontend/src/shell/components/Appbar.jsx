import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  ExitToApp,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

export default function Appbar({ onMenuClick }) {
  const { user, logout } = useAuth();

  return (
    <AppBar
      position="fixed"
      sx={{
        top: '30px', // 為 WindowMenu 留出空間
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: '#2a2a3e',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <Toolbar variant="dense" sx={{ minHeight: '40px' }}>
        <IconButton
          color="inherit"
          aria-label="toggle drawer"
          onClick={onMenuClick}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          JWT 管理系統
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <AccountCircle sx={{ mr: 1 }} />
            <Typography variant="body2">
              {user?.username} ({user?.role})
            </Typography>
          </Box>
          
          <IconButton
            color="inherit"
            onClick={logout}
            title="登出"
          >
            <ExitToApp />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}