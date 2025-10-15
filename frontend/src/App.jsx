import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Avatar,
  Link,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  Grid,
  Paper,
  IconButton
} from '@mui/material'
import { 
  LockOutlined, 
  Dashboard, 
  Settings, 
  ExitToApp,
  Home,
  Person
} from '@mui/icons-material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AuthProvider, useAuth } from './contexts/AuthContext'

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

//  登入組件 (使用 AuthContext)
function LoginPage() {
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    username: 'admin',
    password: 'password'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const result = await login(formData.username, formData.password)
      
      if (!result.success) {
        setError(result.error)
      }
      // 登入成功會由 AuthContext 自動處理狀態更新
    } catch (error) {
      setError('登入過程發生錯誤')
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1e1e2e 0%, #2a2a3e 100%)',
        padding: 3,
        margin: 0,
        boxSizing: 'border-box',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 450,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Card
          sx={{
            width: '100%',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 3,
                textAlign: 'center',
              }}
            >
              <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                <LockOutlined />
              </Avatar>
              <Typography component="h1" variant="h4" gutterBottom>
                歡迎回來
              </Typography>
              <Typography variant="body2" color="text.secondary">
                請登入您的帳戶 (使用 JWT 認證)
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box 
              component="form" 
              onSubmit={handleSubmit}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="使用者名稱"
                name="username"
                autoComplete="username"
                autoFocus
                value={formData.username}
                onChange={handleInputChange}
                variant="outlined"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="密碼"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleInputChange}
                variant="outlined"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  mt: 3,
                  mb: 2,
                  height: 48,
                  background: 'linear-gradient(135deg, #646cff 0%, #535bf2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #535bf2 0%, #4c4fc7 100%)',
                  },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  '登入'
                )}
              </Button>
              
              <Box sx={{ textAlign: 'center', mt: 2, width: '100%' }}>
                <Typography variant="body2" color="text.secondary">
                  忘記密碼？{' '}
                  <Link href="#forgot" color="primary">
                    重設密碼
                  </Link>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            測試帳號：admin / password 或 user / userpass
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

// 主界面組件 (使用 AuthContext)
function MainDashboard() {
  const { user, logout, makeAuthenticatedRequest } = useAuth()
  const [protectedData, setProtectedData] = useState(null)

  // 測試受保護的 API
  const testProtectedAPI = async () => {
    try {
      const response = await makeAuthenticatedRequest('http://localhost:8080/api/protected')
      const data = await response.json()
      setProtectedData(data)
      console.log('受保護的 API 回應:', data)
    } catch (error) {
      console.error('API 呼叫失敗:', error)
      alert('API 呼叫失敗: ' + error.message)
    }
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ mb: 3 }}>
        <Toolbar>
          <Dashboard sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            JWT 安全控制台
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            歡迎, {user?.username} ({user?.role})
          </Typography>
          <IconButton
            color="inherit"
            onClick={logout}
            title="登出"
          >
            <ExitToApp />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box maxWidth="lg" sx={{ mx: 'auto', px: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={testProtectedAPI}
            >
              <Home sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                測試 API
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                點擊測試受保護的 API 端點
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <Person sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                用戶資訊
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                ID: {user?.id}<br />
                角色: {user?.role}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <Settings sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                JWT Token
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                有效的身份驗證令牌
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                系統狀態
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  ✅ JWT 認證正常運行
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  � Token 驗證成功
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  � 用戶: {user?.username} (ID: {user?.id})
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  � 權限: {user?.role}
                </Typography>
                {protectedData && (
                  <Typography variant="body2" color="success.main">
                    🎯 API 測試成功: {protectedData.message}
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

// 應用內容組件
function AppContent() {
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

  return user ? (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <MainDashboard />
    </Box>
  ) : (
    <LoginPage />
  )
}

// 主 App 組件
function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
