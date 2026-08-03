import { useEffect, useMemo, useState } from 'react'
import { Modal } from '../components/Modal'

type Prioridad = 'rojo' | 'naranja' | 'amarillo' | 'verde' | 'azul'
type Sexo = 'M' | 'F'
type Tab = 'todos' | 'sin-admision' | 'admisionados'

interface AdmisionInfo {
  destino: string
  servicio: string
  medico: string
  camaBox: string
  observaciones: string
  registradaTs: number
}

interface PacienteAdmision {
  id: string
  documento: string
  nombre: string
  edad: number
  sexo: Sexo
  prioridad: Prioridad
  motivo: string
  triajeTs: number
  admision: AdmisionInfo | null
}

const prioridadInfo: Record<Prioridad, { label: string; bg: string; text: string; dot: string; metaMin: number }> = {
  rojo: { label: 'Rojo · Resucitación', bg: '#fee2e2', text: '#b91c1c', dot: '#dc2626', metaMin: 0 },
  naranja: { label: 'Naranja · Muy urgente', bg: '#ffedd5', text: '#c2410c', dot: '#f97316', metaMin: 10 },
  amarillo: { label: 'Amarillo · Urgente', bg: '#fef9c3', text: '#a16207', dot: '#eab308', metaMin: 60 },
  verde: { label: 'Verde · Poco urgente', bg: '#d1fae5', text: '#047857', dot: '#10b981', metaMin: 120 },
  azul: { label: 'Azul · No urgente', bg: '#dbeafe', text: '#1d4ed8', dot: '#3b82f6', metaMin: 240 },
}

const destinoOptions = [
  'Emergencia – Observación',
  'Emergencia – Cirugía',
  'Hospitalización – Medicina interna',
  'UCI',
  'Alta con indicaciones',
]

function seedPacientes(): PacienteAdmision[] {
  const now = Date.now()
  return [
    {
      id: '1', documento: '45102233', nombre: 'Jorge Luis Quispe Ramos', edad: 39, sexo: 'M', prioridad: 'rojo',
      motivo: 'Politraumatismo por accidente de tránsito', triajeTs: now - 96 * 60_000, admision: null,
    },
    {
      id: '2', documento: '48930112', nombre: 'Renato Cabrera Soto', edad: 36, sexo: 'M', prioridad: 'naranja',
      motivo: 'Fractura expuesta de tibia tras caída', triajeTs: now - 120 * 60_000,
      admision: { destino: 'Emergencia – Cirugía', servicio: 'Cirugía general', medico: 'Dr. Hidalgo', camaBox: 'Box 3', observaciones: 'Estabilizado, en espera de sala de operaciones.', registradaTs: now - 40 * 60_000 },
    },
    {
      id: '3', documento: '40877612', nombre: 'María Elena Torres Bautista', edad: 60, sexo: 'F', prioridad: 'naranja',
      motivo: 'Dolor torácico opresivo de 40 minutos', triajeTs: now - 74 * 60_000, admision: null,
    },
    {
      id: '4', documento: '42678930', nombre: 'Rosa Chumpitaz León', edad: 68, sexo: 'F', prioridad: 'naranja',
      motivo: 'Disnea súbita y palidez', triajeTs: now - 24 * 60_000, admision: null,
    },
    {
      id: '5', documento: '44321098', nombre: 'Luis Fernández Paredes', edad: 45, sexo: 'M', prioridad: 'amarillo',
      motivo: 'Dolor abdominal difuso de 6 horas', triajeTs: now - 32 * 60_000, admision: null,
    },
    {
      id: '6', documento: '47765432', nombre: 'Ana Torres Vega', edad: 27, sexo: 'F', prioridad: 'verde',
      motivo: 'Cefalea leve sin signos de alarma', triajeTs: now - 15 * 60_000, admision: null,
    },
    {
      id: '7', documento: '43219087', nombre: 'Carlos Mendoza Ruiz', edad: 52, sexo: 'M', prioridad: 'amarillo',
      motivo: 'Dolor lumbar postraumático', triajeTs: now - 150 * 60_000,
      admision: { destino: 'Hospitalización – Medicina interna', servicio: 'Medicina interna', medico: 'Dra. Salazar', camaBox: 'Sala 204', observaciones: 'Ingresa para manejo de dolor y estudios de imagen.', registradaTs: now - 20 * 60_000 },
    },
  ]
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}min` : `${m} min`
}

export function Admisiones() {
  const [pacientes, setPacientes] = useState<PacienteAdmision[]>(seedPacientes)
  const [tab, setTab] = useState<Tab>('todos')
  const [busqueda, setBusqueda] = useState('')
  const [tick, setTick] = useState(0)

  const [pacienteAGenerar, setPacienteAGenerar] = useState<PacienteAdmision | null>(null)
  const [pacienteDetalle, setPacienteDetalle] = useState<PacienteAdmision | null>(null)

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30_000)
    return () => clearInterval(interval)
  }, [])

  const sinAdmision = pacientes.filter(p => !p.admision)
  const admisionados = pacientes.filter(p => p.admision)
  const prioridadAltaSinAdmitir = sinAdmision.filter(p => p.prioridad === 'rojo' || p.prioridad === 'naranja')

  const filtrados = useMemo(() => {
    const base = tab === 'todos' ? pacientes : tab === 'sin-admision' ? sinAdmision : admisionados
    const q = busqueda.trim().toLowerCase()
    if (!q) return base
    return base.filter(p => p.nombre.toLowerCase().includes(q) || p.documento.includes(q))
  }, [tab, busqueda, pacientes]) // eslint-disable-line react-hooks/exhaustive-deps

  function minutosTranscurridos(triajeTs: number): number {
    void tick
    return Math.max(0, Math.floor((Date.now() - triajeTs) / 60_000))
  }

  function horaTriaje(triajeTs: number): string {
    return new Date(triajeTs).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
  }

  function handleGenerarAdmision(id: string, admision: AdmisionInfo) {
    setPacientes(prev => prev.map(p => (p.id === id ? { ...p, admision } : p)))
    setPacienteAGenerar(null)
  }

  return (
    <div className="gp-in" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', color: '#7a86a1', textTransform: 'uppercase' }}>Bandeja en tiempo real</div>
        <h1 style={{ margin: '4px 0 6px', fontSize: 24, fontWeight: 700, color: '#07153a' }}>Pacientes post-triaje</h1>
        <p style={{ margin: 0, fontSize: 13, color: '#7a86a1', maxWidth: 640, lineHeight: 1.5 }}>
          Listado de pacientes que ya fueron evaluados en triaje. Los pacientes sin admisión registrada
          requieren generar su admisión de emergencia antes de continuar la atención.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        <StatCard label="Pacientes en bandeja" value={pacientes.length} unit="hoy" barColor="#07153a" />
        <StatCard label="Sin admisión" value={sinAdmision.length} unit="pendientes" barColor="#dc2626" />
        <StatCard label="Admisionados" value={admisionados.length} unit="registrados" barColor="#059669" />
        <StatCard label="Prioridad alta sin admitir" value={prioridadAltaSinAdmitir.length} unit="rojo / naranja" barColor="#dc2626" />
      </div>

      <div style={{ background: '#fff', border: '1px solid #e6eaf2', borderRadius: 16, padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 6, background: '#f3f5fb', padding: 5, borderRadius: 12 }}>
            <TabButton active={tab === 'todos'} onClick={() => setTab('todos')} label="Todos" count={pacientes.length} />
            <TabButton active={tab === 'sin-admision'} onClick={() => setTab('sin-admision')} label="Sin admisión" count={sinAdmision.length} />
            <TabButton active={tab === 'admisionados'} onClick={() => setTab('admisionados')} label="Admisionados" count={admisionados.length} />
          </div>

          <div style={{ position: 'relative' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a0bd" strokeWidth="2" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o DNI..."
              style={{ width: 260, padding: '9px 14px 9px 34px', border: '1px solid #e0e6f1', borderRadius: 11, fontSize: 13, background: '#f8fafc', color: '#07153a' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#7a86a1', fontWeight: 600, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.03em' }}>
                <th style={{ padding: '0 10px 10px' }}>Prioridad</th>
                <th style={{ padding: '0 10px 10px' }}>Paciente</th>
                <th style={{ padding: '0 10px 10px' }}>Motivo de consulta</th>
                <th style={{ padding: '0 10px 10px' }}>Hora triaje</th>
                <th style={{ padding: '0 10px 10px' }}>Tiempo transcurrido</th>
                <th style={{ padding: '0 10px 10px' }}>Estado</th>
                <th style={{ padding: '0 10px 10px', textAlign: 'right' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '20px 10px', color: '#94a0bd', textAlign: 'center' }}>No hay pacientes en esta bandeja.</td></tr>
              )}
              {filtrados.map(p => {
                const info = prioridadInfo[p.prioridad]
                const elapsed = minutosTranscurridos(p.triajeTs)
                const fueraDeMeta = !p.admision && elapsed > info.metaMin
                return (
                  <tr key={p.id} className="gp-row" style={{ borderTop: '1px solid #eef1f6' }}>
                    <td style={{ padding: '12px 10px', verticalAlign: 'top' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 999, background: info.bg, color: info.text, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: info.dot, flexShrink: 0 }} />
                        {info.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 600, color: '#07153a' }}>{p.nombre}</div>
                      <div style={{ fontSize: 12, color: '#7a86a1', marginTop: 2 }}>
                        DNI {p.documento} · {p.edad} años · {p.sexo === 'M' ? 'Masculino' : 'Femenino'}
                      </div>
                    </td>
                    <td style={{ padding: '12px 10px', verticalAlign: 'top', color: '#54617f', maxWidth: 260 }}>{p.motivo}</td>
                    <td style={{ padding: '12px 10px', verticalAlign: 'top', color: '#54617f' }}>{horaTriaje(p.triajeTs)}</td>
                    <td style={{ padding: '12px 10px', verticalAlign: 'top' }}>
                      <span style={{ color: fueraDeMeta ? '#dc2626' : '#54617f', fontWeight: fueraDeMeta ? 600 : 400 }}>
                        {formatDuration(elapsed)}{fueraDeMeta ? ' · fuera de meta' : ''}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', verticalAlign: 'top' }}>
                      {p.admision ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, background: '#d1fae5', color: '#047857', fontSize: 12, fontWeight: 700 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                          {p.admision.destino}
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', padding: '5px 12px', borderRadius: 999, background: '#fef3c7', color: '#b45309', fontSize: 12, fontWeight: 700 }}>Sin admisión</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 10px', verticalAlign: 'top', textAlign: 'right' }}>
                      {p.admision ? (
                        <button
                          onClick={() => setPacienteDetalle(p)}
                          className="gp-ghost-btn"
                          style={{ padding: '8px 16px', border: '1px solid #e0e6f1', borderRadius: 10, background: '#fff', fontSize: 12.5, fontWeight: 600, color: '#54617f', cursor: 'pointer' }}
                        >
                          Ver detalle
                        </button>
                      ) : (
                        <button
                          onClick={() => setPacienteAGenerar(p)}
                          className="gp-primary-btn"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 16px', background: '#263c7a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                          Generar admisión
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {pacienteAGenerar && (
        <GenerarAdmisionModal
          paciente={pacienteAGenerar}
          onClose={() => setPacienteAGenerar(null)}
          onSubmit={admision => handleGenerarAdmision(pacienteAGenerar.id, admision)}
        />
      )}

      {pacienteDetalle && (
        <DetalleAdmisionModal paciente={pacienteDetalle} onClose={() => setPacienteDetalle(null)} />
      )}
    </div>
  )
}

function StatCard({ label, value, unit, barColor }: { label: string; value: number; unit: string; barColor: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e6eaf2', borderLeft: `4px solid ${barColor}`, borderRadius: 16, padding: '16px 18px' }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em', color: '#94a0bd', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: '#07153a' }}>{value}</span>
        <span style={{ fontSize: 12.5, color: '#7a86a1' }}>{unit}</span>
      </div>
    </div>
  )
}

function TabButton({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      onClick={onClick}
      className="gp-switch-btn"
      style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', border: 'none', borderRadius: 9,
        background: active ? '#0f2a5c' : 'transparent', color: active ? '#fff' : '#54617f',
        fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
      }}
    >
      {label}
      <span style={{
        fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 999,
        background: active ? 'rgba(255,255,255,.18)' : '#e2e8f0', color: active ? '#fff' : '#54617f',
      }}>{count}</span>
    </button>
  )
}

function GenerarAdmisionModal({ paciente, onClose, onSubmit }: {
  paciente: PacienteAdmision
  onClose: () => void
  onSubmit: (admision: AdmisionInfo) => void
}) {
  const [destino, setDestino] = useState(destinoOptions[0])
  const [servicio, setServicio] = useState('')
  const [medico, setMedico] = useState('')
  const [camaBox, setCamaBox] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [error, setError] = useState('')

  function handleSubmit() {
    if (!servicio.trim() || !medico.trim() || !camaBox.trim()) {
      setError('Complete el servicio, médico responsable y cama/box.')
      return
    }
    onSubmit({ destino, servicio, medico, camaBox, observaciones, registradaTs: Date.now() })
  }

  const info = prioridadInfo[paciente.prioridad]

  return (
    <Modal title={`Generar admisión · ${paciente.nombre}`} subtitle={`DNI ${paciente.documento} · ${info.label}`} onClose={onClose} width={600}>
      <div style={{ marginBottom: 16, padding: 12, borderRadius: 11, background: '#f7faff', border: '1px solid #dbe3f4', fontSize: 12.5, color: '#54617f' }}>
        <strong style={{ color: '#07153a' }}>Motivo de consulta:</strong> {paciente.motivo}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <SelectField label="Destino" value={destino} onChange={setDestino} options={destinoOptions.map(d => ({ value: d, label: d }))} />
        <TextField label="Servicio / especialidad" value={servicio} onChange={v => { setServicio(v); setError('') }} placeholder="Ej: Cirugía general" />
        <TextField label="Médico responsable" value={medico} onChange={v => { setMedico(v); setError('') }} placeholder="Ej: Dr. Hidalgo" />
        <TextField label="Cama / box" value={camaBox} onChange={v => { setCamaBox(v); setError('') }} placeholder="Ej: Box 3" />
      </div>

      <div style={{ marginTop: 14 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#54617f', marginBottom: 6 }}>Observaciones</label>
        <textarea
          value={observaciones}
          onChange={e => setObservaciones(e.target.value)}
          placeholder="Indicaciones u observaciones para admisión"
          rows={3}
          style={{ width: '100%', padding: '10px 14px', border: '1px solid #d5dceb', borderRadius: 11, fontSize: 14, background: '#f8fafc', color: '#07153a', resize: 'vertical', fontFamily: 'inherit' }}
        />
      </div>

      {error && (
        <div style={{ marginTop: 16, background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', fontSize: 13, fontWeight: 500, padding: '10px 13px', borderRadius: 11 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
        <button onClick={onClose} className="gp-ghost-btn" style={{ padding: '10px 20px', border: '1px solid #e0e6f1', borderRadius: 11, background: '#fff', fontSize: 14, fontWeight: 600, color: '#54617f', cursor: 'pointer' }}>
          Cancelar
        </button>
        <button onClick={handleSubmit} className="gp-primary-btn" style={{ padding: '10px 22px', background: '#263c7a', color: '#fff', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Registrar admisión
        </button>
      </div>
    </Modal>
  )
}

function DetalleAdmisionModal({ paciente, onClose }: { paciente: PacienteAdmision; onClose: () => void }) {
  const info = prioridadInfo[paciente.prioridad]
  const admision = paciente.admision!

  return (
    <Modal title={`Admisión · ${paciente.nombre}`} subtitle={`DNI ${paciente.documento} · ${info.label}`} onClose={onClose} width={560}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 13, color: '#54617f' }}>
        <div><strong style={{ color: '#07153a' }}>Destino:</strong> {admision.destino}</div>
        <div><strong style={{ color: '#07153a' }}>Servicio:</strong> {admision.servicio}</div>
        <div><strong style={{ color: '#07153a' }}>Médico responsable:</strong> {admision.medico}</div>
        <div><strong style={{ color: '#07153a' }}>Cama / box:</strong> {admision.camaBox}</div>
        <div style={{ gridColumn: '1 / -1' }}><strong style={{ color: '#07153a' }}>Motivo de consulta:</strong> {paciente.motivo}</div>
        {admision.observaciones && (
          <div style={{ gridColumn: '1 / -1' }}><strong style={{ color: '#07153a' }}>Observaciones:</strong> {admision.observaciones}</div>
        )}
        <div style={{ gridColumn: '1 / -1' }}>
          <strong style={{ color: '#07153a' }}>Registrada:</strong> {new Date(admision.registradaTs).toLocaleString('es-PE')}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22 }}>
        <button onClick={onClose} className="gp-ghost-btn" style={{ padding: '10px 20px', border: '1px solid #e0e6f1', borderRadius: 11, background: '#fff', fontSize: 14, fontWeight: 600, color: '#54617f', cursor: 'pointer' }}>
          Cerrar
        </button>
      </div>
    </Modal>
  )
}

function TextField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#54617f', marginBottom: 6 }}>{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: '100%', padding: '10px 14px', border: '1px solid #d5dceb', borderRadius: 11, fontSize: 14, background: '#f8fafc', color: '#07153a' }}
      />
    </div>
  )
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#54617f', marginBottom: 6 }}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '10px 14px', border: '1px solid #d5dceb', borderRadius: 11, fontSize: 14, background: '#f8fafc', color: '#07153a' }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}
