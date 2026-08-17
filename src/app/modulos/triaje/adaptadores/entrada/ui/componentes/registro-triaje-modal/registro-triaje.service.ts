import { Injectable, inject } from '@angular/core';
import { MaestrosApiService } from '../../../../../../../compartido/api/maestros.api.service';
import { PacientesApiService } from '../../../../../../pacientes/adaptadores/salida/http/pacientes.api.service';
import { SisApiService } from '../../../../../../sis/adaptadores/salida/http/sis.api.service';
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
    { value: '1', label: 'Rojo · Emergencia' },
    { value: '2', label: 'Naranja · Muy urgente' },
    { value: '3', label: 'Amarillo · Urgente' },
    { value: '4', label: 'Verde · Poco urgente' },
    { value: '5', label: 'Azul · No urgente' },
    { value: '6', label: 'Negro · Cadáver' }
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
        this.maestrosApi.getServicios(1)
      ]);
    } catch (err: unknown) {
      console.error('Error al cargar catálogos:', err);
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

    this.buscando = true;
    this.mensajeError = '';
    this.pacienteEncontrado = false;
    this.sisConsultado = false;
    this.sisActivo = false;

    try {
      let paciente = await this.buscarEnBaseDatosLocal();

      if (!paciente) {
        await this.consultarReniec();
        this.pacienteEncontrado = true;
        this.pasoActual = 2;
      } else {
        this.mapearPacienteLocal(paciente);
        this.pacienteEncontrado = true;
        this.pasoActual = 2;
      }

      await this.consultarSis();

    } catch (error: any) {
      this.mensajeError = error instanceof ApiRequestError ? error.message : 'Error inesperado al buscar paciente.';
    } finally {
      this.buscando = false;
    }
  }

  private habilitarModoNN(): void {
    this.pacienteEncontrado = true;
    this.formulario.apellidoPaterno = 'NN';
    this.formulario.apellidoMaterno = 'NN';
    this.formulario.primerNombre = 'NN';
  }

  private async buscarEnBaseDatosLocal(): Promise<any> {
    try {
      return await this.pacientesApi.porDocumento(this.formulario.nroDocumento, this.formulario.idDocIdentidad);
    } catch (error: any) {
      if (error instanceof ApiRequestError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  private async consultarReniec(): Promise<void> {
    const resultado = await this.pacientesApi.consultarReniec(this.formulario.nroDocumento);

    if (resultado.datos) {
      const formComoPaciente = this.formulario as unknown as import('../../../../../../../compartido/ui/registro-paciente/registro-paciente.interfaces').FormRegistroPaciente;
      const mapeado = await this.reniecMapper.mapearDatos(resultado.datos, formComoPaciente, this.tiposSexo, this.estadosCivil);

      Object.assign(this.formulario, mapeado.form);

      if (this.formulario.idDepartamentoDomicilio) await this.cargarProvincias();
      if (this.formulario.idProvinciaDomicilio) await this.cargarDistritos();
      if (this.formulario.idDistritoDomicilio) await this.cargarCentrosPoblados();

      this.pacienteEncontrado = true;
    } else {
      this.mensajeError = 'No se encontraron datos en la RENIEC.';
    }
  }

  private async consultarSis(): Promise<void> {
    try {
      const tipoDoc = this.formulario.idDocIdentidad === '1' ? 1 : 3;
      const sisResponse = await this.sisApi.consultarAfiliado(this.formulario.nroDocumento, tipoDoc);

      this.sisConsultado = true;
      this.pacienteEncontrado = true;
      this.pasoActual = 2;
        
      const sisFuente = this.fuentesFinanciamiento.find(f => f.descripcion && f.descripcion.toUpperCase().includes('SIS'));
      if (sisFuente) {
        this.formulario.idFuenteFinanciamiento = String(sisFuente.id);
      }

      if (sisResponse?.estado === 'ACTIVO') {
        this.sisActivo = true;
        this.sisDescripcion = `${sisResponse.estado} - ${sisResponse.descTipoSeguro}`;

        try {
          await this.sisApi.gestionarAfiliacion({
            documentoTipo: this.formulario.idDocIdentidad,
            documentoNumero: this.formulario.nroDocumento,
            paterno: sisResponse.apePaterno,
            materno: sisResponse.apeMaterno,
            pNombre: sisResponse.nombres,
            estado: sisResponse.estado,
            descTipoSeguro: sisResponse.descTipoSeguro
          });
          this.sisGuardado = true;
        } catch {
          this.sisGuardado = false;
        }
      } else {
        this.sisActivo = false;
      }
    } catch {
      this.sisConsultado = true;
      this.sisActivo = false;
    }
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

    const idCP = v('homeCenterId', 'HomeCenterID', 'idCentroPobladoDomicilio');
    this.formulario.idCentroPobladoDomicilio = idCP ? String(idCP) : '';

    this.cargarProvincias();
    this.cargarDistritos();
    this.cargarCentrosPoblados();
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

    this.guardando = true;

    try {
      let idPacienteFinal = this.formulario.idPaciente;

      const payloadPaciente = {
        nroDocumento: this.formulario.nroDocumento,
        idDocIdentidad: Number(this.formulario.idDocIdentidad) || 1,
        apellidoPaterno: this.formulario.apellidoPaterno,
        apellidoMaterno: this.formulario.apellidoMaterno,
        primerNombre: this.formulario.primerNombre,
        segundoNombre: this.formulario.segundoNombre,
        fechaNacimiento: this.formulario.fechaNacimiento || undefined,
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
        fechaNacimiento: this.formulario.fechaNacimiento || undefined,
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

    } finally {
      this.guardando = false;
    }
  }
}
