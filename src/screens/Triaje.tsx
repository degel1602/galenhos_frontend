import { useEffect, useState } from 'react'
import { Modal } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'
import { getToken } from '../api/client'
import { ReporteTriajeModal } from '../reports/triaje/ReporteTriaje'

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { accept: 'application/json', ...extra }
  const token = getToken()
  if (token) headers.authorization = `Bearer ${token}`
  return headers
}

type TipoDocumento = 'DNI' | 'CE' | 'PAS' | 'SIS' | 'SD'
type Estado = 'sin-triaje' | 'triado'
type Prioridad = 'rojo' | 'naranja' | 'amarillo' | 'verde' | 'azul'

interface TriajeEvaluacion {
  motivo: string
  pa: string
  fc: string
  fr: string
  temp: string
  spo2: string
  prioridad: Prioridad
}

interface PacienteTriaje {
  id: string
  codigo: string
  hcCodigo: string | null
  tipoDocumento: TipoDocumento
  documento: string | null
  nombre: string
  seguro: string | null
  arrivalTs: number
  estado: Estado
  evaluacion: TriajeEvaluacion | null
}

interface RegistroTriaje {
  idTriaje: number
  NroDocumento?: string | null
  Paciente?: string | null
  fecha_registro?: string
  Servicio?: string | null
  TipoGravedad?: string | null
  IdEstado?: number
}

const prioridadInfo: Record<Prioridad, { label: string; variant: 'danger' | 'warning' | 'info' | 'success' | 'neutral' }> = {
  rojo: { label: 'Rojo · Emergencia', variant: 'danger' },
  naranja: { label: 'Naranja · Muy urgente', variant: 'warning' },
  amarillo: { label: 'Amarillo · Urgente', variant: 'warning' },
  verde: { label: 'Verde · Poco urgente', variant: 'success' },
  azul: { label: 'Azul · No urgente', variant: 'info' },
}

const frecuenciaTiempoOptions = ['Minutos', 'Horas', 'Días', 'Semanas', 'Meses', 'Años']

const tipoPrioridadOptions: { id: string; label: string; color: string }[] = [
  { id: '1', label: 'I. Emerg. o Gravedad', color: '#3b82f6' },
  { id: '2', label: 'II. Urgencia Mayor', color: '#22c55e' },
  { id: '3', label: 'III. Urgencia Menor', color: '#eab308' },
  { id: '4', label: 'IV. Patología Aguda Común', color: '#f97316' },
  { id: '5', label: 'Llegó Cadáver', color: '#ef4444' },
]

function seedPacientes(): PacienteTriaje[] {
  const now = Date.now()
  return [
    {
      id: '1', codigo: 'TR-001', hcCodigo: 'HC-198822', tipoDocumento: 'DNI', documento: '45102233',
      nombre: 'Jorge Luis Quispe Ramos', seguro: 'SIS', arrivalTs: now - 18 * 60_000, estado: 'sin-triaje', evaluacion: null,
    },
    {
      id: '2', codigo: 'TR-002', hcCodigo: 'HC-190044', tipoDocumento: 'DNI', documento: '42678930',
      nombre: 'Rosa Chumpitaz León', seguro: 'SIS', arrivalTs: now - 9 * 60_000, estado: 'sin-triaje', evaluacion: null,
    },
    {
      id: '3', codigo: 'TR-003', hcCodigo: null, tipoDocumento: 'SD', documento: null,
      nombre: 'Paciente NN (varón adulto)', seguro: null, arrivalTs: now - 4 * 60_000, estado: 'sin-triaje', evaluacion: null,
    },
    {
      id: '4', codigo: 'TR-004', hcCodigo: 'HC-188213', tipoDocumento: 'DNI', documento: '41556678',
      nombre: 'Marco Antonio Effio Reyes', seguro: 'Particular', arrivalTs: now - 55 * 60_000, estado: 'triado',
      evaluacion: { motivo: 'Dolor abdominal', pa: '118/76', fc: '82', fr: '18', temp: '36.8', spo2: '98', prioridad: 'amarillo' },
    },
  ]
}

export function Triaje() {
  const [pacientes, setPacientes] = useState<PacienteTriaje[]>(seedPacientes)
  const [referenciasSisPendientes] = useState(1)

  const [showRegistrar, setShowRegistrar] = useState(false)
  const [pacienteEnTriaje, setPacienteEnTriaje] = useState<PacienteTriaje | null>(null)

  const [fini, setFini] = useState(new Date().toISOString().slice(0, 10))
  const [ffin, setFfin] = useState(new Date().toISOString().slice(0, 10))
  const [servicioFiltro, setServicioFiltro] = useState('')
  const [serviciosTriaje, setServiciosTriaje] = useState<UbicacionItem[]>([])
  const [triajesRegistrados, setTriajesRegistrados] = useState<RegistroTriaje[]>([])
  const [buscandoTriajes, setBuscandoTriajes] = useState(false)
  const [errorTriajes, setErrorTriajes] = useState('')
  const [reporteSeleccionado, setReporteSeleccionado] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    cargarCatalogo<{ id: number; nombre: string | null }>('/api/v1/servicios/2', i => ({ id: i.id, nombre: (i.nombre ?? '').trim() })).then(list => {
      if (!cancelled) setServiciosTriaje(list)
    })
    return () => { cancelled = true }
  }, [])

  async function buscarTriajesRegistrados() {
    setErrorTriajes('')
    setBuscandoTriajes(true)
    try {
      const params = new URLSearchParams({ fini, ffin, derivadoAServicio: servicioFiltro || '-100', idEstado: '-100' })
      const res = await fetch(`/api/v1/triaje?${params.toString()}`, { headers: authHeaders() })
      const env = await res.json().catch(() => null)
      if (!res.ok || !env?.success) {
        setErrorTriajes(env?.error?.message ?? 'No se pudo obtener los triajes registrados.')
        setTriajesRegistrados([])
        return
      }
      setTriajesRegistrados((env.data ?? []) as RegistroTriaje[])
    } catch {
      setErrorTriajes('No se pudo obtener los triajes registrados.')
      setTriajesRegistrados([])
    } finally {
      setBuscandoTriajes(false)
    }
  }

  const enEspera = pacientes.filter(p => p.estado === 'sin-triaje')
  const triadosHoy = pacientes.filter(p => p.estado === 'triado')

  function handleRegistrarPaciente(nuevo: Omit<PacienteTriaje, 'id' | 'codigo' | 'arrivalTs' | 'estado' | 'evaluacion'>) {
    const siguiente = pacientes.length + 1
    setPacientes(prev => [
      {
        ...nuevo,
        id: String(Date.now()),
        codigo: `TR-${String(siguiente).padStart(3, '0')}`,
        arrivalTs: Date.now(),
        estado: 'sin-triaje',
        evaluacion: null,
      },
      ...prev,
    ])
    setShowRegistrar(false)
  }

  function handleGuardarEvaluacion(id: string, evaluacion: TriajeEvaluacion) {
    setPacientes(prev => prev.map(p => (p.id === id ? { ...p, estado: 'triado', evaluacion } : p)))
    setPacienteEnTriaje(null)
  }

  return (
    <div className="gp-in" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', color: '#7a86a1', textTransform: 'uppercase' }}>Bandeja en tiempo real</div>
          <h1 style={{ margin: '4px 0 6px', fontSize: 24, fontWeight: 700, color: '#07153a' }}>Triaje de emergencia</h1>
          <p style={{ margin: 0, fontSize: 13, color: '#7a86a1', maxWidth: 620, lineHeight: 1.5 }}>
            Identifica al paciente por su documento, valida si ya existe en el sistema o crea su historia clínica,
            y registra la evaluación de triaje antes de enviarlo a admisión.
          </p>
        </div>
        <button
          onClick={() => setShowRegistrar(true)}
          className="gp-primary-btn"
          style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', background: '#0d9488', color: '#fff', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Registrar Triaje
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        <StatCard label="En bandeja hoy" value={pacientes.length} unit="pacientes" barColor="#07153a" />
        <StatCard label="En espera de triaje" value={enEspera.length} unit="pendientes" barColor="#dc2626" />
        <StatCard label="Triados hoy" value={triadosHoy.length} unit="completados" barColor="#059669" />
        <StatCard label="Referencias SIS pendientes" value={referenciasSisPendientes} unit="por atender" barColor="#7c3aed" />
      </div>

      <div style={{ background: '#fff', border: '1px solid #e6eaf2', borderRadius: 16, padding: '18px 20px' }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', color: '#7a86a1', textTransform: 'uppercase' }}>Consulta</div>
          <h2 style={{ margin: '4px 0 2px', fontSize: 18, fontWeight: 700, color: '#07153a' }}>Triajes registrados</h2>
          <p style={{ margin: 0, fontSize: 12.5, color: '#7a86a1' }}>Filtre por rango de fechas y servicio de derivación.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'end', marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#54617f', marginBottom: 6 }}>Fecha inicio</label>
            <input type="date" value={fini} onChange={e => setFini(e.target.value)} style={{ width: '100%', padding: '9px 14px', border: '1px solid #d5dceb', borderRadius: 11, fontSize: 14, background: '#f8fafc', color: '#07153a' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#54617f', marginBottom: 6 }}>Fecha fin</label>
            <input type="date" value={ffin} onChange={e => setFfin(e.target.value)} style={{ width: '100%', padding: '9px 14px', border: '1px solid #d5dceb', borderRadius: 11, fontSize: 14, background: '#f8fafc', color: '#07153a' }} />
          </div>
          <SelectField
            label="Servicio derivado"
            value={servicioFiltro}
            onChange={v => setServicioFiltro(v)}
            options={[{ value: '', label: 'Todos' }, ...serviciosTriaje.map(s => ({ value: String(s.id), label: s.nombre }))]}
          />
          <button
            onClick={buscarTriajesRegistrados}
            disabled={buscandoTriajes}
            className="gp-primary-btn"
            style={{ display: 'flex', alignItems: 'center', gap: 7, height: 42, padding: '0 20px', background: '#263c7a', color: '#fff', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: buscandoTriajes ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">{buscandoTriajes ? <path d="M21 12a9 9 0 1 1-6.219-8.56" /> : <circle cx="11" cy="11" r="7" />}{!buscandoTriajes && <path d="M21 21l-4.3-4.3" />}</svg>
            {buscandoTriajes ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {errorTriajes && (
          <div style={{ marginBottom: 12, background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', fontSize: 13, fontWeight: 500, padding: '10px 13px', borderRadius: 11 }}>
            {errorTriajes}
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#7a86a1', fontWeight: 600, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.03em' }}>
                <th style={{ padding: '0 10px 10px' }}>N.º Triaje</th>
                <th style={{ padding: '0 10px 10px' }}>Documento</th>
                <th style={{ padding: '0 10px 10px' }}>Paciente</th>
                <th style={{ padding: '0 10px 10px' }}>Fecha registro</th>
                <th style={{ padding: '0 10px 10px' }}>Servicio</th>
                <th style={{ padding: '0 10px 10px' }}>Tipo gravedad</th>
                <th style={{ padding: '0 10px 10px' }}>Estado</th>
                <th style={{ padding: '0 10px 10px', textAlign: 'right' }}>Reporte</th>
              </tr>
            </thead>
            <tbody>
              {triajesRegistrados.length === 0 && (
                <tr><td colSpan={8} style={{ padding: '20px 10px', color: '#94a0bd', textAlign: 'center' }}>Realice una búsqueda para ver los triajes registrados.</td></tr>
              )}
              {triajesRegistrados.map(t => (
                <tr key={t.idTriaje} className="gp-row" style={{ borderTop: '1px solid #eef1f6' }}>
                  <td style={{ padding: '12px 10px', verticalAlign: 'top', fontWeight: 600, color: '#263c7a' }}>{t.idTriaje}</td>
                  <td style={{ padding: '12px 10px', verticalAlign: 'top', color: '#54617f' }}>{t.NroDocumento ?? '—'}</td>
                  <td style={{ padding: '12px 10px', verticalAlign: 'top', fontWeight: 600, color: '#07153a' }}>{t.Paciente ?? '—'}</td>
                  <td style={{ padding: '12px 10px', verticalAlign: 'top', color: '#54617f' }}>{t.fecha_registro ? new Date(t.fecha_registro).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }) : '—'}</td>
                  <td style={{ padding: '12px 10px', verticalAlign: 'top', color: '#54617f' }}>{t.Servicio ?? 'NO ASIGNADO'}</td>
                  <td style={{ padding: '12px 10px', verticalAlign: 'top', color: '#54617f' }}>{t.TipoGravedad ?? '—'}</td>
                  <td style={{ padding: '12px 10px', verticalAlign: 'top' }}>
                    <Badge variant={t.IdEstado === 1 ? 'success' : 'neutral'}>{t.IdEstado === 1 ? 'Activo' : 'Otro'}</Badge>
                  </td>
                  <td style={{ padding: '12px 10px', verticalAlign: 'top', textAlign: 'right' }}>
                    <button
                      onClick={() => setReporteSeleccionado(t.idTriaje)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#263c7a', color: '#fff', border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8M16 17H8M10 9H8" /></svg>
                      Reporte
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showRegistrar && (
        <RegistrarPacienteModal onClose={() => setShowRegistrar(false)} onSubmit={handleRegistrarPaciente} />
      )}

      {pacienteEnTriaje && (
        <EvaluacionTriajeModal
          paciente={pacienteEnTriaje}
          onClose={() => setPacienteEnTriaje(null)}
          onSubmit={evaluacion => handleGuardarEvaluacion(pacienteEnTriaje.id, evaluacion)}
        />
      )}

      {reporteSeleccionado && (
        <ReporteTriajeModal
          idTriaje={reporteSeleccionado}
          onClose={() => setReporteSeleccionado(null)}
        />
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

interface UbicacionItem {
  id: number
  nombre: string
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

async function consultarSis(nroDocumento: string, tipo: { nombre: string }): Promise<{
  afiliado: boolean
  descripcion?: string
  estado?: string
  apePaterno?: string
  apeMaterno?: string
  nombres?: string
  fechaNacimiento?: string
  genero?: string
  direccion?: string
} | null> {
  const nombre = tipo.nombre.toUpperCase()
  if (nombre !== 'DNI' && !nombre.includes('EXTRANJER')) return null
  const strTipoDocumento = nombre.includes('EXTRANJER') ? 3 : 1
  const res = await fetch(`/api/v1/sis/afiliado/${encodeURIComponent(nroDocumento)}?strTipoDocumento=${strTipoDocumento}&intOpcion=1`, { headers: authHeaders() })
  const env = await res.json().catch(() => null)
  const data = env?.data as {
    estado?: string
    descTipoSeguro?: string
    apePaterno?: string
    apeMaterno?: string
    nombres?: string
    fecNacimiento?: string
    genero?: string
    direccion?: string
  } | undefined
  if (!data?.estado) return null
  const afiliado = data.estado.toUpperCase() === 'ACTIVO'
  return {
    afiliado,
    descripcion: data.descTipoSeguro ?? '',
    estado: data.estado,
    apePaterno: data.apePaterno,
    apeMaterno: data.apeMaterno,
    nombres: data.nombres,
    fechaNacimiento: data.fecNacimiento,
    genero: data.genero,
    direccion: data.direccion,
  }
}

function RegistrarPacienteModal({ onClose, onSubmit }: {
  onClose: () => void
  onSubmit: (nuevo: Omit<PacienteTriaje, 'id' | 'codigo' | 'arrivalTs' | 'estado' | 'evaluacion'>) => void
}) {
  const [tipoDocumento, setTipoDocumento] = useState('')
  const [numeroDocumento, setNumeroDocumento] = useState('')
  const [buscado, setBuscado] = useState(false)
  const [buscando, setBuscando] = useState(false)
  const [esNuevo, setEsNuevo] = useState(false)
  const [hcNueva, setHcNueva] = useState('')
  const [error, setError] = useState('')
  const [esNN, setEsNN] = useState(false)
  const [reporteId, setReporteId] = useState<number | null>(null)

  const [apellidoPaterno, setApellidoPaterno] = useState('')
  const [apellidoMaterno, setApellidoMaterno] = useState('')
  const [primerNombre, setPrimerNombre] = useState('')
  const [segundoNombre, setSegundoNombre] = useState('')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [sexo, setSexo] = useState('')
  const [estadoCivil, setEstadoCivil] = useState('')
  const [telefono, setTelefono] = useState('')
  const [seguro, setSeguro] = useState('')
  const [direccion, setDireccion] = useState('')
  const [selDepartamento, setSelDepartamento] = useState<number | string>('')
  const [selProvincia, setSelProvincia] = useState<number | string>('')
  const [selDistrito, setSelDistrito] = useState<number | string>('')
  const [selCentroPoblado, setSelCentroPoblado] = useState<number | string>('')

  const [tiposDocumentos, setTiposDocumentos] = useState<UbicacionItem[]>([])
  const [sexos, setSexos] = useState<UbicacionItem[]>([])
  const [estadosCivil, setEstadosCivil] = useState<UbicacionItem[]>([])
  const [departamentos, setDepartamentos] = useState<UbicacionItem[]>([])
  const [provincias, setProvincias] = useState<UbicacionItem[]>([])
  const [distritos, setDistritos] = useState<UbicacionItem[]>([])
  const [centrosPoblados, setCentrosPoblados] = useState<UbicacionItem[]>([])
  const [fuentesFinanciamiento, setFuentesFinanciamiento] = useState<UbicacionItem[]>([])
  const [estadosLlego, setEstadosLlego] = useState<UbicacionItem[]>([])
  const [paso, setPaso] = useState<'paciente' | 'triaje'>('paciente')
  const [mostrarPaciente, setMostrarPaciente] = useState(true)
  const [accidenteTransito, setAccidenteTransito] = useState(false)
  const [comoLlego, setComoLlego] = useState('')
  const [fc, setFc] = useState('')
  const [temp, setTemp] = useState('')
  const [pa, setPa] = useState('')
  const [spo2, setSpo2] = useState('')
  const [fr, setFr] = useState('')
  const [fio2, setFio2] = useState('')
  const [peso, setPeso] = useState('')
  const [talla, setTalla] = useState('')
  const [imc, setImc] = useState('')
  const [sintomasPrincipales, setSintomasPrincipales] = useState('')
  const [tiempoSintomas, setTiempoSintomas] = useState('')
  const [frecuenciaTiempo, setFrecuenciaTiempo] = useState('')
  const [escalaDolor, setEscalaDolor] = useState('')
  const [escalaGlasgow, setEscalaGlasgow] = useState('')
  const [tipoPrioridad, setTipoPrioridad] = useState('')
  const [servicioDerivado, setServicioDerivado] = useState('')
  const [servicios, setServicios] = useState<UbicacionItem[]>([])
  const [sisInfo, setSisInfo] = useState<{ afiliado: boolean; descripcion?: string; estado?: string; apePaterno?: string; apeMaterno?: string; nombres?: string; fechaNacimiento?: string; genero?: string; direccion?: string } | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [resultadoMsg, setResultadoMsg] = useState<{ ok: boolean; texto: string } | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      cargarCatalogo<{ id: number; descripcion: string | null }>('/api/v1/tipos-documentos', i => ({ id: i.id, nombre: (i.descripcion ?? '').trim() })),
      cargarCatalogo<{ id: number; descripcion: string | null }>('/api/v1/tipos-sexo', i => ({ id: i.id, nombre: (i.descripcion ?? '').trim() })),
      cargarCatalogo<{ id: number; descripcion: string | null }>('/api/v1/estados-civil', i => ({ id: i.id, nombre: (i.descripcion ?? '').trim() })),
      cargarCatalogo<{ id: number; nombre: string | null }>('/api/v1/departamentos', i => ({ id: i.id, nombre: (i.nombre ?? '').trim() })),
      cargarCatalogo<{ idFuenteFinanciamiento: number; descripcion: string | null }>('/api/v1/fuentes-financiamiento', i => ({ id: i.idFuenteFinanciamiento, nombre: (i.descripcion ?? '').trim() })),
      cargarCatalogo<{ id: number; descripcion: string | null }>('/api/v1/estados-llego-paciente', i => ({ id: i.id, nombre: (i.descripcion ?? '').trim() })),
      cargarCatalogo<{ id: number; nombre: string | null }>('/api/v1/servicios/2', i => ({ id: i.id, nombre: (i.nombre ?? '').trim() })),
    ]).then(([td, s, ec, dep, ff, el, sv]) => {
      if (cancelled) return
      setTiposDocumentos(td.filter(t => t.nombre === 'DNI').concat(td.filter(t => t.nombre !== 'DNI')))
      setSexos(s)
      setEstadosCivil(ec)
      setDepartamentos(dep)
      setFuentesFinanciamiento(ff)
      setEstadosLlego(el)
      setServicios(sv.sort((a, b) => a.nombre.localeCompare(b.nombre)))
      const dni = td.find(t => t.nombre === 'DNI')
      setTipoDocumento(dni ? String(dni.id) : (td[0] ? String(td[0].id) : ''))
    })
    return () => { cancelled = true }
  }, [])

  async function cargarProvincias(idDepartamento: number) {
    setProvincias([])
    setSelProvincia('')
    setDistritos([])
    setSelDistrito('')
    setCentrosPoblados([])
    setSelCentroPoblado('')
    setProvincias(await cargarCatalogo<{ id: number; nombre: string | null }>(`/api/v1/provincias/${idDepartamento}`, i => ({ id: i.id, nombre: (i.nombre ?? '').trim() })))
  }

  async function cargarDistritos(idProvincia: number) {
    setDistritos([])
    setSelDistrito('')
    setCentrosPoblados([])
    setSelCentroPoblado('')
    setDistritos(await cargarCatalogo<{ id: number; nombre: string | null }>(`/api/v1/distritos/${idProvincia}`, i => ({ id: i.id, nombre: (i.nombre ?? '').trim() })))
  }

  async function cargarCentrosPoblados(idDistrito: number) {
    setCentrosPoblados([])
    setSelCentroPoblado('')
    setCentrosPoblados(await cargarCatalogo<{ id: number; nombre: string | null }>(`/api/v1/centros-poblados/${idDistrito}`, i => ({ id: i.id, nombre: (i.nombre ?? '').trim() })))
  }

  function handleTipoDocumentoChange(v: string) {
    setTipoDocumento(v)
    setBuscado(false)
    setEsNuevo(false)
    setError('')
    setNumeroDocumento('')
  }

  function handleToggleNN(activo: boolean) {
    setEsNN(activo)
    setBuscado(false)
    setEsNuevo(false)
    setError('')
    setSisInfo(null)
    if (activo) {
      const sd = tiposDocumentos.find(t => t.nombre.toUpperCase() === 'SD')
      setTipoDocumento(sd ? String(sd.id) : '')
      setNumeroDocumento('')
      setApellidoPaterno('NN')
      setApellidoMaterno('NN')
      setPrimerNombre('NN')
      setSegundoNombre('')
      setHcNueva(`HC-${210000 + Math.floor(Math.random() * 9000)}`)
      setEsNuevo(true)
      setBuscado(true)
      setSeguro(idFuenteFinanciamiento('PARTICULAR'))
    } else {
      setTipoDocumento('')
      setNumeroDocumento('')
      setApellidoPaterno('')
      setApellidoMaterno('')
      setPrimerNombre('')
      setSegundoNombre('')
    }
  }

  function calcularImc(pesoV: string, tallaV: string): string {
    const p = parseFloat(pesoV)
    const t = parseFloat(tallaV)
    if (!p || !t || p <= 0 || t <= 0) return ''
    const imc = p / Math.pow(t / 100, 2)
    return imc.toFixed(1)
  }

  function idFuenteFinanciamiento(busca: string): string {
    const f = fuentesFinanciamiento.find(x => x.nombre.toUpperCase().includes(busca.toUpperCase()))
    return f ? String(f.id) : ''
  }

  function seguroPorDefecto(afiliadoSis: boolean | null): string {
    if (accidenteTransito) return idFuenteFinanciamiento('SOAT')
    if (afiliadoSis) return idFuenteFinanciamiento('SIS')
    return idFuenteFinanciamiento('PARTICULAR')
  }

  function toggleAccidente() {
    const nuevo = !accidenteTransito
    setAccidenteTransito(nuevo)
    setSeguro(nuevo ? idFuenteFinanciamiento('SOAT') : idFuenteFinanciamiento('PARTICULAR'))
  }

  function limpiarFormulario() {
    setApellidoPaterno('')
    setApellidoMaterno('')
    setPrimerNombre('')
    setSegundoNombre('')
    setFechaNacimiento('')
    setSexo('')
    setEstadoCivil('')
    setTelefono('')
    setSeguro('')
    setDireccion('')
    setSelDepartamento('')
    setSelProvincia('')
    setSelDistrito('')
    setSelCentroPoblado('')
    setProvincias([])
    setDistritos([])
    setCentrosPoblados([])
  }

  async function consultarReniec(dni: string): Promise<boolean> {
    const res = await fetch(`/api/v1/reniec/${encodeURIComponent(dni)}?operacion=completo`, { headers: authHeaders() })
    if (!res.ok) throw new Error('No se pudo consultar a la RENIEC.')
    const env = await res.json()
    const d = (env?.data?.datos ?? {}) as {
      apellidoPaterno?: string
      apellidoMaterno?: string
      nombres?: string
      primerNombre?: string
      segundoNombre?: string
      tercerNombre?: string
      fechaNacimiento?: string
      sexo?: string
    }
    setApellidoPaterno((d.apellidoPaterno ?? '').trim().toUpperCase())
    setApellidoMaterno((d.apellidoMaterno ?? '').trim().toUpperCase())
    setPrimerNombre((d.primerNombre ?? d.nombres ?? '').trim().toUpperCase())
    setSegundoNombre((d.tercerNombre ? `${d.segundoNombre ?? ''} ${d.tercerNombre}` : (d.segundoNombre ?? '')).trim().toUpperCase())
    setFechaNacimiento(d.fechaNacimiento ?? '')
    const sexoNombre = (d.sexo ?? '').trim().toLowerCase()
    setSexo(sexoNombre.startsWith('m') ? sexos.find(s => s.nombre.toLowerCase() === 'masculino') ? (sexos.find(s => s.nombre.toLowerCase() === 'masculino')!.id).toString() : '' : sexoNombre.startsWith('f') ? sexos.find(s => s.nombre.toLowerCase() === 'femenino')?.id?.toString() ?? '' : '')
    return Boolean((d.apellidoPaterno ?? '').trim() || (d.primerNombre ?? d.nombres ?? '').trim())
  }

  async function cargarPoblarUbicacion(homeDistrictId: number | undefined, homeCenterId: number | undefined) {
    if (!homeDistrictId) {
      setSelDepartamento('')
      setSelProvincia('')
      setSelDistrito('')
      setSelCentroPoblado('')
      setProvincias([])
      setDistritos([])
      setCentrosPoblados([])
      return
    }
    const deptoId = Math.floor(homeDistrictId / 10000)
    const provId = Math.floor(homeDistrictId / 100)
    setSelDepartamento(deptoId)
    const provs = await cargarCatalogo<{ id: number; nombre: string | null }>(`/api/v1/provincias/${deptoId}`, i => ({ id: i.id, nombre: (i.nombre ?? '').trim() }))
    setProvincias(provs)
    setSelProvincia(provId)
    if (provId) {
      const dists = await cargarCatalogo<{ id: number; nombre: string | null }>(`/api/v1/distritos/${provId}`, i => ({ id: i.id, nombre: (i.nombre ?? '').trim() }))
      setDistritos(dists)
      setSelDistrito(homeDistrictId)
      if (homeDistrictId) {
        const cps = await cargarCatalogo<{ id: number; nombre: string | null }>(`/api/v1/centros-poblados/${homeDistrictId}`, i => ({ id: i.id, nombre: (i.nombre ?? '').trim() }))
        setCentrosPoblados(cps)
        setSelCentroPoblado(homeCenterId ?? '')
      }
    }
  }

  async function handleBuscar() {
    const num = numeroDocumento.trim()
    if (!num) {
      setError('Ingrese el número de documento.')
      return
    }
    const tipo = tiposDocumentos.find(t => String(t.id) === String(tipoDocumento))
    if (!tipo) {
      setError('Seleccione el tipo de documento.')
      return
    }
    setError('')
    setBuscando(true)
    setBuscado(false)
    limpiarFormulario()
    setHcNueva('')
    setSisInfo(null)
    let enBd = false
    let reniecOk = false
    try {
      const res = await fetch(`/api/v1/pacientes/por-documento?nroDocumento=${encodeURIComponent(num)}&idTipoDocIdentidad=${tipoDocumento}`, { headers: authHeaders() })
      if (res.ok) {
        const env = await res.json()
        const d = env?.data as {
          patientId?: number
          historyNumber?: string
          paternalSurname?: string
          maternalSurname?: string
          firstName?: string
          secondName?: string
          thirdName?: string
          dateOfBirth?: string
          homeDistrictId?: number
          homeCenterId?: number
          sexTypeId?: number
          maritalStatusId?: number
          educationDegreeId?: number
          homeAddress?: string
          phone?: string
        }
        enBd = true
        setEsNuevo(false)
        setHcNueva(d?.historyNumber ? String(d.historyNumber) : `HC-${210000 + Math.floor(Math.random() * 9000)}`)
        setApellidoPaterno((d?.paternalSurname ?? '').trim())
        setApellidoMaterno((d?.maternalSurname ?? '').trim())
        setPrimerNombre((d?.firstName ?? '').trim())
        setSegundoNombre(((d?.secondName ?? '') + ' ' + (d?.thirdName ?? '')).trim())
        setFechaNacimiento(d?.dateOfBirth ? String(d.dateOfBirth).slice(0, 10) : '')
        const sexoId = d?.sexTypeId
        const sexoItem = sexoId != null ? sexos.find(s => s.id === sexoId) : undefined
        setSexo(sexoItem ? String(sexoItem.id) : '')
        const eci = d?.maritalStatusId
        const ecItem = eci != null ? estadosCivil.find(e => e.id === eci) : undefined
        setEstadoCivil(ecItem ? String(ecItem.id) : '')
        setTelefono((d?.phone ?? '').trim())
        setDireccion((d?.homeAddress ?? '').trim())
        await cargarPoblarUbicacion(d?.homeDistrictId ?? undefined, d?.homeCenterId ?? undefined)
      } else {
        setEsNuevo(true)
        setHcNueva(`HC-${210000 + Math.floor(Math.random() * 9000)}`)
        if (tipo.nombre.toUpperCase() === 'DNI') {
          try {
            reniecOk = await consultarReniec(num)
          } catch {
            /* si RENIEC no responde, se completa a mano o desde el SIS */
          }
        }
      }
      try {
        const sres = await consultarSis(num, tipo)
        setSisInfo(sres)
        setSeguro(seguroPorDefecto(sres?.afiliado ?? null))
        if (!enBd && !reniecOk && sres) {
          const nombres = (sres.nombres ?? '').trim().toUpperCase().split(/\s+/).filter(Boolean)
          setApellidoPaterno((sres.apePaterno ?? '').trim().toUpperCase())
          setApellidoMaterno((sres.apeMaterno ?? '').trim().toUpperCase())
          setPrimerNombre(nombres[0] ?? '')
          setSegundoNombre(nombres.slice(1).join(' '))
          if (sres.fechaNacimiento) setFechaNacimiento(sres.fechaNacimiento.slice(0, 10))
          const gen = (sres.genero ?? '').trim().toLowerCase()
          setSexo(gen.startsWith('m') ? sexos.find(s => s.nombre.toLowerCase() === 'masculino')?.id?.toString() ?? '' : gen.startsWith('f') ? sexos.find(s => s.nombre.toLowerCase() === 'femenino')?.id?.toString() ?? '' : '')
          if (sres.direccion) setDireccion(sres.direccion.trim())
        }
      } catch {
        setSisInfo(null)
        setSeguro(seguroPorDefecto(null))
      }
    } catch {
      setError('No se pudo consultar el paciente.')
    } finally {
      setBuscado(true)
      setBuscando(false)
    }
  }

  function handleContinuar() {
    if (!buscado) {
      setError('Busque el documento del paciente antes de continuar.')
      return
    }
    setError('')
    setPaso('triaje')
    setMostrarPaciente(false)
  }

  async function obtenerUltimoTriajeId(): Promise<number | null> {
    try {
      const hoy = new Date().toISOString().slice(0, 10)
      const params = new URLSearchParams({
        fini: hoy,
        ffin: hoy,
        filtro: numeroDocumento.trim(),
        derivadoAServicio: '-100',
        idEstado: '-100',
      })
      const res = await fetch(`/api/v1/triaje?${params.toString()}`, { headers: authHeaders() })
      const env = await res.json().catch(() => null)
      const lista = (env?.data ?? []) as { idTriaje?: number }[]
      if (!Array.isArray(lista) || lista.length === 0) return null
      return Math.max(...lista.map((i: { idTriaje?: number }) => i.idTriaje ?? 0))
    } catch {
      return null
    }
  }

  async function handleSubmit() {
    const tipo = tiposDocumentos.find(t => String(t.id) === String(tipoDocumento))
    const tipoNombre = tipo?.nombre ?? ''
    setResultadoMsg(null)
    if (enviando) return
    setEnviando(true)
    try {
      const body = {
        idTriaje: null,
        idDocIdentidad: tipoDocumento ? Number(tipoDocumento) : null,
        nroDocumento: numeroDocumento.trim() || null,
        apellidoPaterno: apellidoPaterno.trim() || null,
        apellidoMaterno: apellidoMaterno.trim() || null,
        primerNombre: primerNombre.trim() || null,
        segundoNombre: segundoNombre.trim() || null,
        tercerNombre: null,
        idSexo: sexo ? Number(sexo) : null,
        fechaNacimiento: fechaNacimiento ? `${fechaNacimiento}T00:00:00Z` : null,
        telefono: telefono.trim() || null,
        idDepartamentoDomicilio: selDepartamento === '' ? null : Number(selDepartamento),
        idProvinciaDomicilio: selProvincia === '' ? null : Number(selProvincia),
        idDistritoDomicilio: selDistrito === '' ? null : Number(selDistrito),
        idComunidadDomicilio: selCentroPoblado === '' ? null : Number(selCentroPoblado),
        direccion: direccion.trim() || null,
        idEsAccidenteTransito: accidenteTransito ? 1 : 0,
        idFuenteFinanciamiento: seguro ? Number(seguro) : null,
        email: null,
        idEstadoCivil: estadoCivil ? Number(estadoCivil) : null,
        frecCardiaca: fc ? Number(fc) : null,
        temperatura: temp ? Number(temp) : null,
        presionArterial: pa.trim() || null,
        saturacion: spo2 ? Number(spo2) : null,
        frecRespiratoria: fr ? Number(fr) : null,
        fiO2: fio2 ? Math.round((Number(fio2) <= 1 ? Number(fio2) * 100 : Number(fio2))) : null,
        peso: peso ? Number(peso) : null,
        talla: talla ? Number(talla) : null,
        imc: imc ? Number(imc) : null,
        tiempoEvolucionCantidad: tiempoSintomas ? Number(tiempoSintomas) : null,
        tiempoEvolucionCantidadUnidad: frecuenciaTiempo.trim() || null,
        escalaDolor: escalaDolor ? Number(escalaDolor) : null,
        escalaGlasgow: escalaGlasgow ? Number(escalaGlasgow) : null,
        idTipoPrioridad: tipoPrioridad ? Number(tipoPrioridad) : null,
        idServicio: servicioDerivado ? Number(servicioDerivado) : null,
        motivo: sintomasPrincipales.trim() || null,
        gestante: null,
        idEstadollego: comoLlego ? Number(comoLlego) : null,
        foto: null,
        idEmpleado: null,
      }
      const res = await fetch(`/api/v1/triaje`, { method: 'POST', headers: authHeaders({ 'content-type': 'application/json' }), body: JSON.stringify(body) })
      const env = await res.json().catch(() => null)
      const resultado = env?.data?.resultado ?? ''
      if (res.ok && /^OK/.test(resultado)) {
        onSubmit({
          tipoDocumento: tipoNombre as TipoDocumento,
          documento: tipoNombre.toUpperCase() === 'SD' ? null : numeroDocumento.trim(),
          hcCodigo: hcNueva,
          nombre: `${primerNombre.trim()} ${segundoNombre.trim()} ${apellidoPaterno.trim()} ${apellidoMaterno.trim()}`.trim(),
          seguro: seguro || null,
        })
        setResultadoMsg({ ok: true, texto: 'El triaje se agregó correctamente.' })
        const id = await obtenerUltimoTriajeId()
        if (id) setReporteId(id)
      } else {
        const msg = (env?.error?.message ?? resultado ?? 'No se pudo registrar el triaje.').replace(/^Error[;: ]*/i, '')
        setResultadoMsg({ ok: false, texto: msg })
      }
    } catch {
      setResultadoMsg({ ok: false, texto: 'No se pudo registrar el triaje.' })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <Modal title="Registrar Triaje" subtitle="Identificación por documento para la bandeja de triaje." onClose={onClose} width={1100}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 10, alignItems: 'end' }}>
        <SelectField
          label="Tipo de documento"
          value={tipoDocumento}
          onChange={v => handleTipoDocumentoChange(v)}
          disabled={esNN}
          options={[{ value: '', label: 'Seleccionar...' }, ...tiposDocumentos.map(t => ({ value: String(t.id), label: t.nombre }))]}
        />
        <TextField
          label="Número de documento"
          value={numeroDocumento}
          onChange={v => { setNumeroDocumento(v); setBuscado(false); setEsNuevo(false); setError('') }}
          onEnter={handleBuscar}
          disabled={esNN}
          placeholder="Ej: 45220357"
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 42, padding: '0 12px', border: `1px solid ${esNN ? '#5eead4' : '#d5dceb'}`, borderRadius: 11, background: esNN ? '#f0fdfa' : '#f8fafc' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#263c7a', whiteSpace: 'nowrap' }}>Paciente NN</span>
          <button
            type="button"
            onClick={() => handleToggleNN(!esNN)}
            aria-pressed={esNN}
            style={{
              width: 40, height: 22, borderRadius: 999, border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0,
              background: esNN ? '#0d9488' : '#c3cbd8', transition: 'background .2s',
            }}
          >
            <span style={{
              position: 'absolute', top: 2, left: esNN ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .2s',
            }} />
          </button>
        </div>
        <button
          onClick={handleBuscar}
          disabled={buscando || esNN}
          className="gp-primary-btn"
          style={{ display: 'flex', alignItems: 'center', gap: 7, height: 42, padding: '0 20px', background: '#263c7a', color: '#fff', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: buscando ? 'wait' : 'pointer', whiteSpace: 'nowrap', opacity: esNN ? 0.5 : 1 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          Buscar
        </button>
      </div>

      <p style={{ fontSize: 12, color: '#7a86a1', margin: '10px 0 0', lineHeight: 1.5 }}>
        El sistema verifica automáticamente si el documento corresponde a un paciente ya registrado (SÍ) o a uno nuevo (NO). Si no existe, consulta a la RENIEC.
      </p>

      {error && (
        <div style={{ marginTop: 14, background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', fontSize: 13, fontWeight: 500, padding: '10px 13px', borderRadius: 11 }}>
          {error}
        </div>
      )}

      {sisInfo && (
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', borderRadius: 11, fontSize: 13, fontWeight: 600, background: sisInfo.afiliado ? '#ecfdf5' : '#fefce8', border: `1px solid ${sisInfo.afiliado ? '#6ee7b7' : '#fde047'}`, color: sisInfo.afiliado ? '#047857' : '#a16207' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            {sisInfo.afiliado
              ? <path d="M20 6L9 17l-5-5" />
              : <path d="M12 9v4M12 17h.01M12 3l9 16H3z" />}
          </svg>
          <span>
            {sisInfo.afiliado
              ? `Afiliado a SIS (${sisInfo.estado})${sisInfo.descripcion ? ` · ${sisInfo.descripcion}` : ''}`
              : `No registra afiliación activa a SIS${sisInfo.estado ? ` (${sisInfo.estado})` : ''}`}
          </span>
        </div>
      )}

      {buscado && (
        <div className="gp-card-in" style={{ marginTop: 16, borderRadius: 14, border: esNuevo ? '1px solid #fde68a' : '1px solid #bbf7d0', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '11px 16px', background: '#f0f4ff', cursor: 'pointer', userSelect: 'none' }} onClick={() => setMostrarPaciente(v => !v)}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#263c7a', textTransform: 'uppercase', letterSpacing: '.04em' }}>Datos del paciente</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ color: '#54617f', transform: mostrarPaciente ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
          {mostrarPaciente && (
            <div style={{ padding: 16 }}>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14 }}>
              <TextField label="Apellido paterno" value={apellidoPaterno} onChange={v => { setApellidoPaterno(v); setError('') }} disabled={esNN} placeholder="Apellido paterno" />
              <TextField label="Apellido materno" value={apellidoMaterno} onChange={v => { setApellidoMaterno(v); setError('') }} disabled={esNN} placeholder="Apellido materno" />
              <TextField label="Primer nombre" value={primerNombre} onChange={v => { setPrimerNombre(v); setError('') }} disabled={esNN} placeholder="Primer nombre" />
              <TextField label="Segundo nombre" value={segundoNombre} onChange={v => { setSegundoNombre(v); setError('') }} disabled={esNN} placeholder="Segundo nombre" />
              <TextField label="Fecha de nacimiento" value={fechaNacimiento} onChange={setFechaNacimiento} type="date" />
              <SelectField
                label="Sexo"
                value={sexo}
                onChange={v => { setSexo(v); setError('') }}
                options={[{ value: '', label: 'Seleccionar...' }, ...sexos.map(s => ({ value: String(s.id), label: s.nombre }))]}
              />
              <SelectField
                label="Estado civil"
                value={estadoCivil}
                onChange={v => { setEstadoCivil(v); setError('') }}
                options={[{ value: '', label: 'Seleccionar...' }, ...estadosCivil.map(e => ({ value: String(e.id), label: e.nombre }))]}
              />
              <TextField label="Teléfono" value={telefono} onChange={setTelefono} placeholder="9xx xxx xxx" />
              <SelectField
                label="Departamento"
                value={selDepartamento}
                onChange={v => { setSelDepartamento(v === '' ? '' : Number(v)); if (v === '') { setProvincias([]); setDistritos([]); setCentrosPoblados([]); setSelProvincia(''); setSelDistrito(''); setSelCentroPoblado('') } else void cargarProvincias(Number(v)) }}
                options={[{ value: '', label: 'Seleccionar...' }, ...departamentos.map(d => ({ value: String(d.id), label: d.nombre }))]}
              />
              <SelectField
                label="Provincia"
                value={selProvincia}
                onChange={v => { setSelProvincia(v === '' ? '' : Number(v)); if (v === '') { setDistritos([]); setCentrosPoblados([]); setSelDistrito(''); setSelCentroPoblado('') } else void cargarDistritos(Number(v)) }}
                options={[{ value: '', label: 'Seleccionar...' }, ...provincias.map(p => ({ value: String(p.id), label: p.nombre }))]}
              />
              <SelectField
                label="Distrito"
                value={selDistrito}
                onChange={v => { setSelDistrito(v === '' ? '' : Number(v)); if (v === '') { setCentrosPoblados([]); setSelCentroPoblado('') } else void cargarCentrosPoblados(Number(v)) }}
                options={[{ value: '', label: 'Seleccionar...' }, ...distritos.map(d => ({ value: String(d.id), label: d.nombre }))]}
              />
              <SelectField
                label="Centro poblado"
                value={selCentroPoblado}
                onChange={v => setSelCentroPoblado(v === '' ? '' : Number(v))}
                options={[{ value: '', label: 'Seleccionar...' }, ...centrosPoblados.map(c => ({ value: String(c.id), label: c.nombre }))]}
              />
              <div style={{ gridColumn: 'span 2' }}>
                <TextField label="Dirección" value={direccion} onChange={setDireccion} placeholder="Dirección completa" />
              </div>
            </div>
            </div>
          )}
        </div>
      )}

      {paso === 'triaje' && (
        <div className="gp-card-in" style={{ marginTop: 16, borderRadius: 14, border: '1px solid #d5dceb', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px', background: '#f0f4ff', fontSize: 12, fontWeight: 700, color: '#263c7a', textTransform: 'uppercase', letterSpacing: '.04em' }}>
            Datos del triaje
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#263c7a' }}>Accidente de tránsito</span>
                <button
                  type="button"
                  onClick={toggleAccidente}
                  aria-pressed={accidenteTransito}
                  style={{
                    width: 52, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer', position: 'relative',
                    background: accidenteTransito ? '#0d9488' : '#d5dceb', transition: 'background .2s',
                  }}
                >
                  <span style={{
                    position: 'absolute', top: 3, left: accidenteTransito ? 25 : 3, width: 22, height: 22, borderRadius: '50%', background: '#fff', transition: 'left .2s',
                  }} />
                </button>
              </div>
              <SelectField
                label="IAFA"
                value={seguro}
                disabled
                onChange={() => {}}
                options={[{ value: '', label: 'Seleccionar...' }, ...fuentesFinanciamiento.map(s => ({ value: String(s.id), label: s.nombre }))]}
              />
              <SelectField
                label="Cómo llegó"
                value={comoLlego}
                onChange={v => setComoLlego(v)}
                options={[{ value: '', label: 'Seleccionar...' }, ...estadosLlego.map(o => ({ value: String(o.id), label: o.nombre }))]}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14 }}>
              <TextField label="F. Cardiaca (lpm)" value={fc} onChange={setFc} disabled={tipoPrioridad === '5'} placeholder="82" />
              <TextField label="Temp (°C)" value={temp} onChange={setTemp} disabled={tipoPrioridad === '5'} placeholder="36.8" />
              <TextField label="P.A. (mmHg)" value={pa} onChange={setPa} disabled={tipoPrioridad === '5'} placeholder="120/80" />
              <TextField label="SAT O₂ (%)" value={spo2} onChange={setSpo2} disabled={tipoPrioridad === '5'} placeholder="98" />
              <TextField label="F.R. (rpm)" value={fr} onChange={setFr} disabled={tipoPrioridad === '5'} placeholder="18" />
              <TextField label="FIO₂ (%)" value={fio2} onChange={setFio2} disabled={tipoPrioridad === '5'} placeholder="21" />
              <TextField label="Peso (kg)" value={peso} onChange={v => { setPeso(v); setImc(calcularImc(v, talla)) }} disabled={tipoPrioridad === '5'} placeholder="70" />
              <TextField label="Talla (cm)" value={talla} onChange={v => { setTalla(v); setImc(calcularImc(peso, v)) }} disabled={tipoPrioridad === '5'} placeholder="172" />
              <TextField label="IMC" value={imc} onChange={setImc} disabled placeholder="—" />
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#54617f', marginBottom: 6 }}>Síntomas principales</label>
              <textarea
                value={sintomasPrincipales}
                onChange={e => setSintomasPrincipales(e.target.value)}
                placeholder="Describa los síntomas principales del paciente"
                rows={2}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #d5dceb', borderRadius: 11, fontSize: 14, background: '#f8fafc', color: '#07153a', resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginTop: 16 }}>
              <TextField label="Tiempo de síntomas" value={tiempoSintomas} onChange={setTiempoSintomas} placeholder="Ej: 3" />
              <SelectField
                label="Frecuencia"
                value={frecuenciaTiempo}
                onChange={v => setFrecuenciaTiempo(v)}
                options={[{ value: '', label: 'Seleccionar...' }, ...frecuenciaTiempoOptions.map(o => ({ value: o, label: o }))]}
              />
              <SelectField
                label="Escala del dolor"
                value={escalaDolor}
                onChange={v => setEscalaDolor(v)}
                options={[{ value: '', label: 'Seleccionar...' }, ...Array.from({ length: 10 }, (_, i) => i + 1).map(n => ({ value: String(n), label: String(n) }))]}
              />
              <SelectField
                label="Escala de Glasgow"
                value={escalaGlasgow}
                onChange={v => setEscalaGlasgow(v)}
                options={[{ value: '', label: 'Seleccionar...' }, ...Array.from({ length: 13 }, (_, i) => i + 3).map(n => ({ value: String(n), label: String(n) }))]}
              />
              <SearchableSelect
                label="Servicio derivado"
                value={servicioDerivado}
                onChange={v => setServicioDerivado(v)}
                options={servicios.map(s => ({ value: String(s.id), label: s.nombre }))}
                placeholder="Buscar y seleccionar servicio..."
              />
            </div>

            <div style={{ marginTop: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#54617f', marginBottom: 8 }}>Tipo de prioridad</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'nowrap' }}>
                {tipoPrioridadOptions.map(op => {
                  const activo = tipoPrioridad === op.id
                  return (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => {
                        setTipoPrioridad(op.id)
                        setError('')
                        if (op.id === '5') {
                          setFc(''); setTemp(''); setPa(''); setSpo2(''); setFr('')
                          setFio2(''); setPeso(''); setTalla(''); setImc('')
                        }
                      }}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 8px', borderRadius: 11, cursor: 'pointer', whiteSpace: 'nowrap',
                        border: activo ? `2px solid ${op.color}` : '1px solid #e0e6f1',
                        background: activo ? `${op.color}1a` : '#fff', color: '#07153a', fontSize: 12.5, fontWeight: 600,
                      }}
                    >
                      <span style={{ width: 12, height: 12, borderRadius: '50%', background: op.color, flexShrink: 0 }} />
                      {op.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {resultadoMsg && (
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', borderRadius: 11, fontSize: 13, fontWeight: 600, background: resultadoMsg.ok ? '#ecfdf5' : '#fee2e2', border: `1px solid ${resultadoMsg.ok ? '#6ee7b7' : '#fca5a5'}`, color: resultadoMsg.ok ? '#047857' : '#b91c1c' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            {resultadoMsg.ok
              ? <path d="M20 6L9 17l-5-5" />
              : <path d="M12 9v4M12 17h.01M12 3l9 16H3z" />}
          </svg>
          <span>{resultadoMsg.texto}</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
        <button onClick={onClose} className="gp-ghost-btn" style={{ padding: '10px 20px', border: '1px solid #e0e6f1', borderRadius: 11, background: '#fff', fontSize: 14, fontWeight: 600, color: '#54617f', cursor: 'pointer' }}>
          Cancelar
        </button>
        {paso === 'paciente' ? (
          <button onClick={handleContinuar} className="gp-primary-btn" style={{ padding: '10px 22px', background: '#0d9488', color: '#fff', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Continuar con el triaje
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={enviando}
            className="gp-primary-btn"
            style={{ padding: '10px 22px', background: '#0d9488', color: '#fff', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: enviando ? 'wait' : 'pointer', opacity: enviando ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {enviando && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>}
            {enviando ? 'Registrando...' : 'Registrar Triaje'}
          </button>
        )}
      </div>
    </Modal>

    {reporteId && (
      <ReporteTriajeModal
        idTriaje={reporteId}
        onClose={() => { setReporteId(null); onClose() }}
      />
    )}
    </>
  )
}

function EvaluacionTriajeModal({ paciente, onClose, onSubmit }: {
  paciente: PacienteTriaje
  onClose: () => void
  onSubmit: (evaluacion: TriajeEvaluacion) => void
}) {
  const yaEvaluado = paciente.estado === 'triado' && paciente.evaluacion
  const [motivo, setMotivo] = useState(paciente.evaluacion?.motivo ?? '')
  const [pa, setPa] = useState(paciente.evaluacion?.pa ?? '')
  const [fc, setFc] = useState(paciente.evaluacion?.fc ?? '')
  const [fr, setFr] = useState(paciente.evaluacion?.fr ?? '')
  const [temp, setTemp] = useState(paciente.evaluacion?.temp ?? '')
  const [spo2, setSpo2] = useState(paciente.evaluacion?.spo2 ?? '')
  const [prioridad, setPrioridad] = useState<Prioridad>(paciente.evaluacion?.prioridad ?? 'amarillo')
  const [error, setError] = useState('')

  function handleSubmit() {
    if (!motivo.trim() || !pa.trim() || !fc.trim() || !fr.trim() || !temp.trim() || !spo2.trim()) {
      setError('Complete el motivo de consulta y todos los signos vitales.')
      return
    }
    onSubmit({ motivo, pa, fc, fr, temp, spo2, prioridad })
  }

  return (
    <Modal title={`Evaluación de triaje · ${paciente.nombre}`} subtitle={`${paciente.codigo}${paciente.hcCodigo ? ` · ${paciente.hcCodigo}` : ''}`} onClose={onClose} width={620}>
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#54617f', marginBottom: 6 }}>Motivo de consulta</label>
        <textarea
          value={motivo}
          onChange={e => { setMotivo(e.target.value); setError('') }}
          placeholder="Describa el motivo de la atención"
          rows={2}
          disabled={!!yaEvaluado}
          style={{ width: '100%', padding: '10px 14px', border: '1px solid #d5dceb', borderRadius: 11, fontSize: 14, background: yaEvaluado ? '#f3f5fb' : '#f8fafc', color: '#07153a', resize: 'vertical', fontFamily: 'inherit' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        <TextField label="Presión arterial" value={pa} onChange={v => { setPa(v); setError('') }} placeholder="120/80" disabled={!!yaEvaluado} />
        <TextField label="Frec. cardiaca (lpm)" value={fc} onChange={v => { setFc(v); setError('') }} placeholder="82" disabled={!!yaEvaluado} />
        <TextField label="Frec. respiratoria (rpm)" value={fr} onChange={v => { setFr(v); setError('') }} placeholder="18" disabled={!!yaEvaluado} />
        <TextField label="Temperatura (°C)" value={temp} onChange={v => { setTemp(v); setError('') }} placeholder="36.8" disabled={!!yaEvaluado} />
        <TextField label="SpO₂ (%)" value={spo2} onChange={v => { setSpo2(v); setError('') }} placeholder="98" disabled={!!yaEvaluado} />
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#54617f', marginBottom: 8 }}>Prioridad de atención</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(Object.keys(prioridadInfo) as Prioridad[]).map(key => (
            <button
              key={key}
              onClick={() => !yaEvaluado && setPrioridad(key)}
              disabled={!!yaEvaluado}
              className={yaEvaluado ? '' : 'gp-switch-btn'}
              style={{
                padding: '8px 14px', borderRadius: 10, fontSize: 12.5, fontWeight: 600, cursor: yaEvaluado ? 'default' : 'pointer',
                border: prioridad === key ? '2px solid #0f2a5c' : '1px solid #e0e6f1',
                background: prioridad === key ? '#eef1fb' : '#fff',
                color: '#07153a',
              }}
            >
              {prioridadInfo[key].label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 16, background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', fontSize: 13, fontWeight: 500, padding: '10px 13px', borderRadius: 11 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
        <button onClick={onClose} className="gp-ghost-btn" style={{ padding: '10px 20px', border: '1px solid #e0e6f1', borderRadius: 11, background: '#fff', fontSize: 14, fontWeight: 600, color: '#54617f', cursor: 'pointer' }}>
          {yaEvaluado ? 'Cerrar' : 'Cancelar'}
        </button>
        {!yaEvaluado && (
          <button onClick={handleSubmit} className="gp-primary-btn" style={{ padding: '10px 22px', background: '#263c7a', color: '#fff', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Guardar y enviar a admisión
          </button>
        )}
      </div>
    </Modal>
  )
}

function TextField({ label, value, onChange, placeholder, type = 'text', disabled, onEnter }: {
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

function SelectField({ label, value, onChange, options, disabled }: {
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

function SearchableSelect({ label, options, value, onChange, placeholder = 'Seleccionar...' }: {
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
