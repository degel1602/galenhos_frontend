import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Etiqueta } from '../../../../../../compartido/ui/etiqueta/etiqueta';

interface PacienteTriaje {
  id: string;
  codigo: string;
  hcCodigo: string | null;
  tipoDocumento: string;
  documento: string | null;
  nombre: string;
  seguro: string | null;
  arrivalTs: number;
  estado: 'sin-triaje' | 'triado';
  evaluacion: any | null;
}

@Component({
  selector: 'app-triaje',
  standalone: true,
  imports: [CommonModule, Etiqueta],
  templateUrl: './triaje.component.html'
})
export class TriajeComponent implements OnInit {
  pacientes: PacienteTriaje[] = [];

  ngOnInit() {
    this.cargarDatosDemo();
  }

  cargarDatosDemo() {
    const now = Date.now();
    this.pacientes = [
      {
        id: '1', codigo: 'TR-001', hcCodigo: 'HC-198822', tipoDocumento: 'DNI', documento: '45102233',
        nombre: 'Jorge Luis Quispe Ramos', seguro: 'SIS', arrivalTs: now - 18 * 60_000, estado: 'sin-triaje', evaluacion: null,
      },
      {
        id: '2', codigo: 'TR-002', hcCodigo: 'HC-190044', tipoDocumento: 'DNI', documento: '42678930',
        nombre: 'Rosa Chumpitaz León', seguro: 'SIS', arrivalTs: now - 9 * 60_000, estado: 'sin-triaje', evaluacion: null,
      },
      {
        id: '4', codigo: 'TR-004', hcCodigo: 'HC-188213', tipoDocumento: 'DNI', documento: '41556678',
        nombre: 'Marco Antonio Effio Reyes', seguro: 'Particular', arrivalTs: now - 55 * 60_000, estado: 'triado',
        evaluacion: { motivo: 'Dolor abdominal', pa: '118/76', fc: '82', fr: '18', temp: '36.8', spo2: '98', prioridad: 'amarillo' },
      }
    ];
  }

  tiempoEspera(ts: number): number {
    return Math.floor((Date.now() - ts) / 60000);
  }

  abrirModalRegistro() {
    alert('Funcionalidad de registro de paciente en construcción (Migración a Angular)');
  }

  iniciarTriaje(paciente: PacienteTriaje) {
    alert(`Iniciando evaluación para ${paciente.nombre} (Migración a Angular)`);
  }
}
