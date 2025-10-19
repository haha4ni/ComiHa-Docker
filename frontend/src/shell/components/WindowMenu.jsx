import React from 'react';
import { Box } from '@mui/material';

export default function WindowMenu() {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '30px',
        backgroundColor: '#1e1e2e',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: (theme) => theme.zIndex.appBar + 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        fontSize: '14px',
        color: '#ffffff',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <span>React App</span>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Window controls can be added here */}
        <Box sx={{ width: 12, height: 12, bgcolor: '#ff5f57', borderRadius: '50%' }} />
        <Box sx={{ width: 12, height: 12, bgcolor: '#ffbd2e', borderRadius: '50%' }} />
        <Box sx={{ width: 12, height: 12, bgcolor: '#28ca42', borderRadius: '50%' }} />
      </Box>
    </Box>
  );
}