import { Component, EventEmitter, Input, Output, SimpleChanges, inject, ChangeDetectorRef, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VentanaModal } from '../ventana-modal/ventana-modal';
import { MaestrosApiService } from '../../api/maestros.api.service';
import { ApiRequestError } from '../../api-client/api-client.service';
import { PacientesApiService, ActualizarPacientePayload } from '../../../modulos/pacientes/adaptadores/salida/http/pacientes.api.service';
import { TriajeApiService, RegistroTriajePayload } from '../../../modulos/triaje/adaptadores/salida/http/triaje.api.service';
import {
  ICatalogoDescripcion,
  ICatalogoNombre,
  IFuenteFinanciamiento,
  RegistroPacientePayload
} from '../../tipos/api-tipos';

export interface FormRegistroPaciente {
  idDocIdentidad: string;
  nroDocumento: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  primerNombre: string;
  segundoNombre: string;
  tercerNombre: string;
  fechaNacimiento: string;
  idTipoSexo: string;
  telefono: string;
  celular: string;
  email: string;
  idPaisNacimiento: string;
  idDistritoNacimiento: string;
  idCentroPobladoNacimiento: string;
  idPaisProcedencia: string;
  idDistritoProcedencia: string;
  idCentroPobladoProcedencia: string;
  idPaisDomicilio: string;
  idDepartamentoDomicilio: string;
  idProvinciaDomicilio: string;
  idDistritoDomicilio: string;
  idCentroPobladoDomicilio: string;
  direccionDomicilio: string;
  idEstadoCivil: string;
  idGradoInstruccion: string;
  idTipoOcupacion: string;
  nombrePadre: string;
  nombreMadre: string;
  idEtnia: string;
  idIdioma: string;
  discapacidad: string;
  incapacidad: string;
  // Solo modo triaje (webTab_PacienteTriajeAgregar)
  idFuenteFinanciamiento: string;
  idEstadollego: string;
  idEsAccidenteTransito: string;
  gestante: string;
  motivo: string;
}

function formVacio(): FormRegistroPaciente {
  return {
    idDocIdentidad: '', nroDocumento: '', apellidoPaterno: '', apellidoMaterno: '',
    primerNombre: '', segundoNombre: '', tercerNombre: '', fechaNacimiento: '',
    idTipoSexo: '', telefono: '', celular: '', email: '',
    idPaisNacimiento: '', idDistritoNacimiento: '', idCentroPobladoNacimiento: '',
    idPaisProcedencia: '', idDistritoProcedencia: '', idCentroPobladoProcedencia: '',
    idPaisDomicilio: '', idDepartamentoDomicilio: '', idProvinciaDomicilio: '',
    idDistritoDomicilio: '', idCentroPobladoDomicilio: '', direccionDomicilio: '',
    idEstadoCivil: '', idGradoInstruccion: '', idTipoOcupacion: '',
    nombrePadre: '', nombreMadre: '', idEtnia: '', idIdioma: '',
    discapacidad: '', incapacidad: '',
    idFuenteFinanciamiento: '', idEstadollego: '', idEsAccidenteTransito: '', gestante: '', motivo: ''
  };
}

// Normaliza un texto para compararlo: mayúsculas, sin acentos y con espacios
// simples.
function normalizarTexto(texto: string): string {
  return texto.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
}

// Elimina caracteres de control/espaciado invisible y recorta los extremos.
function sanitizar(texto: string): string {
  return texto.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\uFEFF]/g, '').trim();
}

@Component({
  selector: 'registro-paciente-modal',
  standalone: true,
  imports: [FormsModule, VentanaModal],
  templateUrl: './registro-paciente-modal.html'
})
export class RegistroPacienteModal implements OnChanges {
  @Input() abierto = false;
  @Input() modo: 'paciente' | 'triaje' = 'paciente';
  @Input() pacienteId: number | string | null = null;
  @Input() titulo = 'Registrar Nuevo Paciente';
  @Input() subtitulo = 'Complete los datos del paciente';
  @Output() alCerrar = new EventEmitter<void>();
  @Output() registrado = new EventEmitter<string>();
  @Output() actualizado = new EventEmitter<string>();

  private pacientesApi = inject(PacientesApiService);
  private triajeApi = inject(TriajeApiService);
  private maestrosApi = inject(MaestrosApiService);
  private cdr = inject(ChangeDetectorRef);

  form: FormRegistroPaciente = formVacio();
  guardando = false;
  consultandoReniec = false;
  cargandoDetalle = false;
  error = '';
  aviso = '';
  catalogoCargado = false;

  // Detalle original cargado en modo edición: los valores del PUT parten de
  // aquí y se sobreescriben con lo que el usuario modifique, para no perder
  // campos que el formulario no edita.
  private detalleOriginal: Record<string, unknown> | null = null;

  tiposDocumento: ICatalogoDescripcion[] = [];
  tiposSexo: ICatalogoDescripcion[] = [];
  estadosCivil: ICatalogoDescripcion[] = [];
  gradosInstruccion: ICatalogoDescripcion[] = [];
  ocupaciones: ICatalogoDescripcion[] = [];
  etnias: ICatalogoDescripcion[] = [];
  idiomas: ICatalogoDescripcion[] = [];
  paises: ICatalogoNombre[] = [];
  fuentesFinanciamiento: IFuenteFinanciamiento[] = [];
  estadosLlego: ICatalogoDescripcion[] = [];

  // Ubigeo de domicilio (se persiste departamento, provincia, distrito).
  departamentos: ICatalogoNombre[] = [];
  provincias: ICatalogoNombre[] = [];
  distritos: ICatalogoNombre[] = [];
  comunidades: ICatalogoNombre[] = [];

  // Ubigeo de nacimiento y procedencia (solo distrito + centro poblado se
  // persisten; departamento/provincia son selects de navegación).
  depNacimiento: ICatalogoNombre[] = [];
  provNacimiento: ICatalogoNombre[] = [];
  distritosNacimiento: ICatalogoNombre[] = [];
  comunidadesNacimiento: ICatalogoNombre[] = [];
  depProcedencia: ICatalogoNombre[] = [];
  provProcedencia: ICatalogoNombre[] = [];
  distritosProcedencia: ICatalogoNombre[] = [];
  comunidadesProcedencia: ICatalogoNombre[] = [];

  // Selects de navegación de nacimiento y procedencia (no se persisten).
  depNacimientoSel = '';
  provNacimientoSel = '';
  depProcedenciaSel = '';
  provProcedenciaSel = '';

  // Tab activo del bloque de ubicación (solo modo paciente).
  tabUbigeo: 'domicilio' | 'nacimiento' | 'procedencia' = 'domicilio';

  ngOnChanges(cambios: SimpleChanges) {
    if (cambios['abierto']?.currentValue === true) {
      this.form = formVacio();
      this.error = '';
      this.aviso = '';
      this.depNacimientoSel = '';
      this.provNacimientoSel = '';
      this.depProcedenciaSel = '';
      this.provProcedenciaSel = '';
      this.tabUbigeo = 'domicilio';
      this.provincias = [];
      this.distritos = [];
      this.comunidades = [];
      this.provNacimiento = [];
      this.distritosNacimiento = [];
      this.comunidadesNacimiento = [];
      this.provProcedencia = [];
      this.distritosProcedencia = [];
      this.comunidadesProcedencia = [];
      this.detalleOriginal = null;
      this.cargarCatalogos();
      if (this.pacienteId) {
        this.cargarPaciente();
      }
    }
  }

  cerrar() {
    this.alCerrar.emit();
  }

  // Normaliza nombres propios: mayúsculas y un solo espacio entre palabras.
  normalizarNombre(texto: string): string {
    return sanitizar(texto).toUpperCase().replace(/\s+/g, ' ');
  }

  soloDigitos(event: KeyboardEvent) {
    if (event.key.length === 1 && !/\d/.test(event.key)) {
      event.preventDefault();
    }
  }

  async cargarCatalogos() {
    try {
      const catalogos: Promise<unknown>[] = [
        this.catalogoCargado ? Promise.resolve([]) : this.maestrosApi.getTiposDocumentos(),
        this.catalogoCargado ? Promise.resolve([]) : this.maestrosApi.getTiposSexo(),
        this.catalogoCargado ? Promise.resolve([]) : this.maestrosApi.getEstadosCivil(),
        this.catalogoCargado ? Promise.resolve([]) : this.maestrosApi.getGradosInstruccion(),
        this.catalogoCargado ? Promise.resolve([]) : this.maestrosApi.getOcupaciones(),
        this.catalogoCargado ? Promise.resolve([]) : this.maestrosApi.getEtnias(),
        this.catalogoCargado ? Promise.resolve([]) : this.maestrosApi.getIdiomas(),
        this.catalogoCargado ? Promise.resolve([]) : this.maestrosApi.getPaises(),
        this.catalogoCargado ? Promise.resolve([]) : this.maestrosApi.getDepartamentos(),
        this.catalogoCargado ? Promise.resolve([]) : this.maestrosApi.getFuentesFinanciamiento(),
        this.catalogoCargado ? Promise.resolve([]) : this.maestrosApi.getEstadosLlegoPaciente()
      ];
      const resultados = await Promise.allSettled(catalogos);
      const [docs, sexos, ec, grados, ocup, etnias, idiomas, paises, deps, ff, el] = resultados.map(r =>
        r.status === 'fulfilled' && Array.isArray(r.value) ? r.value : []
      );
      if (docs.length) this.tiposDocumento = docs as ICatalogoDescripcion[];
      if (sexos.length) this.tiposSexo = sexos as ICatalogoDescripcion[];
      if (ec.length) this.estadosCivil = ec as ICatalogoDescripcion[];
      if (grados.length) this.gradosInstruccion = grados as ICatalogoDescripcion[];
      if (ocup.length) this.ocupaciones = ocup as ICatalogoDescripcion[];
      if (etnias.length) this.etnias = etnias as ICatalogoDescripcion[];
      if (idiomas.length) this.idiomas = idiomas as ICatalogoDescripcion[];
      if (paises.length) this.paises = paises as ICatalogoNombre[];
      if (deps.length) this.departamentos = deps as ICatalogoNombre[];
      if (ff.length) this.fuentesFinanciamiento = ff as IFuenteFinanciamiento[];
      if (el.length) this.estadosLlego = el as ICatalogoDescripcion[];
      const fallaron = resultados.filter(r => r.status === 'rejected');
      if (fallaron.length > 0) {
        this.aviso = 'Algunos catálogos no se cargaron. Verifique la URL del servidor en Configuración y vuelva a abrir el formulario.';
      } else {
        this.catalogoCargado = true;
        this.aviso = '';
      }
    } catch {
      this.aviso = 'No se pudieron cargar los catálogos. Verifique la URL del servidor en Configuración y vuelva a abrir el formulario.';
    } finally {
      this.cdr.detectChanges();
    }
  }

  // --- Ubigeo de domicilio ---
  async onCambioDepartamento() {
    this.form.idProvinciaDomicilio = '';
    this.form.idDistritoDomicilio = '';
    this.form.idCentroPobladoDomicilio = '';
    this.provincias = [];
    this.distritos = [];
    this.comunidades = [];
    if (!this.form.idDepartamentoDomicilio) return;
    try {
      const prov = await this.maestrosApi.getProvincias(this.form.idDepartamentoDomicilio);
      this.provincias = Array.isArray(prov) ? prov : [];
    } catch {
      this.provincias = [];
    } finally {
      this.cdr.detectChanges();
    }
  }

  async onCambioProvincia() {
    this.form.idDistritoDomicilio = '';
    this.form.idCentroPobladoDomicilio = '';
    this.distritos = [];
    this.comunidades = [];
    if (!this.form.idProvinciaDomicilio) return;
    try {
      const dis = await this.maestrosApi.getDistritos(this.form.idProvinciaDomicilio);
      this.distritos = Array.isArray(dis) ? dis : [];
    } catch {
      this.distritos = [];
    } finally {
      this.cdr.detectChanges();
    }
  }

  async onCambioDistrito() {
    this.form.idCentroPobladoDomicilio = '';
    this.comunidades = [];
    if (!this.form.idDistritoDomicilio) return;
    try {
      const cen = await this.maestrosApi.getCentrosPoblados(this.form.idDistritoDomicilio);
      this.comunidades = Array.isArray(cen) ? cen : [];
    } catch {
      this.comunidades = [];
    } finally {
      this.cdr.detectChanges();
    }
  }

  // --- Ubigeo de nacimiento (navegación; solo se persiste distrito) ---
  async onCambioDepartamentoNacimiento() {
    this.form.idDistritoNacimiento = '';
    this.form.idCentroPobladoNacimiento = '';
    this.provNacimiento = [];
    this.distritosNacimiento = [];
    this.comunidadesNacimiento = [];
    if (!this.depNacimientoSel) return;
    try {
      const prov = await this.maestrosApi.getProvincias(this.depNacimientoSel);
      this.provNacimiento = Array.isArray(prov) ? prov : [];
    } catch {
      this.provNacimiento = [];
    } finally {
      this.cdr.detectChanges();
    }
  }

  async onCambioProvinciaNacimiento() {
    this.form.idDistritoNacimiento = '';
    this.form.idCentroPobladoNacimiento = '';
    this.distritosNacimiento = [];
    this.comunidadesNacimiento = [];
    if (!this.provNacimientoSel) return;
    try {
      const dis = await this.maestrosApi.getDistritos(this.provNacimientoSel);
      this.distritosNacimiento = Array.isArray(dis) ? dis : [];
    } catch {
      this.distritosNacimiento = [];
    } finally {
      this.cdr.detectChanges();
    }
  }

  async onCambioDistritoNacimiento() {
    this.form.idCentroPobladoNacimiento = '';
    this.comunidadesNacimiento = [];
    if (!this.form.idDistritoNacimiento) return;
    try {
      const cen = await this.maestrosApi.getCentrosPoblados(this.form.idDistritoNacimiento);
      this.comunidadesNacimiento = Array.isArray(cen) ? cen : [];
    } catch {
      this.comunidadesNacimiento = [];
    } finally {
      this.cdr.detectChanges();
    }
  }

  // --- Ubigeo de procedencia (navegación; solo se persiste distrito) ---
  async onCambioDepartamentoProcedencia() {
    this.form.idDistritoProcedencia = '';
    this.form.idCentroPobladoProcedencia = '';
    this.provProcedencia = [];
    this.distritosProcedencia = [];
    this.comunidadesProcedencia = [];
    if (!this.depProcedenciaSel) return;
    try {
      const prov = await this.maestrosApi.getProvincias(this.depProcedenciaSel);
      this.provProcedencia = Array.isArray(prov) ? prov : [];
    } catch {
      this.provProcedencia = [];
    } finally {
      this.cdr.detectChanges();
    }
  }

  async onCambioProvinciaProcedencia() {
    this.form.idDistritoProcedencia = '';
    this.form.idCentroPobladoProcedencia = '';
    this.distritosProcedencia = [];
    this.comunidadesProcedencia = [];
    if (!this.provProcedenciaSel) return;
    try {
      const dis = await this.maestrosApi.getDistritos(this.provProcedenciaSel);
      this.distritosProcedencia = Array.isArray(dis) ? dis : [];
    } catch {
      this.distritosProcedencia = [];
    } finally {
      this.cdr.detectChanges();
    }
  }

  async onCambioDistritoProcedencia() {
    this.form.idCentroPobladoProcedencia = '';
    this.comunidadesProcedencia = [];
    if (!this.form.idDistritoProcedencia) return;
    try {
      const cen = await this.maestrosApi.getCentrosPoblados(this.form.idDistritoProcedencia);
      this.comunidadesProcedencia = Array.isArray(cen) ? cen : [];
    } catch {
      this.comunidadesProcedencia = [];
    } finally {
      this.cdr.detectChanges();
    }
  }

  // --- RENIEC ---
  async consultarReniec() {
    const dni = this.form.nroDocumento.trim();
    if (!dni) {
      this.error = 'Ingrese el número de documento para consultar a RENIEC.';
      return;
    }
    if (!/^\d{8}$/.test(dni)) {
      this.error = 'RENIEC solo consulta DNI de 8 dígitos. Verifique el número.';
      return;
    }
    this.consultandoReniec = true;
    this.error = '';
    try {
      const res = await this.maestrosApi.consultarReniec(dni);
      const datos = res?.datos;
      if (!datos || (!datos.apellidoPaterno && !datos.primerNombre && !datos.nombres)) {
        this.error = 'RENIEC no devolvió datos para ese documento.';
        return;
      }
      this.form.apellidoPaterno = (datos.apellidoPaterno || this.form.apellidoPaterno).toUpperCase();
      this.form.apellidoMaterno = (datos.apellidoMaterno || this.form.apellidoMaterno).toUpperCase();
      this.form.primerNombre = (datos.primerNombre || this.form.primerNombre).toUpperCase();
      this.form.segundoNombre = (datos.segundoNombre || this.form.segundoNombre).toUpperCase();
      // Si el backend no separó los prenombres, usa "nombres" como respaldo.
      if (!this.form.primerNombre && datos.nombres) {
        const partes = datos.nombres.toUpperCase().split(/\s+/).filter(Boolean);
        if (partes.length > 0) this.form.primerNombre = partes[0];
        if (partes.length > 1) this.form.segundoNombre = partes[1];
        if (partes.length > 2) this.form.tercerNombre = partes.slice(2).join(' ');
      }
      if (datos.tercerNombre) this.form.tercerNombre = datos.tercerNombre.toUpperCase();
      if (datos.fechaNacimiento) this.form.fechaNacimiento = datos.fechaNacimiento;
      if (datos.nombrePadre) this.form.nombrePadre = datos.nombrePadre.toUpperCase();
      if (datos.nombreMadre) this.form.nombreMadre = datos.nombreMadre.toUpperCase();
      this.aplicarSexoReniec(datos.sexo);
      this.aplicarEstadoCivilReniec(datos.estadoCivil);
      if (datos.direccion) this.form.direccionDomicilio = datos.direccion;
      await this.autocompletarUbigeo(datos.departamento, datos.provincia, datos.distrito);
      await this.autocompletarUbigeoNacimiento(datos.departamentoNacimiento, datos.provinciaNacimiento, datos.distritoNacimiento);
    } catch (err: unknown) {
      this.error = err instanceof ApiRequestError ? err.message : 'No se pudo consultar a RENIEC.';
    } finally {
      this.consultandoReniec = false;
      // Sin esto la vista queda "Consultando…" hasta el siguiente clic:
      // tras el await la detección de cambios no corre sola en esta app.
      this.cdr.detectChanges();
    }
  }

  private aplicarSexoReniec(sexoRaw: string) {
    const sexo = (sexoRaw || '').trim().toUpperCase();
    if (!sexo) return;
    const esMasculino = sexo.includes('MASC') || sexo === 'M' || sexo === '1';
    const esFemenino = sexo.includes('FEM') || sexo === 'F' || sexo === '2';
    if (!esMasculino && !esFemenino) return;
    const match = this.tiposSexo.find(sx => {
      const d = normalizarTexto(sx.descripcion || '');
      return esMasculino ? d.includes('MASC') || d === 'M' || d === '1' : d.includes('FEM') || d === 'F' || d === '2';
    });
    if (match) this.form.idTipoSexo = String(match.id);
  }

  // RENIEC a veces devuelve el estado civil como código numérico; mapea los
  // códigos conocidos a su descripción para buscar en el catálogo.
  private static readonly CODIGOS_ESTADO_CIVIL: Record<string, string> = {
    '01': 'SOLTERO', '02': 'CASADO', '03': 'VIUDO', '04': 'DIVORCIADO',
    '05': 'SEPARADO', '06': 'CONVIVIENTE'
  };

  private aplicarEstadoCivilReniec(estadoRaw: string) {
    const estado = normalizarTexto(estadoRaw);
    if (!estado) return;
    if (/^\d+$/.test(estado)) {
      const texto = RegistroPacienteModal.CODIGOS_ESTADO_CIVIL[estado];
      if (!texto) return; // código desconocido: se deja editable
      const match = this.estadosCivil.find(ec => normalizarTexto(ec.descripcion || '') === texto);
      if (match) this.form.idEstadoCivil = String(match.id);
      return;
    }
    const match = this.estadosCivil.find(ec => {
      const d = normalizarTexto(ec.descripcion || '');
      return d.length >= 3 && (estado === d || estado.includes(d) || d.includes(estado));
    });
    if (match) this.form.idEstadoCivil = String(match.id);
  }

  private async autocompletarUbigeo(departamento: string, provincia: string, distrito: string) {
    if (!departamento && !provincia && !distrito) return;
    if (!this.departamentos.length) {
      try {
        await this.cargarCatalogos();
      } catch {
        return;
      }
    }
    const dep = this.buscarEnCatalogo(this.departamentos, departamento);
    if (!dep) return;
    this.form.idDepartamentoDomicilio = String(dep.id);
    const provs = await this.maestrosApi.getProvincias(dep.id);
    this.provincias = Array.isArray(provs) ? provs : [];
    const prv = this.buscarEnCatalogo(this.provincias, provincia);
    if (!prv) return;
    this.form.idProvinciaDomicilio = String(prv.id);
    const dists = await this.maestrosApi.getDistritos(prv.id);
    this.distritos = Array.isArray(dists) ? dists : [];
    const dis = this.buscarEnCatalogo(this.distritos, distrito);
    if (dis) this.form.idDistritoDomicilio = String(dis.id);
  }

  // Autocompleta la sección de nacimiento (departamento → provincia → distrito)
  // con los nombres devueltos por RENIEC.
  private async autocompletarUbigeoNacimiento(departamento: string, provincia: string, distrito: string) {
    if (!departamento && !provincia && !distrito) return;
    if (!this.departamentos.length) {
      try {
        await this.cargarCatalogos();
      } catch {
        return;
      }
    }
    const dep = this.buscarEnCatalogo(this.departamentos, departamento);
    if (!dep) return;
    this.depNacimientoSel = String(dep.id);
    const provs = await this.maestrosApi.getProvincias(dep.id);
    this.provNacimiento = Array.isArray(provs) ? provs : [];
    const prv = this.buscarEnCatalogo(this.provNacimiento, provincia);
    if (!prv) return;
    this.provNacimientoSel = String(prv.id);
    const dists = await this.maestrosApi.getDistritos(prv.id);
    this.distritosNacimiento = Array.isArray(dists) ? dists : [];
    const dis = this.buscarEnCatalogo(this.distritosNacimiento, distrito);
    if (dis) this.form.idDistritoNacimiento = String(dis.id);
  }

  private buscarEnCatalogo(lista: ICatalogoNombre[], nombre: string): ICatalogoNombre | undefined {
    const n = normalizarTexto(nombre);
    if (!n) return undefined;
    return lista.find(x => {
      const d = normalizarTexto(x.nombre);
      return d === n || (n.length >= 5 && (d.includes(n) || n.includes(d)));
    });
  }

  // --- Carga en modo edición ---
  private async cargarPaciente() {
    if (!this.pacienteId) return;
    this.cargandoDetalle = true;
    this.error = '';
    try {
      const detalle = await this.pacientesApi.obtener(this.pacienteId);
      const d = detalle as unknown as Record<string, unknown>;
      this.detalleOriginal = d;
      const texto = (v: unknown): string => (v === null || v === undefined ? '' : String(v));
      this.form.idDocIdentidad = texto(d['docIdentityId']);
      this.form.nroDocumento = texto(d['documentNumber']);
      this.form.apellidoPaterno = texto(d['paternalSurname']);
      this.form.apellidoMaterno = texto(d['maternalSurname']);
      this.form.primerNombre = texto(d['firstName']);
      this.form.segundoNombre = texto(d['secondName']);
      this.form.tercerNombre = texto(d['thirdName']);
      this.form.fechaNacimiento = texto(d['dateOfBirth']).slice(0, 10);
      this.form.idTipoSexo = texto(d['sexTypeId']);
      this.form.telefono = texto(d['phone']);
      this.form.celular = texto(d['cellphone']);
      this.form.email = texto(d['email']);
      this.form.idPaisNacimiento = texto(d['birthCountryId']);
      this.form.idDistritoNacimiento = texto(d['birthDistrictId']);
      this.form.idCentroPobladoNacimiento = texto(d['birthCenterId']);
      this.form.idPaisProcedencia = texto(d['originCountryId']);
      this.form.idDistritoProcedencia = texto(d['originDistrictId']);
      this.form.idCentroPobladoProcedencia = texto(d['originCenterId']);
      this.form.idPaisDomicilio = texto(d['homeCountryId']);
      this.form.idDistritoDomicilio = texto(d['homeDistrictId']);
      this.form.idCentroPobladoDomicilio = texto(d['homeCenterId']);
      this.form.direccionDomicilio = texto(d['homeAddress']);
      this.form.idEstadoCivil = texto(d['maritalStatusId']);
      this.form.idGradoInstruccion = texto(d['educationDegreeId']);
      this.form.idTipoOcupacion = texto(d['occupationTypeId']);
      this.form.nombrePadre = texto(d['fatherName']);
      this.form.nombreMadre = texto(d['motherName']);
      this.form.idEtnia = texto(d['ethnicityId']);
      this.form.idIdioma = texto(d['languageId']);
      this.form.discapacidad = texto(d['disabilityId']);
      this.form.incapacidad = texto(d['incapacityId']);
    } catch (err: unknown) {
      this.error = err instanceof ApiRequestError ? err.message : 'No se pudieron cargar los datos del paciente.';
    } finally {
      this.cargandoDetalle = false;
      this.cdr.detectChanges();
    }
  }

  // --- Guardado ---
  async guardar() {
    const f = this.form;
    const nroDocumento = sanitizar(f.nroDocumento);
    const apellidoPaterno = this.normalizarNombre(f.apellidoPaterno);
    const primerNombre = this.normalizarNombre(f.primerNombre);
    if (!nroDocumento || !apellidoPaterno || !primerNombre) {
      this.error = 'Complete al menos documento, apellido paterno y primer nombre.';
      return;
    }
    const email = sanitizar(f.email);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.error = 'El correo electrónico no tiene un formato válido.';
      return;
    }
    if (f.fechaNacimiento) {
      const hoy = new Date().toISOString().slice(0, 10);
      if (f.fechaNacimiento > hoy) {
        this.error = 'La fecha de nacimiento no puede ser futura.';
        return;
      }
    }
    const telefono = sanitizar(f.telefono);
    const celular = sanitizar(f.celular);
    if (telefono && !/^\d{6,15}$/.test(telefono)) {
      this.error = 'El teléfono debe tener entre 6 y 15 dígitos.';
      return;
    }
    if (celular && !/^\d{6,15}$/.test(celular)) {
      this.error = 'El celular debe tener entre 6 y 15 dígitos.';
      return;
    }

    this.guardando = true;
    this.error = '';

    try {
      if (this.pacienteId) {
        await this.actualizarPaciente(nroDocumento, apellidoPaterno, primerNombre, email, telefono, celular);
        const nombre = `${apellidoPaterno} ${this.normalizarNombre(f.apellidoMaterno)}, ${primerNombre} ${this.normalizarNombre(f.segundoNombre)}`.trim();
        this.actualizado.emit(nombre);
        this.cerrar();
        return;
      }
      if (this.modo === 'triaje') {
        await this.guardarComoTriaje(nroDocumento, apellidoPaterno, primerNombre, email, telefono);
      } else {
        await this.guardarComoPaciente(nroDocumento, apellidoPaterno, primerNombre, email, telefono, celular);
      }
      const nombre = `${apellidoPaterno} ${this.normalizarNombre(f.apellidoMaterno)}, ${primerNombre} ${this.normalizarNombre(f.segundoNombre)}`.trim();
      this.registrado.emit(nombre);
      this.cerrar();
    } catch (err: unknown) {
      this.error = err instanceof ApiRequestError ? err.message : 'No se pudo registrar el paciente.';
    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  private async guardarComoTriaje(nroDocumento: string, apellidoPaterno: string, primerNombre: string, email: string, telefono: string) {
    const f = this.form;
    const payload: RegistroTriajePayload = { nroDocumento, apellidoPaterno, primerNombre };
    if (f.idDocIdentidad) payload.idDocIdentidad = Number(f.idDocIdentidad);
    const apellidoMaterno = this.normalizarNombre(f.apellidoMaterno);
    const segundoNombre = this.normalizarNombre(f.segundoNombre);
    const tercerNombre = this.normalizarNombre(f.tercerNombre);
    if (apellidoMaterno) payload.apellidoMaterno = apellidoMaterno;
    if (segundoNombre) payload.segundoNombre = segundoNombre;
    if (tercerNombre) payload.tercerNombre = tercerNombre;
    if (f.idTipoSexo) payload.idSexo = Number(f.idTipoSexo);
    if (f.fechaNacimiento) payload.fechaNacimiento = new Date(`${f.fechaNacimiento}T00:00:00`).toISOString();
    if (f.idEstadoCivil) payload.idEstadoCivil = Number(f.idEstadoCivil);
    if (f.idDepartamentoDomicilio) payload.idDepartamentoDomicilio = Number(f.idDepartamentoDomicilio);
    if (f.idProvinciaDomicilio) payload.idProvinciaDomicilio = Number(f.idProvinciaDomicilio);
    if (f.idDistritoDomicilio) payload.idDistritoDomicilio = Number(f.idDistritoDomicilio);
    if (f.idCentroPobladoDomicilio) payload.idComunidadDomicilio = Number(f.idCentroPobladoDomicilio);
    if (f.idFuenteFinanciamiento) payload.idFuenteFinanciamiento = Number(f.idFuenteFinanciamiento);
    if (f.idEsAccidenteTransito !== '') payload.idEsAccidenteTransito = Number(f.idEsAccidenteTransito);
    if (f.idEstadollego) payload.idEstadollego = Number(f.idEstadollego);
    if (f.gestante !== '') payload.gestante = Number(f.gestante);
    if (telefono) payload.telefono = telefono;
    if (email) payload.email = email;
    const direccion = sanitizar(f.direccionDomicilio);
    if (direccion) payload.direccion = direccion;
    const motivo = sanitizar(f.motivo);
    if (motivo) payload.motivo = motivo;
    await this.triajeApi.registrar(payload);
  }

  private async guardarComoPaciente(nroDocumento: string, apellidoPaterno: string, primerNombre: string, email: string, telefono: string, celular: string) {
    const f = this.form;
    const payload: RegistroPacientePayload = { nroDocumento, apellidoPaterno, primerNombre };
    if (f.idDocIdentidad) payload.idDocIdentidad = Number(f.idDocIdentidad);
    const apellidoMaterno = this.normalizarNombre(f.apellidoMaterno);
    const segundoNombre = this.normalizarNombre(f.segundoNombre);
    const tercerNombre = this.normalizarNombre(f.tercerNombre);
    if (apellidoMaterno) payload.apellidoMaterno = apellidoMaterno;
    if (segundoNombre) payload.segundoNombre = segundoNombre;
    if (tercerNombre) payload.tercerNombre = tercerNombre;
    if (f.idTipoSexo) payload.idTipoSexo = Number(f.idTipoSexo);
    if (f.fechaNacimiento) payload.fechaNacimiento = new Date(`${f.fechaNacimiento}T00:00:00`).toISOString();
    if (f.idPaisNacimiento) payload.idPaisNacimiento = Number(f.idPaisNacimiento);
    if (f.idDistritoNacimiento) payload.idDistritoNacimiento = Number(f.idDistritoNacimiento);
    if (f.idCentroPobladoNacimiento) payload.idCentroPobladoNacimiento = Number(f.idCentroPobladoNacimiento);
    if (f.idPaisProcedencia) payload.idPaisProcedencia = Number(f.idPaisProcedencia);
    if (f.idDistritoProcedencia) payload.idDistritoProcedencia = Number(f.idDistritoProcedencia);
    if (f.idCentroPobladoProcedencia) payload.idCentroPobladoProcedencia = Number(f.idCentroPobladoProcedencia);
    if (f.idPaisDomicilio) payload.idPaisDomicilio = Number(f.idPaisDomicilio);
    if (f.idDistritoDomicilio) payload.idDistritoDomicilio = Number(f.idDistritoDomicilio);
    if (f.idCentroPobladoDomicilio) payload.idCentroPobladoDomicilio = Number(f.idCentroPobladoDomicilio);
    if (f.idEstadoCivil) payload.idEstadoCivil = Number(f.idEstadoCivil);
    if (f.idGradoInstruccion) payload.idGradoInstruccion = Number(f.idGradoInstruccion);
    if (f.idTipoOcupacion) payload.idTipoOcupacion = Number(f.idTipoOcupacion);
    const nombrePadre = this.normalizarNombre(f.nombrePadre);
    const nombreMadre = this.normalizarNombre(f.nombreMadre);
    if (nombrePadre) payload.nombrePadre = nombrePadre;
    if (nombreMadre) payload.nombreMadre = nombreMadre;
    if (f.idEtnia) payload.idEtnia = Number(f.idEtnia);
    if (f.idIdioma) payload.idIdioma = Number(f.idIdioma);
    if (telefono) payload.telefono = telefono;
    if (celular) payload.celular = celular;
    if (email) payload.email = email;
    const direccion = sanitizar(f.direccionDomicilio);
    if (direccion) payload.direccionDomicilio = direccion;
    if (f.discapacidad !== '') payload.discapacidad = Number(f.discapacidad);
    if (f.incapacidad !== '') payload.incapacidad = Number(f.incapacidad);
    await this.pacientesApi.registrar(payload);
  }

  private async actualizarPaciente(nroDocumento: string, apellidoPaterno: string, primerNombre: string, email: string, telefono: string, celular: string) {
    if (!this.pacienteId) return;
    const f = this.form;
    const d = this.detalleOriginal ?? {};
    const texto = (v: unknown): string => (v === null || v === undefined ? '' : String(v));
    const numero = (v: unknown): number | undefined => {
      if (v === '' || v === null || v === undefined) return undefined;
      const n = Number(v);
      return Number.isNaN(n) ? undefined : n;
    };
    const payload: ActualizarPacientePayload = {
      birthCountryId: numero(f.idPaisNacimiento || texto(d['birthCountryId'])),
      maternalSurname: this.normalizarNombre(f.apellidoMaterno) || texto(d['maternalSurname']) || undefined,
      homeAddress: sanitizar(f.direccionDomicilio) || texto(d['homeAddress']) || undefined,
      originCountryId: numero(f.idPaisProcedencia || texto(d['originCountryId'])),
      paternalSurname: apellidoPaterno,
      firstName: primerNombre,
      secondName: this.normalizarNombre(f.segundoNombre) || texto(d['secondName']) || undefined,
      thirdName: this.normalizarNombre(f.tercerNombre) || texto(d['thirdName']) || undefined,
      dateOfBirth: f.fechaNacimiento ? new Date(`${f.fechaNacimiento}T00:00:00`).toISOString() : undefined,
      documentNumber: nroDocumento,
      phone: telefono || texto(d['phone']) || undefined,
      cellphone: celular || texto(d['cellphone']) || undefined,
      autoGenerated: texto(d['autoGenerated']) || undefined,
      sexTypeId: numero(f.idTipoSexo || texto(d['sexTypeId'])),
      originId: numero(texto(d['originId'])),
      educationDegreeId: numero(f.idGradoInstruccion || texto(d['educationDegreeId'])),
      maritalStatusId: numero(f.idEstadoCivil || texto(d['maritalStatusId'])),
      docIdentityId: numero(f.idDocIdentidad || texto(d['docIdentityId'])),
      occupationTypeId: numero(f.idTipoOcupacion || texto(d['occupationTypeId'])),
      homeCenterId: numero(f.idCentroPobladoDomicilio || texto(d['homeCenterId'])),
      fatherName: this.normalizarNombre(f.nombrePadre) || texto(d['fatherName']) || undefined,
      motherName: this.normalizarNombre(f.nombreMadre) || texto(d['motherName']) || undefined,
      homeCountryId: numero(f.idPaisDomicilio || texto(d['homeCountryId'])),
      birthCenterId: numero(f.idCentroPobladoNacimiento || texto(d['birthCenterId'])),
      originCenterId: numero(f.idCentroPobladoProcedencia || texto(d['originCenterId'])),
      originDistrictId: numero(f.idDistritoProcedencia || texto(d['originDistrictId'])),
      homeDistrictId: numero(f.idDistritoDomicilio || texto(d['homeDistrictId'])),
      birthDistrictId: numero(f.idDistritoNacimiento || texto(d['birthDistrictId'])),
      ethnicityId: f.idEtnia || texto(d['ethnicityId']) || undefined,
      languageId: numero(f.idIdioma || texto(d['languageId'])),
      email: email || texto(d['email']) || undefined,
      disabilityId: f.discapacidad === '' ? numero(texto(d['disabilityId'])) : numero(f.discapacidad),
      incapacityId: f.incapacidad === '' ? numero(texto(d['incapacityId'])) : numero(f.incapacidad)
    };
    // El backend modela NroHistoriaClinica como entero; solo se envía si es numérico.
    const hc = Number(texto(d['historyNumber']));
    if (!Number.isNaN(hc)) payload.historyNumber = hc;
    await this.pacientesApi.actualizar(this.pacienteId, payload);
  }
}