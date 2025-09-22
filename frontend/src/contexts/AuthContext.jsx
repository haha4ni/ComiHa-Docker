import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

// JWT 工具函數
const parseJWT = (token) => {
  try {
    if (!token) return null
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Token 解析失敗:', error)
    return null
  }
}

const isTokenValid = (token) => {
  const payload = parseJWT(token)
  if (!payload) return false
  
  // 檢查是否過期
  const currentTime = Math.floor(Date.now() / 1000)
  return payload.exp > currentTime
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)

  // 初始化：檢查本地儲存的 token
  useEffect(() => {
    const initAuth = () => {
      const storedToken = localStorage.getItem('authToken')
      
      if (storedToken && isTokenValid(storedToken)) {
        const userData = parseJWT(storedToken)
        setToken(storedToken)
        setUser({
          id: userData.user_id,
          username: userData.username,
          role: userData.role
        })
      } else {
        // Token 無效或過期，清除本地儲存
        localStorage.removeItem('authToken')
      }
      
      setLoading(false)
    }

    initAuth()
  }, [])

  // 登入函數
  const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '登入失敗')
      }

      const data = await response.json()
      
      // 儲存 token 到本地儲存
      localStorage.setItem('authToken', data.token)
      setToken(data.token)
      setUser(data.user)
      
      return { success: true, user: data.user }
    } catch (error) {
      console.error('登入錯誤:', error)
      return { success: false, error: error.message }
    }
  }

  // 登出函數
  const logout = () => {
    localStorage.removeItem('authToken')
    setToken(null)
    setUser(null)
  }

  // 檢查用戶是否已登入
  const isAuthenticated = () => {
    return user !== null && token !== null && isTokenValid(token)
  }

  // 檢查用戶角色
  const hasRole = (requiredRole) => {
    return user && user.role === requiredRole
  }

  // 建立帶有認證 header 的 API 請求
  const makeAuthenticatedRequest = async (url, options = {}) => {
    if (!token || !isTokenValid(token)) {
      throw new Error('未認證或 token 已過期')
    }

    const config = {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    }

    const response = await fetch(url, config)
    
    // 如果回應是 401，表示 token 可能已過期
    if (response.status === 401) {
      logout()
      throw new Error('認證已過期，請重新登入')
    }

    return response
  }

  // 檢查 token 有效性並自動登出過期用戶
  useEffect(() => {
    if (token && !isTokenValid(token)) {
      console.log('Token 已過期，自動登出')
      logout()
    }
  }, [token])

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    hasRole,
    makeAuthenticatedRequest,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// 自定義 Hook 來使用 Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth 必須在 AuthProvider 內部使用')
  }
  return context
}

export default AuthContext
