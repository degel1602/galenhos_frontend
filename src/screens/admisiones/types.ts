export interface PendienteAdmision {
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
  Servicio?: string | null
  Descripcion: string | null
  Direccion: string | null
  EsAccidenteTransito: number | null
  IdFuenteFinanciamiento: number | null
  IdCuentaAtencion: number | null
  IAFA?: string | null
  estado: string | null
  fecha_Triaje: string | null
}

export interface CatalogoItem {
  id: number
  nombre: string
}

export const tipoPrioridadInfo: Record<number, { label: string; bg: string; text: string; dot: string }> = {
  1: { label: 'I. Emerg. o Gravedad', bg: '#fee2e2', text: '#b91c1c', dot: '#dc2626' },
  2: { label: 'II. Urgencia Mayor', bg: '#ffedd5', text: '#c2410c', dot: '#f97316' },
  3: { label: 'III. Urgencia Menor', bg: '#fef9c3', text: '#a16207', dot: '#eab308' },
  4: { label: 'IV. Patología Aguda Común', bg: '#d1fae5', text: '#047857', dot: '#10b981' },
  5: { label: 'Llegó Cadáver', bg: '#dbeafe', text: '#1d4ed8', dot: '#3b82f6' },
}

export function formatFechaTriaje(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit' }) + ' ' + d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}