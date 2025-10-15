package auth

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// JWT 密鑰 (實際部署時應該使用環境變數)
var jwtSecret = []byte("your-super-secret-jwt-key-change-this-in-production")

// JWT Claims 結構
type Claims struct {
	UserID   int    `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

// User 結構
type User struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Password string `json:"password"` // 實際應用中應該使用哈希密碼
	Role     string `json:"role"`
}

// 登入請求結構
type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// 登入回應結構
type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

// 模擬用戶數據庫 (實際應用中應該使用真實數據庫)
var users = []User{
	{ID: 1, Username: "admin", Password: "password", Role: "admin"},
	{ID: 2, Username: "user", Password: "userpass", Role: "user"},
}

// GenerateToken 生成 JWT Token
func GenerateToken(user User) (string, error) {
	// 設置過期時間為 24 小時
	expirationTime := time.Now().Add(24 * time.Hour)
	
	// 建立 claims
	claims := &Claims{
		UserID:   user.ID,
		Username: user.Username,
		Role:     user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   string(rune(user.ID)),
		},
	}

	// 建立 token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	
	// 簽名並取得字串
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// VerifyToken 驗證 JWT Token
func VerifyToken(tokenString string) (*Claims, error) {
	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	return claims, nil
}

// ValidateUser 驗證用戶帳號密碼
func ValidateUser(username, password string) *User {
	for _, user := range users {
		if user.Username == username && user.Password == password {
			return &user
		}
	}
	return nil
}