import { Injectable, signal, computed } from '@angular/core';

export type ViewMode = 'tray' | 'form';

export interface PacienteMock {
  id: string;
  historia: string;
  nombre: string;
  edad: string;
  sexo: string;
  ubicacion: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class EvolucionService {
  // Estado base con Signals
  public viewMode = signal<ViewMode>('tray');
  public patientSearch = signal<string>('');
  
  // Datos simulados (mocks) para la bandeja
  public pacientes = signal<PacienteMock[]>([
    { id: '1', historia: 'HC-99201', nombre: 'Carlos Ruiz', edad: '45 años', sexo: 'Masculino', ubicacion: 'Cama 12 - Hosp', estado: 'Estable' },
    { id: '2', historia: 'HC-99202', nombre: 'Ana López', edad: '32 años', sexo: 'Femenino', ubicacion: 'Emergencia - Triage', estado: 'Delicado' },
    { id: '3', historia: 'HC-99203', nombre: 'Miguel Santos', edad: '68 años', sexo: 'Masculino', ubicacion: 'UCI - Cama 4', estado: 'Crítico' },
  ]);

  public activePatient = signal<PacienteMock | null>(null);

  // Derivados (Computed)
  public filteredPacientes = computed(() => {
    const term = this.patientSearch().toLowerCase();
    if (!term) return this.pacientes();
    return this.pacientes().filter(p => 
      p.nombre.toLowerCase().includes(term) || p.historia.toLowerCase().includes(term)
    );
  });

  // Acciones
  public setViewMode(mode: ViewMode) {
    this.viewMode.set(mode);
  }

  public selectPatient(paciente: PacienteMock) {
    this.activePatient.set(paciente);
    this.setViewMode('form');
  }

  public clearSelection() {
    this.activePatient.set(null);
    this.setViewMode('tray');
  }
}
