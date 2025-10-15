package auth

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// LoginHandler 登入 API 處理器
func LoginHandler(c *gin.Context) {
	var loginReq LoginRequest
	
	// Gin 自動解析 JSON
	if err := c.ShouldBindJSON(&loginReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON format"})
		return
	}

	// 驗證用戶
	user := ValidateUser(loginReq.Username, loginReq.Password)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "使用者名稱或密碼錯誤"})
		return
	}

	// 生成 JWT token
	token, err := GenerateToken(*user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Token generation failed"})
		return
	}

	// 回傳 token 和用戶資訊 (不包含密碼)
	response := LoginResponse{
		Token: token,
		User: User{
			ID:       user.ID,
			Username: user.Username,
			Role:     user.Role,
		},
	}

	c.JSON(http.StatusOK, response)
}

// JWTMiddleware JWT 中間件
func JWTMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 從 Authorization header 取得 token
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing authorization header"})
			c.Abort()
			return
		}

		// 檢查格式是否為 "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization format"})
			c.Abort()
			return
		}

		tokenString := parts[1]

		// 驗證 token
		claims, err := VerifyToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// 將用戶資訊加到 context
		c.Set("userID", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("userRole", claims.Role)

		c.Next()
	}
}