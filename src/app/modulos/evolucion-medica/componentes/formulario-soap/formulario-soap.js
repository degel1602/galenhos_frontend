var FormularioSoapComponent_1;

import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { __decorate } from 'tslib';
import { ModalGlobalService } from '../../../../compartido/ui/modal-global/modal-global.service';
import { AuthService } from '../../../auth/aplicacion/auth.service';
import { EvolucionService } from '../../servicios/evolucion.service';
import { SintomaService } from '../../servicios/sintoma.service';
import { AdjuntosComponent } from './adjuntos/adjuntos';
import { DiagnosticosComponent } from './diagnosticos/diagnosticos';
import { ExamenFisicoComponent } from './examen-fisico/examen-fisico';
import { FirmaDigitalComponent } from './firma-digital/firma-digital';
import { InterconsultasComponent } from './interconsultas/interconsultas';
import { MotivoComponent } from './motivo/motivo';
import { OrdenesMedicasComponent } from './ordenes-medicas/ordenes-medicas';
import { PlanTratamientoComponent } from './plan-tratamiento/plan-tratamiento';
import { ProcedimientosCertificadosComponent } from './procedimientos-certificados/procedimientos-certificados';
import { ResultadosComponent } from './resultados/resultados';
import { SignosVitalesComponent } from './signos-vitales/signos-vitales';

let FormularioSoapComponent = class FormularioSoapComponent {
  static {
    FormularioSoapComponent_1 = FormularioSoapComponent;
  }
  evolucionService = inject(EvolucionService);
  authService = inject(AuthService);
  modalGlobal = inject(ModalGlobalService);
  sintomaService = inject(SintomaService);
  fb = inject(FormBuilder);
  activePanel = signal('p1');
  openGroup = signal('encuentro');
  isSaving = signal(false);
  fechaEvolucion = new Date().toISOString().slice(0, 10);
  horaEvolucion = new Date().toTimeString().slice(0, 5);
  tipoAtencion = 'Emergencia';
  estadoAtencion = 'Pendiente';
  auditoria = signal(null);
  firmaDigital = signal(null);
  onFirmaCambio(dataUrl) {
    this.firmaDigital.set(dataUrl);
  }
  sintomasCatalogo = signal([]);
  sintomasSeleccionados = signal(new Set());
  sintomasCargando = signal(false);
  grupoSintomasAbierto = signal('general');
  nuevoSintomaTexto = '';
  nuevoSintomaSistema = 'general';
  static ETIQUETAS_SISTEMA = {
    general: 'General',
    'respiratorio-cv': 'Respiratorio / Cardiovascular',
    gastrointestinal: 'Gastrointestinal',
    neurologico: 'Neurológico',
    otros: 'Otros',
  };
  sintomasPorSistema = computed(() => {
    const grupos = [];
    const mapa = new Map();
    for (const s of this.sintomasCatalogo()) {
      const arr = mapa.get(s.sistema) ?? [];
      arr.push(s);
      mapa.set(s.sistema, arr);
    }
    for (const [clave, lista] of mapa) {
      grupos.push({
        clave,
        etiqueta: FormularioSoapComponent_1.ETIQUETAS_SISTEMA[clave] ?? clave,
        sintomas: [...lista].sort((a, b) => a.orden - b.orden),
      });
    }
    return grupos;
  });
  totalSintomasSeleccionados = computed(
    () => this.sintomasSeleccionados().size,
  );
  ngOnInit() {
    const paciente = this.evolucionService.activePatient();
    if (paciente?.estado) {
      this.estadoAtencion = paciente.estado;
    }
    this.cargarSintomas();
  }
  async cargarSintomas() {
    this.sintomasCargando.set(true);
    const catalogo = await this.sintomaService.listarCatalogo();
    this.sintomasCatalogo.set(catalogo);
    this.sintomasCargando.set(false);
  }
  contarSintomasSistema(clave) {
    const sel = this.sintomasSeleccionados();
    return this.sintomasCatalogo().filter(
      (s) => s.sistema === clave && sel.has(s.idSintoma),
    ).length;
  }
  toggleSintoma(idSintoma) {
    const nuevo = new Set(this.sintomasSeleccionados());
    if (nuevo.has(idSintoma)) {
      nuevo.delete(idSintoma);
    } else {
      nuevo.add(idSintoma);
    }
    this.sintomasSeleccionados.set(nuevo);
  }
  toggleGrupoSintomas(clave) {
    this.grupoSintomasAbierto.set(
      this.grupoSintomasAbierto() === clave ? '' : clave,
    );
  }
  async agregarSintomaNuevo() {
    const texto = this.nuevoSintomaTexto.trim();
    if (!texto) return;
    const sistema = this.nuevoSintomaSistema;
    const ok = await this.sintomaService.agregarSintoma(sistema, texto);
    if (ok) {
      await this.cargarSintomas();
      const agregado = this.sintomasCatalogo().find(
        (s) => s.sistema === sistema && s.sintoma === texto,
      );
      if (agregado) {
        const nuevo = new Set(this.sintomasSeleccionados());
        nuevo.add(agregado.idSintoma);
        this.sintomasSeleccionados.set(nuevo);
      }
      this.grupoSintomasAbierto.set(sistema);
      this.nuevoSintomaTexto = '';
    }
  }
  static GRUPO_DE_PANEL = {
    p1: 'encuentro',
    p2: 'encuentro',
    p3: 'soap',
    p4: 'soap',
    p5: 'soap',
    p6: 'soap',
    p7: 'soap',
    p8: 'doc',
    p9: 'doc',
    p10: 'doc',
    p11: 'doc',
    p14: 'doc',
    p15: 'cierre',
  };
  static ORDEN_PANELES = [
    'p1',
    'p2',
    'p3',
    'p4',
    'p5',
    'p6',
    'p7',
    'p8',
    'p9',
    'p10',
    'p11',
    'p14',
    'p15',
  ];
  activarPanel(panel) {
    this.activePanel.set(panel);
    const grupo = FormularioSoapComponent_1.GRUPO_DE_PANEL[panel];
    if (grupo) this.openGroup.set(grupo);
  }
  irAnterior() {
    const idx = FormularioSoapComponent_1.ORDEN_PANELES.indexOf(
      this.activePanel(),
    );
    if (idx > 0)
      this.activarPanel(FormularioSoapComponent_1.ORDEN_PANELES[idx - 1]);
  }
  irSiguiente() {
    const idx = FormularioSoapComponent_1.ORDEN_PANELES.indexOf(
      this.activePanel(),
    );
    if (idx < FormularioSoapComponent_1.ORDEN_PANELES.length - 1) {
      this.activarPanel(FormularioSoapComponent_1.ORDEN_PANELES[idx + 1]);
    }
  }
  get esPrimerPanel() {
    return (
      FormularioSoapComponent_1.ORDEN_PANELES.indexOf(this.activePanel()) === 0
    );
  }
  get esUltimoPanel() {
    return (
      FormularioSoapComponent_1.ORDEN_PANELES.indexOf(this.activePanel()) ===
      FormularioSoapComponent_1.ORDEN_PANELES.length - 1
    );
  }
  toggleGroup(grupo) {
    this.openGroup.set(this.openGroup() === grupo ? '' : grupo);
  }
  soapForm = this.fb.group({
    motivo: this.fb.group({
      motivoConsulta: [false],
      seguimiento: [false],
      control: [false],
      reevaluacion: [false],
      postoperatorio: [false],
      interconsulta: [false],
      emergencia: [false],
      detalle: [''],
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
      escalaDolor: [null],
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
      glucemia: [null],
    }),
    examenFisico: this.fb.array([
      ...[
        'Estado general',
        'Piel',
        'Cabeza y cuello',
        'Tórax y pulmones',
        'Corazón',
        'Abdomen',
        'Genitourinario',
        'Extremidades y osteomuscular',
        'Neurológico y estado mental',
      ].map((sys) =>
        this.fb.group({
          sistema: [sys],
          normal: [true],
          hallazgo: ['', [Validators.minLength(5)]],
        }),
      ),
    ]),
    resultados: this.fb.group({
      laboratorio: this.fb.array([]),
      imagenes: this.fb.array([]),
      otros: this.fb.array([]),
    }),
    evaluacion: this.fb.group({
      estadoClinico: ['Mejoría'],
      pronostico: ['Bueno'],
    }),
    diagnosticos: this.fb.array([
      this.fb.group({
        cie10: [''],
        descripcion: [''],
        tipo: ['Presuntivo'],
        condicion: ['Principal'],
        estado: ['Activo'],
      }),
    ]),
    plan: this.fb.group({
      farmacologico: this.fb.array([]),
      procedimientosIndicados: this.fb.group({
        curaciones: [false],
        suturas: [false],
        cateter: [false],
        intubacion: [false],
        otro: [''],
      }),
      solicitudExamenes: this.fb.group({
        laboratorio: [''],
        imagenes: [''],
        otros: [''],
      }),
      interconsultas: this.fb.group({
        cardiologia: [false],
        cirugia: [false],
        nutricion: [false],
        psicologia: [false],
        otra: [''],
      }),
      indicacionesGenerales: this.fb.group({
        dieta: [''],
        reposo: [''],
        hidratacion: [''],
        oxigeno: [''],
        restricciones: [''],
      }),
    }),
    evolucionLibre: [''],
    ordenesMedicas: this.fb.group({
      orden: [''],
      detalle: [''],
    }),
    prescripcion: this.fb.array([]),
    procedimientosRealizados: this.fb.array([]),
    incapacidad: this.fb.group({
      dias: [null],
      fechaInicio: [''],
      fechaFin: [''],
      motivo: [''],
    }),
    certificados: this.fb.group({
      certificadoMedico: [false],
      informeMedico: [false],
      epicrisis: [false],
      constancias: [false],
      observaciones: [''],
    }),
    adjuntos: this.fb.array([]),
  });
  get signosVitalesForm() {
    return this.soapForm.get('signosVitales');
  }
  get diagnosticosArray() {
    return this.soapForm.get('diagnosticos');
  }
  get examenFisicoArray() {
    return this.soapForm.get('examenFisico');
  }
  get resultadosForm() {
    return this.soapForm.get('resultados');
  }
  get planForm() {
    return this.soapForm.get('plan');
  }
  get adjuntosArray() {
    return this.soapForm.get('adjuntos');
  }
  async firmar() {
    const firma = this.firmaDigital();
    if (!firma) {
      this.modalGlobal.error(
        'Debe dibujar su firma en el recuadro o subir una imagen de firma antes de firmar la evolución.',
        'Firma requerida',
      );
      return;
    }
    const confirmado = await this.modalGlobal.confirmar(
      'Se guardará la evolución completa con su firma. ¿Desea continuar?',
      'Firmar evolución',
      'Firmar',
    );
    if (!confirmado) return;
    this.isSaving.set(true);
    const paciente = this.evolucionService.activePatient();
    const catalogo = this.sintomasCatalogo();
    const seleccion = this.sintomasSeleccionados();
    const sintomas = catalogo
      .filter((s) => seleccion.has(s.idSintoma))
      .map((s) => ({
        idSintoma: s.idSintoma,
        sistema: s.sistema,
        sintoma: s.sintoma,
      }));
    if (paciente && sintomas.length > 0) {
      await this.sintomaService.guardarSintomas(
        paciente.idRegAtencion,
        sintomas,
      );
    }
    const formData = {
      timestamp: new Date().toISOString(),
      cabecera: {
        numeroEvolucion: this.numeroEvolucion(),
        fecha: this.fechaEvolucion,
        hora: this.horaEvolucion,
        medicoTratante: this.authService.username() ?? '',
        tipoAtencion: this.tipoAtencion,
        estado: this.estadoAtencion,
      },
      firmaDigital: firma,
      sintomas: sintomas.map((s) => s.sintoma),
      ...this.soapForm.value,
    };
    const dataB64 = btoa(
      encodeURIComponent(JSON.stringify(formData)).replace(
        /%([0-9A-F]{2})/g,
        (_match, p1) => String.fromCodePoint(Number(`0x${p1}`)),
      ),
    );
    const respuesta = await this.evolucionService.guardarEvolucion(dataB64);
    this.isSaving.set(false);
    if (respuesta) {
      this.auditoria.set({
        fecha: respuesta.fecha,
        hora: respuesta.hora,
        usuario: this.authService.username() ?? '',
        ip: respuesta.ipCliente,
      });
      this.modalGlobal.exito(
        'La evolución fue firmada y guardada correctamente.',
        'Evolución guardada',
      );
      this.evolucionService.clearSelection();
    } else {
      this.modalGlobal.error(
        'No se pudo guardar la evolución. Verifique la conexión e intente de nuevo.',
        'Error al guardar',
      );
    }
  }
  numeroEvolucion() {
    const paciente = this.evolucionService.activePatient();
    if (!paciente) return '—';
    return `EV-${paciente.idRegAtencion}`;
  }
};
FormularioSoapComponent = FormularioSoapComponent_1 = __decorate(
  [
    Component({
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
        MotivoComponent,
        FirmaDigitalComponent,
      ],
      changeDetection: ChangeDetectionStrategy.OnPush,
      templateUrl: './formulario-soap.html',
    }),
  ],
  FormularioSoapComponent,
);

export { FormularioSoapComponent };
