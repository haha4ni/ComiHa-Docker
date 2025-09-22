# JWT 認證系統完整指南

## 📋 目錄
1. [前後端API關係說明](#前後端api關係說明)
2. [JWT認證流程](#jwt認證流程)
3. [後端實現 (Go)](#後端實現-go)
4. [前端實現 (React)](#前端實現-react)
5. [測試方法](#測試方法)
6. [安全性考量](#安全性考量)
7. [故障排除](#故障排除)

---

## 前後端API關係說明

### 手動測試 vs 前端自動化
您問到的前後端關係，主要體現在API調用方式的差異：

#### 1. 手動測試 (命令行)
```bash
# 登入獲取Token
curl -X POST http://localhost:8080/api/login ^
-H "Content-Type: application/json" ^
-d "{\"username\":\"admin\",\"password\":\"password\"}"

# 使用Token訪問受保護資源
curl -X GET http://localhost:8080/api/protected ^
-H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 2. 前端自動化 (React)
```javascript
// AuthContext.jsx 中的實現
const login = async (username, password) => {
  const response = await fetch('http://localhost:8080/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  // 自動儲存Token到localStorage
}

const makeAuthenticatedRequest = async (url) => {
  return fetch(url, {
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}` 
    }
  })
}
```

**關鍵差異：**
- 手動測試：每次都要手動複製貼上Token
- 前端自動化：程式自動管理Token的儲存與使用

---

## JWT認證流程

### 完整認證循環
```
1. 用戶輸入帳密 → React前端
2. 前端發送POST /api/login → Go後端
3. 後端驗證 → 生成JWT Token
4. 前端接收Token → 儲存到localStorage
5. 前端自動在每個API請求加上Authorization header
6. 後端驗證Token → 允許/拒絕訪問
```

### Token結構
```
Header.Payload.Signature
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzI3MDMzNjAwfQ.
signature_hash
```

---

## 後端實現 (Go)

### 檔案結構
```
backend/
├── main.go      # 主程式
└── go.mod       # 依賴管理
```

### 關鍵程式碼 (main.go)
```go
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "strings"
    "time"
    "github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte("your-secret-key")

// 用戶結構
type User struct {
    ID       int    `json:"id"`
    Username string `json:"username"`
    Password string `json:"password"`
    Role     string `json:"role"`
}

// 預設用戶資料庫
var users = []User{
    {ID: 1, Username: "admin", Password: "password", Role: "admin"},
    {ID: 2, Username: "user", Password: "userpass", Role: "user"},
}

// JWT生成
func generateToken(user User) (string, error) {
    claims := jwt.MapClaims{
        "id":       user.ID,
        "username": user.Username,
        "role":     user.Role,
        "exp":      time.Now().Add(time.Hour * 24).Unix(),
    }
    
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(jwtSecret)
}

// JWT驗證
func verifyToken(tokenString string) (*jwt.Token, error) {
    return jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
        return jwtSecret, nil
    })
}

// JWT中間件
func jwtMiddleware(next http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        authHeader := r.Header.Get("Authorization")
        if authHeader == "" {
            http.Error(w, "Authorization header required", http.StatusUnauthorized)
            return
        }
        
        tokenString := strings.TrimPrefix(authHeader, "Bearer ")
        token, err := verifyToken(tokenString)
        
        if err != nil || !token.Valid {
            http.Error(w, "Invalid token", http.StatusUnauthorized)
            return
        }
        
        next(w, r)
    }
}

// 登入端點
func loginHandler(w http.ResponseWriter, r *http.Request) {
    // CORS設定
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    
    if r.Method == "OPTIONS" {
        return
    }
    
    var credentials struct {
        Username string `json:"username"`
        Password string `json:"password"`
    }
    
    json.NewDecoder(r.Body).Decode(&credentials)
    
    // 驗證用戶
    for _, user := range users {
        if user.Username == credentials.Username && user.Password == credentials.Password {
            token, err := generateToken(user)
            if err != nil {
                http.Error(w, "Token generation failed", http.StatusInternalServerError)
                return
            }
            
            response := map[string]interface{}{
                "token": token,
                "user": map[string]interface{}{
                    "id":       user.ID,
                    "username": user.Username,
                    "role":     user.Role,
                },
            }
            
            w.Header().Set("Content-Type", "application/json")
            json.NewEncoder(w).Encode(response)
            return
        }
    }
    
    http.Error(w, "Invalid credentials", http.StatusUnauthorized)
}

// 受保護端點
func protectedHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Content-Type", "application/json")
    
    response := map[string]string{
        "message": "這是受保護的資源！",
        "time":    time.Now().Format(time.RFC3339),
    }
    
    json.NewEncoder(w).Encode(response)
}

func main() {
    http.HandleFunc("/api/login", loginHandler)
    http.HandleFunc("/api/protected", jwtMiddleware(protectedHandler))
    
    fmt.Println("伺服器運行在 http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}
```

### 啟動後端
```bash
cd backend
go mod tidy
go run main.go
```

---

## 前端實現 (React)

### 檔案結構
```
frontend/src/
├── App.jsx                 # 主應用程式
├── contexts/
│   └── AuthContext.jsx     # 認證上下文
└── main.jsx               # 入口點
```

### AuthContext.jsx (認證核心)
```javascript
import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// JWT解析工具
const parseJWT = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('JWT parsing error:', error)
    return null
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // 初始化時檢查localStorage
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const payload = parseJWT(token)
      if (payload && payload.exp > Date.now() / 1000) {
        setUser({
          id: payload.id,
          username: payload.username,
          role: payload.role
        })
      } else {
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  // 登入函數
  const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || '登入失敗')
      }

      const data = await response.json()
      
      // 儲存Token
      localStorage.setItem('token', data.token)
      
      // 設置用戶狀態
      setUser(data.user)
      
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error.message }
    }
  }

  // 登出函數
  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  // 帶認證的API請求
  const makeAuthenticatedRequest = async (url, options = {}) => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      throw new Error('No authentication token found')
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Token過期，自動登出
        logout()
        throw new Error('認證過期，請重新登入')
      }
      throw new Error(`Request failed: ${response.statusText}`)
    }

    return response
  }

  const value = {
    user,
    loading,
    login,
    logout,
    makeAuthenticatedRequest
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
```

### App.jsx (主應用邏輯)
- 使用 `useAuth()` Hook 獲取認證狀態
- 根據登入狀態顯示登入頁面或主控台
- 提供API測試功能

### 啟動前端
```bash
cd frontend
npm install
npm run dev
```

---

## 測試方法

### 1. 系統測試流程
```bash
# 1. 啟動後端 (Terminal 1)
cd backend
go run main.go

# 2. 啟動前端 (Terminal 2)
cd frontend
npm run dev

# 3. 瀏覽器測試
# 訪問 http://localhost:5173
# 使用帳號: admin/password 或 user/userpass
```

### 2. API手動測試
```bash
# 登入測試
curl -X POST http://localhost:8080/api/login ^
-H "Content-Type: application/json" ^
-d "{\"username\":\"admin\",\"password\":\"password\"}"

# 受保護資源測試 (替換YOUR_TOKEN)
curl -X GET http://localhost:8080/api/protected ^
-H "Authorization: Bearer YOUR_TOKEN"
```

### 3. 前端功能測試
- ✅ 登入表單提交
- ✅ Token自動儲存
- ✅ 受保護API調用
- ✅ 自動登出
- ✅ Token過期處理

---

## 安全性考量

### 已實現的安全特性
1. **JWT簽名驗證** - 防止Token偽造
2. **Token過期機制** - 24小時自動失效
3. **Authorization Header** - 標準認證方式
4. **CORS設定** - 跨域請求控制
5. **前端狀態管理** - 安全的認證流程

### 建議的改進項目
1. **HTTPS部署** - 加密傳輸
2. **Token刷新機制** - 延長使用體驗
3. **密碼雜湊** - bcrypt加密儲存
4. **速率限制** - 防止暴力破解
5. **日誌記錄** - 安全審計

---

## 故障排除

### 常見問題

#### 1. CORS錯誤
```javascript
// 確保後端設置正確的CORS header
w.Header().Set("Access-Control-Allow-Origin", "*")
w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
```

#### 2. Token無效
- 檢查Token格式：`Bearer <token>`
- 確認Token未過期
- 驗證簽名密鑰一致

#### 3. 登入失敗
- 確認用戶名密碼正確
- 檢查後端服務運行狀態
- 查看Network面板錯誤訊息

#### 4. 前端狀態異常
- 清除localStorage: `localStorage.clear()`
- 重新啟動開發服務器
- 檢查AuthContext Provider包裝

### 除錯工具
```javascript
// 前端除錯
console.log('Token:', localStorage.getItem('token'))
console.log('User:', user)

// 手動解析Token
const token = localStorage.getItem('token')
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]))
  console.log('Token payload:', payload)
}
```

---

## 總結

這個JWT認證系統提供了：
- **安全的用戶認證** - 基於業界標準JWT
- **無狀態設計** - 易於擴展的架構
- **自動化管理** - 前端透明處理Token
- **開發友好** - 清晰的代碼結構

前後端的關係就是：前端自動化了您手動測試時的所有步驟，讓用戶無需關心Token的細節，專注於業務功能的使用。

---

*文件建立時間：2025年9月22日*  
*系統版本：React 18 + Go 1.21 + JWT*
