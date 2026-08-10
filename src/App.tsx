import { useState } from 'react'
import { type Screen } from './data/navigation'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Login } from './screens/Login'
import { AppShell } from './components/layout/AppShell'

function Root() {
  const { isAuthenticated, username, logout } = useAuth()
  const [screen, setScreen] = useState<Screen>('dashboard')

  if (!isAuthenticated) {
    return <Login />
  }

  return <AppShell screen={screen} setScreen={setScreen} username={username} onLogout={logout} />
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  )
}
