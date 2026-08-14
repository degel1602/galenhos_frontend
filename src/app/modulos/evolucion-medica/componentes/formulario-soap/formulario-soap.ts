import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { EvolucionService } from '../../servicios/evolucion.service';
import { AuthService } from '../../../auth/aplicacion/auth.service';
import { SignosVitalesComponent } from './signos-vitales/signos-vitales';
import { DiagnosticosComponent } from './diagnosticos/diagnosticos';
import { ExamenFisicoComponent } from './examen-fisico/examen-fisico';
import { ResultadosComponent } from './resultados/resultados';
import { PlanTratamientoComponent } from './plan-tratamiento/plan-tratamiento';
import { OrdenesMedicasComponent } from './ordenes-medicas/ordenes-medicas';
import { ProcedimientosCertificadosComponent } from './procedimientos-certificados/procedimientos-certificados';
import { AdjuntosComponent } from './adjuntos/adjuntos';
import { InterconsultasComponent } from './interconsultas/interconsultas';
import { MotivoComponent } from './motivo/motivo';

@Component({
  selector: 'app-formulario-soap',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SignosVitalesComponent,
    DiagnosticosComponent,
    ExamenFisicoComponent,
    ResultadosComponent,
    PlanTratamientoComponent,
    OrdenesMedicasComponent,
    ProcedimientosCertificadosComponent,
    AdjuntosComponent,
    InterconsultasComponent,
    MotivoComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './formulario-soap.html'
})
export class FormularioSoapComponent {
  public readonly evolucionService = inject(EvolucionService);
  public readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  public readonly activePanel = signal<string>('p1');
  public readonly isSaving = signal<boolean>(false);

  public readonly soapForm = this.fb.group({
    motivo: this.fb.group({
      motivoConsulta: [false],
      seguimiento: [false],
      control: [false],
      reevaluacion: [false],
      postoperatorio: [false],
      interconsulta: [false],
      emergencia: [false],
      detalle: ['']
    }),
    subjetivo: this.fb.group({
      dolor: [false],
      fiebre: [false],
      tos: [false],
      nauseas: [false],
      vomitos: [false],
      mareos: [false],
      disnea: [false],
      evolucionSintomas: [''],
      escalaDolor: [null]
    }),
    signosVitales: this.fb.group({
      presionArterial: [''],
      frecuenciaCardiaca: [null],
      frecuenciaRespiratoria: [null],
      temperatura: [null],
      saturacionOxigeno: [null],
      peso: [null],
      talla: [null],
      imc: ['—'],
      glucemia: [null]
    }),
    examenFisico: this.fb.array([
      // Se inicializan los sistemas
      ...['Estado general','Piel','Cabeza','Cuello','Ojos','Oídos','Nariz','Boca','Tórax','Pulmones','Corazón','Abdomen','Genitourinario','Extremidades','Neurológico','Osteomuscular','Estado mental'].map(sys => 
        this.fb.group({
          sistema: [sys],
          hallazgos: ['']
        })
      )
    ]),
    resultados: this.fb.group({
      laboratorio: this.fb.array([]),
      imagenes: this.fb.array([]),
      otros: this.fb.array([])
    }),
    evaluacion: this.fb.group({
      estadoClinico: ['Mejoría'],
      pronostico: ['Bueno']
    }),
    diagnosticos: this.fb.array([
      this.fb.group({
        cie10: [''],
        descripcion: [''],
        tipo: ['Presuntivo'],
        condicion: ['Principal'],
        estado: ['Activo']
      })
    ]),
    plan: this.fb.group({
      farmacologico: this.fb.array([]),
      procedimientosIndicados: this.fb.group({
        curaciones: [false],
        suturas: [false],
        cateter: [false],
        intubacion: [false],
        otro: ['']
      }),
      solicitudExamenes: this.fb.group({
        laboratorio: [''],
        imagenes: [''],
        otros: ['']
      }),
      interconsultas: this.fb.group({
        cardiologia: [false],
        cirugia: [false],
        nutricion: [false],
        psicologia: [false],
        otra: ['']
      }),
      indicacionesGenerales: this.fb.group({
        dieta: [''],
        reposo: [''],
        hidratacion: [''],
        oxigeno: [''],
        restricciones: ['']
      })
    }),
    evolucionLibre: [''],
    ordenesMedicas: this.fb.group({
      orden: [''], // radio
      detalle: ['']
    }),
    prescripcion: this.fb.array([]),
    procedimientosRealizados: this.fb.array([]),
    incapacidad: this.fb.group({
      dias: [null],
      fechaInicio: [''],
      fechaFin: [''],
      motivo: ['']
    }),
    certificados: this.fb.group({
      certificadoMedico: [false],
      informeMedico: [false],
      epicrisis: [false],
      constancias: [false],
      observaciones: ['']
    })
  });

  get signosVitalesForm(): FormGroup {
    return this.soapForm.get('signosVitales') as FormGroup;
  }

  get diagnosticosArray(): FormArray {
    return this.soapForm.get('diagnosticos') as FormArray;
  }

  get examenFisicoArray(): FormArray {
    return this.soapForm.get('examenFisico') as FormArray;
  }

  get resultadosForm(): FormGroup {
    return this.soapForm.get('resultados') as FormGroup;
  }

  get planForm(): FormGroup {
    return this.soapForm.get('plan') as FormGroup;
  }


  async firmar() {
    this.isSaving.set(true);
    const formData = {
      timestamp: new Date().toISOString(),
      ...this.soapForm.value
    };
    
    // Codificar a base64 string
    const dataB64 = btoa(encodeURIComponent(JSON.stringify(formData)).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCodePoint(Number('0x' + p1))));
    
    const success = await this.evolucionService.guardarEvolucion(dataB64);
    this.isSaving.set(false);
    
    if (success) {
      alert('Evolución firmada y guardada correctamente.');
      this.evolucionService.clearSelection();
    } else {
      alert('Error al intentar guardar la evolución.');
    }
  }
}
