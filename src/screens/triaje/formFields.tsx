import { useState } from 'react'

export function TextField({ label, value, onChange, placeholder, type = 'text', disabled, onEnter }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean; onEnter?: () => void
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#54617f', marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onEnter?.()}
        placeholder={placeholder}
        style={{ width: '100%', padding: '10px 14px', border: '1px solid #d5dceb', borderRadius: 11, fontSize: 14, background: disabled ? '#f3f5fb' : '#f8fafc', color: '#07153a' }}
      />
    </div>
  )
}

export function SelectField({ label, value, onChange, options, disabled }: {
  label: string; value: string | number; onChange: (v: string) => void; options: { value: string | number; label: string }[]; disabled?: boolean
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#54617f', marginBottom: 6 }}>{label}</label>
      <select
        value={String(value)}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '10px 14px', border: '1px solid #d5dceb', borderRadius: 11, fontSize: 14, background: disabled ? '#eef1f6' : '#f8fafc', color: '#07153a' }}
      >
        {options.map(o => <option key={String(o.value)} value={String(o.value)}>{o.label}</option>)}
      </select>
    </div>
  )
}

export function SearchableSelect({ label, options, value, onChange, placeholder = 'Seleccionar...' }: {
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [abierto, setAbierto] = useState(false)
  const [filtro, setFiltro] = useState('')
  const seleccionado = options.find(o => o.value === value)
  const filtrados = options.filter(o => o.label.toLowerCase().includes(filtro.toLowerCase()))

  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#54617f', marginBottom: 6 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => { setAbierto(v => !v); setFiltro('') }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
            padding: '10px 14px', border: '1px solid #d5dceb', borderRadius: 11, fontSize: 14,
            background: '#f8fafc', color: seleccionado ? '#07153a' : '#94a0bd', cursor: 'pointer', textAlign: 'left',
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{seleccionado ? seleccionado.label : placeholder}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ flexShrink: 0, transform: abierto ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}><path d="M6 9l6 6 6-6" /></svg>
        </button>
        {abierto && (
          <>
            <div style={{ position: 'relative' }}>
              <input
                autoFocus
                value={filtro}
                onChange={e => setFiltro(e.target.value)}
                placeholder="Buscar..."
                style={{ width: '100%', boxSizing: 'border-box', padding: '9px 14px', border: 'none', outline: 'none', fontSize: 14, background: '#fff' }}
              />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a0bd" strokeWidth="2.2" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
            </div>
            <div style={{ borderTop: '1px solid #e8ecf5', maxHeight: 180, overflowY: 'auto' }}>
              {filtrados.length === 0 && <div style={{ padding: '10px 14px', fontSize: 13, color: '#7a86a1' }}>Sin resultados</div>}
              {filtrados.map(o => (
                <div
                  key={o.value}
                  onClick={() => { onChange(o.value); setAbierto(false) }}
                  style={{ padding: '9px 14px', fontSize: 13.5, cursor: 'pointer', color: '#07153a', background: o.value === value ? '#eef1fb' : '#fff' }}
                  onMouseEnter={e => { e.currentTarget.style.background = o.value === value ? '#eef1fb' : '#eef3ff' }}
                  onMouseLeave={e => { e.currentTarget.style.background = o.value === value ? '#eef1fb' : '#fff' }}
                >
                  {o.label}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}