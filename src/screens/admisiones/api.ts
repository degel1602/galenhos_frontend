import { getToken } from '../../api/client'
import type { PendienteAdmision } from './types'

export function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { accept: 'application/json', ...extra }
  const token = getToken()
  if (token) headers.authorization = `Bearer ${token}`
  return headers
}

export async function cargarCatalogos(): Promise<{ departamentos: { id: number; nombre: string }[]; especialidades: { id: number; nombre: string }[]; servicios: { id: number; nombre: string }[] }> {
  try {
    const [dep, esp, srv] = await Promise.all([
      fetch('/api/v1/departamentos', { headers: authHeaders() }).then(r => r.json()),
      fetch('/api/v1/especialidades', { headers: authHeaders() }).then(r => r.json()),
      fetch('/api/v1/servicios/2', { headers: authHeaders() }).then(r => r.json()),
    ])
    const norm = <T extends { id: number; nombre: string | null }>(arr: T[]) => arr.map(i => ({ id: i.id, nombre: (i.nombre ?? '').trim() })).filter(i => i.nombre)
    return {
      departamentos: norm((dep?.data ?? []) as { id: number; nombre: string | null }[]),
      especialidades: norm((esp?.data ?? []) as { id: number; nombre: string | null }[]),
      servicios: norm((srv?.data ?? []) as { id: number; nombre: string | null }[]),
    }
  } catch {
    return { departamentos: [], especialidades: [], servicios: [] }
  }
}

export async function buscarPendientesAdmision(params: { fecha: string; idDepartamento: string; idEspecialidad: string; idServicio: string; filtro: string }): Promise<PendienteAdmision[]> {
  const qs = new URLSearchParams({
    fecha: params.fecha,
    idDepartamento: params.idDepartamento,
    idEspecialidad: params.idEspecialidad,
    idServicio: params.idServicio,
    idTipoServicio: '2',
  })
  if (params.filtro.trim()) qs.set('filtro', params.filtro.trim())
  const res = await fetch(`/api/v1/triaje/pendientes-admision?${qs.toString()}`, { headers: authHeaders() })
  if (!res.ok) throw new Error('No se pudo consultar los pendientes de admisión.')
  const env = await res.json()
  return (env?.data ?? []) as PendienteAdmision[]
}

export async function registrarAdmision(body: { idTriaje: number; idPacienteTriaje: number; idEmpleado: number; nombreAcompanante: string | null; telefonoAcompanante: string | null; direccionPaciente: string | null; observacion: string | null }): Promise<string> {
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
    return resultado.replace(/^OK[;: ]*/i, '').trim() || 'Admisión generada correctamente. Se creó el número de cuenta.'
  }
  const detalle = env?.error?.message ?? resultado ?? (res.status >= 400 ? `HTTP ${res.status}: ${raw.slice(0, 200)}` : 'No se pudo registrar la admisión.')
  throw new Error(String(detalle).replace(/^Error[;: ]*/i, ''))
}