import { Box, Typography, Paper, Grid } from '@mui/material';
import { Home as HomeIcon, Dashboard, Analytics } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

// HomePage 組件，作為歡迎頁面
export default function HomePage() {
  const { user } = useAuth();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" gutterBottom sx={{ mb: 2 }}>
        歡迎回來, {user?.username}！
      </Typography>
      
      <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        您已成功登入 JWT 管理系統
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <HomeIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              系統總覽
            </Typography>
            <Typography variant="body1" color="text.secondary">
              這是您的主要控制面板，您可以從這裡開始探索系統的各項功能。
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Dashboard sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              快速開始
            </Typography>
            <Typography variant="body1" color="text.secondary">
              使用左側導航欄來瀏覽不同的功能模塊，或點擊儀表板查看詳細信息。
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              用戶信息
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                👤 用戶名: {user?.username}
              </Typography>
              <Typography variant="body1" gutterBottom>
                🆔 用戶 ID: {user?.id}
              </Typography>
              <Typography variant="body1" gutterBottom>
                🔑 用戶角色: {user?.role}
              </Typography>
              <Typography variant="body1" color="success.main">
                ✅ 認證狀態: 已登入
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
