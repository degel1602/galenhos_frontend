import type { ReactNode } from 'react'

interface ModalProps {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  width?: number
}

export function Modal({ title, subtitle, onClose, children, width = 640 }: ModalProps) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(7,21,58,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 100 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="gp-pop"
        style={{ width: '100%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto', background: '#fff', borderRadius: 18, boxShadow: '0 20px 60px rgba(7,21,58,0.3)' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #eef1f6', position: 'sticky', top: 0, background: '#fff', borderRadius: '18px 18px 0 0' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#07153a' }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12.5, color: '#7a86a1', marginTop: 3 }}>{subtitle}</div>}
          </div>
          <button
            onClick={onClose}
            className="gp-ghost-btn"
            style={{ width: 32, height: 32, borderRadius: 9, border: '1px solid #e0e6f1', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#54617f', flexShrink: 0 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div style={{ padding: 24 }}>
          {children}
        </div>
      </div>
    </div>
  )
}
