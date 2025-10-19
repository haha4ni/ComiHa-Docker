import { useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Paper,
} from '@mui/material'
import { 
  Home,
  Person,
  Settings
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'

export default function Dashboard() {
  const { user, makeAuthenticatedRequest } = useAuth()
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        儀表板
      </Typography>

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
                ✅ Token 驗證成功
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                👤 用戶: {user?.username} (ID: {user?.id})
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                🔑 權限: {user?.role}
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
  )
}
