import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Etiqueta } from '../../../../../../compartido/ui/etiqueta/etiqueta';
import { VentanaModal } from '../../../../../../compartido/ui/ventana-modal/ventana-modal';
import { TriajeApiService, RegistroTriajePayload } from '../../../salida/http/triaje.api.service';
import { MaestrosApiService } from '../../../../../../compartido/api/maestros.api.service';
import { ApiRequestError } from '../../../../../../compartido/api-client/api-client.service';
import { IFilaBackend, ICatalogoNombre } from '../../../../../../compartido/tipos/api-tipos';
import { RegistroPacienteModal } from '../../../../../../compartido/ui/registro-paciente/registro-paciente-modal';

interface FormEvaluacion {
  motivo: string;
  presionArterial: string;
  frecCardiaca: string;
  frecRespiratoria: string;
  temperatura: string;
  saturacion: string;
  fiO2: string;
  peso: string;
  talla: string;
  escalaDolor: string;
  escalaGlasgow: string;
  tiempoEvolucionCantidad: string;
  tiempoEvolucionCantidadUnidad: string;
  idServicio: string;
  idTipoPrioridad: string;
}

function formEvaluacionVacio(): FormEvaluacion {
  return {
    motivo: '', presionArterial: '', frecCardiaca: '', frecRespiratoria: '',
    temperatura: '', saturacion: '', fiO2: '', peso: '', talla: '', escalaDolor: '',
    escalaGlasgow: '', tiempoEvolucionCantidad: '', tiempoEvolucionCantidadUnidad: '',
    idServicio: '', idTipoPrioridad: ''
  };
}

// Lee un campo de un map devuelto por el SP probando varias claves (los SP
// resuelven los nombres de columna en runtime; variantes de mayúsculas).

function campo(item: IFilaBackend | null | undefined, claves: string[]): string {
  if (!item) return '';
  for (const k of claves) {
    const v = item[k];
    if (v !== undefined && v !== null && v !== '') return String(v);
  }
  return '';
}

const PRIORIDADES = [
  { value: '1', label: 'Rojo · Emergencia' },
  { value: '2', label: 'Naranja · Muy urgente' },
  { value: '3', label: 'Amarillo · Urgente' },
  { value: '4', label: 'Verde · Poco urgente' },
  { value: '5', label: 'Azul · No urgente' }
];

const UNIDADES_TIEMPO = [
  { value: 'MINUTOS', label: 'Minutos' },
  { value: 'HORAS', label: 'Horas' },
  { value: 'DIAS', label: 'Días' },
  { value: 'SEMANAS', label: 'Semanas' }
];

const SI_NO = [
  { value: '0', label: 'No' },
  { value: '1', label: 'Sí' }
];

@Component({
  selector: 'app-triaje',
  standalone: true,
  imports: [FormsModule, CommonModule, Etiqueta, VentanaModal, RegistroPacienteModal],
  templateUrl: './triaje.component.html'
})
export class TriajeComponent implements OnInit {
  private triajeApi = inject(TriajeApiService);
  private maestrosApi = inject(MaestrosApiService);
  private cdr = inject(ChangeDetectorRef);

  pacientes: IFilaBackend[] = [];
  cargando = false;
  error = '';
  mensajeExito = '';

  filtro = '';
  fecha = new Date().toISOString().slice(0, 10);

  // Modal de registro (componente global compartido con la página Pacientes)
  modalRegistro = false;

  // Modal de evaluación
  pacienteEvaluar: IFilaBackend | null = null;
  formEvaluacion: FormEvaluacion = formEvaluacionVacio();
  guardandoEvaluacion = false;
  errorEvaluacion = '';
  servicios: ICatalogoNombre[] = [];

  prioridades = PRIORIDADES;
  unidadesTiempo = UNIDADES_TIEMPO;
  opcionesSiNo = SI_NO;

  ngOnInit() {
    this.cargarLista();
    this.cargarCatalogos();
  }

  async cargarLista() {
    this.cargando = true;
    this.error = '';
    try {
      const items = await this.triajeApi.listar(this.fecha, this.fecha, this.filtro);
      this.pacientes = Array.isArray(items) ? items : [];
    } catch (err: unknown) {
      this.error = err instanceof ApiRequestError ? err.message : 'No se pudo cargar el listado de triaje.';
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  async cargarCatalogos() {
    try {
      const serv = await this.maestrosApi.getServicios(2);
      if (Array.isArray(serv)) this.servicios = serv;
    } catch {
      // Catálogo auxiliar; el formulario de evaluación sigue usable sin él.
    }
  }

  // La fuente financiamiento responde con idFuenteFinanciamiento (no "id").
  abrirModalRegistro() {
    this.modalRegistro = true;
  }

  cerrarModalRegistro() {
    this.modalRegistro = false;
  }

  onPacienteRegistrado() {
    this.modalRegistro = false;
    this.mensajeExito = 'Paciente registrado en la bandeja de triaje.';
    setTimeout(() => this.mensajeExito = '', 5000);
    this.cargarLista();
  }

  // Elimina caracteres de control/espaciado invisible y recorta los extremos.
  sanitizar(texto: string): string {
    return texto.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\uFEFF]/g, '').trim();
  }

  abrirEvaluacion(paciente: IFilaBackend) {
    const ev = (paciente['evaluacion'] ?? undefined) as Record<string, unknown> | undefined;
    const texto = (v: unknown): string => (v === null || v === undefined ? '' : String(v));
    this.pacienteEvaluar = paciente;
    this.formEvaluacion = ev
      ? {
          motivo: texto(ev['motivo']), presionArterial: texto(ev['pa'] ?? ev['presionArterial']), frecCardiaca: texto(ev['fc'] ?? ev['frecCardiaca']),
          frecRespiratoria: texto(ev['fr'] ?? ev['frecRespiratoria']), temperatura: texto(ev['temp'] ?? ev['temperatura']),
          saturacion: texto(ev['spo2'] ?? ev['saturacion']), fiO2: texto(ev['fiO2']), peso: texto(ev['peso']),
          talla: texto(ev['talla']), escalaDolor: texto(ev['escalaDolor']), escalaGlasgow: texto(ev['escalaGlasgow']),
          tiempoEvolucionCantidad: texto(ev['tiempoEvolucionCantidad']), tiempoEvolucionCantidadUnidad: texto(ev['tiempoEvolucionCantidadUnidad']),
          idServicio: texto(ev['idServicio']), idTipoPrioridad: texto(ev['idTipoPrioridad'])
        }
      : formEvaluacionVacio();
    this.errorEvaluacion = '';
  }

  cerrarEvaluacion() {
    this.pacienteEvaluar = null;
  }

  async guardarEvaluacion() {
    const f = this.formEvaluacion;
    const idTriaje = Number(campo(this.pacienteEvaluar, ['IdTriaje', 'idTriaje', 'IDTriaje']));
    if (!idTriaje) {
      this.errorEvaluacion = 'El registro no tiene un id de triaje válido.';
      return;
    }
    const motivo = this.sanitizar(f.motivo);
    const presionArterial = this.sanitizar(f.presionArterial);
    if (!motivo || !presionArterial || !f.frecCardiaca.trim() ||
        !f.frecRespiratoria.trim() || !f.temperatura.trim() || !f.saturacion.trim()) {
      this.errorEvaluacion = 'Complete el motivo de consulta y todos los signos vitales.';
      return;
    }
    if (!/^\d{2,3}\/\d{2,3}$/.test(presionArterial)) {
      this.errorEvaluacion = 'La presión arterial debe tener el formato 120/80.';
      return;
    }
    this.guardandoEvaluacion = true;
    this.errorEvaluacion = '';
    const payload: RegistroTriajePayload = {
      idTriaje,
      motivo,
      presionArterial
    };
    const fc = Number(f.frecCardiaca);
    const fr = Number(f.frecRespiratoria);
    const temp = Number(f.temperatura.replace(',', '.'));
    const spo2 = Number(f.saturacion);
    const peso = Number(f.peso.replace(',', '.'));
    const talla = Number(f.talla.replace(',', '.'));
    if (!Number.isNaN(fc)) payload.frecCardiaca = fc;
    if (!Number.isNaN(fr)) payload.frecRespiratoria = fr;
    if (!Number.isNaN(temp)) payload.temperatura = temp;
    if (!Number.isNaN(spo2)) payload.saturacion = spo2;
    if (f.fiO2) payload.fiO2 = Number(f.fiO2);
    if (!Number.isNaN(peso) && peso > 0) payload.peso = peso;
    if (!Number.isNaN(talla) && talla > 0) payload.talla = talla;
    // IMC calculado: peso / (talla en metros)^2
    if (!Number.isNaN(peso) && peso > 0 && !Number.isNaN(talla) && talla > 0) {
      const imc = peso / Math.pow(talla / 100, 2);
      payload.imc = Math.round(imc * 100) / 100;
    }
    if (f.escalaDolor) payload.escalaDolor = Number(f.escalaDolor);
    if (f.escalaGlasgow) payload.escalaGlasgow = Number(f.escalaGlasgow);
    if (f.tiempoEvolucionCantidad) payload.tiempoEvolucionCantidad = Number(f.tiempoEvolucionCantidad);
    if (f.tiempoEvolucionCantidadUnidad) payload.tiempoEvolucionCantidadUnidad = f.tiempoEvolucionCantidadUnidad;
    if (f.idServicio) payload.idServicio = Number(f.idServicio);
    if (f.idTipoPrioridad) payload.idTipoPrioridad = Number(f.idTipoPrioridad);

    try {
      await this.triajeApi.registrar(payload);
      this.pacienteEvaluar = null;
      this.mensajeExito = 'Evaluación de triaje guardada.';
      setTimeout(() => this.mensajeExito = '', 5000);
      this.cargarLista();
    } catch (err: unknown) {
      this.errorEvaluacion = err instanceof ApiRequestError ? err.message : 'No se pudo guardar la evaluación.';
    } finally {
      this.guardandoEvaluacion = false;
      this.cdr.detectChanges();
    }
  }

  // --- Ayudantes de render ---
  campo(item: IFilaBackend, claves: string[]): string {
    return campo(item, claves);
  }

  idTriaje(item: IFilaBackend): number {
    return Number(campo(item, ['IdTriaje', 'idTriaje', 'IDTriaje'])) || 0;
  }

  documento(item: IFilaBackend): string {
    return campo(item, ['NroDocumento', 'nroDocumento', 'Documento', 'documento']);
  }

  tipoDocumento(item: IFilaBackend): string {
    return campo(item, ['TipoDocumento', 'tipoDocumento', 'DescripcionTipoDocumento', 'DescripcionDoc']);
  }

  nombrePaciente(item: IFilaBackend): string {
    const completo = campo(item, ['NombreCompleto', 'nombreCompleto', 'Paciente', 'paciente', 'Nombre', 'nombre']);
    if (completo) return completo;
    const partes = [
      campo(item, ['ApellidoPaterno', 'apellidoPaterno', 'Paterno', 'paterno']),
      campo(item, ['ApellidoMaterno', 'apellidoMaterno', 'Materno', 'materno']),
      campo(item, ['PrimerNombre', 'primerNombre', 'PrimerNmobre', 'Nombres', 'nombres']),
      campo(item, ['SegundoNombre', 'segundoNombre'])
    ].filter(Boolean);
    return partes.join(' ') || '—';
  }

  hora(item: IFilaBackend): string {
    const raw = campo(item, ['FechaTriaje', 'fechaTriaje', 'FechaRegistro', 'fechaRegistro', 'FechaIngreso', 'fechaIngreso', 'Fecha', 'fecha', 'HoraRegistro']);
    if (!raw) return '—';
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }

  prioridad(item: IFilaBackend): string {
    return campo(item, ['Prioridad', 'prioridad', 'TipoPrioridad', 'tipoPrioridad', 'DescripcionPrioridad']);
  }

  estadoTriaje(item: IFilaBackend): string {
    const estado = campo(item, ['Estado', 'estado', 'IdEstado', 'idEstado', 'NombreEstado']);
    const vitals = campo(item, ['PresionArterial', 'presionArterial', 'PA']);
    return (estado || vitals) ? 'triado' : 'sin-triaje';
  }

  tiempoEspera(item: IFilaBackend): string {
    const raw = campo(item, ['FechaTriaje', 'fechaTriaje', 'FechaRegistro', 'fechaRegistro', 'FechaIngreso', 'fechaIngreso', 'Fecha', 'fecha', 'HoraRegistro']);
    if (!raw) return '—';
    const d = new Date(raw);
    if (isNaN(d.getTime())) return '—';
    return `${Math.max(0, Math.floor((Date.now() - d.getTime()) / 60000))} min`;
  }
}