export interface Patient {
  documentNumber: string
  paternalSurname: string
  maternalSurname: string
  firstName: string
  secondName: string
  thirdName: string
}

export interface PageResponse<T> {
  items: T[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface TimeSlot {
  startsAt: string
  endsAt: string
}

export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  slot: TimeSlot
  status: AppointmentStatus
  reason: string
  createdAt: string
  updatedAt: string
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
}

export interface ApiErrorPayload {
  code: string
  message: string
}
