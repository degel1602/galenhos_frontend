import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { EvolucionService } from '../../servicios/evolucion.service';
import { AuthService } from '../../../auth/aplicacion/auth.service';
import { SintomaService, SintomaCatalogo, SintomaSeleccionado } from '../../servicios/sintoma.service';
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
    FormsModule,
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
export class FormularioSoapComponent implements OnInit {
  public readonly evolucionService = inject(EvolucionService);
  public readonly authService = inject(AuthService);
  private readonly sintomaService = inject(SintomaService);
  private readonly fb = inject(FormBuilder);
  public readonly activePanel = signal<string>('p1');
  public readonly openGroup = signal<string>('encuentro');
  public readonly isSaving = signal<boolean>(false);

  // Síntomas referidos (catálogo + selección)
  public readonly sintomasCatalogo = signal<SintomaCatalogo[]>([]);
  public readonly sintomasSeleccionados = signal<Set<number>>(new Set());
  public readonly sintomasCargando = signal<boolean>(false);
  public readonly grupoSintomasAbierto = signal<string>('general');
  public nuevoSintomaTexto = '';
  public nuevoSintomaSistema = 'general';

  private static readonly ETIQUETAS_SISTEMA: Record<string, string> = {
    general: 'General',
    'respiratorio-cv': 'Respiratorio / Cardiovascular',
    gastrointestinal: 'Gastrointestinal',
    neurologico: 'Neurológico',
    otros: 'Otros'
  };

  readonly sintomasPorSistema = computed(() => {
    const grupos: { clave: string; etiqueta: string; sintomas: SintomaCatalogo[] }[] = [];
    const mapa = new Map<string, SintomaCatalogo[]>();
    for (const s of this.sintomasCatalogo()) {
      const arr = mapa.get(s.sistema) ?? [];
      arr.push(s);
      mapa.set(s.sistema, arr);
    }
    for (const [clave, lista] of mapa) {
      grupos.push({
        clave,
        etiqueta: FormularioSoapComponent.ETIQUETAS_SISTEMA[clave] ?? clave,
        sintomas: [...lista].sort((a, b) => a.orden - b.orden)
      });
    }
    return grupos;
  });

  readonly totalSintomasSeleccionados = computed(() => this.sintomasSeleccionados().size);

  ngOnInit() {
    this.cargarSintomas();
  }

  async cargarSintomas() {
    this.sintomasCargando.set(true);
    const catalogo = await this.sintomaService.listarCatalogo();
    this.sintomasCatalogo.set(catalogo);
    this.sintomasCargando.set(false);
  }

  contarSintomasSistema(clave: string): number {
    const sel = this.sintomasSeleccionados();
    return this.sintomasCatalogo().filter(s => s.sistema === clave && sel.has(s.idSintoma)).length;
  }

  toggleSintoma(idSintoma: number) {
    const nuevo = new Set(this.sintomasSeleccionados());
    if (nuevo.has(idSintoma)) {
      nuevo.delete(idSintoma);
    } else {
      nuevo.add(idSintoma);
    }
    this.sintomasSeleccionados.set(nuevo);
  }

  toggleGrupoSintomas(clave: string) {
    this.grupoSintomasAbierto.set(this.grupoSintomasAbierto() === clave ? '' : clave);
  }

  async agregarSintomaNuevo() {
    const texto = this.nuevoSintomaTexto.trim();
    if (!texto) return;
    const sistema = this.nuevoSintomaSistema;
    const ok = await this.sintomaService.agregarSintoma(sistema, texto);
    if (ok) {
      await this.cargarSintomas();
      const agregado = this.sintomasCatalogo().find(s => s.sistema === sistema && s.sintoma === texto);
      if (agregado) {
        const nuevo = new Set(this.sintomasSeleccionados());
        nuevo.add(agregado.idSintoma);
        this.sintomasSeleccionados.set(nuevo);
      }
      this.grupoSintomasAbierto.set(sistema);
      this.nuevoSintomaTexto = '';
    }
  }

  private static readonly GRUPO_DE_PANEL: Record<string, string> = {
    p1: 'encuentro', p2: 'encuentro',
    p3: 'soap', p4: 'soap', p5: 'soap', p6: 'soap', p7: 'soap',
    p8: 'doc', p9: 'doc', p10: 'doc', p11: 'doc', p14: 'doc',
    p15: 'cierre'
  };

  activarPanel(panel: string) {
    this.activePanel.set(panel);
    const grupo = FormularioSoapComponent.GRUPO_DE_PANEL[panel];
    if (grupo) this.openGroup.set(grupo);
  }

  toggleGroup(grupo: string) {
    this.openGroup.set(this.openGroup() === grupo ? '' : grupo);
  }

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
    const paciente = this.evolucionService.activePatient();
    const catalogo = this.sintomasCatalogo();
    const seleccion = this.sintomasSeleccionados();
    const sintomas: SintomaSeleccionado[] = catalogo
      .filter(s => seleccion.has(s.idSintoma))
      .map(s => ({ idSintoma: s.idSintoma, sistema: s.sistema, sintoma: s.sintoma }));

    if (paciente && sintomas.length > 0) {
      await this.sintomaService.guardarSintomas(paciente.idRegAtencion, sintomas);
    }

    const formData = {
      timestamp: new Date().toISOString(),
      sintomas: sintomas.map(s => s.sintoma),
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
