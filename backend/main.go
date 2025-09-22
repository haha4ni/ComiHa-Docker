package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// JWT 密鑰 (實際部署時應該使用環境變數)
var jwtSecret = []byte("your-super-secret-jwt-key-change-this-in-production")

// 用戶結構
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

// JWT Claims 結構
type Claims struct {
	UserID   int    `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

// 模擬用戶數據庫 (實際應用中應該使用真實數據庫)
var users = []User{
	{ID: 1, Username: "admin", Password: "password", Role: "admin"},
	{ID: 2, Username: "user", Password: "userpass", Role: "user"},
}

// 生成 JWT Token
func generateToken(user User) (string, error) {
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
			Subject:   fmt.Sprintf("%d", user.ID),
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

// 驗證 JWT Token
func verifyToken(tokenString string) (*Claims, error) {
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

// 驗證用戶帳號密碼
func validateUser(username, password string) *User {
	for _, user := range users {
		if user.Username == username && user.Password == password {
			return &user
		}
	}
	return nil
}

// 登入 API 處理器
func loginHandler(w http.ResponseWriter, r *http.Request) {
	// 設置 CORS 標頭
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	// 處理預檢請求
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var loginReq LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&loginReq); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// 驗證用戶
	user := validateUser(loginReq.Username, loginReq.Password)
	if user == nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "使用者名稱或密碼錯誤",
		})
		return
	}

	// 生成 JWT token
	token, err := generateToken(*user)
	if err != nil {
		http.Error(w, "Token generation failed", http.StatusInternalServerError)
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

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// JWT 中間件：驗證請求中的 token
func jwtMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 設置 CORS 標頭
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// 處理預檢請求
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// 從 Authorization header 取得 token
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Missing authorization header", http.StatusUnauthorized)
			return
		}

		// 檢查格式是否為 "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			http.Error(w, "Invalid authorization format", http.StatusUnauthorized)
			return
		}

		tokenString := parts[1]

		// 驗證 token
		claims, err := verifyToken(tokenString)
		if err != nil {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		// 將用戶資訊加到 request context (這裡簡化處理)
		r.Header.Set("X-User-ID", fmt.Sprintf("%d", claims.UserID))
		r.Header.Set("X-User-Name", claims.Username)
		r.Header.Set("X-User-Role", claims.Role)

		// 繼續處理請求
		next.ServeHTTP(w, r)
	})
}

// 受保護的 API 處理器
func protectedHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	// 從 header 取得用戶資訊 (由中間件設置)
	userID := r.Header.Get("X-User-ID")
	userName := r.Header.Get("X-User-Name")
	userRole := r.Header.Get("X-User-Role")

	response := map[string]string{
		"message":  "這是受保護的資源",
		"user_id":  userID,
		"username": userName,
		"role":     userRole,
	}

	json.NewEncoder(w).Encode(response)
}

// API Hello Handler
func apiHello(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	
	response := map[string]string{
		"message": "Hello from Go backend!",
		"status":  "running",
	}
	
	json.NewEncoder(w).Encode(response)
}

func main() {
	// 註冊 API 路由
	http.HandleFunc("/api/hello", apiHello)
	http.HandleFunc("/api/auth/login", loginHandler)
	http.HandleFunc("/api/protected", jwtMiddleware(protectedHandler))

	// 判斷 dist 路徑：先用容器內的 ./frontend/dist，如果不存在再用本機開發的 ../frontend/dist
	distPath := "./frontend/dist"
	if _, err := os.Stat(distPath); os.IsNotExist(err) {
		distPath = "../frontend/dist"
	}

	// 提供 React 靜態檔案
	fs := http.FileServer(http.Dir(distPath))
	http.Handle("/", fs)

	fmt.Println("🚀 Server started at http://localhost:8080")
	fmt.Println("📋 Available endpoints:")
	fmt.Println("   GET  /api/hello           - Public API")
	fmt.Println("   POST /api/auth/login      - Login endpoint")
	fmt.Println("   GET  /api/protected       - Protected API (requires JWT)")
	fmt.Println("   GET  /                    - React frontend")
	
	http.ListenAndServe(":8080", nil)
}