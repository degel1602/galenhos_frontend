import { useEffect, useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import { getStoredUsername, getToken } from '../../api/client'

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { accept: 'application/json', ...extra }
  const token = getToken()
  if (token) headers.authorization = `Bearer ${token}`
  return headers
}

export interface FichaAdmisionData {
  IdCuentaAtencion?: number
  NroHistoriaClinica?: number | string
  IAFA?: string | null
  IdTipoGravedad?: number
  PACIENTE?: string | null
  Pac?: string | null
  NroDocumento?: string | null
  TipoDocumento?: string | null
  FechaNacimiento?: string | null
  Sexo?: string | null
  DireccionDomicilio?: string | null
  DepartamentoDomicilio?: string | null
  ProvinciaDomicilio?: string | null
  DistritoDomicilio?: string | null
  Edad?: number
  Ocupacion?: string | null
  GradoInstruccion?: string | null
  EstadoCivil?: string | null
  Telefono?: string | null
  NombreAcompaniante?: string | null
  Servicio?: string | null
  EspecialidadMedico?: string | null
  TipoPrioridad?: string | null
  TipoEdad?: string | null
  Telefono_Acompaniante?: string | null
  NombresMedico?: string | null
  Medico?: string | null
  FechaIngreso?: string | null
  HoraIngreso?: string | null
  temperatura?: string | null
  presion_arterial?: string | null
  frecuencia_respiratoria?: number | null
  frecuencia_cardiaca?: number | null
  peso?: string | null
  talla?: number | null
  saturacion_oxigeno?: string | null
  escala_glasgow?: number | null
}

function decodificarBase64(valor: string | null | undefined): string {
  if (!valor) return ''
  try {
    if (/^[A-Za-z0-9+/]+={0,2}$/.test(valor)) return atob(valor)
  } catch {
    /* no es base64 */
  }
  return valor
}

interface DatosInstitucion {
  rucEess?: string | null
  nombre?: string | null
  direccion?: string | null
  telefono?: string | null
  logoMinsa?: string | null
}

export function FichaAdmisionModal({ idCuentaAtencion, onClose }: { idCuentaAtencion: number; onClose: () => void }) {
  const [ficha, setFicha] = useState<FichaAdmisionData | null>(null)
  const [institucion, setInstitucion] = useState<DatosInstitucion | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function cargar() {
      try {
        const [rFicha, rInst] = await Promise.all([
          fetch(`/api/v1/triaje/ficha-admision?idCuentaAtencion=${idCuentaAtencion}`, { headers: authHeaders() }),
          fetch(`/api/v1/datos-institucion`, { headers: authHeaders() }),
        ])
        const envF = await rFicha.json().catch(() => null)
        const envI = await rInst.json().catch(() => null)
        if (cancelled) return
        if (!rFicha.ok || !envF?.data) {
          setError(envF?.error?.message ?? 'No se encontró la ficha de admisión.')
        } else {
          setFicha(envF.data as FichaAdmisionData)
          setInstitucion((envI?.data ?? null) as DatosInstitucion | null)
        }
      } catch {
        if (!cancelled) setError('No se pudo cargar la ficha de admisión.')
      } finally {
        if (!cancelled) setCargando(false)
      }
    }
    cargar()
    return () => { cancelled = true }
  }, [idCuentaAtencion])

  function generarHtmlFicha(): string {
    if (!ficha) return ''
    const usuario = getStoredUsername() ?? ''
    const fechaImp = new Date().toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    const v = (x: string | number | null | undefined) => (x === null || x === undefined || x === '' ? '&nbsp;' : String(x))
    const unde = (ancho = 420) => `<span style="display:inline-block;border-bottom:1px solid #000;width:${ancho}px">&nbsp;</span>`

    const etiq = (t: string) => `<td style="background:#e3e6ee;border:1px solid #000;text-align:center;font-size:8.5px;text-transform:uppercase;font-weight:bold;padding:2px 4px;width:11%">${t}</td>`
    const dato = (val: string | number | null | undefined, extra = '') => `<td style="border:1px solid #000;font-size:11px;text-transform:uppercase;padding:2px 5px;width:11% ${extra}">${v(val)}</td>`

    const filasDiagnostico = (filas: number) => {
      let out = ''
      for (let i = 1; i <= filas; i++) {
        out += `<tr>
          <td style="border:1px solid #000;text-align:center;font-size:10px;padding:4px 0">${i}</td>
          <td style="border:1px solid #000;width:8%">&nbsp;</td>
          <td style="border:1px solid #000;width:62%">&nbsp;</td>
          <td style="border:1px solid #000;width:22%">&nbsp;</td>
        </tr>`
      }
      return out
    }

    const filasMedicamento = (filas: number) => {
      let out = ''
      for (let i = 1; i <= filas; i++) {
        out += `<tr>
          <td style="border:1px solid #000;text-align:center;font-size:10px;padding:4px 0">${i}</td>
          <td style="border:1px solid #000">&nbsp;</td>
          <td style="border:1px solid #000">&nbsp;</td>
          <td style="border:1px solid #000">&nbsp;</td>
          <td style="border:1px solid #000">&nbsp;</td>
          <td style="border:1px solid #000">&nbsp;</td>
          <td style="border:1px solid #000">&nbsp;</td>
          <td style="border:1px solid #000">&nbsp;</td>
        </tr>`
      }
      return out
    }

    const tmpl = `<!doctype html><html><head><meta charset="utf-8"><title>REPORTE DE ADMISIÓN - CUENTA N° ${idCuentaAtencion}</title>
      <style>
        @page { size: letter landscape; margin: 0.6cm; }
        body { margin: 0; color: #000; font-family: Arial, sans-serif; }
        table { border-collapse: collapse; }
      </style></head><body>
      <table style="width:100%;margin-bottom:4px">
        <tr>
          <td style="width:15%;vertical-align:top">${institucion?.logoMinsa ? `<img src="data:image/png;base64,${institucion.logoMinsa}" style="height:48px">` : ''}</td>
          <td style="text-align:center;vertical-align:top">
            <b style="font-size:17px;letter-spacing:.06em">REGISTRO DE EMERGENCIA</b>
            <div style="border-bottom:1px solid #000;margin:1px 0 3px"></div>
            <div style="font-size:8.5px;line-height:1.3">MINISTERIO DE SALUD<br>${institucion?.nombre ?? '&nbsp;'}<br>${institucion?.direccion ?? '&nbsp;'}</div>
          </td>
          <td style="width:15%;text-align:right;vertical-align:top;font-size:7px;color:#444">FECHA: ${fechaImp}<br>U. IMPRESIÓN: ${usuario}</td>
        </tr>
      </table>

      <table style="width:100%;line-height:1.5;margin-bottom:4px">
        <tr>
          ${etiq('Nro. Hist. Clínica')}<td style="border:1px solid #000;font-size:12px;font-weight:bold;text-align:center;width:11%">${v(ficha?.NroHistoriaClinica)}</td>
          ${etiq('N° Cuenta')}<td style="border:1px solid #000;font-size:12px;font-weight:bold;text-align:center;width:11%">${v(ficha?.IdCuentaAtencion)}</td>
          ${etiq('IAFA')}<td style="border:1px solid #000;font-size:12px;font-weight:bold;text-align:center;width:11%">${v(ficha?.IAFA)}</td>
        </tr>
        <tr>
          ${etiq('Paciente')}<td colspan="4" style="border:1px solid #000;font-size:12px;text-transform:uppercase;padding:2px 5px">${v(ficha?.PACIENTE ?? ficha?.Pac)}</td>
        </tr>
        <tr>
          ${etiq('F. Nacim.')} ${dato(ficha?.FechaNacimiento)} ${etiq('Sexo')} ${dato(ficha?.Sexo)}
          ${etiq('Edad')} ${dato(ficha?.Edad)} ${etiq('N° Doc.')} ${dato(ficha?.NroDocumento)}
        </tr>
        <tr>
          ${etiq('Domicilio')}<td colspan="4" style="border:1px solid #000;font-size:10px;text-transform:uppercase">${v(ficha?.DireccionDomicilio)}</td>
        </tr>
        <tr>
          ${etiq('Estado Civil')} ${dato(ficha?.EstadoCivil)} ${etiq('Ocupación')} ${dato(ficha?.Ocupacion)}
          ${etiq('Teléfono')} ${dato(ficha?.Telefono)} ${etiq('Instrucción')} ${dato(ficha?.GradoInstruccion)}
        </tr>
        <tr>
          ${etiq('Acompañante')}<td colspan="3" style="border:1px solid #000;font-size:11px;text-transform:uppercase">${v(ficha?.NombreAcompaniante)}</td>
          ${etiq('Tel. Acc.')} ${dato(ficha?.Telefono_Acompaniante)}
        </tr>
        <tr>
          ${etiq('F. Ingreso')} ${dato(ficha?.FechaIngreso + ' ' + ficha?.HoraIngreso)} ${etiq('Servicio')} ${dato(ficha?.Servicio)}
          ${etiq('Médico')}<td colspan="2" style="border:1px solid #000;font-size:10px;text-transform:uppercase">${v(ficha?.NombresMedico ?? ficha?.Medico)}</td>
        </tr>
        <tr>
          ${etiq('Prioridad')}<td colspan="4" style="border:1px solid #000;font-size:12px;font-weight:bold">${v(ficha?.TipoPrioridad)}</td>
        </tr>
      </table>

      <div style="border:1px solid #000;background:#eee;text-align:center;font-size:10px;font-weight:bold;padding:2px">ANAMNESIS</div>
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="border:1px solid #000;width:50%;vertical-align:top;padding:3px">
            <b style="font-size:9px">DIRECTA:</b>
            <div style="height:110px"></div>
          </td>
          <td style="border:1px solid #000;width:50%;vertical-align:top;padding:3px">
            <b style="font-size:9px">INDIRECTA:</b>
            <div style="height:110px"></div>
          </td>
        </tr>
      </table>
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="border:1px solid #000;width:60%;padding:3px 5px;font-size:11px">FECHA Y HORA DE ATENCIÓN:&nbsp;${unde(300)}</td>
          <td style="border:1px solid #000;width:40%;padding:3px 5px;font-size:11px"></td>
        </tr>
      </table>

      <div style="border:1px solid #000;background:#eee;text-align:center;font-size:10px;font-weight:bold;padding:2px;margin-top:4px">FUNCIONES VITALES</div>
      <table style="width:100%;border-collapse:collapse;line-height:1.5">
        <tr>
          ${etiq('TEMP')} ${dato(decodificarBase64(ficha?.temperatura))} ${etiq('P.A')} ${dato(ficha?.presion_arterial)}
          ${etiq('F.R')} ${dato(ficha?.frecuencia_respiratoria)} ${etiq('F.C')} ${dato(ficha?.frecuencia_cardiaca)}
        </tr>
        <tr>
          ${etiq('Peso')} ${dato(decodificarBase64(ficha?.peso))} ${etiq('Talla')} ${dato(ficha?.talla)}
          ${etiq('SpO2')} ${dato(decodificarBase64(ficha?.saturacion_oxigeno))} ${etiq('Glasgow')} ${dato(ficha?.escala_glasgow)}
        </tr>
      </table>

      <div style="border:1px solid #000;background:#eee;text-align:center;font-size:10px;font-weight:bold;padding:2px;margin-top:4px">EXAMEN CLÍNICO</div>
      <table style="width:100%;border-collapse:collapse"><tr><td style="border:1px solid #000;height:170px">&nbsp;</td></tr></table>

      <div style="border:1px solid #000;background:#eee;text-align:center;font-size:10px;font-weight:bold;padding:2px;margin-top:4px">DIAGNÓSTICOS</div>
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="border:1px solid #000;background:#eee;text-align:center;font-size:8px;font-weight:bold;width:5%">N°</td>
          <td style="border:1px solid #000;background:#eee;text-align:center;font-size:8px;font-weight:bold;width:8%">P/S</td>
          <td style="border:1px solid #000;background:#eee;text-align:center;font-size:8px;font-weight:bold;width:65%">DIAGNÓSTICO (CIE-10)</td>
          <td style="border:1px solid #000;background:#eee;text-align:center;font-size:8px;font-weight:bold;width:22%">CÓDIGO</td>
        </tr>
        ${filasDiagnostico(4)}
      </table>

      <div style="border:1px solid #000;background:#eee;text-align:center;font-size:10px;font-weight:bold;padding:2px;margin-top:4px">PLAN DE TRABAJO</div>
      <table style="width:100%;border-collapse:collapse;line-height:1.8">
        <tr>
          <td style="border:1px solid #000;padding:3px 6px;width:4%"></td>
          <td style="border:1px solid #000;padding:3px 6px">EXÁMENES AUXILIARES: ${unde(300)}</td>
        </tr>
        <tr>
          <td style="border:1px solid #000;padding:3px 6px"></td>
          <td style="border:1px solid #000;padding:3px 6px">AGA: ${unde(180)} EKG: ${unde(180)} Rx: ${unde(180)}</td>
        </tr>
      </table>

      <table style="width:100%;border-collapse:collapse;line-height:1.8">
        <tr>
          <td style="border:1px solid #000;padding:3px 6px"></td>
          <td style="border:1px solid #000;padding:3px 6px">EXÁMENES / IMÁGENES: ${unde(280)}</td>
        </tr>
      </table>
      <table style="width:100%;border-collapse:collapse;line-height:1.8">
        <tr>
          <td style="border:1px solid #000;padding:3px 6px"></td>
          <td style="border:1px solid #000;padding:3px 6px">INTERCONSULTAS: ${unde(300)}</td>
        </tr>
        <tr>
          <td style="border:1px solid #000;padding:3px 6px"></td>
          <td style="border:1px solid #000;padding:3px 6px">REFERENCIA / CONTRA-REFERENCIA: ${unde(240)}</td>
        </tr>
        <tr>
          <td style="border:1px solid #000;padding:3px 6px"></td>
          <td style="border:1px solid #000;padding:3px 6px">PROCEDIMIENTO: ${unde(300)}</td>
        </tr>
      </table>

      <div style="border:1px solid #000;background:#eee;text-align:center;font-size:10px;font-weight:bold;padding:2px;margin-top:4px">DIAGNÓSTICOS DE EGRESO</div>
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="border:1px solid #000;background:#eee;text-align:center;font-size:8px;font-weight:bold;width:5%">N°</td>
          <td style="border:1px solid #000;background:#eee;text-align:center;font-size:8px;font-weight:bold;width:8%">P/D</td>
          <td style="border:1px solid #000;background:#eee;text-align:center;font-size:8px;font-weight:bold;width:65%">DIAGNÓSTICO DE EGRESO</td>
          <td style="border:1px solid #000;background:#eee;text-align:center;font-size:8px;font-weight:bold;width:22%">CÓDIGO</td>
        </tr>
        ${filasDiagnostico(4)}
      </table>
      <table style="width:100%;border-collapse:collapse;line-height:1.7">
        <tr>
          <td style="border:1px solid #000;padding:4px 6px">&nbsp;</td>
          <td style="border:1px solid #000;padding:4px 6px;font-size:11px">
            <b>CONDICIÓN DE EGRESO:</b>&nbsp;
            ${['ALTA', 'TRANSFERENCIA', 'FALLECIDO', 'OBSERVACIÓN', 'REFERENCIA', 'RETIRO VOLUNTARIO', 'SOP', 'FUGA', 'UCI', 'HOSPITALIZACIÓN', 'OTROS'].map(c => `[ ] ${c}`).join(' &nbsp; ')}
          </td>
        </tr>
        <tr>
          <td style="border:1px solid #000;padding:4px 6px">&nbsp;</td>
          <td style="border:1px solid #000;padding:4px 6px;font-size:11px">FECHA Y HORA DE EGRESO: ${unde(200)} &nbsp;&nbsp; FIRMA DEL MÉDICO: ${unde(200)}</td>
        </tr>
      </table>

      <div style="border:1px solid #000;background:#eee;text-align:center;font-size:10px;font-weight:bold;padding:2px;margin-top:4px">TRATAMIENTO / MEDICAMENTOS</div>
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="border:1px solid #000;background:#eee;text-align:center;font-size:8px;font-weight:bold;width:5%">N°</td>
          <td style="border:1px solid #000;background:#eee;text-align:center;font-size:8px;font-weight:bold;width:12%">FECHA</td>
          <td style="border:1px solid #000;background:#eee;text-align:center;font-size:8px;font-weight:bold;width:30%">MEDICAMENTO</td>
          <td style="border:1px solid #000;background:#eee;text-align:center;font-size:8px;font-weight:bold;width:10%">DOSIS</td>
          <td style="border:1px solid #000;background:#eee;text-align:center;font-size:8px;font-weight:bold;width:8%">VÍA</td>
          <td style="border:1px solid #000;background:#eee;text-align:center;font-size:8px;font-weight:bold;width:8%">FREC.</td>
          <td style="border:1px solid #000;background:#eee;text-align:center;font-size:8px;font-weight:bold;width:10%">HORA</td>
          <td style="border:1px solid #000;background:#eee;text-align:center;font-size:8px;font-weight:bold;width:17%">FIRMA</td>
        </tr>
        ${filasMedicamento(6)}
      </table>
      <table style="width:100%;border-collapse:collapse;margin-top:3px">
        <tr>
          <td style="border:1px solid #000;vertical-align:top;padding:4px;width:50%"><b>EVOLUCIÓN Y EVALUACIÓN:</b><br>${unde(400)}<br>${unde(400)}<br>${unde(400)}</td>
          <td style="border:1px solid #000;vertical-align:top;padding:4px;width:50%"><b>EVALUACIÓN DE ENFERMERÍA:</b><br>${unde(400)}<br>${unde(400)}<br>${unde(400)}</td>
        </tr>
      </table>
    </body></html>`
    return tmpl
  }

  function imprimirFicha(html: string) {
    if (!html) return
    const win = window.open('', '_blank', 'width=1200,height=900')
    if (win) {
      win.document.write(html)
      win.document.close()
      win.focus()
      setTimeout(() => win.print(), 500)
    }
  }

  return (
    <Modal title="Ficha de Admisión" subtitle={`Cuenta N° ${idCuentaAtencion}`} onClose={onClose} width={780}>
      {cargando ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '40px 0', color: '#54617f', fontSize: 14, fontWeight: 500 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
          Cargando ficha...
        </div>
      ) : error ? (
        <div style={{ padding: 20, textAlign: 'center', color: '#b91c1c', fontSize: 13.5, fontWeight: 500 }}>{error}</div>
      ) : ficha ? (
        <div>
          <iframe
            title={`Ficha de Admisión N° ${idCuentaAtencion}`}
            srcDoc={generarHtmlFicha()}
            style={{ width: '100%', height: '68vh', border: '1px solid #e2e8f2', borderRadius: 12, background: '#fff' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16, borderTop: '1px solid #e6eaf2', paddingTop: 16 }}>
            <button onClick={onClose} className="gp-ghost-btn" style={{ padding: '10px 20px', border: '1px solid #e0e6f1', borderRadius: 11, background: '#fff', fontSize: 14, fontWeight: 600, color: '#54617f', cursor: 'pointer' }}>
              Cerrar
            </button>
            <button onClick={() => imprimirFicha(generarHtmlFicha())} className="gp-primary-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#263c7a', color: '#fff', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
              Imprimir PDF
            </button>
          </div>
        </div>
      ) : null}
    </Modal>
  )
}