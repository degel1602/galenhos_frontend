import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { Modal } from '../../components/ui/Modal'
import { getStoredUsername, getToken } from '../../api/client'

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { accept: 'application/json', ...extra }
  const token = getToken()
  if (token) headers.authorization = `Bearer ${token}`
  return headers
}

export interface TriajeReporteData {
  idTriaje?: number
  NroDocumento?: string | null
  Paciente?: string | null
  FechaNacimiento?: string | null
  EstadoCivil?: string | null
  Sexo?: string | null
  Direccion?: string | null
  Distrito?: string | null
  Edad?: string | null
  Telefono?: string | null
  fuentefinanciamiento?: string | null
  Gravedad?: string | null
  temperatura?: string | null
  presion_arterial?: string | null
  frecuencia_respiratoria?: number | null
  frecuencia_cardiaca?: number | null
  peso?: string | null
  talla?: number | null
  IMC?: string | null
  escala_glasgow?: number | null
  escala_dolor?: number | null
  sintoma_principal?: string | null
  tiempo_evolucion_cantidad?: number | null
  tiempo_evolucion_unidad?: string | null
  Servicio?: string | null
}

interface DatosInstitucion {
  rucEess?: string | null
  nombre?: string | null
  direccion?: string | null
  telefono?: string | null
  logoMinsa?: string | null
  logoHospi?: string | null
}

export function decodificarBase64Reporte(valor: string | null | undefined): string {
  if (!valor) return ''
  try {
    if (/^[A-Za-z0-9+/]+={0,2}$/.test(valor)) return atob(valor)
  } catch {
    /* no es base64 válido */
  }
  return valor
}

function formatFechaReporte(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso ?? ''
  return d.toLocaleDateString('es-PE')
}

export function ReporteTriajeModal({ idTriaje, onClose }: { idTriaje: number; onClose: () => void }) {
  const [cabecera, setCabecera] = useState<TriajeReporteData | null>(null)
  const [institucion, setInstitucion] = useState<DatosInstitucion | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function cargar() {
      try {
        const [rReporte, rInst] = await Promise.all([
          fetch(`/api/v1/triaje/reporte?id=${idTriaje}`, { headers: authHeaders() }),
          fetch(`/api/v1/datos-institucion`, { headers: authHeaders() }),
        ])
        const envR = await rReporte.json().catch(() => null)
        const envI = await rInst.json().catch(() => null)
        if (cancelled) return
        const data = (envR?.data ?? []) as TriajeReporteData[]
        if (!rReporte.ok || !Array.isArray(data) || data.length === 0) {
          setError(envR?.error?.message ?? 'No se encontró el reporte del triaje.')
        } else {
          setCabecera(data[0])
          setInstitucion((envI?.data ?? null) as DatosInstitucion | null)
        }
      } catch {
        if (!cancelled) setError('No se pudo cargar el reporte del triaje.')
      } finally {
        if (!cancelled) setCargando(false)
      }
    }
    cargar()
    return () => { cancelled = true }
  }, [idTriaje])

  const usuario = getStoredUsername() ?? ''
  const fechaImp = new Date().toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })

  const tdLabel: CSSProperties = { textAlign: 'center', fontSize: 10, background: '#cccccc', border: '1px solid #000' }
  const tdValue: CSSProperties = { border: '1px solid #000', textAlign: 'center', fontSize: 10, textTransform: 'uppercase', padding: '2px 5px' }
  const tdValueLeft: CSSProperties = { ...tdValue, textAlign: 'left' }

  function imprimirReporte() {
    if (!cabecera) return
    const c = cabecera
    const v = (x: string | number | null | undefined) => (x === null || x === undefined || x === '' ? '—' : String(x))
    const celda = (value: string | number | null | undefined, centro = false) =>
      `<td style="border:1px solid #000;font-size:10px;text-align:${centro ? 'center' : 'left'};text-transform:uppercase;padding:2px 5px">${v(value)}</td>`
    const etiqueta = (t: string) => `<td style="background:#cccccc;border:1px solid #000;font-size:10px;text-align:center">${t}</td>`

    const tmpl = `<!doctype html><html><head><meta charset="utf-8"><title>Reporte de Triaje N° ${idTriaje}</title>
      <style>
        @page { margin: 1cm; font-family: Arial; }
        body { font-family: Arial, sans-serif; margin: 1cm; color: #000; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 2px 5px; }
        .centrar { text-align: center; }
        .datosemer { text-align: center; font-size: 6.5px; background: #cccccc; border: 1px solid #000; }
        .mayuscula { text-transform: uppercase; font-size: 9px; }
      </style></head><body>
        <table style="width:100%"><tr><td style="width:50%;text-align:left">${institucion?.logoMinsa ? `<img src="data:image/png;base64,${institucion.logoMinsa}" style="width:90px">` : ''}</td>
        <td style="text-align:right;font-size:7px;color:#4c4c4c">Fecha: ${fechaImp}<br>U. Impresión: ${usuario}</td></tr></table>
        <table style="width:100%;margin-top:8px"><tr><td style="text-align:center;font-size:14px" class="centrar"><b>TRIAJE</b></td></tr></table>
        <table style="width:100%;text-align:center;font-size:9.5px">
          <tr><td style="text-align:center">RUC: ${institucion?.rucEess ?? '—'}</td></tr>
          <tr><td style="text-align:center">DIRECCIÓN: ${institucion?.direccion ?? '—'}</td></tr>
          <tr><td style="text-align:center">Telef.: ${institucion?.telefono ?? '—'}</td></tr>
          <tr><td colspan="35">&nbsp;</td></tr>
        </table>
        <table style="width:100%;font-size:11px">
          <tr>
            ${etiqueta('N° DOCUMENTO')} ${celda(c.NroDocumento, false)} ${etiqueta('N° DE TRIAJE')} ${celda(c.idTriaje ?? idTriaje, true)} ${etiqueta('FUEN. FIN')} ${celda(c.fuentefinanciamiento, true)}
          </tr>
          <tr>${etiqueta('PACIENTE')} ${celda(c.Paciente, false)}</tr>
          <tr>
            ${etiqueta('F.NACIMIENTO')} ${celda(formatFechaReporte(c.FechaNacimiento), false)}
            ${etiqueta('ESTADO CIVIL')} ${celda(c.EstadoCivil, true)}
            ${etiqueta('SEXO')} ${celda(c.Sexo, true)}
          </tr>
          <tr>
            ${etiqueta('DIRECCIÓN')} ${celda(c.Direccion ? (c.Direccion + (c.Distrito ? ', ' + c.Distrito : '')) : '—', false)}
            ${etiqueta('EDAD')} ${celda(c.Edad, true)}
          </tr>
          <tr><td colspan="35"><br></td></tr>
          <tr><td colspan="35" style="border:1px solid #000;background:#cccccc;text-align:center;font-size:6.5px;font-weight:bold">FUNCIONES VITALES</td></tr>
          <tr>
            ${['TEM.','P.A.','F.R.','F.C.','PESO','TALLA','IMC','GLASGOW / DOLOR'].map(h => etiqueta(h)).join('')}
          </tr>
          <tr>
            ${celda(decodificarBase64Reporte(c.temperatura), true)}
            ${celda(c.presion_arterial, true)}
            ${celda(c.frecuencia_respiratoria, true)}
            ${celda(c.frecuencia_cardiaca, true)}
            ${celda(decodificarBase64Reporte(c.peso), true)}
            ${celda(c.talla, true)}
            ${celda(decodificarBase64Reporte(c.IMC), true)}
            ${celda((c.escala_glasgow ?? '—') + ' / ' + (c.escala_dolor ?? '—'), true)}
          </tr>
          <tr><td colspan="35"><br></td></tr>
          <tr><td colspan="35" style="border:1px solid #000;background:#cccccc;text-align:center;font-size:6.5px"><b>MOTIVO DE CONSULTA</b></td></tr>
          <tr>
            ${etiqueta('Síntomas principales')} ${celda(c.sintoma_principal, false)}
            ${etiqueta('Tiempo de evolución')} ${celda((c.tiempo_evolucion_cantidad ?? '') + ' ' + (c.tiempo_evolucion_unidad ?? ''), true)}
          </tr>
          <tr><td colspan="35"><br></td></tr>
          <tr><td colspan="35" style="border:1px solid #000;background:#cccccc;text-align:center;font-size:11px"><b>CLASIFICACIÓN Y DERIVACIÓN</b></td></tr>
          <tr>
            ${etiqueta('Tipo de gravedad')} ${celda(c.Gravedad, false)}
            ${etiqueta('Servicio')} ${celda(c.Servicio, true)}
          </tr>
        </table>
      </body></html>`
    const win = window.open('', '_blank', 'width=820,height=1000')
    if (win) {
      win.document.write(tmpl)
      win.document.close()
      win.focus()
      setTimeout(() => win.print(), 300)
    }
  }

  return (
    <Modal title="Reporte de Triaje" subtitle={`Triaje N° ${idTriaje}`} onClose={onClose} width={760}>
      {cargando ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '40px 0', color: '#54617f', fontSize: 14, fontWeight: 500 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
          Generando reporte...
        </div>
      ) : error ? (
        <div style={{ padding: 20, textAlign: 'center', color: '#b91c1c', fontSize: 13.5, fontWeight: 500 }}>{error}</div>
      ) : (
        <div className="gp-reporte">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 10 }}>
            {institucion?.logoMinsa && (
              <img src={`data:image/png;base64,${institucion.logoMinsa}`} alt="Logo MINSA" style={{ maxHeight: 70 }} />
            )}
            <div style={{ textAlign: 'right', fontSize: 11, color: '#4c4c4c', lineHeight: 1.6 }}>
              <div>Fecha: {fechaImp}</div>
              <div>U. Impresión: {usuario}</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, color: '#07153a', letterSpacing: '.08em', margin: '2px 0' }}>TRIAJE</div>
          <div style={{ textAlign: 'center', fontSize: 12, color: '#333', lineHeight: 1.7, marginBottom: 14 }}>
            <div>RUC: {institucion?.rucEess ?? '—'} · {institucion?.nombre ?? ''}</div>
            <div>DIRECCIÓN: {institucion?.direccion ?? '—'}</div>
            <div>Telef.: {institucion?.telefono ?? '—'}</div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <tbody>
              <tr>
                <td style={tdLabel}>N° DOCUMENTO</td>
                <td style={tdValueLeft} colSpan={3}>{cabecera?.NroDocumento ?? '—'}</td>
                <td style={tdLabel}>N° DE TRIAJE</td>
                <td style={tdValue}>{cabecera?.idTriaje ?? idTriaje}</td>
                <td style={tdLabel}>FUEN. FIN</td>
                <td style={tdValue}>{cabecera?.fuentefinanciamiento ?? '—'}</td>
              </tr>
              <tr>
                <td style={tdLabel}>PACIENTE</td>
                <td style={tdValueLeft} colSpan={7}>{cabecera?.Paciente ?? '—'}</td>
              </tr>
              <tr>
                <td style={tdLabel}>F. NACIMIENTO</td>
                <td style={tdValueLeft} colSpan={2}>{formatFechaReporte(cabecera?.FechaNacimiento)}</td>
                <td style={tdLabel}>ESTADO CIVIL</td>
                <td style={tdValue} colSpan={2}>{cabecera?.EstadoCivil ?? '—'}</td>
                <td style={tdLabel}>SEXO</td>
                <td style={tdValue} colSpan={2}>{cabecera?.Sexo ?? '—'}</td>
              </tr>
              <tr>
                <td style={tdLabel}>EDAD</td>
                <td style={tdValue} colSpan={3}>{cabecera?.Edad ?? '—'}</td>
                <td style={tdLabel}>TELÉFONO</td>
                <td style={tdValueLeft} colSpan={4}>{cabecera?.Telefono ?? '—'}</td>
              </tr>
              <tr>
                <td style={tdLabel}>DIRECCIÓN</td>
                <td style={tdValueLeft} colSpan={7}>{cabecera?.Direccion ?? '—'}{cabecera?.Distrito ? `, ${cabecera.Distrito}` : ''}</td>
              </tr>

              <tr><td colSpan={8} style={{ height: 8 }}>&nbsp;</td></tr>
              <tr>
                <td colSpan={8} style={tdLabel}>FUNCIONES VITALES</td>
              </tr>
              <tr>
                {['TEM. (°C)', 'P.A. (mmHg)', 'F.R. (x min)', 'F.C. (x min)', 'PESO (kg)', 'TALLA (cm)', 'IMC', 'Glasgow / Dolor'].map(h => (
                  <td key={h} style={tdValue}>{h}</td>
                ))}
              </tr>
              <tr>
                <td style={tdValue}>{decodificarBase64Reporte(cabecera?.temperatura)}</td>
                <td style={tdValue}>{cabecera?.presion_arterial ?? '—'}</td>
                <td style={tdValue}>{cabecera?.frecuencia_respiratoria ?? '—'}</td>
                <td style={tdValue}>{cabecera?.frecuencia_cardiaca ?? '—'}</td>
                <td style={tdValue}>{decodificarBase64Reporte(cabecera?.peso)}</td>
                <td style={tdValue}>{cabecera?.talla ?? '—'}</td>
                <td style={tdValue}>{decodificarBase64Reporte(cabecera?.IMC)}</td>
                <td style={tdValue}>{cabecera?.escala_glasgow ?? '—'} / {cabecera?.escala_dolor ?? '—'}</td>
              </tr>

              <tr><td colSpan={8} style={{ height: 8 }}>&nbsp;</td></tr>
              <tr>
                <td colSpan={8} style={tdLabel}>MOTIVO DE CONSULTA</td>
              </tr>
              <tr>
                <td style={tdLabel}>Síntomas principales</td>
                <td style={tdValueLeft} colSpan={5}>{cabecera?.sintoma_principal ?? '—'}</td>
                <td style={tdLabel}>Tiempo de evolución</td>
                <td style={tdValue}>{cabecera?.tiempo_evolucion_cantidad ?? '—'} {cabecera?.tiempo_evolucion_unidad ?? ''}</td>
              </tr>

              <tr><td colSpan={8} style={{ height: 8 }}>&nbsp;</td></tr>
              <tr>
                <td colSpan={8} style={tdLabel}>CLASIFICACIÓN Y DERIVACIÓN</td>
              </tr>
              <tr>
                <td style={tdLabel}>Tipo de gravedad</td>
                <td style={tdValueLeft} colSpan={3}>{cabecera?.Gravedad ?? '—'}</td>
                <td style={tdLabel}>Servicio</td>
                <td style={tdValueLeft} colSpan={3}>{cabecera?.Servicio ?? '—'}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22, borderTop: '1px solid #e6eaf2', paddingTop: 16 }}>
            <button onClick={onClose} className="gp-ghost-btn" style={{ padding: '10px 20px', border: '1px solid #e0e6f1', borderRadius: 11, background: '#fff', fontSize: 14, fontWeight: 600, color: '#54617f', cursor: 'pointer' }}>
              Cerrar
            </button>
            <button onClick={imprimirReporte} className="gp-primary-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#263c7a', color: '#fff', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
              Imprimir PDF
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}