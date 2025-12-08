import { useState, useEffect } from 'react'
import LoginPage from './components/LoginPage'
import Dashboard from './components/Dashboard'
import I18nProvider from './i18n/I18nProvider'
import { getResources } from './api'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setIsChecking(false)
        return
      }
      
      try {
        // 验证 token 是否有效
        await getResources()
        setIsLoggedIn(true)
      } catch {
        // token 无效，清除并要求重新登录
        localStorage.removeItem('token')
      } finally {
        setIsChecking(false)
      }
    }
    
    checkAuth()
  }, [])

  const handleLogin = (token: string) => {
    localStorage.setItem('token', token)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
  }

  // 正在检查认证状态时显示加载
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-purple-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <I18nProvider>
      {!isLoggedIn ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <Dashboard onLogout={handleLogout} />
      )}
    </I18nProvider>
  )
}

export default App
