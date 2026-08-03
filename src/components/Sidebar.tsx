import type { ReactNode } from 'react'
import { type Screen } from '../data/navigation'
import { Logo } from './Logo'

interface SidebarProps {
  screen: Screen
  setScreen: (s: Screen) => void
  username: string | null
  onLogout: () => void
}

const ACTIVE_BG = '#22366e'
const ACTIVE_BAR = '#66b6ff'
const INACTIVE_COLOR = '#9fb0d6'

function navStyle(active: boolean) {
  return {
    bg: active ? ACTIVE_BG : 'transparent',
    col: active ? '#ffffff' : INACTIVE_COLOR,
    bar: active ? ACTIVE_BAR : 'transparent',
  }
}

export function Sidebar({ screen, setScreen, username, onLogout }: SidebarProps) {
  const g = {
    dash: navStyle(screen === 'dashboard'),
    pac: navStyle(screen === 'pacientes'),
    triaje: navStyle(screen === 'triaje'),
    admisiones: navStyle(screen === 'admisiones'),
    citas: navStyle(screen === 'citas'),
    cfg: navStyle(screen === 'config'),
  }

  function navBtn(active: { bg: string; col: string; bar: string }, onClick: () => void, icon: ReactNode, label: string) {
    return (
      <button
        onClick={onClick}
        className="gp-nav-btn"
        style={{
          display: 'flex', alignItems: 'center', gap: 12, width: '100%',
          padding: '11px 13px', border: 'none', borderLeft: `3px solid ${active.bar}`,
          borderRadius: 11, cursor: 'pointer', fontSize: 14, fontWeight: 500,
          textAlign: 'left', background: active.bg, color: active.col,
        }}
      >
        {icon}
        {label}
      </button>
    )
  }

  const initials = (username || 'GP').slice(0, 2).toUpperCase()

  return (
    <aside style={{ width: 262, flexShrink: 0, background: 'linear-gradient(180deg,#07153a 0%,#091a45 100%)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 18px 16px' }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: '11px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Logo size={20} />
        </div>
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 7, paddingLeft: 2 }}>
          <span style={{ fontSize: 11, letterSpacing: '.14em', color: '#66b6ff', fontWeight: 700 }}>GALENOS PRO</span>
          <span style={{ fontSize: 11, color: '#5f6f9c' }}>· Citas Médicas</span>
        </div>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {navBtn(g.dash, () => setScreen('dashboard'),
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
          </svg>, 'Dashboard'
        )}
        {navBtn(g.pac, () => setScreen('pacientes'),
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>, 'Pacientes'
        )}
        {navBtn(g.triaje, () => setScreen('triaje'),
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>, 'Triaje'
        )}
        {navBtn(g.admisiones, () => setScreen('admisiones'),
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" />
            <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>, 'Admisiones'
        )}
        {navBtn(g.citas, () => setScreen('citas'),
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>, 'Citas Médicas'
        )}
        {navBtn(g.cfg, () => setScreen('config'),
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
            <line x1="2" y1="14" x2="6" y2="14" /><line x1="10" y1="8" x2="14" y2="8" />
            <line x1="18" y1="16" x2="22" y2="16" />
          </svg>, 'Configuración'
        )}
      </nav>

      <div style={{ padding: '14px 14px 18px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg,#66b6ff,#263c7a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{username || 'Sesión activa'}</div>
            <div style={{ fontSize: 11, color: '#7d8cba' }}>Operador clínico</div>
          </div>
          <button
            onClick={onLogout}
            title="Cerrar sesión"
            style={{ background: 'transparent', border: 'none', color: '#7d8cba', cursor: 'pointer', padding: 5, borderRadius: 8 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}
