import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
} from '@mui/material';
import {
  Home,
  Dashboard,
  Person,
  Settings,
  Analytics,
  Security,
} from '@mui/icons-material';

const drawerWidth = 240;

const menuItems = [
  { text: '首頁', icon: <Home />, path: '/' },
  { text: '儀表板', icon: <Dashboard />, path: '/dashboard' },
  { text: '用戶管理', icon: <Person />, path: '/users' },
  { text: '分析', icon: <Analytics />, path: '/analytics' },
  { text: '安全', icon: <Security />, path: '/security' },
  { text: '設定', icon: <Settings />, path: '/settings' },
];

export default function SimpleList({ open, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: open ? drawerWidth : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          top: '70px', // WindowMenu (30px) + Appbar (40px)
          height: 'calc(100vh - 70px)',
          backgroundColor: '#1e1e2e',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ color: '#646cff', fontWeight: 'bold' }}>
          導航選單
        </Typography>
      </Box>
      
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
      
      <List sx={{ pt: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                mx: 1,
                borderRadius: 1,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(100, 108, 255, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(100, 108, 255, 0.3)',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? '#646cff' : 'inherit',
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{
                  '& .MuiListItemText-primary': {
                    color: location.pathname === item.path ? '#646cff' : 'inherit',
                    fontWeight: location.pathname === item.path ? 600 : 400,
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}