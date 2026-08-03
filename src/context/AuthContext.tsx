import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { AUTH_EXPIRED_EVENT, api, clearSession, getStoredUsername, getToken, setSession } from '../api/client'

interface AuthContextValue {
  isAuthenticated: boolean
  username: string | null
  login: (username: string, password: string) => Promise<void>
  loginDemo: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getToken())
  const [username, setUsername] = useState<string | null>(() => getStoredUsername())

  useEffect(() => {
    function handleExpired() {
      setIsAuthenticated(false)
      setUsername(null)
    }
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired)
  }, [])

  async function login(user: string, password: string) {
    const { accessToken } = await api.login(user, password)
    setSession(accessToken, user)
    setUsername(user)
    setIsAuthenticated(true)
  }

  /** Sesión sin backend, solo para probar la UI en desarrollo (import.meta.env.DEV). */
  function loginDemo() {
    setSession('demo-token', 'demo')
    setUsername('demo')
    setIsAuthenticated(true)
  }

  function logout() {
    clearSession()
    setIsAuthenticated(false)
    setUsername(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, login, loginDemo, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
