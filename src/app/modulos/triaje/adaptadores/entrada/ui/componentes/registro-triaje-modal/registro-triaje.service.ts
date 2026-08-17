import { Injectable, inject } from '@angular/core';
import { MaestrosApiService } from '../../../../../../../compartido/api/maestros.api.service';
import { PacientesApiService } from '../../../../../../pacientes/adaptadores/salida/http/pacientes.api.service';
import { SisApiService, SisAfiliado } from '../../../../../../sis/adaptadores/salida/http/sis.api.service';
import { TriajeApiService, RegistroTriajePayload } from '../../../../salida/http/triaje.api.service';
import { ICatalogoDescripcion, ICatalogoNombre } from '../../../../../../../compartido/tipos/api-tipos';
import { ApiRequestError } from '../../../../../../../compartido/api-client/api-client.service';
import { FormRegistroTriaje } from './registro-triaje.interfaces';
import { ReniecMapper } from '../../../../../../../compartido/utilidades/reniec.mapper';

@Injectable()
export class RegistroTriajeService {
  private readonly maestrosApi = inject(MaestrosApiService);
  private readonly pacientesApi = inject(PacientesApiService);
  private readonly sisApi = inject(SisApiService);
  private readonly triajeApi = inject(TriajeApiService);
  private readonly reniecMapper = inject(ReniecMapper);

  formulario: FormRegistroTriaje = this.crearFormularioVacio();

  buscando = false;
  guardando = false;
  pacienteEncontrado = false;
  mensajeError = '';

  sisConsultado = false;
  sisActivo = false;
  sisDescripcion = '';
  sisGuardado = false;

  ultimoTriajeId: number | null = null;

  tiposDocumentos: ICatalogoDescripcion[] = [];
  tiposSexo: ICatalogoDescripcion[] = [];
  estadosCivil: ICatalogoDescripcion[] = [];
  departamentos: ICatalogoNombre[] = [];
  provincias: ICatalogoNombre[] = [];
  distritos: ICatalogoNombre[] = [];
  centrosPoblados: ICatalogoNombre[] = [];
  fuentesFinanciamiento: any[] = [];
  estadosLlegoPaciente: ICatalogoDescripcion[] = [];
  servicios: ICatalogoNombre[] = [];
  
  prioridades = [
    { value: '1', label: 'I. Emerg. o Gravedad', color: '#3b82f6' },
    { value: '2', label: 'II. Urgencia Mayor', color: '#22c55e' },
    { value: '3', label: 'III. Urgencia Menor', color: '#eab308' },
    { value: '4', label: 'IV. Patología Aguda Común', color: '#f97316' },
    { value: '6', label: 'Llegó Cadáver', color: '#ef4444' },
  ];

  unidadesTiempo = [
    { value: 'Años', label: 'Años' },
    { value: 'Meses', label: 'Meses' },
    { value: 'Semanas', label: 'Semanas' },
    { value: 'Días', label: 'Días' },
    { value: 'Horas', label: 'Horas' },
    { value: 'Minutos', label: 'Minutos' }
  ];

  pasoActual = 1;

  crearFormularioVacio(): FormRegistroTriaje {
    return {
      idDocIdentidad: '1',
      nroDocumento: '',
      pacienteNn: false,
      apellidoPaterno: '',
      apellidoMaterno: '',
      primerNombre: '',
      segundoNombre: '',
      fechaNacimiento: '',
      idTipoSexo: '',
      idEstadoCivil: '',
      telefono: '',
      idDepartamentoDomicilio: '',
      idProvinciaDomicilio: '',
      idDistritoDomicilio: '',
      idCentroPobladoDomicilio: '',
      direccionDomicilio: '',
      esAccidenteTransito: false,
      idFuenteFinanciamiento: '',
      idEstadoLlego: '',
      motivo: '',
      presionArterial: '',
      frecCardiaca: '',
      frecRespiratoria: '',
      temperatura: '',
      saturacion: '',
      fiO2: '',
      peso: '',
      talla: '',
      escalaDolor: '',
      escalaGlasgow: '',
      tiempoEvolucionCantidad: '',
      tiempoEvolucionCantidadUnidad: '',
      idServicio: '',
      idTipoPrioridad: ''
    };
  }

  async cargarCatalogosIniciales(): Promise<void> {
    try {
      [this.tiposDocumentos, this.tiposSexo, this.estadosCivil, this.departamentos, this.fuentesFinanciamiento, this.estadosLlegoPaciente, this.servicios] = await Promise.all([
        this.maestrosApi.getTiposDocumentos(),
        this.maestrosApi.getTiposSexo(),
        this.maestrosApi.getEstadosCivil(),
        this.maestrosApi.getDepartamentos(),
        this.maestrosApi.getFuentesFinanciamiento(),
        this.maestrosApi.getEstadosLlegoPaciente(),
        this.maestrosApi.getServicios(2)
      ]);
    } catch {
      this.mensajeError = 'Error al cargar catálogos iniciales.';
    }
  }

  avanzarPaso(): void {
    if (this.pasoActual === 1) this.pasoActual = 2;
    else if (this.pasoActual === 2) this.pasoActual = 3;
  }

  retrocederPaso(): void {
    if (this.pasoActual === 3) this.pasoActual = 2;
    else if (this.pasoActual === 2) this.pasoActual = 1;
  }

  limpiarEstado(): void {
    this.pasoActual = 1;
    this.formulario = this.crearFormularioVacio();
    this.pacienteEncontrado = false;
    this.buscando = false;
    this.guardando = false;
    this.mensajeError = '';
    this.sisConsultado = false;
    this.sisActivo = false;
    this.sisDescripcion = '';
    this.sisGuardado = false;
    this.ultimoTriajeId = null;
  }

  async buscarPaciente(): Promise<void> {
    if (this.formulario.pacienteNn) {
      this.habilitarModoNN();
      return;
    }

    if (!this.formulario.nroDocumento) {
      this.mensajeError = 'Ingrese un número de documento';
      return;
    }

    this.formulario.nroDocumento = this.formulario.nroDocumento.trim();
    this.buscando = true;
    this.mensajeError = '';
    this.pacienteEncontrado = false;
    this.sisConsultado = false;
    this.sisActivo = false;

    try {
      let paciente = await this.buscarEnBaseDatosLocal();

      if (!paciente) {
        const reniecOk = await this.consultarReniec();
        if (reniecOk) {
          this.pacienteEncontrado = true;
          this.pasoActual = 2;
        }
      } else {
        this.mapearPacienteLocal(paciente);
        this.pacienteEncontrado = true;
        this.pasoActual = 2;
      }

      await this.consultarSis();

      if (!this.pacienteEncontrado && !this.mensajeError) {
        this.mensajeError = 'No se encontró el paciente en la base de datos, RENIEC ni SIS. Complete los datos manualmente o active el modo Paciente NN.';
      }

    } catch (error: any) {
      this.mensajeError = error instanceof ApiRequestError ? error.message : 'Error inesperado al buscar paciente.';
    } finally {
      this.buscando = false;
    }
  }

  private habilitarModoNN(): void {
    this.pacienteEncontrado = true;
    this.pasoActual = 2;
    this.formulario.apellidoPaterno = 'NN';
    this.formulario.apellidoMaterno = 'NN';
    this.formulario.primerNombre = 'NN';
  }

  private async buscarEnBaseDatosLocal(): Promise<any> {
    try {
      return await this.pacientesApi.porDocumento(this.formulario.nroDocumento, this.formulario.idDocIdentidad);
    } catch (error: any) {
      if (error instanceof ApiRequestError && error.status === 404) {
        return await this.buscarPorDocumentoSinTipo();
      }
      throw error;
    }
  }

  private async buscarPorDocumentoSinTipo(): Promise<any> {
    try {
      const resultados = await this.pacientesApi.buscar(`documento=${encodeURIComponent(this.formulario.nroDocumento)}`);
      return resultados.length > 0 ? resultados[0] : null;
    } catch {
      return null;
    }
  }

  private async consultarReniec(): Promise<boolean> {
    try {
      const resultado = await this.pacientesApi.consultarReniec(this.formulario.nroDocumento);

      if (resultado.datos) {
        const formComoPaciente = this.formulario as unknown as import('../../../../../../../compartido/ui/registro-paciente/registro-paciente.interfaces').FormRegistroPaciente;
        const mapeado = await this.reniecMapper.mapearDatos(resultado.datos, formComoPaciente, this.tiposSexo, this.estadosCivil);

        Object.assign(this.formulario, mapeado.form);

        if (this.formulario.idDepartamentoDomicilio) await this.cargarProvincias();
        if (this.formulario.idProvinciaDomicilio) await this.cargarDistritos();
        if (this.formulario.idDistritoDomicilio) await this.cargarCentrosPoblados();

        return true;
      } else {
        this.mensajeError = 'No se encontraron datos en la RENIEC.';
        return false;
      }
    } catch {
      this.mensajeError = 'No se pudo consultar RENIEC. Complete los datos manualmente.';
      return false;
    }
  }

  private async consultarSis(): Promise<void> {
    try {
      const tipoDoc = this.formulario.idDocIdentidad === '1' ? 1 : 3;
      const sisResponse = await this.sisApi.consultarAfiliado(this.formulario.nroDocumento, tipoDoc);

      this.sisConsultado = true;

      if (sisResponse?.estado === 'ACTIVO') {
        this.sisActivo = true;
        this.sisDescripcion = `${sisResponse.estado} - ${sisResponse.descTipoSeguro}`;

        this.mapearDatosSisAlFormulario(sisResponse);

        const fNacimientoIso = this.formatearFechaSis(sisResponse.fecNacimiento);

        try {
          await this.sisApi.gestionarAfiliacion({
            documentoTipo: sisResponse.tipoDocumento || this.formulario.idDocIdentidad,
            documentoNumero: sisResponse.nroDocumento || this.formulario.nroDocumento,
            paterno: sisResponse.apePaterno,
            materno: sisResponse.apeMaterno,
            pNombre: sisResponse.nombres,
            genero: sisResponse.genero,
            fNacimiento: fNacimientoIso || undefined,
            idDistritoDomicilio: sisResponse.idUbigeo,
            estado: sisResponse.estado,
            afiliacionDisa: sisResponse.disa,
            afiliacionTipoFormato: sisResponse.tipoFormato,
            afiliacionNroFormato: sisResponse.nroContrato,
            afiliacionNroIntegrante: sisResponse.correlativo,
            codigoEstablAdscripcion: sisResponse.eess,
            descEESS: sisResponse.descEESS,
            descEessUbigeo: sisResponse.descEessUbigeo,
            regimen: sisResponse.regimen,
            tipoSeguro: sisResponse.tipoSeguro,
            descTipoSeguro: sisResponse.descTipoSeguro,
            contrato: sisResponse.contrato,
            idPlan: sisResponse.idPlan,
            idGrupoPoblacional: sisResponse.idGrupoPoblacional,
            msgConfidencial: sisResponse.msgConfidencial
          });
          this.sisGuardado = true;
        } catch {
          this.sisGuardado = false;
        }
      } else {
        this.sisActivo = false;
      }

      this.actualizarIafaAutomatico();
    } catch {
      this.sisConsultado = true;
      this.sisActivo = false;
      this.actualizarIafaAutomatico();
    }
  }

  private formatearFechaSis(fecha: string | undefined): string {
    if (!fecha) return '';
    if (fecha.length === 8) {
      return `${fecha.slice(0, 4)}-${fecha.slice(4, 6)}-${fecha.slice(6, 8)}T00:00:00Z`;
    }
    return fecha;
  }

  actualizarIafaAutomatico(): void {
    if (this.formulario.esAccidenteTransito) {
      const soat = this.fuentesFinanciamiento.find(f => f.descripcion && f.descripcion.toUpperCase().includes('SOAT'));
      if (soat) this.formulario.idFuenteFinanciamiento = String(soat.idFuenteFinanciamiento);
    } else if (this.sisActivo) {
      const sis = this.fuentesFinanciamiento.find(f => f.descripcion && f.descripcion.toUpperCase().includes('SIS'));
      if (sis) this.formulario.idFuenteFinanciamiento = String(sis.idFuenteFinanciamiento);
    } else {
      const particular = this.fuentesFinanciamiento.find(f => f.descripcion && f.descripcion.toUpperCase().includes('PARTICULAR'));
      if (particular) this.formulario.idFuenteFinanciamiento = String(particular.idFuenteFinanciamiento);
    }
  }

  private mapearDatosSisAlFormulario(sis: SisAfiliado): void {
    if (!this.formulario.apellidoPaterno && sis.apePaterno) this.formulario.apellidoPaterno = sis.apePaterno;
    if (!this.formulario.apellidoMaterno && sis.apeMaterno) this.formulario.apellidoMaterno = sis.apeMaterno;
    if (!this.formulario.primerNombre && sis.nombres) {
      const partes = sis.nombres.trim().split(/\s+/);
      this.formulario.primerNombre = partes[0] || '';
      this.formulario.segundoNombre = partes.slice(1).join(' ');
    }
    if (!this.formulario.fechaNacimiento && sis.fecNacimiento && sis.fecNacimiento.length === 8) {
      this.formulario.fechaNacimiento = `${sis.fecNacimiento.slice(0, 4)}-${sis.fecNacimiento.slice(4, 6)}-${sis.fecNacimiento.slice(6, 8)}`;
    }
    if (!this.formulario.idTipoSexo && sis.genero) {
      this.formulario.idTipoSexo = sis.genero === '1' ? '1' : sis.genero === '2' ? '2' : '';
    }
    if (!this.formulario.direccionDomicilio && sis.direccion) this.formulario.direccionDomicilio = sis.direccion;
    if (!this.formulario.idDistritoDomicilio && sis.idUbigeo) {
      this.formulario.idDistritoDomicilio = sis.idUbigeo;
    }

    if (this.formulario.idDistritoDomicilio) {
      const dist = this.formulario.idDistritoDomicilio;
      if (!this.formulario.idDepartamentoDomicilio && dist.length >= 2) {
        this.formulario.idDepartamentoDomicilio = dist.substring(0, 2);
      }
      if (!this.formulario.idProvinciaDomicilio && dist.length >= 4) {
        this.formulario.idProvinciaDomicilio = dist.substring(0, 4);
      }
    }

    this.pacienteEncontrado = true;
    this.pasoActual = 2;

    this.cargarProvincias().then(() => this.cargarDistritos()).then(() => this.cargarCentrosPoblados());
  }

  private mapearPacienteLocal(paciente: any): void {
    const v = (prop1: string, prop2: string, prop3?: string) => paciente[prop1] || paciente[prop2] || (prop3 ? paciente[prop3] : '') || '';

    this.formulario.idPaciente = paciente.patientId || paciente.PatientID || paciente.idPaciente || paciente.IdPaciente;
    this.formulario.apellidoPaterno = v('paternalSurname', 'PaternalSurname', 'apellidoPaterno');
    this.formulario.apellidoMaterno = v('maternalSurname', 'MaternalSurname', 'apellidoMaterno');
    this.formulario.primerNombre = v('firstName', 'FirstName', 'primerNombre');
    this.formulario.segundoNombre = v('secondName', 'SecondName', 'segundoNombre');

    const fechaNac = v('dateOfBirth', 'DateOfBirth', 'fechaNacimiento');
    if (fechaNac) {
      this.formulario.fechaNacimiento = fechaNac.split('T')[0];
    }

    const idSexo = v('sexTypeId', 'SexTypeID', 'idTipoSexo');
    this.formulario.idTipoSexo = idSexo ? String(idSexo) : '';

    const idEstado = v('maritalStatusId', 'MaritalStatusID', 'idEstadoCivil');
    this.formulario.idEstadoCivil = idEstado ? String(idEstado) : '';

    this.formulario.telefono = v('phone', 'Phone', 'telefono');
    this.formulario.direccionDomicilio = v('homeAddress', 'HomeAddress', 'direccionDomicilio');

    const idDep = v('homeDepartmentId', 'HomeDepartmentID', 'idDepartamentoDomicilio');
    this.formulario.idDepartamentoDomicilio = idDep ? String(idDep) : '';

    const idProv = v('homeProvinceId', 'HomeProvinceID', 'idProvinciaDomicilio');
    this.formulario.idProvinciaDomicilio = idProv ? String(idProv) : '';

    const idDist = v('homeDistrictId', 'HomeDistrictID', 'idDistritoDomicilio');
    this.formulario.idDistritoDomicilio = idDist ? String(idDist) : '';

    if (!this.formulario.idDepartamentoDomicilio && this.formulario.idDistritoDomicilio.length >= 2) {
      this.formulario.idDepartamentoDomicilio = this.formulario.idDistritoDomicilio.substring(0, 2);
    }
    if (!this.formulario.idProvinciaDomicilio && this.formulario.idDistritoDomicilio.length >= 4) {
      this.formulario.idProvinciaDomicilio = this.formulario.idDistritoDomicilio.substring(0, 4);
    }

    const idCP = v('homeCenterId', 'HomeCenterID', 'idCentroPobladoDomicilio');
    this.formulario.idCentroPobladoDomicilio = idCP ? String(idCP) : '';

    this.cargarProvincias().then(() => this.cargarDistritos()).then(() => this.cargarCentrosPoblados());
  }

  async cargarProvincias(): Promise<void> {
    if (!this.formulario.idDepartamentoDomicilio) {
      this.provincias = [];
      return;
    }
    this.provincias = await this.maestrosApi.getProvincias(this.formulario.idDepartamentoDomicilio);
  }

  async cargarDistritos(): Promise<void> {
    if (!this.formulario.idProvinciaDomicilio) {
      this.distritos = [];
      return;
    }
    this.distritos = await this.maestrosApi.getDistritos(this.formulario.idProvinciaDomicilio);
  }

  async cargarCentrosPoblados(): Promise<void> {
    if (!this.formulario.idDistritoDomicilio) {
      this.centrosPoblados = [];
      return;
    }
    this.centrosPoblados = await this.maestrosApi.getCentrosPoblados(this.formulario.idDistritoDomicilio);
  }

  async guardarYContinuar(): Promise<void> {
    this.mensajeError = '';

    if (!this.pacienteEncontrado) {
      this.mensajeError = 'Debe buscar un paciente antes de continuar.';
      return;
    }

    if (!this.formulario.apellidoPaterno || !this.formulario.primerNombre) {
      this.mensajeError = 'Complete los nombres y apellidos del paciente.';
      return;
    }

    if (!this.formulario.idFuenteFinanciamiento) {
      this.mensajeError = 'Seleccione la fuente de financiamiento (IAFA).';
      return;
    }

    if (!this.formulario.idTipoPrioridad) {
      this.mensajeError = 'Seleccione el tipo de prioridad.';
      return;
    }

    if (!this.formulario.idServicio) {
      this.mensajeError = 'Seleccione el servicio derivado.';
      return;
    }

    this.guardando = true;

    try {
      let idPacienteFinal = this.formulario.idPaciente;

      const fechaNacIso = this.formulario.fechaNacimiento ? this.formulario.fechaNacimiento + 'T00:00:00Z' : undefined;

      const payloadPaciente = {
        nroDocumento: this.formulario.nroDocumento,
        idDocIdentidad: Number(this.formulario.idDocIdentidad) || 1,
        apellidoPaterno: this.formulario.apellidoPaterno,
        apellidoMaterno: this.formulario.apellidoMaterno,
        primerNombre: this.formulario.primerNombre,
        segundoNombre: this.formulario.segundoNombre,
        fechaNacimiento: fechaNacIso,
        idTipoSexo: Number(this.formulario.idTipoSexo) || undefined,
        idEstadoCivil: Number(this.formulario.idEstadoCivil) || undefined,
        telefono: this.formulario.telefono,
        direccionDomicilio: this.formulario.direccionDomicilio,
        idDepartamentoDomicilio: Number(this.formulario.idDepartamentoDomicilio) || undefined,
        idProvinciaDomicilio: Number(this.formulario.idProvinciaDomicilio) || undefined,
        idDistritoDomicilio: Number(this.formulario.idDistritoDomicilio) || undefined,
        idCentroPobladoDomicilio: Number(this.formulario.idCentroPobladoDomicilio) || undefined,
      };

      if (!idPacienteFinal && !this.formulario.pacienteNn) {
        await this.pacientesApi.registrar(payloadPaciente as any);
      } else if (idPacienteFinal) {
        await this.pacientesApi.actualizar(idPacienteFinal, payloadPaciente as any);
      }

      const payloadTriaje: RegistroTriajePayload = {
        idDocIdentidad: Number(this.formulario.idDocIdentidad) || 1,
        nroDocumento: this.formulario.nroDocumento,
        apellidoPaterno: this.formulario.apellidoPaterno,
        apellidoMaterno: this.formulario.apellidoMaterno,
        primerNombre: this.formulario.primerNombre,
        segundoNombre: this.formulario.segundoNombre,
        fechaNacimiento: fechaNacIso,
        idSexo: Number(this.formulario.idTipoSexo) || undefined,
        idEstadoCivil: Number(this.formulario.idEstadoCivil) || undefined,
        telefono: this.formulario.telefono,
        direccion: this.formulario.direccionDomicilio,
        idDepartamentoDomicilio: Number(this.formulario.idDepartamentoDomicilio) || undefined,
        idProvinciaDomicilio: Number(this.formulario.idProvinciaDomicilio) || undefined,
        idDistritoDomicilio: Number(this.formulario.idDistritoDomicilio) || undefined,
        idComunidadDomicilio: Number(this.formulario.idCentroPobladoDomicilio) || undefined,
        idEsAccidenteTransito: this.formulario.esAccidenteTransito ? 1 : 0,
        idFuenteFinanciamiento: Number(this.formulario.idFuenteFinanciamiento) || undefined,
        idEstadollego: Number(this.formulario.idEstadoLlego) || undefined,
        motivo: this.formulario.motivo,
        presionArterial: this.formulario.presionArterial,
        frecCardiaca: Number(this.formulario.frecCardiaca) || undefined,
        frecRespiratoria: Number(this.formulario.frecRespiratoria) || undefined,
        temperatura: Number(this.formulario.temperatura) || undefined,
        saturacion: Number(this.formulario.saturacion) || undefined,
        fiO2: Number(this.formulario.fiO2) || undefined,
        peso: Number(this.formulario.peso) || undefined,
        talla: Number(this.formulario.talla) || undefined,
        escalaDolor: Number(this.formulario.escalaDolor) || undefined,
        escalaGlasgow: Number(this.formulario.escalaGlasgow) || undefined,
        tiempoEvolucionCantidad: Number(this.formulario.tiempoEvolucionCantidad) || undefined,
        tiempoEvolucionCantidadUnidad: this.formulario.tiempoEvolucionCantidadUnidad,
        idServicio: Number(this.formulario.idServicio) || undefined,
        idTipoPrioridad: Number(this.formulario.idTipoPrioridad) || undefined
      };

      await this.triajeApi.registrar(payloadTriaje);

      this.ultimoTriajeId = await this.obtenerUltimoTriajeId();

    } catch (error: any) {
      this.mensajeError = error instanceof ApiRequestError ? error.message : 'Error al guardar el triaje.';
    } finally {
      this.guardando = false;
    }
  }

  private async obtenerUltimoTriajeId(): Promise<number | null> {
    try {
      const hoy = new Date().toISOString().slice(0, 10);
      const items = await this.triajeApi.listar(hoy, hoy, this.formulario.nroDocumento.trim());
      const arr = Array.isArray(items) ? items : [];
      if (arr.length === 0) return null;
      const ids = arr.map((i: any) => Number(i.IdTriaje ?? i.idTriaje ?? i.IDTriaje ?? 0));
      const max = Math.max(...ids);
      return max > 0 ? max : null;
    } catch {
      return null;
    }
  }
}
