import { useState } from 'react'
import { getApiBaseUrl, setApiBaseUrl } from '../api/client'

interface ConfiguracionProps {
  username: string | null
  onLogout: () => void
}

export function Configuracion({ username, onLogout }: ConfiguracionProps) {
  const [url, setUrl] = useState(getApiBaseUrl())
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setApiBaseUrl(url)
    setUrl(getApiBaseUrl())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="gp-in" style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 560 }}>
      <div style={{ background: '#fff', border: '1px solid #e6eaf2', borderRadius: 16, padding: '18px 20px' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#07153a', marginBottom: 4 }}>Conexión a la API</div>
        <p style={{ margin: '0 0 14px', fontSize: 12.5, color: '#7a86a1' }}>URL base del backend de GALENOS PRO (Go + SQL Server).</p>

        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#54617f', marginBottom: 6 }}>URL de la API</label>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            value={url}
            onChange={e => { setUrl(e.target.value); setSaved(false) }}
            placeholder="http://localhost:8080"
            style={{ flex: 1, padding: '10px 14px', border: '1px solid #d5dceb', borderRadius: 11, fontSize: 14, background: '#f8fafc', color: '#07153a' }}
          />
          <button
            onClick={handleSave}
            className="gp-primary-btn"
            style={{ padding: '10px 22px', background: '#263c7a', color: '#fff', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            Guardar
          </button>
        </div>

        {saved && (
          <div style={{ marginTop: 12, fontSize: 12.5, color: '#059669', fontWeight: 600 }}>Guardado. Se usará en la próxima petición.</div>
        )}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e6eaf2', borderRadius: 16, padding: '18px 20px' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#07153a', marginBottom: 14 }}>Sesión</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#07153a' }}>{username ?? 'Operador'}</div>
            <div style={{ fontSize: 12, color: '#7a86a1' }}>Autenticado con Bearer token JWT</div>
          </div>
          <button
            onClick={onLogout}
            className="gp-ghost-btn"
            style={{ padding: '9px 18px', border: '1px solid #e0e6f1', borderRadius: 11, background: '#fff', fontSize: 13, fontWeight: 600, color: '#dc2626', cursor: 'pointer' }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}
