import { useEffect, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { ReporteTriajeModal } from '../../reports/triaje/ReporteTriaje'
import { authHeaders, cargarCatalogo } from './api'
import { RegistrarPacienteModal } from './RegistrarPacienteModal'
import { EvaluacionTriajeModal } from './EvaluacionTriajeModal'
import type { PacienteTriaje, RegistroTriaje, TriajeEvaluacion, UbicacionItem } from './types'

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
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#54617f', marginBottom: 6 }}>Servicio derivado</label>
            <select value={servicioFiltro} onChange={e => setServicioFiltro(e.target.value)} style={{ width: '100%', padding: '9px 14px', border: '1px solid #d5dceb', borderRadius: 11, fontSize: 14, background: '#f8fafc', color: '#07153a' }}>
              {[{ value: '', label: 'Todos' }, ...serviciosTriaje.map(s => ({ value: String(s.id), label: s.nombre }))].map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
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