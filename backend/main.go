package main

import (
	"fmt"
	"net/http"
	"os"

	"backend/auth"
	"github.com/gin-gonic/gin"
)

// API Hello Handler
func apiHello(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Hello from Go backend with Gin!",
		"status":  "running",
	})
}

// 受保護的 API 處理器
func protectedHandler(c *gin.Context) {
	// 從 context 取得用戶資訊 (由中間件設置)
	userID, _ := c.Get("userID")
	username, _ := c.Get("username")
	userRole, _ := c.Get("userRole")

	c.JSON(http.StatusOK, gin.H{
		"message":  "這是受保護的資源",
		"user_id":  userID,
		"username": username,
		"role":     userRole,
	})
}

func main() {
	// 創建 Gin 路由器
	r := gin.Default()

	// 設置 CORS 中間件
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusOK)
			return
		}

		c.Next()
	})

	// 註冊 API 路由
	api := r.Group("/api")
	{
		api.GET("/hello", apiHello)
		api.POST("/auth/login", auth.LoginHandler)          // 使用 auth package 的 LoginHandler
		api.GET("/protected", auth.JWTMiddleware(), protectedHandler)  // 使用 auth package 的 JWTMiddleware
	}

	// 判斷 dist 路徑：先用容器內的 ./frontend/dist，如果不存在再用本機開發的 ../frontend/dist
	distPath := "./frontend/dist"
	if _, err := os.Stat(distPath); os.IsNotExist(err) {
		distPath = "../frontend/dist"
	}

	// 提供 React 靜態檔案
	r.Static("/assets", distPath+"/assets")   // Vite 使用 assets 不是 static
	r.StaticFile("/vite.svg", distPath+"/vite.svg")
	r.StaticFile("/", distPath+"/index.html")
	r.StaticFile("/index.html", distPath+"/index.html")

	fmt.Println("🚀 Server started at http://localhost:8080")
	fmt.Println("📋 Available endpoints:")
	fmt.Println("   GET  /api/hello           - Public API")
	fmt.Println("   POST /api/auth/login      - Login endpoint")
	fmt.Println("   GET  /api/protected       - Protected API (requires JWT)")
	fmt.Println("   GET  /                    - React frontend")
	
	// 啟動服務器
	r.Run(":8080")
}