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
} from '@mui/material'
import { LockOutlined } from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'

export default function LoginPage() {
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
