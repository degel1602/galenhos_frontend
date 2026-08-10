import { getToken } from '../../api/client'
import type { SisAfiliadoData, UbicacionItem } from './types'

export function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { accept: 'application/json', ...extra }
  const token = getToken()
  if (token) headers.authorization = `Bearer ${token}`
  return headers
}

export async function cargarCatalogo<T>(url: string, map: (item: T) => UbicacionItem): Promise<UbicacionItem[]> {
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

export async function consultarSis(nroDocumento: string, tipo: { nombre: string }): Promise<SisAfiliadoData | null> {
  const nombre = tipo.nombre.toUpperCase()
  if (nombre !== 'DNI' && !nombre.includes('EXTRANJER')) return null
  const strTipoDocumento = nombre.includes('EXTRANJER') ? 3 : 1
  const res = await fetch(`/api/v1/sis/afiliado/${encodeURIComponent(nroDocumento)}?strTipoDocumento=${strTipoDocumento}&intOpcion=1`, { headers: authHeaders() })
  const env = await res.json().catch(() => null)
  const data = env?.data as SisAfiliadoData | undefined
  if (!data?.estado) return null
  return { ...data, afiliado: data.estado.toUpperCase() === 'ACTIVO' }
}

export function aIsoParaFiliacion(v: string | undefined): string | null {
  if (!v || !v.trim()) return null
  const s = v.trim()
  const m = s.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})/)
  const d = m ? new Date(`${m[3]}-${m[2]}-${m[1]}`) : new Date(s)
  if (isNaN(d.getTime())) return null
  return d.toISOString()
}

export async function guardarFiliacionSis(d: SisAfiliadoData): Promise<string> {
  const nombres = (d.nombres ?? '').trim().split(/\s+/).filter(Boolean)
  const n = (v?: string) => v && v.trim() !== '' ? v.trim() : null
  const body: Record<string, unknown> = {
    idSiasis: d.idNumReg && !isNaN(Number(d.idNumReg)) ? Number(d.idNumReg) : null,
    codigo: n(d.tabla),
    afiliacionDisa: n(d.disa),
    afiliacionTipoFormato: n(d.tipoFormato),
    afiliacionNroFormato: n(d.nroContrato),
    afiliacionNroIntegrante: n(d.correlativo),
    documentoTipo: n(d.tipoDocumento),
    codigoEstablAdscripcion: n(d.eess),
    afiliacionFecha: aIsoParaFiliacion(d.fecAfiliacion),
    paterno: n(d.apePaterno),
    materno: n(d.apeMaterno),
    pNombre: n(nombres[0]),
    oNombres: n(nombres.slice(1).join(' ')),
    genero: n(d.genero),
    fNacimiento: aIsoParaFiliacion(d.fecNacimiento),
    idDistritoDomicilio: n(d.idUbigeo),
    estado: n(d.estado),
    fBaja: null,
    documentoNumero: n(d.nroDocumento),
    motivoBaja: null,
    fBajaOk: null,
    descEESS: n(d.descEESS),
    descEessUbigeo: n(d.descEessUbigeo),
    regimen: n(d.regimen),
    tipoSeguro: n(d.tipoSeguro),
    descTipoSeguro: n(d.descTipoSeguro),
    contrato: n(d.contrato),
    idPlan: n(d.idPlan),
    idGrupoPoblacional: n(d.idGrupoPoblacional),
    msgConfidencial: n(d.msgConfidencial),
    idUsuarioAuditoria: null,
  }
  const res = await fetch(`/api/v1/sis/filiaciones`, {
    method: 'POST',
    headers: authHeaders({ 'content-type': 'application/json' }),
    body: JSON.stringify(body),
  })
  const env: { success?: boolean; error?: { message?: string } } | null = await res.json().catch(() => null)
  if (!res.ok || !env?.success) {
    const msg = env?.error?.message ?? (res.status >= 400 ? `HTTP ${res.status}` : 'No se pudo guardar la afiliación SIS.')
    throw new Error(String(msg).replace(/^Error[;: ]*/i, ''))
  }
  return 'ok'
}