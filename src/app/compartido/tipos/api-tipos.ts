// Fila genérica de un listado del backend. Los SP resuelven los nombres de
// columna en runtime, por lo que cada registro se modela como un mapa de
// claves desconocidas (alternativa tipada a `any`).
export type IFilaBackend = Record<string, unknown>;

// Paciente del listado de pacientes (sp_listarPaciente): campos conocidos
// tipados y las columnas extra del SP accesibles por índice.
export interface IPaciente {
  patientId: string | number;
  documentNumber?: string;
  historyNumber?: string;
  paternalSurname?: string;
  maternalSurname?: string;
  firstName?: string;
  secondName?: string;
  thirdName?: string;
  dateOfBirth?: string;
  [columna: string]: unknown;
}

export interface ICatalogoDescripcion {
  id: number;
  descripcion?: string;
}

export interface ICatalogoNombre {
  id: number;
  nombre: string;
}

export interface IFuenteFinanciamiento {
  idFuenteFinanciamiento: number;
  descripcion?: string;
  idTipoFinanciamiento: number;
}

export interface IReniecDatos {
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  primerNombre: string;
  segundoNombre: string;
  tercerNombre: string;
  fechaNacimiento: string;
  sexo: string;
  estadoCivil: string;
  departamento: string;
  provincia: string;
  distrito: string;
  direccion: string;
  ubigeo: string;
  nombrePadre: string;
  nombreMadre: string;
  departamentoNacimiento: string;
  provinciaNacimiento: string;
  distritoNacimiento: string;
}

export interface IReniecResultado {
  dni: string;
  operacion: string;
  resultado: string[];
  datos: IReniecDatos;
}

export interface IListadoPacientes {
  items: IPaciente[];
  page: number;
  totalPages: number;
  totalItems: number;
}

// Cuerpo de POST /api/v1/pacientes: replica los campos de la tabla Pacientes
// (misma convención camelCase que updatePatientRequest del backend). Los
// campos opcionales se omiten para que el backend los persista como NULL.
export interface RegistroPacientePayload {
  idPaisNacimiento?: number;
  apellidoMaterno?: string;
  direccionDomicilio?: string;
  idPaisProcedencia?: number;
  apellidoPaterno: string;
  primerNombre: string;
  segundoNombre?: string;
  tercerNombre?: string;
  fechaNacimiento?: string;
  idDocIdentidad?: number;
  nroDocumento: string;
  telefono?: string;
  celular?: string;
  idTipoSexo?: number;
  idProcedencia?: number;
  idGradoInstruccion?: number;
  idEstadoCivil?: number;
  idTipoOcupacion?: number;
  idCentroPobladoDomicilio?: number;
  nombrePadre?: string;
  nombreMadre?: string;
  idPaisDomicilio?: number;
  idCentroPobladoNacimiento?: number;
  idCentroPobladoProcedencia?: number;
  idDistritoProcedencia?: number;
  idDistritoDomicilio?: number;
  idDistritoNacimiento?: number;
  idEtnia?: number;
  idIdioma?: number;
  email?: string;
  discapacidad?: number;
  incapacidad?: number;
}
