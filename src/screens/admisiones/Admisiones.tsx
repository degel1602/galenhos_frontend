import { useEffect, useState } from 'react'
import { FichaAdmisionModal } from '../../reports/fichaAdmision/FichaAdmision'
import { SisFuaReport } from '../../reports/sisFua/SisFuaReport'
import { buscarPendientesAdmision, cargarCatalogos } from './api'
import { DetallePacienteModal } from './DetallePacienteModal'
import type { CatalogoItem, PendienteAdmision } from './types'
import { formatFechaTriaje, tipoPrioridadInfo } from './types'

export function Admisiones() {
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [filtro, setFiltro] = useState('')
  const [idDepartamento, setIdDepartamento] = useState('0')
  const [idEspecialidad, setIdEspecialidad] = useState('0')
  const [idServicio, setIdServicio] = useState('0')
  const [departamentos, setDepartamentos] = useState<CatalogoItem[]>([])
  const [especialidades, setEspecialidades] = useState<CatalogoItem[]>([])
  const [servicios, setServicios] = useState<CatalogoItem[]>([])

  const [items, setItems] = useState<PendienteAdmision[]>([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [buscar, setBuscar] = useState(false)
  const [pacienteAdmision, setPacienteAdmision] = useState<PendienteAdmision | null>(null)
  const [fichaCuenta, setFichaCuenta] = useState<number | null>(null)
  const [fuaCuenta, setFuaCuenta] = useState<number | null>(null)
  const [mensajeExito, setMensajeExito] = useState('')

  function handleAdmisionExitosa(mensaje: string) {
    setPacienteAdmision(null)
    setMensajeExito(mensaje)
    handleBuscar()
  }

  useEffect(() => {
    let cancelled = false
    cargarCatalogos().then(({ departamentos: d, especialidades: e, servicios: s }) => {
      if (cancelled) return
      setDepartamentos(d)
      setEspecialidades(e)
      setServicios(s)
    })
    return () => { cancelled = true }
  }, [])

  async function handleBuscar() {
    setCargando(true)
    setError('')
    setItems([])
    try {
      const result = await buscarPendientesAdmision({ fecha, idDepartamento, idEspecialidad, idServicio, filtro })
      setItems(result)
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
                <th style={{ padding: '0 10px 10px' }}>Servicio</th>
                <th style={{ padding: '0 10px 10px' }}>Tipo ingreso</th>
                <th style={{ padding: '0 10px 10px' }}>Fecha triaje</th>
                <th style={{ padding: '0 10px 10px' }}>IAFA</th>
                <th style={{ padding: '0 10px 10px', textAlign: 'right' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '20px 10px', color: '#94a0bd', textAlign: 'center' }}>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 12, color: '#54617f' }}>{`DNI: ${p.NroDocumento ?? '—'}`}</span>
                          {p.IdCuentaAtencion != null && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 999, background: '#d1fae5', color: '#047857', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                              {p.IdCuentaAtencion}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px 10px', verticalAlign: 'top', color: '#54617f', maxWidth: 200 }}>{p.Servicio ?? '—'}</td>
                      <td style={{ padding: '12px 10px', verticalAlign: 'top', color: '#54617f' }}>{p.TipoIngreso ?? '—'}</td>
                      <td style={{ padding: '12px 10px', verticalAlign: 'top', color: '#54617f' }}>{formatFechaTriaje(p.fecha_Triaje)}</td>
                      <td style={{ padding: '12px 10px', verticalAlign: 'top' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: '#e0f2fe', color: '#075985', fontSize: 11.5, fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {p.IAFA || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px', verticalAlign: 'top', textAlign: 'right' }}>
                        {p.IdCuentaAtencion != null ? (
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => setFichaCuenta(p.IdCuentaAtencion)}
                              className="gp-primary-btn"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#263c7a', color: '#fff', border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8M16 17H8M10 9H8" /></svg>
                              Ficha admisión
                            </button>
                            {p.IAFA?.toUpperCase().includes('SIS') && (
                              <button
                                onClick={() => setFuaCuenta(p.IdCuentaAtencion)}
                                className="gp-primary-btn"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#075985', color: '#fff', border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
                                FUA
                              </button>
                            )}
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

      {fuaCuenta != null && (
        <SisFuaReport
          idCuentaAtencion={fuaCuenta}
          onClose={() => setFuaCuenta(null)}
        />
      )}
    </div>
  )
}