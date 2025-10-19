import { Box, CircularProgress } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import LoginPage from './pages/LoginPage'

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
})

// 內容組件，處理認證狀態
function AuthenticatedContent() {
  const { user, loading } = useAuth()

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
    )
  }

  // 如果用戶未登入，顯示登入頁面
  if (!user) {
    return <LoginPage />
  }

  // 用戶已登入，顯示主要內容
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Outlet />
    </Box>
  )
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
  )
}
