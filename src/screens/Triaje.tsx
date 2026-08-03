import { useEffect, useMemo, useState } from 'react'
import { Modal } from '../components/Modal'
import { Badge } from '../components/Badge'

type TipoDocumento = 'DNI' | 'CE' | 'PAS' | 'SIS' | 'SD'
type Seguro = 'SIS' | 'EsSalud' | 'Seguro privado' | 'Particular'
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
  seguro: Seguro | null
  arrivalTs: number
  estado: Estado
  evaluacion: TriajeEvaluacion | null
}

const prioridadInfo: Record<Prioridad, { label: string; variant: 'danger' | 'warning' | 'info' | 'success' | 'neutral' }> = {
  rojo: { label: 'Rojo · Emergencia', variant: 'danger' },
  naranja: { label: 'Naranja · Muy urgente', variant: 'warning' },
  amarillo: { label: 'Amarillo · Urgente', variant: 'warning' },
  verde: { label: 'Verde · Poco urgente', variant: 'success' },
  azul: { label: 'Azul · No urgente', variant: 'info' },
}

const tipoDocumentoOptions: { value: TipoDocumento; label: string }[] = [
  { value: 'DNI', label: 'DNI' },
  { value: 'CE', label: 'Carné de Extranjería' },
  { value: 'PAS', label: 'Pasaporte' },
  { value: 'SIS', label: 'Carné SIS' },
  { value: 'SD', label: 'Sin documento (menor / NN)' },
]

const seguroOptions: Seguro[] = ['SIS', 'EsSalud', 'Seguro privado', 'Particular']

interface RegistroEncontrado {
  nombres: string
  apellidos: string
  edad: number
  sexo: 'Masculino' | 'Femenino'
  seguro: Seguro
  telefono: string
  direccion: string
  hc: string
}

/** Base de pacientes ya registrados, simulada para la búsqueda por documento (reemplazar por RENIEC / HIS / padrón SIS). */
const mockPatientsDB: Record<string, RegistroEncontrado> = {
  'DNI-45102233': { nombres: 'Jorge Luis', apellidos: 'Quispe Ramos', edad: 39, sexo: 'Masculino', seguro: 'SIS', telefono: '987 210 344', direccion: 'Av. Los Álamos 445, San Juan de Lurigancho', hc: 'HC-198822' },
  'DNI-40877612': { nombres: 'María Elena', apellidos: 'Torres Bautista', edad: 60, sexo: 'Femenino', seguro: 'SIS', telefono: '944 561 002', direccion: 'Jr. Las Camelias 210, Comas', hc: 'HC-197310' },
  'DNI-71204598': { nombres: 'Ana Sofía', apellidos: 'Delgado Vera', edad: 25, sexo: 'Femenino', seguro: 'EsSalud', telefono: '912 774 220', direccion: 'Calle Las Begonias 88, Surco', hc: 'HC-205511' },
  'CE-001234567': { nombres: 'Yeison', apellidos: 'Martínez Pérez', edad: 33, sexo: 'Masculino', seguro: 'Particular', telefono: '922 340 118', direccion: 'Av. Brasil 900, Breña', hc: 'HC-203390' },
  'DNI-42678930': { nombres: 'Rosa', apellidos: 'Chumpitaz León', edad: 68, sexo: 'Femenino', seguro: 'SIS', telefono: '954 112 007', direccion: 'Calle Real 120, Ate', hc: 'HC-190044' },
}

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
  const [tab, setTab] = useState<Estado>('sin-triaje')
  const [busqueda, setBusqueda] = useState('')
  const [tick, setTick] = useState(0)
  const [referenciasSisPendientes] = useState(1)

  const [showRegistrar, setShowRegistrar] = useState(false)
  const [pacienteEnTriaje, setPacienteEnTriaje] = useState<PacienteTriaje | null>(null)

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30_000)
    return () => clearInterval(interval)
  }, [])

  const enEspera = pacientes.filter(p => p.estado === 'sin-triaje')
  const triadosHoy = pacientes.filter(p => p.estado === 'triado')

  const filtrados = useMemo(() => {
    const base = tab === 'sin-triaje' ? enEspera : triadosHoy
    const q = busqueda.trim().toLowerCase()
    if (!q) return base
    return base.filter(p => p.nombre.toLowerCase().includes(q) || (p.documento ?? '').includes(q))
  }, [tab, busqueda, pacientes]) // eslint-disable-line react-hooks/exhaustive-deps

  function minutosEsperando(arrivalTs: number): number {
    void tick
    return Math.max(0, Math.floor((Date.now() - arrivalTs) / 60_000))
  }

  function horaLlegada(arrivalTs: number): string {
    return new Date(arrivalTs).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
  }

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
    setTab('sin-triaje')
  }

  function handleGuardarEvaluacion(id: string, evaluacion: TriajeEvaluacion) {
    setPacientes(prev => prev.map(p => (p.id === id ? { ...p, estado: 'triado', evaluacion } : p)))
    setPacienteEnTriaje(null)
    setTab('triado')
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
          Registrar paciente
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        <StatCard label="En bandeja hoy" value={pacientes.length} unit="pacientes" barColor="#07153a" />
        <StatCard label="En espera de triaje" value={enEspera.length} unit="pendientes" barColor="#dc2626" />
        <StatCard label="Triados hoy" value={triadosHoy.length} unit="completados" barColor="#059669" />
        <StatCard label="Referencias SIS pendientes" value={referenciasSisPendientes} unit="por atender" barColor="#7c3aed" />
      </div>

      <div style={{ background: '#fff', border: '1px solid #e6eaf2', borderRadius: 16, padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 6, background: '#f3f5fb', padding: 5, borderRadius: 12 }}>
            <TabButton active={tab === 'sin-triaje'} onClick={() => setTab('sin-triaje')} label="En espera de triaje" count={enEspera.length} />
            <TabButton active={tab === 'triado'} onClick={() => setTab('triado')} label="Triados hoy" count={triadosHoy.length} />
          </div>

          <div style={{ position: 'relative' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a0bd" strokeWidth="2" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o documento..."
              style={{ width: 260, padding: '9px 14px 9px 34px', border: '1px solid #e0e6f1', borderRadius: 11, fontSize: 13, background: '#f8fafc', color: '#07153a' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#7a86a1', fontWeight: 600, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.03em' }}>
                <th style={{ padding: '0 10px 10px' }}>Documento</th>
                <th style={{ padding: '0 10px 10px' }}>Paciente</th>
                <th style={{ padding: '0 10px 10px' }}>Hora de llegada</th>
                <th style={{ padding: '0 10px 10px' }}>Tiempo esperando</th>
                <th style={{ padding: '0 10px 10px' }}>Prioridad / Estado</th>
                <th style={{ padding: '0 10px 10px', textAlign: 'right' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '20px 10px', color: '#94a0bd', textAlign: 'center' }}>No hay pacientes en esta bandeja.</td></tr>
              )}
              {filtrados.map(p => (
                <tr key={p.id} className="gp-row" style={{ borderTop: '1px solid #eef1f6' }}>
                  <td style={{ padding: '12px 10px', verticalAlign: 'top' }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: '#94a0bd', letterSpacing: '.04em' }}>{p.tipoDocumento}</div>
                    <div style={{ fontWeight: 600, color: '#07153a' }}>{p.documento ?? '—'}</div>
                  </td>
                  <td style={{ padding: '12px 10px', verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600, color: '#07153a' }}>{p.nombre}</span>
                      {p.seguro === 'SIS' && <Badge variant="info">SIS</Badge>}
                    </div>
                    <div style={{ fontSize: 12, color: '#7a86a1', marginTop: 2 }}>{p.codigo}{p.hcCodigo ? ` · ${p.hcCodigo}` : ''}</div>
                  </td>
                  <td style={{ padding: '12px 10px', verticalAlign: 'top', color: '#54617f' }}>{horaLlegada(p.arrivalTs)}</td>
                  <td style={{ padding: '12px 10px', verticalAlign: 'top', color: '#54617f' }}>{minutosEsperando(p.arrivalTs)} min</td>
                  <td style={{ padding: '12px 10px', verticalAlign: 'top' }}>
                    {p.estado === 'sin-triaje' || !p.evaluacion
                      ? <Badge variant="warning">Sin triaje</Badge>
                      : <Badge variant={prioridadInfo[p.evaluacion.prioridad].variant}>{prioridadInfo[p.evaluacion.prioridad].label}</Badge>}
                  </td>
                  <td style={{ padding: '12px 10px', verticalAlign: 'top', textAlign: 'right' }}>
                    {p.estado === 'sin-triaje' ? (
                      <button
                        onClick={() => setPacienteEnTriaje(p)}
                        className="gp-primary-btn"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 16px', background: '#263c7a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                        Iniciar triaje
                      </button>
                    ) : (
                      <button
                        onClick={() => setPacienteEnTriaje(p)}
                        className="gp-ghost-btn"
                        style={{ padding: '8px 16px', border: '1px solid #e0e6f1', borderRadius: 10, background: '#fff', fontSize: 12.5, fontWeight: 600, color: '#54617f', cursor: 'pointer' }}
                      >
                        Ver evaluación
                      </button>
                    )}
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

function RegistrarPacienteModal({ onClose, onSubmit }: {
  onClose: () => void
  onSubmit: (nuevo: Omit<PacienteTriaje, 'id' | 'codigo' | 'arrivalTs' | 'estado' | 'evaluacion'>) => void
}) {
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento>('DNI')
  const [numeroDocumento, setNumeroDocumento] = useState('')
  const [buscado, setBuscado] = useState(false)
  const [encontrado, setEncontrado] = useState<RegistroEncontrado | null>(null)
  const [hcNueva, setHcNueva] = useState('')
  const [error, setError] = useState('')

  const [nombres, setNombres] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [sexo, setSexo] = useState<'' | 'Masculino' | 'Femenino'>('')
  const [telefono, setTelefono] = useState('')
  const [seguro, setSeguro] = useState<'' | Seguro>('')
  const [direccion, setDireccion] = useState('')

  function handleTipoDocumentoChange(v: TipoDocumento) {
    setTipoDocumento(v)
    setBuscado(false)
    setEncontrado(null)
    setError('')
    setNumeroDocumento(v === 'SD' ? `S/D-${Math.floor(1000 + Math.random() * 9000)}` : '')
  }

  function handleBuscar() {
    const num = numeroDocumento.trim()
    if (!num) {
      setError('Ingrese el número de documento.')
      return
    }
    setError('')
    const registro = mockPatientsDB[`${tipoDocumento}-${num}`] ?? null
    setEncontrado(registro)
    setBuscado(true)
    if (!registro) {
      setHcNueva(`HC-${210000 + Math.floor(Math.random() * 9000)}`)
      setNombres('')
      setApellidos('')
      setFechaNacimiento('')
      setSexo('')
      setTelefono('')
      setSeguro('')
      setDireccion('')
    }
  }

  function handleSubmit() {
    if (!buscado) {
      setError('Busque el documento del paciente antes de registrarlo.')
      return
    }
    if (encontrado) {
      onSubmit({
        tipoDocumento,
        documento: tipoDocumento === 'SD' ? null : numeroDocumento.trim(),
        hcCodigo: encontrado.hc,
        nombre: `${encontrado.nombres} ${encontrado.apellidos}`,
        seguro: encontrado.seguro,
      })
      return
    }
    if (!nombres.trim() || !apellidos.trim() || !sexo || !seguro) {
      setError('Complete los datos obligatorios del paciente nuevo antes de continuar.')
      return
    }
    onSubmit({
      tipoDocumento,
      documento: tipoDocumento === 'SD' ? null : numeroDocumento.trim(),
      hcCodigo: hcNueva,
      nombre: `${nombres.trim()} ${apellidos.trim()}`,
      seguro,
    })
    void fechaNacimiento
    void telefono
    void direccion
  }

  return (
    <Modal title="Registrar paciente" subtitle="Identificación por documento para la bandeja de triaje." onClose={onClose} width={640}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#263c7a', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 10 }}>
        Identificación por documento
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'end' }}>
        <SelectField
          label="Tipo de documento"
          value={tipoDocumento}
          onChange={v => handleTipoDocumentoChange(v as TipoDocumento)}
          options={tipoDocumentoOptions}
        />
        <TextField
          label="Número de documento"
          value={numeroDocumento}
          onChange={v => { setNumeroDocumento(v); setBuscado(false); setEncontrado(null); setError('') }}
          onEnter={handleBuscar}
          placeholder="Ej: 45102233"
          disabled={tipoDocumento === 'SD'}
        />
        <button
          onClick={handleBuscar}
          className="gp-primary-btn"
          style={{ display: 'flex', alignItems: 'center', gap: 7, height: 42, padding: '0 20px', background: '#263c7a', color: '#fff', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          Buscar
        </button>
      </div>

      <p style={{ fontSize: 12, color: '#7a86a1', margin: '10px 0 0', lineHeight: 1.5 }}>
        El sistema verifica automáticamente si el documento corresponde a un paciente ya registrado (SÍ) o a uno nuevo (NO).
      </p>

      {error && (
        <div style={{ marginTop: 14, background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', fontSize: 13, fontWeight: 500, padding: '10px 13px', borderRadius: 11 }}>
          {error}
        </div>
      )}

      {buscado && encontrado && (
        <div className="gp-card-in" style={{ marginTop: 16, borderRadius: 14, border: '1px solid #bbf7d0', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 16px', background: '#f0fdf4' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#059669' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M20 6L9 17l-5-5" /></svg>
              Paciente encontrado — SÍ existe en el sistema
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: 12.5, fontWeight: 700, color: '#07153a', background: '#fff', border: '1px solid #d5dceb', borderRadius: 8, padding: '3px 10px' }}>{encontrado.hc}</span>
          </div>
          <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
            <div>
              <div style={{ fontSize: 11, color: '#7a86a1', fontWeight: 600 }}>Nombres y apellidos</div>
              <div style={{ color: '#07153a', fontWeight: 600 }}>{encontrado.nombres} {encontrado.apellidos}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#7a86a1', fontWeight: 600 }}>Edad / Sexo</div>
              <div style={{ color: '#07153a' }}>{encontrado.edad} años · {encontrado.sexo}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#7a86a1', fontWeight: 600 }}>Seguro</div>
              <div style={{ color: '#07153a', display: 'flex', alignItems: 'center', gap: 7 }}>
                {encontrado.seguro}{encontrado.seguro === 'SIS' && <Badge variant="info">SIS</Badge>}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#7a86a1', fontWeight: 600 }}>Teléfono</div>
              <div style={{ color: '#07153a' }}>{encontrado.telefono}</div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: 11, color: '#7a86a1', fontWeight: 600 }}>Dirección</div>
              <div style={{ color: '#07153a' }}>{encontrado.direccion}</div>
            </div>
          </div>
        </div>
      )}

      {buscado && !encontrado && (
        <div className="gp-card-in" style={{ marginTop: 16, borderRadius: 14, border: '1px solid #fde68a', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 16px', background: '#fffbeb' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#b45309' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 9v4M12 17h.01M12 3l9 16H3z" /></svg>
              Paciente nuevo — NO existe registro previo
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: 12.5, fontWeight: 700, color: '#07153a', background: '#fff', border: '1px solid #d5dceb', borderRadius: 8, padding: '3px 10px' }}>{hcNueva} (nueva)</span>
          </div>
          <div style={{ padding: 16 }}>
            <p style={{ margin: '0 0 14px', fontSize: 12.5, color: '#7a86a1' }}>
              No se encontró historia clínica con este documento. Se creará una nueva. Complete los datos básicos del paciente:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <TextField label="Nombres" value={nombres} onChange={v => { setNombres(v); setError('') }} placeholder="Nombres" />
              <TextField label="Apellidos" value={apellidos} onChange={v => { setApellidos(v); setError('') }} placeholder="Apellidos" />
              <TextField label="Fecha de nacimiento" value={fechaNacimiento} onChange={setFechaNacimiento} type="date" />
              <SelectField
                label="Sexo"
                value={sexo}
                onChange={v => { setSexo(v as '' | 'Masculino' | 'Femenino'); setError('') }}
                options={[{ value: '', label: 'Seleccionar...' }, { value: 'Masculino', label: 'Masculino' }, { value: 'Femenino', label: 'Femenino' }]}
              />
              <TextField label="Teléfono" value={telefono} onChange={setTelefono} placeholder="9xx xxx xxx" />
              <SelectField
                label="Seguro"
                value={seguro}
                onChange={v => { setSeguro(v as '' | Seguro); setError('') }}
                options={[{ value: '', label: 'Seleccionar...' }, ...seguroOptions.map(s => ({ value: s, label: s }))]}
              />
              <div style={{ gridColumn: '1 / -1' }}>
                <TextField label="Dirección" value={direccion} onChange={setDireccion} placeholder="Dirección completa" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
        <button onClick={onClose} className="gp-ghost-btn" style={{ padding: '10px 20px', border: '1px solid #e0e6f1', borderRadius: 11, background: '#fff', fontSize: 14, fontWeight: 600, color: '#54617f', cursor: 'pointer' }}>
          Cancelar
        </button>
        <button onClick={handleSubmit} className="gp-primary-btn" style={{ padding: '10px 22px', background: '#0d9488', color: '#fff', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Registrar paciente
        </button>
      </div>
    </Modal>
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
