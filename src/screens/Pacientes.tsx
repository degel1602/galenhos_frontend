import { useEffect, useState, useRef, type KeyboardEvent } from 'react'
import { Modal } from '../components/ui/Modal'
import { getToken } from '../api/client'

interface PacienteApi {
  patientId: number
  documentNumber: string
  historyNumber: string
  paternalSurname: string
  maternalSurname: string
  firstName: string
  secondName: string
  thirdName: string
  dateOfBirth: string
}

interface Filtros {
  documento: string
  historiaClinica: string
  apellidoPaterno: string
  apellidoMaterno: string
  nombres: string
}

interface NuevoPaciente {
  NroDocumento: string
  NroHistoriaClinica: string | null
  ApellidoPaterno: string
  ApellidoMaterno: string | null
  PrimerNombre: string
  SegundoNombre: string | null
  TercerNombre: string | null
  FechaNacimiento: string
  EstadoCivil: string | null
  Sexo: string | null
  codetni: string | null
  IdiomaMaterno: string | null
  GradoInstruccion: string | null
  Ocupacion: string | null
  TipoDocumento: string | null
  Email: string | null
  NombrePadre: string | null
  Celular: string | null
  Departamento: string | null
  Provincia: string | null
  Distrito: string | null
  CentroPoblado: string | null
  Pais: string | null
  Direccion: string | null
  Discapacidad: boolean
  Incapacidad: boolean
}

interface UbicacionItem {
  id: number
  nombre: string
}

const inputBaseStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #d5dceb',
  borderRadius: 11,
  fontSize: 14,
  background: '#f8fafc',
  color: '#07153a',
  boxSizing: 'border-box' as const,
}

const inputListaStyle = {
  ...inputBaseStyle,
  appearance: 'auto' as const,
  cursor: 'pointer',
}

function CampoTexto({ label, value, onChange, placeholder, type = 'text', required, onKeyDown, maxLength, onBlur }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  required?: boolean
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void
  maxLength?: number
  onBlur?: () => void
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#54617f' }}>
        {label}{required && <span style={{ color: '#dc2626' }}> *</span>}
      </span>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} onKeyDown={onKeyDown} onBlur={onBlur} placeholder={placeholder} maxLength={maxLength} style={inputBaseStyle} />
    </label>
  )
}

function CampoLista({
  label,
  value,
  required,
  onChange,
  options
}: {
  label: string
  value: string
  required?: boolean
  onChange: (v: string) => void
  options: string[]
}) {
  const [abierto, setAbierto] = useState(false)
  const [texto, setTexto] = useState('')
  const [editando, setEditando] = useState(false)
  const envoltorioRef = useRef<HTMLLabelElement>(null)

  const q = texto.trim().toLowerCase()
  const filtradas = q ? options.filter(o => o.toLowerCase().includes(q)) : options

  useEffect(() => {
    function cerrar(e: MouseEvent) {
      if (envoltorioRef.current && !envoltorioRef.current.contains(e.target as Node)) {
        setAbierto(false)
        setTexto('')
        setEditando(false)
      }
    }
    document.addEventListener('mousedown', cerrar)
    return () => document.removeEventListener('mousedown', cerrar)
  }, [])

  function seleccionar(o: string) {
    onChange(o)
    setAbierto(false)
    setTexto('')
    setEditando(false)
  }

  return (
    <label ref={envoltorioRef} style={{ display: 'flex', flexDirection: 'column', gap: 5, position: 'relative' }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#54617f' }}>
        {label}
        {required && <span style={{ color: '#dc2626' }}> *</span>}
      </span>

      <input
        value={editando ? texto : value}
        onChange={e => { setEditando(true); setTexto(e.target.value); setAbierto(true); }}
        onFocus={() => setAbierto(true)}
        placeholder="Escribir para filtrar…"
        autoComplete="off"
        style={{ ...inputListaStyle, paddingRight: 30 }}
      />

      {abierto && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, maxHeight: 210, overflowY: 'auto', background: '#fff', border: '1px solid #d5dceb', borderRadius: 11, boxShadow: '0 10px 30px rgba(7,21,58,.14)', zIndex: 60, padding: 6 }}>
          {filtradas.length === 0 ? (
            <div style={{ padding: '9px 12px', color: '#94a0bd', fontSize: 13 }}>Sin resultados</div>
          ) : filtradas.map(o => (
            <button
              key={o}
              type="button"
              onClick={() => seleccionar(o)}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: o === value ? '#eef3ff' : 'transparent', borderRadius: 8, fontSize: 13, color: '#07153a', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f2f5fb' }}
              onMouseLeave={e => { e.currentTarget.style.background = o === value ? '#eef3ff' : 'transparent' }}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </label>
  )
}

function CampoListaUbicacion({ label, value, onChange, items, cargando }: {
  label: string
  value: number | string
  onChange: (v: number | string) => void
  items: UbicacionItem[]
  cargando?: boolean
}) {
  const [abierto, setAbierto] = useState(false)
  const [texto, setTexto] = useState('')
  const [editando, setEditando] = useState(false)
  const envoltorioRef = useRef<HTMLLabelElement>(null)

  const seleccionado = items.find(it => it.id === value)?.nombre ?? ''
  const q = texto.trim().toLowerCase()
  const filtradas = q ? items.filter(it => it.nombre.toLowerCase().includes(q)) : items

  useEffect(() => {
    function cerrar(e: MouseEvent) {
      if (envoltorioRef.current && !envoltorioRef.current.contains(e.target as Node)) {
        setAbierto(false)
        setTexto('')
        setEditando(false)
      }
    }
    document.addEventListener('mousedown', cerrar)
    return () => document.removeEventListener('mousedown', cerrar)
  }, [])

  function seleccionar(it: UbicacionItem) {
    onChange(it.id)
    setAbierto(false)
    setTexto('')
    setEditando(false)
  }

  return (
    <label ref={envoltorioRef} style={{ display: 'flex', flexDirection: 'column', gap: 5, position: 'relative' }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#54617f' }}>{label}</span>

      <input
        value={editando ? texto : seleccionado}
        onChange={e => { setEditando(true); setTexto(e.target.value); setAbierto(true); }}
        onFocus={() => setAbierto(true)}
        placeholder={cargando ? 'Cargando…' : 'Escribir para filtrar…'}
        autoComplete="off"
        style={{ ...inputListaStyle, paddingRight: 30 }}
      />

      {abierto && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, maxHeight: 210, overflowY: 'auto', background: '#fff', border: '1px solid #d5dceb', borderRadius: 11, boxShadow: '0 10px 30px rgba(7,21,58,.14)', zIndex: 60, padding: 6 }}>
          {filtradas.length === 0 ? (
            <div style={{ padding: '9px 12px', color: '#94a0bd', fontSize: 13 }}>Sin resultados</div>
          ) : filtradas.map(it => (
            <button
              key={it.id}
              type="button"
              onClick={() => seleccionar(it)}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: it.id === value ? '#eef3ff' : 'transparent', borderRadius: 8, fontSize: 13, color: '#07153a', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f2f5fb' }}
              onMouseLeave={e => { e.currentTarget.style.background = it.id === value ? '#eef3ff' : 'transparent' }}
            >
              {it.nombre}
            </button>
          ))}
        </div>
      )}
    </label>
  )
}

const FILTROS_INICIALES: Filtros = {
  documento: '',
  historiaClinica: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  nombres: '',
}

function formatFecha(fecha: string): string {
  const [y, m, d] = fecha.split('-')
  if (!y || !m || !d) return fecha
  return `${d}/${m}/${y}`
}

async function leerApi<T>(res: Response): Promise<T> {
  const cuerpo = await res.json()
  if (!res.ok || !cuerpo.success) {
    throw new Error(cuerpo?.error?.message ?? 'Ocurrió un error al consultar.')
  }
  return cuerpo.data as T
}

// Todos los endpoints de negocio exigen el JWT (salvo login), igual que el
// resto de la aplicación vía src/api/client.ts.
function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { accept: 'application/json', ...extra }
  const token = getToken()
  if (token) headers.authorization = `Bearer ${token}`
  return headers
}

async function buscarPacientes(filtros: Filtros): Promise<PacienteApi[]> {
  const params = new URLSearchParams()
  if (filtros.documento.trim()) params.set('documento', filtros.documento.trim())
  if (filtros.historiaClinica.trim()) params.set('hc', filtros.historiaClinica.trim())
  if (filtros.apellidoPaterno.trim()) params.set('paterno', filtros.apellidoPaterno.trim())
  if (filtros.apellidoMaterno.trim()) params.set('materno', filtros.apellidoMaterno.trim())
  if (filtros.nombres.trim()) params.set('nombres', filtros.nombres.trim())

  const res = await fetch(`/api/v1/pacientes/buscar?${params.toString()}`, {
    headers: authHeaders(),
  })
  return leerApi<PacienteApi[]>(res)
}

interface ReniecDatos {
  apellidoPaterno?: string | null
  apellidoMaterno?: string | null
  nombres?: string | null
  primerNombre?: string | null
  segundoNombre?: string | null
  tercerNombre?: string | null
  fechaNacimiento?: string | null
  sexo?: string | null
}

async function consultarReniec(nroDocumento: string): Promise<ReniecDatos> {
  const res = await fetch(`/api/v1/reniec/${encodeURIComponent(nroDocumento)}?operacion=completo`, {
    headers: authHeaders(),
  })
  const cuerpo = await res.json().catch(() => ({}))
  if (!res.ok || !cuerpo?.success) {
    throw new Error(cuerpo?.error?.message ?? 'No se pudo consultar a la RENIEC.')
  }
  const data = cuerpo.data as { datos?: ReniecDatos }
  const d = data?.datos ?? {}
  return {
    apellidoPaterno: (d.apellidoPaterno ?? '').trim(),
    apellidoMaterno: (d.apellidoMaterno ?? '').trim(),
    nombres: (d.nombres ?? '').trim(),
    primerNombre: (d.primerNombre ?? '').trim(),
    segundoNombre: (d.segundoNombre ?? '').trim(),
    tercerNombre: (d.tercerNombre ?? '').trim(),
    fechaNacimiento: (d.fechaNacimiento ?? '').trim(),
    sexo: (d.sexo ?? '').trim(),
  }
}

async function consultarPacientePorDocumento(nroDocumento: string, idTipoDocIdentidad: number): Promise<PacienteApi | null> {
  const res = await fetch(`/api/v1/pacientes/por-documento?nroDocumento=${encodeURIComponent(nroDocumento)}&idTipoDocIdentidad=${idTipoDocIdentidad}`, {
    headers: authHeaders(),
  })
  if (res.status === 404) return null
  const cuerpo = await res.json().catch(() => ({}))
  if (!res.ok || !cuerpo?.success) {
    throw new Error(cuerpo?.error?.message ?? 'No se pudo consultar el paciente.')
  }
  return cuerpo.data as PacienteApi
}

async function registrarPaciente(payload: NuevoPaciente): Promise<PacienteApi> {
  const res = await fetch('/api/v1/pacientes', {
    method: 'POST',
    headers: authHeaders({ 'content-type': 'application/json' }),
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error(`No se pudo registrar el paciente (error ${res.status}).`)
  }
  return leerApi<PacienteApi>(res)
}

export function Pacientes() {
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIALES)
  const [buscando, setBuscando] = useState(false)
  const [resultados, setResultados] = useState<PacienteApi[] | null>(null)
  const [error, setError] = useState('')
  const [showRegistrar, setShowRegistrar] = useState(false)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [mensaje, setMensaje] = useState('')

  function setFiltro(key: keyof Filtros, value: string) {
    setFiltros(f => ({ ...f, [key]: value }))
    setError('')
  }

  const hayCriterios = Object.values(filtros).some(v => v.trim().length > 0)

  async function ejecutarBusqueda() {
    setBuscando(true)
    setError('')
    setResultados(null)
    try {
      setResultados(await buscarPacientes(filtros))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error al consultar los pacientes.')
    } finally {
      setBuscando(false)
    }
  }

  async function handleBuscar() {
    if (!hayCriterios) {
      setError('Ingrese al menos un criterio de búsqueda.')
      return
    }
    await ejecutarBusqueda()
  }

  function handleLimpiar() {
    setFiltros(FILTROS_INICIALES)
    setResultados(null)
    setError('')
  }

  async function handleGuardar(payload: NuevoPaciente) {
    await registrarPaciente(payload)
    setShowRegistrar(false)
    setMensaje('Paciente registrado correctamente.')
    setTimeout(() => setMensaje(''), 4000)
    if (hayCriterios) {
      void ejecutarBusqueda()
    } else {
      setResultados(null)
    }
  }

  async function handleEliminar(idPaciente: number) {
    if (!window.confirm(`¿Está seguro de eliminar al paciente ${idPaciente}?`)) return
    try {
      const res = await fetch(`/api/v1/pacientes/${idPaciente}`, { method: 'DELETE', headers: authHeaders() })
      if (!res.ok) {
        throw new Error(`No se pudo eliminar el paciente (error ${res.status}).`)
      }
      setMensaje('Paciente eliminado correctamente.')
      setTimeout(() => setMensaje(''), 4000)
      if (hayCriterios) {
        void ejecutarBusqueda()
      } else {
        setResultados(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error al eliminar el paciente.')
    }
  }

  const campos: { key: keyof Filtros; label: string; placeholder: string; numeric?: boolean; maxLength?: number }[] = [
    { key: 'documento', label: 'Nro. documento', placeholder: '', numeric: true, maxLength: 12 },
    { key: 'historiaClinica', label: 'Nro. historia clínica', placeholder: '', numeric: true , maxLength: 10},
    { key: 'apellidoPaterno', label: 'Apellido paterno', placeholder: '' , maxLength: 30},
    { key: 'apellidoMaterno', label: 'Apellido materno', placeholder: '' , maxLength: 30},
    { key: 'nombres', label: 'Nombres', placeholder: ''  , maxLength: 30},
  ]

  return (
    <div className="gp-in" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {mensaje && (
        <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', color: '#065f46', fontSize: 13, fontWeight: 600, padding: '11px 15px', borderRadius: 12 }}>
          {mensaje}
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #e6eaf2', borderRadius: 16, padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#07153a' }}>Buscar pacientes</div>
            <div style={{ fontSize: 12.5, color: '#7a86a1', marginTop: 2 }}>Complete al menos un criterio de búsqueda.</div>
          </div>
          <button
            onClick={() => setShowRegistrar(true)}
            className="gp-primary-btn"
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', background: '#263c7a', color: '#fff', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 5v14M5 12h14" /></svg>
            Agregar
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {campos.map(campo => (
            <label key={campo.key} style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: '1 1 180px', maxWidth: 220 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#54617f' }}>{campo.label}</span>
              <input
                value={filtros[campo.key]}
                onChange={e => setFiltro(campo.key, campo.numeric ? e.target.value.replace(/\D/g, '') : e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleBuscar()}
                placeholder={campo.placeholder}
                maxLength={campo.maxLength}
                style={{ padding: '10px 14px', border: '1px solid #d5dceb', borderRadius: 11, fontSize: 14, background: '#f8fafc', color: '#07153a' }}
              />
            </label>
          ))}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
            <button
              onClick={handleBuscar}
              disabled={buscando}
              className="gp-primary-btn"
              style={{ padding: '10px 22px', background: '#263c7a', color: '#fff', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              {buscando ? 'Buscando…' : 'Buscar'}
            </button>
            <button
              onClick={handleLimpiar}
              className="gp-ghost-btn"
              style={{ padding: '10px 18px', border: '1px solid #e0e6f1', borderRadius: 11, background: '#fff', fontSize: 13, fontWeight: 600, color: '#54617f', cursor: 'pointer' }}
            >
              Limpiar
            </button>
          </div>
        </div>

        {error && (
          <div style={{ marginTop: 14, background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', fontSize: 13, fontWeight: 500, padding: '10px 13px', borderRadius: 11 }}>
            {error}
          </div>
        )}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e6eaf2', borderRadius: 16, padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#07153a' }}>Resultados</div>
          {resultados && (
            <div style={{ fontSize: 12, color: '#7a86a1' }}>{resultados.length} registro{resultados.length === 1 ? '' : 's'}</div>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#7a86a1', fontWeight: 600, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.03em' }}>
                <th style={{ padding: '0 10px 10px' }}>Id paciente</th>
                <th style={{ padding: '0 10px 10px' }}>Documento</th>
                <th style={{ padding: '0 10px 10px' }}>Historia clínica</th>
                <th style={{ padding: '0 10px 10px' }}>Apellido paterno</th>
                <th style={{ padding: '0 10px 10px' }}>Apellido materno</th>
                <th style={{ padding: '0 10px 10px' }}>Nombres</th>
                <th style={{ padding: '0 10px 10px' }}>Fecha nacimiento</th>
                <th style={{ padding: '0 10px 10px', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {buscando && (
                <tr><td colSpan={8} style={{ padding: '18px 10px', color: '#94a0bd', textAlign: 'center' }}>Buscando…</td></tr>
              )}
              {!buscando && !resultados && (
                <tr><td colSpan={8} style={{ padding: '18px 10px', color: '#94a0bd', textAlign: 'center' }}>Ingrese al menos un criterio de búsqueda para consultar pacientes.</td></tr>
              )}
              {!buscando && resultados && resultados.length === 0 && (
                <tr><td colSpan={8} style={{ padding: '18px 10px', color: '#94a0bd', textAlign: 'center' }}>No se encontraron pacientes con los criterios ingresados.</td></tr>
              )}
              {!buscando && resultados?.map(p => (
                <tr key={p.patientId} className="gp-row" style={{ borderTop: '1px solid #eef1f6' }}>
                  <td style={{ padding: '10px', fontWeight: 600, color: '#07153a' }}>{p.patientId}</td>
                  <td style={{ padding: '10px', fontWeight: 600, color: '#07153a' }}>{p.documentNumber || '—'}</td>
                  <td style={{ padding: '10px', color: '#54617f' }}>{p.historyNumber || '—'}</td>
                  <td style={{ padding: '10px', color: '#54617f' }}>{p.paternalSurname || '—'}</td>
                  <td style={{ padding: '10px', color: '#54617f' }}>{p.maternalSurname || '—'}</td>
                  <td style={{ padding: '10px', color: '#54617f' }}>{[p.firstName, p.secondName, p.thirdName].filter(Boolean).join(' ') || '—'}</td>
                  <td style={{ padding: '10px', color: '#54617f' }}>{p.dateOfBirth ? formatFecha(p.dateOfBirth.slice(0, 10)) : '—'}</td>
                  <td style={{ padding: '10px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button
                        onClick={() => setEditandoId(p.patientId)}
                        title="Editar"
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 9, border: '1px solid #e0e6f1', background: '#fff', color: '#263c7a', cursor: 'pointer' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button
                        onClick={() => handleEliminar(p.patientId)}
                        title="Eliminar"
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 9, border: '1px solid #fee2e2', background: '#fff', color: '#dc2626', cursor: 'pointer' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showRegistrar && (
        <RegistrarPacienteModal
          onClose={() => setShowRegistrar(false)}
          onGuardar={handleGuardar}
        />
      )}

      {editandoId !== null && (
        <EditarPacienteModal
          idPaciente={editandoId}
          onClose={() => setEditandoId(null)}
          onGuardado={() => {
            setMensaje('El paciente ha sido actualizado correctamente.')
            setTimeout(() => setMensaje(''), 4500)
          }}
        />
      )}
    </div>
  )
}

function RegistrarPacienteModal({ onClose, onGuardar }: {
  onClose: () => void
  onGuardar: (payload: NuevoPaciente) => Promise<void>
}) {
  const [datos, setDatos] = useState({
    NroDocumento: '',
    NroHistoriaClinica: '',
    ApellidoPaterno: '',
    ApellidoMaterno: '',
    PrimerNombre: '',
    SegundoNombre: '',
    TercerNombre: '',
    FechaNacimiento: '',
    EstadoCivil: '',
    Sexo: '',
    codetni: '',
    IdiomaMaterno: '',
    GradoInstruccion: '',
    Ocupacion: '',
    TipoDocumento: '',
    Email: '',
    NombrePadre: '',
    Celular: '',
    Departamento: '',
    Provincia: '',
    Distrito: '',
    CentroPoblado: '',
    Pais: '',
    Direccion: '',
    Discapacidad: false,
    Incapacidad: false,
  })
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [consultando, setConsultando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [idiomas, setIdiomas] = useState<string[]>([])
  const [etnias, setEtnias] = useState<string[]>([])
  const [departamentos, setDepartamentos] = useState<UbicacionItem[]>([])
  const [provincias, setProvincias] = useState<UbicacionItem[]>([])
  const [distritos, setDistritos] = useState<UbicacionItem[]>([])
  const [centrosPoblados, setCentrosPoblados] = useState<UbicacionItem[]>([])
  const [paises, setPaises] = useState<UbicacionItem[]>([])
  const [selDepartamento, setSelDepartamento] = useState<number | string>('')
  const [selProvincia, setSelProvincia] = useState<number | string>('')
  const [selDistrito, setSelDistrito] = useState<number | string>('')
  const [selCentroPoblado, setSelCentroPoblado] = useState<number | string>('')
  const [selPais, setSelPais] = useState<number | string>('')
  const [cargandoDep, setCargandoDep] = useState(true)
  const [cargandoProv, setCargandoProv] = useState(false)
  const [cargandoDist, setCargandoDist] = useState(false)
  const [cargandoCP, setCargandoCP] = useState(false)
  const [cargandoPaises, setCargandoPaises] = useState(true)
  const [tiposSexo, setTiposSexo] = useState<string[]>([])
  const [estadosCivil, setEstadosCivil] = useState<string[]>([])
  const [gradosInstruccion, setGradosInstruccion] = useState<string[]>([])
  const [ocupaciones, setOcupaciones] = useState<string[]>([])
  const [tiposDocumentos, setTiposDocumentos] = useState<UbicacionItem[]>([])

  useEffect(() => {
    let cancelled = false
    fetch('/api/v1/tipos-documentos', { headers: authHeaders() })
      .then(res => res.json())
      .then((env: { success: boolean; data: { id: number; descripcion: string | null }[] }) => {
        if (!cancelled) setTiposDocumentos((env.data ?? []).map(i => ({ id: i.id, nombre: (i.descripcion ?? '').trim() })))
      })
      .catch(() => { /* si falla la carga no se listan tipos de documento */ })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch('/api/v1/idiomas', { headers: authHeaders() })
      .then(res => res.json())
      .then((env: { success: boolean; data: { id: number; lengua: string | null }[] }) => {
        if (!cancelled) setIdiomas((env.data ?? []).map(i => (i.lengua ?? '').trim()).filter(Boolean))
      })
      .catch(() => { /* si falla la carga no se muestran idiomas */ })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch('/api/v1/etnias', { headers: authHeaders() })
      .then(res => res.json())
      .then((env: { success: boolean; data: { codigo: string; descripcion: string | null }[] }) => {
        if (!cancelled) setEtnias((env.data ?? []).map(i => (i.descripcion ?? '').trim()).filter(Boolean))
      })
      .catch(() => { /* si falla la carga no se muestran etnias */ })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    setCargandoDep(true)
    fetch('/api/v1/departamentos', { headers: authHeaders() })
      .then(res => res.json())
      .then((env: { success: boolean; data: { id: number; nombre: string | null }[] }) => {
        if (!cancelled) setDepartamentos((env.data ?? []).map(d => ({ id: d.id, nombre: (d.nombre ?? '').trim() })))
      })
      .catch(() => { /* si falla la carga no se listan departamentos */ })
      .finally(() => { if (!cancelled) setCargandoDep(false) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    setCargandoPaises(true)
    fetch('/api/v1/paises', { headers: authHeaders() })
      .then(res => res.json())
      .then((env: { success: boolean; data: { id: number; nombre: string | null }[] }) => {
        if (!cancelled) setPaises((env.data ?? []).map(p => ({ id: p.id, nombre: (p.nombre ?? '').trim() })))
      })
      .catch(() => { /* si falla la carga no se listan países */ })
      .finally(() => { if (!cancelled) setCargandoPaises(false) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch('/api/v1/tipos-sexo', { headers: authHeaders() }).then(r => r.json()),
      fetch('/api/v1/estados-civil', { headers: authHeaders() }).then(r => r.json()),
      fetch('/api/v1/grados-instruccion', { headers: authHeaders() }).then(r => r.json()),
      fetch('/api/v1/ocupaciones', { headers: authHeaders() }).then(r => r.json()),
    ])
      .then(([sexo, ec, gi, oc]) => {
        if (cancelled) return
        const nombres = (arr: { id: number; descripcion: string | null }[]) => (arr ?? []).map(i => (i.descripcion ?? '').trim()).filter(Boolean)
        setTiposSexo(nombres(sexo.data ?? []))
        setEstadosCivil(nombres(ec.data ?? []))
        setGradosInstruccion(nombres(gi.data ?? []))
        setOcupaciones(nombres(oc.data ?? []))
      })
      .catch(() => { /* si falla la carga no se listan las opciones */ })
    return () => { cancelled = true }
  }, [])

  function setCampo(key: keyof typeof datos, value: string) {
    setDatos(d => ({ ...d, [key]: value }))
  }

  async function consultarPorDni(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    const dni = (e.target as HTMLInputElement).value.trim()
    if (!dni) return
    if (datos.TipoDocumento !== 'DNI') {
      setError('Para consultar la RENIEC el tipo de documento debe ser DNI.')
      return
    }
    setConsultando(true)
    setError('')
    setAviso('Consultando la RENIEC…')
    try {
      const r = await consultarReniec(dni)
      setDatos(d => ({
        ...d,
        PrimerNombre: (r.primerNombre ?? r.nombres ?? '').toUpperCase(),
        SegundoNombre: (r.segundoNombre ?? '').toUpperCase(),
        TercerNombre: (r.tercerNombre ?? '').toUpperCase(),
        ApellidoPaterno: (r.apellidoPaterno ?? '').toUpperCase(),
        ApellidoMaterno: (r.apellidoMaterno ?? '').toUpperCase(),
        FechaNacimiento: r.fechaNacimiento ?? '',
      }))
      setAviso('Datos obtenidos de la RENIEC. Revise y guarde.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo consultar a la RENIEC.')
    } finally {
      setConsultando(false)
    }
  }

  async function verificarDuplicado() {
    const nro = datos.NroDocumento.trim()
    if (!nro) return
    const tipo = tiposDocumentos.find(i => i.nombre === datos.TipoDocumento)
    if (!tipo) return
    setError('')
    setAviso('')
    try {
      const paciente = await consultarPacientePorDocumento(nro, tipo.id)
      if (!paciente) return
      setAviso(
        `Ya existe un paciente con el documento ${nro}. ` +
        `Datos: ${paciente.paternalSurname ?? ''} ${paciente.maternalSurname ?? ''}, ${paciente.firstName ?? ''} ${paciente.secondName ?? ''} (HC: ${paciente.historyNumber ?? 'N/A'}).`
      )
      setDatos(d => ({ ...d, NroDocumento: '' }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo verificar el documento.')
    }
  }

  async function cargarProvincias(idDepartamento: number) {
    setCargandoProv(true)
    setDistritos([])
    setSelDistrito('')
    setDatos(d => ({ ...d, Provincia: '', Distrito: '' }))
    try {
      const res = await fetch(`/api/v1/provincias/${idDepartamento}`, { headers: authHeaders() })
      const env = await res.json()
      if (!res.ok || !env.success) throw new Error()
      const data: { id: number; nombre: string | null }[] = env.data ?? []
      setProvincias(data.map(p => ({ id: p.id, nombre: (p.nombre ?? '').trim() })))
    } catch {
      setProvincias([])
    } finally {
      setCargandoProv(false)
    }
  }

  async function cargarDistritos(idProvincia: number) {
    setCargandoDist(true)
    setDatos(d => ({ ...d, Distrito: '', CentroPoblado: '' }))
    setCentrosPoblados([])
    setSelCentroPoblado('')
    try {
      const res = await fetch(`/api/v1/distritos/${idProvincia}`, { headers: authHeaders() })
      const env = await res.json()
      if (!res.ok || !env.success) throw new Error()
      const data: { id: number; nombre: string | null }[] = env.data ?? []
      setDistritos(data.map(d => ({ id: d.id, nombre: (d.nombre ?? '').trim() })))
    } catch {
      setDistritos([])
    } finally {
      setCargandoDist(false)
    }
  }

  async function cargarCentrosPoblados(idDistrito: number) {
    setCargandoCP(true)
    try {
      const res = await fetch(`/api/v1/centros-poblados/${idDistrito}`, { headers: authHeaders() })
      const env = await res.json()
      if (!res.ok || !env.success) throw new Error()
      const data: { id: number; nombre: string | null }[] = env.data ?? []
      setCentrosPoblados(data.map(d => ({ id: d.id, nombre: (d.nombre ?? '').trim() })))
    } catch {
      setCentrosPoblados([])
    } finally {
      setCargandoCP(false)
    }
  }

  function handleDepartamento(v: number | string) {
    const dep = departamentos.find(d => d.id === v)
    setSelDepartamento(v)
    setDatos(d => ({ ...d, Departamento: v === '' ? '' : dep?.nombre ?? '' }))
    setSelProvincia('')
    setSelDistrito('')
    setSelCentroPoblado('')
    setProvincias([])
    setDistritos([])
    setCentrosPoblados([])
    setDatos(d => ({ ...d, Provincia: '', Distrito: '', CentroPoblado: '' }))
    if (v !== '') void cargarProvincias(Number(v))
  }

  function handleProvincia(v: number | string) {
    const prov = provincias.find(p => p.id === v)
    setSelProvincia(v)
    setDatos(d => ({ ...d, Provincia: v === '' ? '' : prov?.nombre ?? '' }))
    setSelDistrito('')
    setSelCentroPoblado('')
    setDistritos([])
    setCentrosPoblados([])
    setDatos(d => ({ ...d, Distrito: '', CentroPoblado: '' }))
    if (v !== '') void cargarDistritos(Number(v))
  }

  function handleDistrito(v: number | string) {
    const dist = distritos.find(d => d.id === v)
    setSelDistrito(v)
    setDatos(d => ({ ...d, Distrito: v === '' ? '' : dist?.nombre ?? '' }))
    setSelCentroPoblado('')
    setCentrosPoblados([])
    setDatos(d => ({ ...d, CentroPoblado: '' }))
    if (v !== '') void cargarCentrosPoblados(Number(v))
  }

  function handleCentroPoblado(v: number | string) {
    const cp = centrosPoblados.find(c => c.id === v)
    setSelCentroPoblado(v)
    setDatos(d => ({ ...d, CentroPoblado: v === '' ? '' : cp?.nombre ?? '' }))
  }

  function handlePais(v: number | string) {
    const pais = paises.find(p => p.id === v)
    setSelPais(v)
    setDatos(d => ({ ...d, Pais: v === '' ? '' : pais?.nombre ?? '' }))
  }

  async function handleSubmit() {
    if (!datos.NroDocumento.trim() || !datos.ApellidoPaterno.trim() || !datos.ApellidoMaterno.trim() || !datos.PrimerNombre.trim() || !datos.TipoDocumento || !datos.Sexo || !datos.codetni || !datos.IdiomaMaterno || !datos.FechaNacimiento) {
      setError('Complete todos los campos obligatorios (*).')
      return
    }
    setGuardando(true)
    setError('')
    try {
      await onGuardar({
        NroDocumento: datos.NroDocumento.trim(),
        NroHistoriaClinica: datos.NroHistoriaClinica.trim() || null,
        ApellidoPaterno: datos.ApellidoPaterno.trim().toUpperCase(),
        ApellidoMaterno: datos.ApellidoMaterno.trim().toUpperCase() || null,
        PrimerNombre: datos.PrimerNombre.trim().toUpperCase(),
        SegundoNombre: datos.SegundoNombre.trim().toUpperCase() || null,
        TercerNombre: datos.TercerNombre.trim().toUpperCase() || null,
        FechaNacimiento: datos.FechaNacimiento,
        EstadoCivil: datos.EstadoCivil || null,
        Sexo: datos.Sexo || null,
        codetni: datos.codetni || null,
        IdiomaMaterno: datos.IdiomaMaterno || null,
        GradoInstruccion: datos.GradoInstruccion || null,
        Ocupacion: datos.Ocupacion || null,
        TipoDocumento: datos.TipoDocumento || null,
        Email: datos.Email.trim() || null,
        NombrePadre: datos.NombrePadre.trim().toUpperCase() || null,
        Celular: datos.Celular.trim() || null,
        Departamento: datos.Departamento || null,
        Provincia: datos.Provincia || null,
        Distrito: datos.Distrito || null,
        CentroPoblado: datos.CentroPoblado || null,
        Pais: datos.Pais || null,
        Direccion: datos.Direccion.trim() || null,
        Discapacidad: datos.Discapacidad,
        Incapacidad: datos.Incapacidad,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error al registrar el paciente.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal title="Registrar paciente" subtitle="Complete los datos del nuevo paciente." onClose={onClose} width={1040}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#263c7a', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 10 }}>
        Identificación
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
        <CampoLista label="Tipo de documento" value={datos.TipoDocumento} onChange={v => setCampo('TipoDocumento', v)} options={tiposDocumentos.map(i => i.nombre)} required />
        <CampoTexto label="Nro. documento" value={datos.NroDocumento}  onChange={v => setCampo('NroDocumento', v)} placeholder=""  required onKeyDown={consultarPorDni} onBlur={verificarDuplicado} maxLength={12} />        
        <CampoTexto label="Nro. historia clínica" value={datos.NroHistoriaClinica} onChange={v => setCampo('NroHistoriaClinica', v)} placeholder=""  maxLength={10} />
        <CampoTexto label="Apellido paterno" value={datos.ApellidoPaterno} onChange={v => setCampo('ApellidoPaterno', v)} placeholder="" required maxLength={30} />
        <CampoTexto label="Apellido materno" value={datos.ApellidoMaterno} onChange={v => setCampo('ApellidoMaterno', v)} placeholder="" required maxLength={30}/>
        <CampoTexto label="Primer nombre" value={datos.PrimerNombre} onChange={v => setCampo('PrimerNombre', v)} placeholder="" required maxLength={30}/>
        <CampoTexto label="Segundo nombre" value={datos.SegundoNombre} onChange={v => setCampo('SegundoNombre', v)} placeholder="" maxLength={30}/>
        <CampoTexto label="Tercer nombre" value={datos.TercerNombre} onChange={v => setCampo('TercerNombre', v)} placeholder="" maxLength={30}/>
        <CampoTexto label="Fecha de nacimiento" value={datos.FechaNacimiento} onChange={v => setCampo('FechaNacimiento', v)} type="date" required />
        <CampoLista label="Sexo" value={datos.Sexo} onChange={v => setCampo('Sexo', v)} options={tiposSexo} required />
        <CampoLista label="Estado civil" value={datos.EstadoCivil} onChange={v => setCampo('EstadoCivil', v)} options={estadosCivil} />
        <CampoLista label="Etnia" value={datos.codetni} onChange={v => setCampo('codetni', v)} options={etnias} required />
        <CampoLista label="Idioma materno" value={datos.IdiomaMaterno} onChange={v => setCampo('IdiomaMaterno', v)} options={idiomas} required />
        <CampoLista label="Grado de instrucción" value={datos.GradoInstruccion} onChange={v => setCampo('GradoInstruccion', v)} options={gradosInstruccion} />
        <CampoLista label="Ocupación" value={datos.Ocupacion} onChange={v => setCampo('Ocupacion', v)} options={ocupaciones} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, marginTop: 14 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: '#54617f', cursor: 'pointer' }}>
          <input type="checkbox" checked={datos.Discapacidad} onChange={e => setDatos(d => ({ ...d, Discapacidad: e.target.checked }))} style={{ width: 18, height: 18, accentColor: '#263c7a', cursor: 'pointer' }} />
          Discapacidad
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: '#54617f', cursor: 'pointer' }}>
          <input type="checkbox" checked={datos.Incapacidad} onChange={e => setDatos(d => ({ ...d, Incapacidad: e.target.checked }))} style={{ width: 18, height: 18, accentColor: '#263c7a', cursor: 'pointer' }} />
          Incapacidad
        </label>
      </div>          
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, color: '#263c7a', textTransform: 'uppercase', letterSpacing: '.04em', margin: '20px 0 10px' }}>
        Contacto y filiación
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
        <CampoTexto label="Email" value={datos.Email} onChange={v => setCampo('Email', v)} type="email" placeholder="ejemplo@correo.com" maxLength={40}/>
        <CampoTexto label="Celular" value={datos.Celular} onChange={v => setCampo('Celular', v)} type="tel" placeholder="Ej: 987654321" />
        <CampoTexto label="Nombre del padre" value={datos.NombrePadre} onChange={v => setCampo('NombrePadre', v)} placeholder="" maxLength={30}/>
        
      </div>


      <div style={{ fontSize: 12, fontWeight: 700, color: '#263c7a', textTransform: 'uppercase', letterSpacing: '.04em', margin: '20px 0 10px' }}>
        Ubicación geográfica
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
        <CampoListaUbicacion label="País" value={selPais} onChange={handlePais} items={paises} cargando={cargandoPaises} />
        <CampoListaUbicacion label="Departamento" value={selDepartamento} onChange={handleDepartamento} items={departamentos} cargando={cargandoDep} />
        <CampoListaUbicacion label="Provincia" value={selProvincia} onChange={handleProvincia} items={provincias} cargando={cargandoProv} />
        <CampoListaUbicacion label="Distrito" value={selDistrito} onChange={handleDistrito} items={distritos} cargando={cargandoDist} />
        <CampoListaUbicacion label="Centro poblado" value={selCentroPoblado} onChange={handleCentroPoblado} items={centrosPoblados} cargando={cargandoCP} />
        <CampoTexto label="Dirección" value={datos.Direccion} onChange={v => setCampo('Direccion', v)} placeholder="" maxLength={30} />
      </div>

      {aviso && (
        <div style={{ marginTop: 16, background: '#e0ecff', border: '1px solid #a8c4f5', color: '#1d3a8f', fontSize: 13, fontWeight: 500, padding: '10px 13px', borderRadius: 11 }}>
          {consultando ? 'Consultando la RENIEC…' : aviso}
        </div>
      )}

      {error && (
        <div style={{ marginTop: 16, background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', fontSize: 13, fontWeight: 500, padding: '10px 13px', borderRadius: 11 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
        <button
          onClick={onClose}
          disabled={guardando}
          className="gp-ghost-btn"
          style={{ padding: '10px 18px', border: '1px solid #e0e6f1', borderRadius: 11, background: '#fff', fontSize: 13, fontWeight: 600, color: '#54617f', cursor: 'pointer' }}
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={guardando}
          className="gp-primary-btn"
          style={{ padding: '10px 22px', background: '#263c7a', color: '#fff', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: guardando ? 'not-allowed' : 'pointer', opacity: guardando ? 0.6 : 1 }}
        >
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </Modal>
  )
}

interface DetallePaciente {
  patientId?: number
  documentNumber?: string | null
  historyNumber?: string | null
  paternalSurname?: string | null
  maternalSurname?: string | null
  firstName?: string | null
  secondName?: string | null
  thirdName?: string | null
  dateOfBirth?: string | null
  phone?: string | null
  homeAddress?: string | null
  autoGenerated?: string | null
  sexTypeId?: number | null
  originId?: number | null
  educationDegreeId?: number | null
  maritalStatusId?: number | null
  docIdentityId?: number | null
  occupationTypeId?: number | null
  birthCenterId?: number | null
  homeCenterId?: number | null
  fatherName?: string | null
  motherName?: string | null
  numberingTypeId?: number | null
  originCenterId?: number | null
  homeCountryId?: number | null
  originCountryId?: number | null
  birthCountryId?: number | null
  originDistrictId?: number | null
  homeDistrictId?: number | null
  birthDistrictId?: number | null
  ethnicityId?: string | number | null
  languageId?: number | null
  email?: string | null
  cellphone?: string | null
  stateId?: number | null
  insuranceTypeId?: number | null
  disabilityId?: number | null
  incapacityId?: number | null
}

async function cargarCatalogo<T>(url: string, map: (item: T) => UbicacionItem): Promise<UbicacionItem[]> {
  try {
    const res = await fetch(url, { headers: authHeaders() })
    if (!res.ok) return []
    const env = await res.json()
    const data = (env?.data ?? []) as T[]
    return data.map(map)
  } catch {
    return []
  }
}

function EditarPacienteModal({ idPaciente, onClose, onGuardado }: {
  idPaciente: number
  onClose: () => void
  onGuardado: () => void
}) {
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [consultando, setConsultando] = useState(false)
  const [detalle, setDetalle] = useState<DetallePaciente | null>(null)
  const [datos, setDatos] = useState({
    NroDocumento: '',
    NroHistoriaClinica: '',
    ApellidoPaterno: '',
    ApellidoMaterno: '',
    PrimerNombre: '',
    SegundoNombre: '',
    TercerNombre: '',
    FechaNacimiento: '',
    Email: '',
    Celular: '',
    NombrePadre: '',
    Direccion: '',
    Sexo: '',
    EstadoCivil: '',
    GradoInstruccion: '',
    Ocupacion: '',
    Etnia: '',
    IdiomaMaterno: '',
    Pais: '',
    TipoDocumento: '',
    Departamento: '',
    Provincia: '',
    Distrito: '',
    CentroPoblado: '',
    Discapacidad: false,
    Incapacidad: false,
  })
  const [tiposSexo, setTiposSexo] = useState<UbicacionItem[]>([])
  const [estadosCivil, setEstadosCivil] = useState<UbicacionItem[]>([])
  const [gradosInstruccion, setGradosInstruccion] = useState<UbicacionItem[]>([])
  const [ocupaciones, setOcupaciones] = useState<UbicacionItem[]>([])
  const [etnias, setEtnias] = useState<UbicacionItem[]>([])
  const [idiomas, setIdiomas] = useState<UbicacionItem[]>([])
  const [paises, setPaises] = useState<UbicacionItem[]>([])
  const [tiposDocumentos, setTiposDocumentos] = useState<UbicacionItem[]>([])
  const [departamentos, setDepartamentos] = useState<UbicacionItem[]>([])
  const [provincias, setProvincias] = useState<UbicacionItem[]>([])
  const [distritos, setDistritos] = useState<UbicacionItem[]>([])
  const [centrosPoblados, setCentrosPoblados] = useState<UbicacionItem[]>([])
  const [selPais, setSelPais] = useState<number | string>('')
  const [selDepartamento, setSelDepartamento] = useState<number | string>('')
  const [selProvincia, setSelProvincia] = useState<number | string>('')
  const [selDistrito, setSelDistrito] = useState<number | string>('')
  const [selCentroPoblado, setSelCentroPoblado] = useState<number | string>('')
  const [cargandoDep, setCargandoDep] = useState(true)
  const [cargandoProv, setCargandoProv] = useState(false)
  const [cargandoDist, setCargandoDist] = useState(false)
  const [cargandoCP, setCargandoCP] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function cargar() {
      try {
        const [detalle, sexo, ec, gi, oc, et, idm, pais, dep, tdoc] = await Promise.all([
          fetch(`/api/v1/pacientes/${idPaciente}`, { headers: authHeaders() }).then(r => r.json()),
          cargarCatalogo<{ id: number; descripcion: string | null }>('/api/v1/tipos-sexo', i => ({ id: i.id, nombre: (i.descripcion ?? '').trim() })),
          cargarCatalogo<{ id: number; descripcion: string | null }>('/api/v1/estados-civil', i => ({ id: i.id, nombre: (i.descripcion ?? '').trim() })),
          cargarCatalogo<{ id: number; descripcion: string | null }>('/api/v1/grados-instruccion', i => ({ id: i.id, nombre: (i.descripcion ?? '').trim() })),
          cargarCatalogo<{ id: number; descripcion: string | null }>('/api/v1/ocupaciones', i => ({ id: i.id, nombre: (i.descripcion ?? '').trim() })),
          cargarCatalogo<{ codigo: string; descripcion: string | null }>('/api/v1/etnias', i => ({ id: Number(i.codigo), nombre: (i.descripcion ?? '').trim() })),
          cargarCatalogo<{ id: number; lengua: string | null }>('/api/v1/idiomas', i => ({ id: i.id, nombre: (i.lengua ?? '').trim() })),
          cargarCatalogo<{ id: number; nombre: string | null }>('/api/v1/paises', i => ({ id: i.id, nombre: (i.nombre ?? '').trim() })),
          cargarCatalogo<{ id: number; nombre: string | null }>('/api/v1/departamentos', i => ({ id: i.id, nombre: (i.nombre ?? '').trim() })),
          cargarCatalogo<{ id: number; descripcion: string | null }>('/api/v1/tipos-documentos', i => ({ id: i.id, nombre: (i.descripcion ?? '').trim() })),
        ])
        if (cancelled) return

        const d = detalle.data as DetallePaciente
        const deptoId = d.homeDistrictId ? Math.floor(d.homeDistrictId / 10000) : null
        const provId = d.homeDistrictId ? Math.floor(d.homeDistrictId / 100) : null
        setDetalle(d)
        setDatos({
          NroDocumento: d.documentNumber ?? '',
          NroHistoriaClinica: d.historyNumber ?? '',
          ApellidoPaterno: d.paternalSurname ?? '',
          ApellidoMaterno: d.maternalSurname ?? '',
          PrimerNombre: d.firstName ?? '',
          SegundoNombre: d.secondName ?? '',
          TercerNombre: d.thirdName ?? '',
          FechaNacimiento: d.dateOfBirth ? d.dateOfBirth.slice(0, 10) : '',
          Email: d.email ?? '',
          Celular: d.cellphone ?? d.phone ?? '',
          NombrePadre: d.fatherName ?? '',
          Direccion: d.homeAddress ?? '',
          Sexo: sexo.find(i => i.id === d.sexTypeId)?.nombre ?? '',
          EstadoCivil: ec.find(i => i.id === d.maritalStatusId)?.nombre ?? '',
          GradoInstruccion: gi.find(i => i.id === d.educationDegreeId)?.nombre ?? '',
          Ocupacion: oc.find(i => i.id === d.occupationTypeId)?.nombre ?? '',
          TipoDocumento: tdoc.find(i => i.id === d.docIdentityId)?.nombre ?? '',
          Etnia: et.find(i => i.id === Number(d.ethnicityId))?.nombre ?? '',
          IdiomaMaterno: idm.find(i => i.id === d.languageId)?.nombre ?? '',
          Pais: pais.find(i => i.id === d.homeCountryId)?.nombre ?? '',
          Departamento: dep.find(i => i.id === deptoId)?.nombre ?? '',
          Provincia: '',
          Distrito: '',
          CentroPoblado: '',
          Discapacidad: Boolean(d.disabilityId),
          Incapacidad: Boolean(d.incapacityId),
        })
        setTiposSexo(sexo)
        setEstadosCivil(ec)
        setGradosInstruccion(gi)
        setOcupaciones(oc)
        setEtnias(et)
        setIdiomas(idm)
        setPaises(pais)
        setTiposDocumentos(tdoc)
        setDepartamentos(dep)
        setSelPais(d.homeCountryId ?? '')
        setSelDepartamento(deptoId ?? '')

        if (deptoId) {
          const provsEnv = await fetch(`/api/v1/provincias/${deptoId}`, { headers: authHeaders() }).then(r => r.json())
          if (cancelled) return
          const provsList: UbicacionItem[] = ((provsEnv.data ?? []) as { id: number; nombre: string | null }[]).map(p => ({ id: p.id, nombre: (p.nombre ?? '').trim() }))
          setProvincias(provsList)
          setSelProvincia(provId ?? '')
          setDatos(ds => ({ ...ds, Provincia: provsList.find(i => i.id === provId)?.nombre ?? '' }))

          if (provId) {
            const distsEnv = await fetch(`/api/v1/distritos/${provId}`, { headers: authHeaders() }).then(r => r.json())
            if (cancelled) return
            const distsList: UbicacionItem[] = ((distsEnv.data ?? []) as { id: number; nombre: string | null }[]).map(x => ({ id: x.id, nombre: (x.nombre ?? '').trim() }))
            setDistritos(distsList)
            setSelDistrito(d.homeDistrictId ?? '')
            setDatos(ds => ({ ...ds, Distrito: distsList.find(i => i.id === d.homeDistrictId)?.nombre ?? '' }))

            if (d.homeDistrictId) {
              const cpsEnv = await fetch(`/api/v1/centros-poblados/${d.homeDistrictId}`, { headers: authHeaders() }).then(r => r.json())
              if (cancelled) return
              const cpsList: UbicacionItem[] = ((cpsEnv.data ?? []) as { id: number; nombre: string | null }[]).map(x => ({ id: x.id, nombre: (x.nombre ?? '').trim() }))
              setCentrosPoblados(cpsList)
              setSelCentroPoblado(d.homeCenterId ?? '')
              setDatos(ds => ({ ...ds, CentroPoblado: cpsList.find(i => i.id === d.homeCenterId)?.nombre ?? '' }))
            }
          }
        }
      } catch {
        if (!cancelled) setError('No se pudo cargar la información del paciente.')
      } finally {
        if (!cancelled) { setCargando(false); setCargandoDep(false) }
      }
    }

    void cargar()
    return () => { cancelled = true }
  }, [idPaciente])

  function setCampo(key: keyof typeof datos, value: string) {
    setDatos(d => ({ ...d, [key]: value }))
  }

  async function consultarPorDni(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    const dni = (e.target as HTMLInputElement).value.trim()
    if (!dni) return
    if (datos.TipoDocumento !== 'DNI') {
      setError('Para consultar la RENIEC el tipo de documento debe ser DNI.')
      return
    }
    setConsultando(true)
    setError('')
    setAviso('Consultando la RENIEC…')
    try {
      const r = await consultarReniec(dni)
      setDatos(d => ({
        ...d,
        PrimerNombre: (r.primerNombre ?? r.nombres ?? '').toUpperCase(),
        SegundoNombre: (r.segundoNombre ?? '').toUpperCase(),
        TercerNombre: (r.tercerNombre ?? '').toUpperCase(),
        ApellidoPaterno: (r.apellidoPaterno ?? '').toUpperCase(),
        ApellidoMaterno: (r.apellidoMaterno ?? '').toUpperCase(),
        FechaNacimiento: r.fechaNacimiento ?? '',
      }))
      setAviso('Datos obtenidos de la RENIEC. Revise y guarde.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo consultar a la RENIEC.')
    } finally {
      setConsultando(false)
    }
  }

  async function verificarDuplicado() {
    const nro = datos.NroDocumento.trim()
    if (!nro) return
    const tipo = tiposDocumentos.find(i => i.nombre === datos.TipoDocumento)
    if (!tipo) return
    setError('')
    setAviso('')
    try {
      const paciente = await consultarPacientePorDocumento(nro, tipo.id)
      if (!paciente) return
      if (paciente.patientId === idPaciente) return
      setAviso(
        `Ya existe un paciente con el documento ${nro}. ` +
        `Datos: ${paciente.paternalSurname ?? ''} ${paciente.maternalSurname ?? ''}, ${paciente.firstName ?? ''} ${paciente.secondName ?? ''} (HC: ${paciente.historyNumber ?? 'N/A'}).`
      )
      setDatos(d => ({ ...d, NroDocumento: '' }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo verificar el documento.')
    }
  }

  async function cargarProvincias(idDepartamento: number) {
    setCargandoProv(true)
    setProvincias([])
    setSelProvincia('')
    setDistritos([])
    setSelDistrito('')
    setCentrosPoblados([])
    setSelCentroPoblado('')
    setDatos(d => ({ ...d, Provincia: '', Distrito: '', CentroPoblado: '' }))
    try {
      const res = await fetch(`/api/v1/provincias/${idDepartamento}`, { headers: authHeaders() })
      const env = await res.json()
      if (!res.ok || !env.success) throw new Error()
      const data: { id: number; nombre: string | null }[] = env.data ?? []
      setProvincias(data.map(p => ({ id: p.id, nombre: (p.nombre ?? '').trim() })))
    } catch {
      setProvincias([])
    } finally {
      setCargandoProv(false)
    }
  }

  async function cargarDistritos(idProvincia: number) {
    setCargandoDist(true)
    setDistritos([])
    setSelDistrito('')
    setCentrosPoblados([])
    setSelCentroPoblado('')
    setDatos(d => ({ ...d, Distrito: '', CentroPoblado: '' }))
    try {
      const res = await fetch(`/api/v1/distritos/${idProvincia}`, { headers: authHeaders() })
      const env = await res.json()
      if (!res.ok || !env.success) throw new Error()
      const data: { id: number; nombre: string | null }[] = env.data ?? []
      setDistritos(data.map(dist => ({ id: dist.id, nombre: (dist.nombre ?? '').trim() })))
    } catch {
      setDistritos([])
    } finally {
      setCargandoDist(false)
    }
  }

  async function cargarCentrosPoblados(idDistrito: number) {
    setCargandoCP(true)
    try {
      const res = await fetch(`/api/v1/centros-poblados/${idDistrito}`, { headers: authHeaders() })
      const env = await res.json()
      if (!res.ok || !env.success) throw new Error()
      const data: { id: number; nombre: string | null }[] = env.data ?? []
      setCentrosPoblados(data.map(cp => ({ id: cp.id, nombre: (cp.nombre ?? '').trim() })))
    } catch {
      setCentrosPoblados([])
    } finally {
      setCargandoCP(false)
    }
  }

  function handlePais(v: number | string) {
    const pais = paises.find(p => p.id === v)
    setSelPais(v)
    setDatos(d => ({ ...d, Pais: v === '' ? '' : pais?.nombre ?? '' }))
  }

  function handleDepartamento(v: number | string) {
    const dep = departamentos.find(d => d.id === v)
    setSelDepartamento(v)
    setDatos(d => ({ ...d, Departamento: v === '' ? '' : dep?.nombre ?? '' }))
    setSelProvincia('')
    setSelDistrito('')
    setSelCentroPoblado('')
    setProvincias([])
    setDistritos([])
    setCentrosPoblados([])
    setDatos(d => ({ ...d, Provincia: '', Distrito: '', CentroPoblado: '' }))
    if (v !== '') void cargarProvincias(Number(v))
  }

  function handleProvincia(v: number | string) {
    const prov = provincias.find(p => p.id === v)
    setSelProvincia(v)
    setDatos(d => ({ ...d, Provincia: v === '' ? '' : prov?.nombre ?? '' }))
    setSelDistrito('')
    setSelCentroPoblado('')
    setDistritos([])
    setCentrosPoblados([])
    setDatos(d => ({ ...d, Distrito: '', CentroPoblado: '' }))
    if (v !== '') void cargarDistritos(Number(v))
  }

  function handleDistrito(v: number | string) {
    const dist = distritos.find(d => d.id === v)
    setSelDistrito(v)
    setDatos(d => ({ ...d, Distrito: v === '' ? '' : dist?.nombre ?? '' }))
    setSelCentroPoblado('')
    setCentrosPoblados([])
    setDatos(d => ({ ...d, CentroPoblado: '' }))
    if (v !== '') void cargarCentrosPoblados(Number(v))
  }

  function handleCentroPoblado(v: number | string) {
    const cp = centrosPoblados.find(c => c.id === v)
    setSelCentroPoblado(v)
    setDatos(d => ({ ...d, CentroPoblado: v === '' ? '' : cp?.nombre ?? '' }))
  }

  async function handleGuardar() {
    if (!datos.NroDocumento.trim() || !datos.ApellidoPaterno.trim() || !datos.PrimerNombre.trim() || !datos.TipoDocumento || !datos.Sexo || !datos.Etnia || !datos.IdiomaMaterno || !datos.FechaNacimiento) {
      setError('Complete todos los campos obligatorios (*).')
      return
    }
    setGuardando(true)
    setError('')
    const d = detalle ?? {}
    const payload = {
      birthCountryId: d.birthCountryId ?? null,
      maternalSurname: datos.ApellidoMaterno.trim().toUpperCase() || null,
      homeAddress: datos.Direccion.trim() || null,
      originCountryId: d.originCountryId ?? null,
      paternalSurname: datos.ApellidoPaterno.trim().toUpperCase() || null,
      firstName: datos.PrimerNombre.trim().toUpperCase() || null,
      secondName: datos.SegundoNombre.trim().toUpperCase() || null,
      thirdName: datos.TercerNombre.trim().toUpperCase() || null,
      dateOfBirth: datos.FechaNacimiento ? `${datos.FechaNacimiento}T00:00:00Z` : (d.dateOfBirth ?? null),
      documentNumber: datos.NroDocumento.trim() || null,
      phone: d.phone ?? null,
      cellphone: datos.Celular.trim() || null,
      autoGenerated: d.autoGenerated ?? null,
      sexTypeId: datos.Sexo ? tiposSexo.find(i => i.nombre === datos.Sexo)?.id ?? null : null,
      originId: d.originId ?? null,
      educationDegreeId: datos.GradoInstruccion ? gradosInstruccion.find(i => i.nombre === datos.GradoInstruccion)?.id ?? null : null,
      maritalStatusId: datos.EstadoCivil ? estadosCivil.find(i => i.nombre === datos.EstadoCivil)?.id ?? null : null,
      docIdentityId: datos.TipoDocumento ? tiposDocumentos.find(i => i.nombre === datos.TipoDocumento)?.id ?? null : null,
      occupationTypeId: datos.Ocupacion ? ocupaciones.find(i => i.nombre === datos.Ocupacion)?.id ?? null : null,
      homeCenterId: selCentroPoblado === '' ? null : Number(selCentroPoblado),
      fatherName: datos.NombrePadre.trim().toUpperCase() || null,
      motherName: d.motherName ?? null,
      homeCountryId: selPais === '' ? null : Number(selPais),
      historyNumber: datos.NroHistoriaClinica.trim() ? Number(datos.NroHistoriaClinica.trim()) : null,
      birthCenterId: d.birthCenterId ?? null,
      originCenterId: d.originCenterId ?? null,
      originDistrictId: d.originDistrictId ?? null,
      homeDistrictId: selDistrito === '' ? null : Number(selDistrito),
      birthDistrictId: d.birthDistrictId ?? null,
      ethnicityId: datos.Etnia ? etnias.find(i => i.nombre === datos.Etnia)?.id?.toString() ?? null : null,
      languageId: datos.IdiomaMaterno ? idiomas.find(i => i.nombre === datos.IdiomaMaterno)?.id ?? null : null,
      email: datos.Email.trim() || null,
      disabilityId: datos.Discapacidad ? 1 : 0,
      incapacityId: datos.Incapacidad ? 1 : 0,
      auditUserId: d.stateId ?? null,
    }
    try {
      const res = await fetch(`/api/v1/pacientes/${idPaciente}`, {
        method: 'PUT',
        headers: authHeaders({ 'content-type': 'application/json' }),
        body: JSON.stringify(payload),
      })
      const env = await res.json().catch(() => ({}))
      if (!res.ok || !env?.success) {
        throw new Error(env?.error?.message ?? `No se pudo actualizar el paciente (error ${res.status}).`)
      }
      onGuardado()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo grabar el paciente. Ocurrió un error interno.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal title={`Editar paciente · ${idPaciente}`} subtitle="Datos cargados desde la API." onClose={onClose} width={1040}>
      {cargando ? (
        <div style={{ padding: '24px 0', color: '#94a0bd', textAlign: 'center', fontSize: 14 }}>Cargando datos del paciente…</div>
      ) : (
        <>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#263c7a', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 10 }}>
            Identificación
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
            <CampoLista label="Tipo de documento" value={datos.TipoDocumento} onChange={v => setCampo('TipoDocumento', v)}   options={tiposDocumentos.map(i => i.nombre)} required />
            <CampoTexto label="Nro. documento" value={datos.NroDocumento} onChange={v => setCampo('NroDocumento', v)} onKeyDown={consultarPorDni} onBlur={verificarDuplicado} maxLength={12} required/>            
            <CampoTexto label="Nro. historia clínica" value={datos.NroHistoriaClinica} onChange={v => setCampo('NroHistoriaClinica', v)} />
            <CampoTexto label="Apellido paterno" value={datos.ApellidoPaterno} onChange={v => setCampo('ApellidoPaterno', v)} required/>
            <CampoTexto label="Apellido materno" value={datos.ApellidoMaterno} onChange={v => setCampo('ApellidoMaterno', v)} required/>
            <CampoTexto label="Primer nombre" value={datos.PrimerNombre} onChange={v => setCampo('PrimerNombre', v)} required />
            <CampoTexto label="Segundo nombre" value={datos.SegundoNombre} onChange={v => setCampo('SegundoNombre', v)} />
            <CampoTexto label="Tercer nombre" value={datos.TercerNombre} onChange={v => setCampo('TercerNombre', v)} />
            <CampoTexto label="Fecha de nacimiento" value={datos.FechaNacimiento} onChange={v => setCampo('FechaNacimiento', v)} type="date" required />
            <CampoLista label="Sexo" value={datos.Sexo} onChange={v => setCampo('Sexo', v)}  options={tiposSexo.map(i => i.nombre)} required  />
            <CampoLista label="Estado civil" value={datos.EstadoCivil} onChange={v => setCampo('EstadoCivil', v)} options={estadosCivil.map(i => i.nombre)}  />
            <CampoLista label="Etnia" value={datos.Etnia} onChange={v => setCampo('Etnia', v)} options={etnias.map(i => i.nombre)} required/>
            <CampoLista label="Idioma materno" value={datos.IdiomaMaterno} onChange={v => setCampo('IdiomaMaterno', v)} options={idiomas.map(i => i.nombre)} required />
            <CampoLista label="Grado de instrucción" value={datos.GradoInstruccion} onChange={v => setCampo('GradoInstruccion', v)} options={gradosInstruccion.map(i => i.nombre)} />
            <CampoLista label="Ocupación" value={datos.Ocupacion} onChange={v => setCampo('Ocupacion', v)} options={ocupaciones.map(i => i.nombre)} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, marginTop: 14 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: '#54617f', cursor: 'pointer' }}>
              <input type="checkbox" checked={datos.Discapacidad} onChange={e => setDatos(d => ({ ...d, Discapacidad: e.target.checked }))} style={{ width: 18, height: 18, accentColor: '#263c7a', cursor: 'pointer' }} />
              Discapacidad
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: '#54617f', cursor: 'pointer' }}>
              <input type="checkbox" checked={datos.Incapacidad} onChange={e => setDatos(d => ({ ...d, Incapacidad: e.target.checked }))} style={{ width: 18, height: 18, accentColor: '#263c7a', cursor: 'pointer' }} />
              Incapacidad
            </label>
          </div>              
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: '#263c7a', textTransform: 'uppercase', letterSpacing: '.04em', margin: '20px 0 10px' }}>
            Contacto y filiación
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
            <CampoTexto label="Email" value={datos.Email} onChange={v => setCampo('Email', v)} type="email" />
            <CampoTexto label="Celular" value={datos.Celular} onChange={v => setCampo('Celular', v)} type="tel" />
            <CampoTexto label="Nombre del padre" value={datos.NombrePadre} onChange={v => setCampo('NombrePadre', v)} />
           
          </div>



          <div style={{ fontSize: 12, fontWeight: 700, color: '#263c7a', textTransform: 'uppercase', letterSpacing: '.04em', margin: '20px 0 10px' }}>
            Ubicación geográfica
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
            <CampoListaUbicacion label="País" value={selPais} onChange={handlePais} items={paises} />
            <CampoListaUbicacion label="Departamento" value={selDepartamento} onChange={handleDepartamento} items={departamentos} cargando={cargandoDep} />
            <CampoListaUbicacion label="Provincia" value={selProvincia} onChange={handleProvincia} items={provincias} cargando={cargandoProv} />
            <CampoListaUbicacion label="Distrito" value={selDistrito} onChange={handleDistrito} items={distritos} cargando={cargandoDist} />
            <CampoListaUbicacion label="Centro poblado" value={selCentroPoblado} onChange={handleCentroPoblado} items={centrosPoblados} cargando={cargandoCP} />
             <CampoTexto label="Dirección" value={datos.Direccion} onChange={v => setCampo('Direccion', v)} />
          </div>

          {aviso && (
            <div style={{ marginTop: 16, background: '#e0ecff', border: '1px solid #a8c4f5', color: '#1d3a8f', fontSize: 13, fontWeight: 500, padding: '10px 13px', borderRadius: 11 }}>
              {consultando ? 'Consultando la RENIEC…' : aviso}
            </div>
          )}

          {error && (
            <div style={{ marginTop: 16, background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', fontSize: 13, fontWeight: 500, padding: '10px 13px', borderRadius: 11 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button
              onClick={onClose}
              disabled={guardando}
              className="gp-ghost-btn"
              style={{ padding: '10px 18px', border: '1px solid #e0e6f1', borderRadius: 11, background: '#fff', fontSize: 13, fontWeight: 600, color: '#54617f', cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              disabled={guardando}
              className="gp-primary-btn"
              style={{ padding: '10px 22px', background: '#263c7a', color: '#fff', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: guardando ? 'not-allowed' : 'pointer', opacity: guardando ? 0.6 : 1 }}
            >
              {guardando ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}
