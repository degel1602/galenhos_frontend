import { useEffect, useState } from 'react'
import { Modal } from '../components/ui/Modal'
import { getToken } from '../api/client'
import { FichaAdmisionModal } from '../reports/fichaAdmision/FichaAdmision'

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { accept: 'application/json', ...extra }
  const token = getToken()
  if (token) headers.authorization = `Bearer ${token}`
  return headers
}

interface PendienteAdmision {
  idTriaje: number
  IdpacienteTriaje: number
  IdPaciente: number | null
  NroDocumento: string | null
  Paciente: string
  Sexo: string | null
  prioridad: string | null
  idTiposGravedad: number | null
  IdTipoPrioridad: number | null
  TipoIngreso: string | null
  Descripcion: string | null
  Direccion: string | null
  EsAccidenteTransito: number | null
  IdFuenteFinanciamiento: number | null
  IdCuentaAtencion: number | null
  estado: string | null
  fecha_Triaje: string | null
}

const tipoPrioridadInfo: Record<number, { label: string; bg: string; text: string; dot: string }> = {
  1: { label: 'I. Emerg. o Gravedad', bg: '#fee2e2', text: '#b91c1c', dot: '#dc2626' },
  2: { label: 'II. Urgencia Mayor', bg: '#ffedd5', text: '#c2410c', dot: '#f97316' },
  3: { label: 'III. Urgencia Menor', bg: '#fef9c3', text: '#a16207', dot: '#eab308' },
  4: { label: 'IV. Patología Aguda Común', bg: '#d1fae5', text: '#047857', dot: '#10b981' },
  5: { label: 'Llegó Cadáver', bg: '#dbeafe', text: '#1d4ed8', dot: '#3b82f6' },
}

function formatFechaTriaje(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit' }) + ' ' + d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}

export function Admisiones() {
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [filtro, setFiltro] = useState('')
  const [idDepartamento, setIdDepartamento] = useState('0')
  const [idEspecialidad, setIdEspecialidad] = useState('0')
  const [idServicio, setIdServicio] = useState('0')
  const [departamentos, setDepartamentos] = useState<{ id: number; nombre: string }[]>([])
  const [especialidades, setEspecialidades] = useState<{ id: number; nombre: string }[]>([])
  const [servicios, setServicios] = useState<{ id: number; nombre: string }[]>([])

  const [items, setItems] = useState<PendienteAdmision[]>([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [buscar, setBuscar] = useState(false)
  const [pacienteAdmision, setPacienteAdmision] = useState<PendienteAdmision | null>(null)
  const [fichaCuenta, setFichaCuenta] = useState<number | null>(null)
  const [mensajeExito, setMensajeExito] = useState('')

  function handleAdmisionExitosa(mensaje: string) {
    setPacienteAdmision(null)
    setMensajeExito(mensaje)
    handleBuscar()
  }

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch('/api/v1/departamentos', { headers: authHeaders() }).then(r => r.json()),
      fetch('/api/v1/especialidades', { headers: authHeaders() }).then(r => r.json()),
      fetch('/api/v1/servicios/2', { headers: authHeaders() }).then(r => r.json()),
    ]).then(([dep, esp, srv]) => {
      if (cancelled) return
      const d = (dep?.data ?? []) as { id: number; nombre: string | null }[]
      setDepartamentos(d.map(i => ({ id: i.id, nombre: (i.nombre ?? '').trim() })).filter(i => i.nombre))
      const e = (esp?.data ?? []) as { id: number; nombre: string | null }[]
      setEspecialidades(e.map(i => ({ id: i.id, nombre: (i.nombre ?? '').trim() })).filter(i => i.nombre))
      const s = (srv?.data ?? []) as { id: number; nombre: string | null }[]
      setServicios(s.map(i => ({ id: i.id, nombre: (i.nombre ?? '').trim() })).filter(i => i.nombre))
    }).catch(() => { /* sin catálogos, se listan los filtros vacíos */ })
    return () => { cancelled = true }
  }, [])

  async function handleBuscar() {
    setCargando(true)
    setError('')
    setItems([])
    try {
      const qs = new URLSearchParams({
        fecha,
        idDepartamento,
        idEspecialidad,
        idServicio,
        idTipoServicio: '2',
      })
      if (filtro.trim()) qs.set('filtro', filtro.trim())
      const res = await fetch(`/api/v1/triaje/pendientes-admision?${qs.toString()}`, { headers: authHeaders() })
      if (!res.ok) throw new Error('No se pudo consultar los pendientes de admisión.')
      const env = await res.json()
      setItems((env?.data ?? []) as PendienteAdmision[])
      setBuscar(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error de conexión.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="gp-in" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', color: '#7a86a1', textTransform: 'uppercase' }}>Bandeja de admisión</div>
        <h1 style={{ margin: '4px 0 6px', fontSize: 24, fontWeight: 700, color: '#07153a' }}>Pacientes post-triaje sin admisión</h1>
        <p style={{ margin: 0, fontSize: 13, color: '#7a86a1', maxWidth: 640, lineHeight: 1.5 }}>
          Listado de pacientes ya triados que aún no tienen admisión registrada. Filtre por fecha, paciente,
          departamento, especialidad o consultorio para localizar la bandeja.
        </p>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e6eaf2', borderRadius: 16, padding: '18px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 1fr 1fr 1fr auto', gap: 10, alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#54617f', marginBottom: 6 }}>Fecha</label>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e0e6f1', borderRadius: 11, fontSize: 13.5, background: '#f8fafc', color: '#07153a' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#54617f', marginBottom: 6 }}>Paciente</label>
            <input
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleBuscar() }}
              placeholder="Buscar por nombre o documento..."
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #e0e6f1', borderRadius: 11, fontSize: 13.5, background: '#f8fafc', color: '#07153a' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#54617f', marginBottom: 6 }}>Departamento</label>
            <select value={idDepartamento} onChange={e => setIdDepartamento(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e6f1', borderRadius: 11, fontSize: 13.5, background: '#f8fafc', color: '#07153a' }}>
              <option value="0">Todos</option>
              {departamentos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#54617f', marginBottom: 6 }}>Especialidad</label>
            <select value={idEspecialidad} onChange={e => setIdEspecialidad(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e6f1', borderRadius: 11, fontSize: 13.5, background: '#f8fafc', color: '#07153a' }}>
              <option value="0">Todas</option>
              {especialidades.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#54617f', marginBottom: 6 }}>Consultorio</label>
            <select value={idServicio} onChange={e => setIdServicio(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e6f1', borderRadius: 11, fontSize: 13.5, background: '#f8fafc', color: '#07153a' }}>
              <option value="0">Todos</option>
              {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </div>

          <button
            onClick={handleBuscar}
            disabled={cargando}
            className="gp-primary-btn"
            style={{ display: 'flex', alignItems: 'center', gap: 7, height: 42, padding: '0 20px', background: '#263c7a', color: '#fff', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: cargando ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
            Buscar
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', fontSize: 13, fontWeight: 500, padding: '10px 13px', borderRadius: 11 }}>
          {error}
        </div>
      )}

      {mensajeExito && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', borderRadius: 13, background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', fontSize: 13.5, fontWeight: 600 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10" /><path d="M8 12.5l2.5 2.5L16 9.5" /></svg>
          {mensajeExito}
          <button onClick={() => setMensajeExito('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#047857', fontSize: 15, cursor: 'pointer', lineHeight: 1 }} aria-label="Cerrar">×</button>
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #e6eaf2', borderRadius: 16, padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#07153a' }}>Resultados</span>
            <span style={{ fontSize: 12.5, color: '#7a86a1' }}>
              {buscar ? `${items.length} paciente(s) sin admisión` : 'Complete los filtros y pulse Buscar.'}
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#7a86a1', fontWeight: 600, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.03em' }}>
                <th style={{ padding: '0 10px 10px' }}>Prioridad</th>
                <th style={{ padding: '0 10px 10px' }}>Paciente</th>
                <th style={{ padding: '0 10px 10px' }}>Documento</th>
                <th style={{ padding: '0 10px 10px' }}>Dirección</th>
                <th style={{ padding: '0 10px 10px' }}>Tipo ingreso</th>
                <th style={{ padding: '0 10px 10px' }}>Fecha triaje</th>
                <th style={{ padding: '0 10px 10px' }}>Estado</th>
                <th style={{ padding: '0 10px 10px', textAlign: 'right' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '20px 10px', color: '#94a0bd', textAlign: 'center' }}>
                  {cargando ? 'Consultando...' : buscar ? 'No se encontraron pacientes para los filtros aplicados.' : 'Realice una búsqueda para ver resultados.'}
                </td></tr>
              ) : (
                items.map(p => {
                  const prio = p.IdTipoPrioridad != null ? tipoPrioridadInfo[p.IdTipoPrioridad] : undefined
                  return (
                    <tr key={p.idTriaje} className="gp-row" style={{ borderTop: '1px solid #eef1f6' }}>
                      <td style={{ padding: '12px 10px', verticalAlign: 'top' }}>
                        {prio ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 999, background: prio.bg, color: prio.text, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: prio.dot, flexShrink: 0 }} />
                            {prio.label}
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: '#7a86a1' }}>{p.prioridad ?? '—'}</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 10px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 600, color: '#07153a' }}>{p.Paciente || 'Paciente NN'}</div>
                        <div style={{ fontSize: 12, color: '#7a86a1', marginTop: 2 }}>{p.Sexo ?? '—'}</div>
                      </td>
                      <td style={{ padding: '12px 10px', verticalAlign: 'top', color: '#54617f' }}>{p.NroDocumento ?? '—'}</td>
                      <td style={{ padding: '12px 10px', verticalAlign: 'top', color: '#54617f', maxWidth: 260 }}>{p.Direccion ?? '—'}</td>
                      <td style={{ padding: '12px 10px', verticalAlign: 'top', color: '#54617f' }}>{p.TipoIngreso ?? '—'}</td>
                      <td style={{ padding: '12px 10px', verticalAlign: 'top', color: '#54617f' }}>{formatFechaTriaje(p.fecha_Triaje)}</td>
                      <td style={{ padding: '12px 10px', verticalAlign: 'top' }}>
                        <span style={{ display: 'inline-flex', padding: '5px 12px', borderRadius: 999, background: p.estado === 'Registrado' ? '#d1fae5' : '#fef3c7', color: p.estado === 'Registrado' ? '#047857' : '#b45309', fontSize: 12, fontWeight: 700 }}>
                          {p.estado ?? '—'}
                        </span>
                      </td>
<td style={{ padding: '12px 10px', verticalAlign: 'top', textAlign: 'right' }}>
  {p.IdCuentaAtencion != null ? (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, background: '#d1fae5', color: '#047857', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
        Nro cuenta: {p.IdCuentaAtencion}
      </span>
      <button
        onClick={() => setFichaCuenta(p.IdCuentaAtencion)}
        className="gp-primary-btn"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#263c7a', color: '#fff', border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8M16 17H8M10 9H8" /></svg>
        Ficha admisión
      </button>
    </div>
  ) : (
    <button
      onClick={() => setPacienteAdmision(p)}
      className="gp-primary-btn"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 16px', background: '#263c7a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
      Para admisionar
    </button>
  )}
</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pacienteAdmision && (
        <DetallePacienteModal
          paciente={pacienteAdmision}
          onClose={() => setPacienteAdmision(null)}
          onSuccess={handleAdmisionExitosa}
        />
      )}

      {fichaCuenta != null && (
        <FichaAdmisionModal
          idCuentaAtencion={fichaCuenta}
          onClose={() => setFichaCuenta(null)}
        />
      )}
    </div>
  )
}

function DetallePacienteModal({ paciente, onClose, onSuccess }: { paciente: PendienteAdmision; onClose: () => void; onSuccess: (mensaje: string) => void }) {
  const [nombreAcompanante, setNombreAcompanante] = useState('')
  const [telefonoAcompanante, setTelefonoAcompanante] = useState('')
  const [direccionPaciente, setDireccionPaciente] = useState(paciente.Direccion ?? '')
  const [observacion, setObservacion] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  async function handleRegistrar() {
    setError('')
    setEnviando(true)
    try {
      const body = {
        idTriaje: paciente.idTriaje,
        idPacienteTriaje: paciente.IdpacienteTriaje,
        idEmpleado: 2937,
        nombreAcompanante: nombreAcompanante.trim() || null,
        telefonoAcompanante: telefonoAcompanante.trim() || null,
        direccionPaciente: direccionPaciente.trim() || null,
        observacion: observacion.trim() || null,
      }
      const res = await fetch(`/api/v1/triaje/admision`, {
        method: 'POST',
        headers: authHeaders({ 'content-type': 'application/json' }),
        body: JSON.stringify(body),
      })
      let env: any = null
      const raw = await res.text()
      try { env = raw ? JSON.parse(raw) : null } catch { env = null }
      const resultado = env?.data?.resultado ?? ''
      if (res.ok && /^OK/.test(resultado)) {
        const msg = resultado.replace(/^OK[;: ]*/i, '').trim()
        onSuccess(msg || 'Admisión generada correctamente. Se creó el número de cuenta.')
        return
      }
      const detalle = env?.error?.message ?? resultado ?? (res.status >= 400 ? `HTTP ${res.status}: ${raw.slice(0, 200)}` : 'No se pudo registrar la admisión.')
      setError(String(detalle).replace(/^Error[;: ]*/i, ''))
    } catch {
      setError('Error de conexión al registrar la admisión.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal title={paciente.Paciente || 'Paciente NN'} subtitle="Registrar admisión desde el triaje" onClose={onClose} width={560}>
      <div style={{ marginBottom: 18, padding: 14, borderRadius: 12, background: '#f0f4ff', border: '1px solid #dbe3f4' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#07153a', textTransform: 'uppercase', letterSpacing: '.01em' }}>{paciente.Paciente || 'Paciente NN'}</div>
        {paciente.NroDocumento && <div style={{ fontSize: 12.5, color: '#7a86a1', marginTop: 4 }}>Documento: {paciente.NroDocumento}</div>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <TextField label="Nombre del acompañante" value={nombreAcompanante} onChange={v => setNombreAcompanante(v)} placeholder="Ej: María Pérez" />
        <TextField label="Teléfono del acompañante" value={telefonoAcompanante} onChange={v => setTelefonoAcompanante(v)} placeholder="Ej: 987654321" />
      </div>

      <div style={{ marginTop: 14 }}>
        <TextField label="Dirección del paciente" value={direccionPaciente} onChange={v => setDireccionPaciente(v)} placeholder="Dirección del paciente" />
      </div>

      <div style={{ marginTop: 14 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#54617f', marginBottom: 6 }}>Observación</label>
        <textarea
          value={observacion}
          onChange={e => setObservacion(e.target.value)}
          placeholder="Observación de la admisión"
          rows={3}
          style={{ width: '100%', padding: '10px 14px', border: '1px solid #d5dceb', borderRadius: 11, fontSize: 14, background: '#f8fafc', color: '#07153a', resize: 'vertical', fontFamily: 'inherit' }}
        />
      </div>

      {error && (
        <div style={{ marginTop: 14, background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', fontSize: 13, fontWeight: 500, padding: '10px 13px', borderRadius: 11 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
        <button onClick={onClose} className="gp-ghost-btn" style={{ padding: '10px 20px', border: '1px solid #e0e6f1', borderRadius: 11, background: '#fff', fontSize: 14, fontWeight: 600, color: '#54617f', cursor: 'pointer' }}>
          Cancelar
        </button>
        <button onClick={handleRegistrar} disabled={enviando} className="gp-primary-btn" style={{ padding: '10px 22px', background: '#263c7a', color: '#fff', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: enviando ? 'wait' : 'pointer' }}>
          {enviando ? 'Registrando...' : 'Registrar admisión'}
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

