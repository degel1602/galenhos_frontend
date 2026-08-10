export type TipoDocumento = 'DNI' | 'CE' | 'PAS' | 'SIS' | 'SD'
export type Estado = 'sin-triaje' | 'triado'
export type Prioridad = 'rojo' | 'naranja' | 'amarillo' | 'verde' | 'azul'

export interface TriajeEvaluacion {
  motivo: string
  pa: string
  fc: string
  fr: string
  temp: string
  spo2: string
  prioridad: Prioridad
}

export interface PacienteTriaje {
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

export interface RegistroTriaje {
  idTriaje: number
  NroDocumento?: string | null
  Paciente?: string | null
  fecha_registro?: string
  Servicio?: string | null
  TipoGravedad?: string | null
  IdEstado?: number
}

export interface UbicacionItem {
  id: number
  nombre: string
}

export const prioridadInfo: Record<Prioridad, { label: string; variant: 'danger' | 'warning' | 'info' | 'success' | 'neutral' }> = {
  rojo: { label: 'Rojo · Emergencia', variant: 'danger' },
  naranja: { label: 'Naranja · Muy urgente', variant: 'warning' },
  amarillo: { label: 'Amarillo · Urgente', variant: 'warning' },
  verde: { label: 'Verde · Poco urgente', variant: 'success' },
  azul: { label: 'Azul · No urgente', variant: 'info' },
}

export const frecuenciaTiempoOptions = ['Minutos', 'Horas', 'Días', 'Semanas', 'Meses', 'Años']

export const tipoPrioridadOptions: { id: string; label: string; color: string }[] = [
  { id: '1', label: 'I. Emerg. o Gravedad', color: '#3b82f6' },
  { id: '2', label: 'II. Urgencia Mayor', color: '#22c55e' },
  { id: '3', label: 'III. Urgencia Menor', color: '#eab308' },
  { id: '4', label: 'IV. Patología Aguda Común', color: '#f97316' },
  { id: '5', label: 'Llegó Cadáver', color: '#ef4444' },
]

export interface SisAfiliadoData {
  idError?: string
  resultado?: string
  tipoDocumento?: string
  nroDocumento?: string
  apePaterno?: string
  apeMaterno?: string
  nombres?: string
  fecAfiliacion?: string
  eess?: string
  descEESS?: string
  eessUbigeo?: string
  descEessUbigeo?: string
  regimen?: string
  tipoSeguro?: string
  descTipoSeguro?: string
  contrato?: string
  fecCaducidad?: string
  estado?: string
  tabla?: string
  idNumReg?: string
  genero?: string
  fecNacimiento?: string
  idUbigeo?: string
  direccion?: string
  disa?: string
  tipoFormato?: string
  nroContrato?: string
  correlativo?: string
  idPlan?: string
  idGrupoPoblacional?: string
  msgConfidencial?: string
  afiliado: boolean
}