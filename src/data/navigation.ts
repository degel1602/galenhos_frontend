export type Screen = 'dashboard' | 'pacientes' | 'citas' | 'triaje' | 'admisiones' | 'config'

export const screenTitles: Record<Screen, string> = {
  dashboard: 'Dashboard',
  pacientes: 'Pacientes',
  citas: 'Citas Médicas',
  triaje: 'Triaje de Emergencia',
  admisiones: 'Admisiones',
  config: 'Configuración',
}
