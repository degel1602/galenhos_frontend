export interface IPatient {
  documentNumber: string;
  paternalSurname: string;
  maternalSurname: string;
  firstName: string;
  secondName: string;
  thirdName: string;
}

export interface IPageResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ITimeSlot {
  startsAt: string;
  endsAt: string;
}

export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface IAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  slot: ITimeSlot;
  status: AppointmentStatus;
  reason: string;
  createdAt: string;
  updatedAt: string;
}

export interface ILoginResponse {
  accessToken: string;
  tokenType: string;
}

export interface IApiErrorPayload {
  code: string;
  message: string;
}
