import { useState } from 'react'
import { ApiRequestError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Logo } from '../components/ui/Logo'

export function Login() {
  const { login, loginDemo } = useAuth()
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!user || !pass) {
      setError('Ingrese usuario y contraseña.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await login(user, pass)
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === 'INVALID_CREDENTIALS') {
        setError('Usuario o contraseña incorrectos.')
      } else if (err instanceof ApiRequestError && err.status === 0) {
        setError('No se pudo conectar con el servidor. Verifique la URL de la API.')
      } else if (err instanceof ApiRequestError) {
        setError(err.message)
      } else {
        setError('Ocurrió un error inesperado.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'radial-gradient(1200px 600px at 15% -10%, #16265c 0%, transparent 55%), radial-gradient(1000px 700px at 110% 120%, #1b2f6b 0%, transparent 50%), linear-gradient(160deg,#07153a 0%,#0a1a45 100%)',
      }}
    >
      <div className="gp-in" style={{ width: '100%', maxWidth: 412, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '16px 26px', boxShadow: '0 18px 45px rgba(3,10,30,.45)' }}>
          <Logo size={26} />
        </div>

        <div style={{ width: '100%', background: '#fff', borderRadius: 20, padding: '32px 30px', boxShadow: '0 24px 60px rgba(3,10,30,.4)' }}>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#07153a' }}>Bienvenido a GALENOS PRO</h1>
          <p style={{ margin: '0 0 22px', fontSize: 13.5, color: '#6b7794' }}>Sistema de Gestión de Citas Médicas</p>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', fontSize: 13, fontWeight: 500, padding: '10px 13px', borderRadius: 11, marginBottom: 16 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              <span>{error}</span>
            </div>
          )}

          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#54617f', marginBottom: 6 }}>
            Usuario <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <svg style={{ position: 'absolute', left: 13, top: 12, color: '#9aa6c0' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            <input
              value={user}
              onChange={e => { setUser(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="usuario"
              style={{ width: '100%', padding: '11px 14px 11px 40px', border: '1px solid #d5dceb', borderRadius: 11, fontSize: 14, background: '#f8fafc', color: '#07153a' }}
            />
          </div>

          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#54617f', marginBottom: 6 }}>
            Contraseña <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <svg style={{ position: 'absolute', left: 13, top: 12, color: '#9aa6c0' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              type="password"
              value={pass}
              onChange={e => { setPass(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              style={{ width: '100%', padding: '11px 14px 11px 40px', border: '1px solid #d5dceb', borderRadius: 11, fontSize: 14, background: '#f8fafc', color: '#07153a' }}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="gp-primary-btn"
            style={{ width: '100%', padding: 13, background: '#263c7a', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 8px 20px rgba(38,60,122,.35)' }}
          >
            {loading ? 'Ingresando…' : 'Iniciar sesión'}
          </button>

          {import.meta.env.DEV && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0' }}>
                <span style={{ flex: 1, height: 1, background: '#e6eaf2' }} />
                <span style={{ fontSize: 11, color: '#9aa6c0' }}>sin backend</span>
                <span style={{ flex: 1, height: 1, background: '#e6eaf2' }} />
              </div>
              <button
                onClick={loginDemo}
                className="gp-ghost-btn"
                style={{ width: '100%', padding: 12, background: '#fff', color: '#263c7a', border: '1px dashed #c7d0e2', borderRadius: 12, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}
              >
                Entrar en modo demo (sin backend)
              </button>
            </>
          )}
        </div>

        <p style={{ margin: 0, fontSize: 12, color: '#8aa0d4' }}>© 2026 GALENOS PRO · Sistema de Citas Médicas</p>
      </div>
    </div>
  )
}
