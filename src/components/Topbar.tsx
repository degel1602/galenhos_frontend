interface TopbarProps {
  title: string
  username: string | null
}

export function Topbar({ title, username }: TopbarProps) {
  return (
    <header style={{ height: 66, flexShrink: 0, background: '#fff', borderBottom: '1px solid #e3e8f2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px' }}>
      <div>
        <div style={{ fontSize: 11, color: '#94a0bd', fontWeight: 500, letterSpacing: '.04em' }}>GALENOS PRO</div>
        <h2 style={{ margin: '1px 0 0', fontSize: 19, fontWeight: 700, color: '#07153a' }}>{title}</h2>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#f3f5fb', border: '1px solid #e6eaf5', padding: '7px 14px', borderRadius: 12 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#07153a' }}>{username ?? 'Operador'}</span>
        </div>
      </div>
    </header>
  )
}
