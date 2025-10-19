import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { CircularProgress } from '@mui/material';
import LoginPage from '../pages/auth/LoginPage';
import WindowMenu from "./components/WindowMenu";
import SimpleList from "./components/List";
import Appbar from "./components/Appbar";

// 創建深色主題
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#646cff',
    },
    background: {
      default: '#1e1e2e',
      paper: 'rgba(255, 255, 255, 0.05)',
    },
  },
  shape: {
    borderRadius: 12,
  },
});

// 內容組件，處理認證狀態
function AuthenticatedContent() {
  const { user, loading } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(true);

  const handleDrawerToggle = () => {
    setDrawerOpen((prev) => !prev);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minWidth: '100vw',
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // 如果用戶未登入，顯示登入頁面
  if (!user) {
    return <LoginPage />;
  }

  // 用戶已登入，顯示主要布局
  return (
    <Box>
      <CssBaseline />
      <WindowMenu />
      <Appbar onMenuClick={handleDrawerToggle} />
      <Box sx={{ display: "flex" }}>
        <SimpleList open={drawerOpen} onToggle={handleDrawerToggle} />
        <Box
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 5,
            marginLeft: drawerOpen ? "0px" : "-180px", // Adjust margin based on drawer state
            transition: "margin-left 0.3s ease", // Smooth transition
            display: "flex",
            mt: 5, // appbar高度
            flexWrap: "wrap",
            alignItems: "flex-start",
            alignContent: "flex-start",
            height: "calc(100vh - 40px)",
            width: "100%",
            overflowY: "auto",
          }}
        >
          <Box sx={{ width: "100%" }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// 主 MainMode 組件
export default function MainMode() {
  return (
    <AuthProvider>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <AuthenticatedContent />
      </ThemeProvider>
    </AuthProvider>
  );
}
