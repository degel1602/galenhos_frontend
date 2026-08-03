import { useEffect, useState, type ReactNode } from 'react'
import { type Screen } from '../data/navigation'
import { ApiRequestError, api, getApiBaseUrl } from '../api/client'

interface DashboardProps {
  setScreen: (s: Screen) => void
}

export function Dashboard({ setScreen }: DashboardProps) {
  const [totalPacientes, setTotalPacientes] = useState<number | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    api.listPacientes(1, 1)
      .then(res => { if (!cancelled) setTotalPacientes(res.totalItems) })
      .catch(err => {
        if (cancelled) return
        setError(err instanceof ApiRequestError ? err.message : 'No se pudo obtener el resumen de pacientes.')
      })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="gp-in">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
        <KpiCard
          label="Pacientes registrados"
          value={totalPacientes === null ? (error ? '—' : '…') : String(totalPacientes)}
          delta={error || 'Total en el sistema'}
          deltaColor={error ? '#dc2626' : '#7a86a1'}
          icon={<UsersIcon />} iconBg="#e0e9fb" iconColor="#263c7a"
        />
        <KpiCard label="API" value="Conectada" delta={getApiBaseUrl()} deltaColor="#7a86a1" icon={<ServerIcon />} iconBg="#e0f2e9" iconColor="#059669" />
        <KpiCard label="Sesión" value="Activa" delta="Bearer token JWT" deltaColor="#7a86a1" icon={<ShieldIcon />} iconBg="#fef0dc" iconColor="#d97706" />
      </div>

      <div style={{ background: '#fff', border: '1px solid #e6eaf2', borderRadius: 16, padding: '18px 20px' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#07153a', marginBottom: 14 }}>Acciones rápidas</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <QuickAction onClick={() => setScreen('pacientes')} bg="#263c7a" icon={<SearchWhite />} label="Buscar paciente" />
          <QuickAction onClick={() => setScreen('citas')} bg="#66b6ff" icon={<CalendarWhite />} label="Agendar cita" />
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value, delta, deltaColor, icon, iconBg, iconColor }: {
  label: string; value: string; delta: string; deltaColor: string
  icon: ReactNode; iconBg: string; iconColor: string
}) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e6eaf2', borderRadius: 16, padding: '16px 16px 15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: '#7a86a1', fontWeight: 500 }}>{label}</span>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor }}>{icon}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#07153a', marginTop: 8 }}>{value}</div>
      <div style={{ fontSize: 11, color: deltaColor, fontWeight: 600, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{delta}</div>
    </div>
  )
}

function QuickAction({ onClick, bg, icon, label }: { onClick: () => void; bg: string; icon: ReactNode; label: string }) {
  return (
    <button onClick={onClick} className="gp-switch-btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, padding: 16, border: '1px solid #dbe3f4', borderRadius: 14, background: '#f7faff', cursor: 'pointer', textAlign: 'left' }}>
      <span style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#07153a' }}>{label}</span>
    </button>
  )
}

const UsersIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
const ServerIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="8" rx="2" /><rect x="2" y="13" width="20" height="8" rx="2" /><line x1="6" y1="7" x2="6.01" y2="7" /><line x1="6" y1="17" x2="6.01" y2="17" /></svg>
const ShieldIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
const SearchWhite = () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
const CalendarWhite = () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
