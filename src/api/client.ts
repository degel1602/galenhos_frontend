import type {
  ApiErrorPayload,
  Appointment,
  LoginResponse,
  PageResponse,
  Patient,
} from './types'

const TOKEN_KEY = 'galenos.accessToken'
const USERNAME_KEY = 'galenos.username'
const API_BASE_URL_KEY = 'galenos.apiBaseUrl'

/** Se dispara en window cuando el servidor rechaza el token (401), para que
 * la sesión se cierre de forma reactiva sin acoplar el cliente HTTP a React. */
export const AUTH_EXPIRED_EVENT = 'galenos:auth-expired'

export function getApiBaseUrl(): string {
  return localStorage.getItem(API_BASE_URL_KEY) || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
}

export function setApiBaseUrl(url: string): void {
  localStorage.setItem(API_BASE_URL_KEY, url.trim().replace(/\/+$/, ''))
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUsername(): string | null {
  return localStorage.getItem(USERNAME_KEY)
}

export function setSession(token: string, username: string): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USERNAME_KEY, username)
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USERNAME_KEY)
}

export class ApiRequestError extends Error {
  constructor(public code: string, message: string, public status: number) {
    super(message)
    this.name = 'ApiRequestError'
  }
}

interface ApiEnvelope<T> {
  success: boolean
  data?: T
  error?: ApiErrorPayload
}

async function request<T>(path: string, options: RequestInit = {}, requiresAuth = true): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  if (options.body) headers.set('Content-Type', 'application/json')

  if (requiresAuth) {
    const token = getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  let response: Response
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, { ...options, headers })
  } catch {
    throw new ApiRequestError('NETWORK_ERROR', 'No se pudo conectar con el servidor. Verifique la URL configurada y su conexión.', 0)
  }

  const envelope: ApiEnvelope<T> = await response.json().catch(() => ({
    success: false,
    error: { code: 'PARSE_ERROR', message: 'La respuesta del servidor no es válida.' },
  }))

  if (!response.ok || !envelope.success) {
    if (response.status === 401 && requiresAuth) {
      clearSession()
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
    }
    throw new ApiRequestError(
      envelope.error?.code ?? 'UNKNOWN_ERROR',
      envelope.error?.message ?? 'Ocurrió un error inesperado.',
      response.status,
    )
  }

  return envelope.data as T
}

export const api = {
  login(username: string, password: string) {
    return request<LoginResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }, false)
  },

  listPacientes(page: number, pageSize: number) {
    return request<PageResponse<Patient>>(`/api/v1/pacientes?page=${page}&pageSize=${pageSize}`)
  },

  getPacienteByDocumento(numDocumento: string) {
    return request<Patient>(`/api/v1/pacientes/${encodeURIComponent(numDocumento)}`)
  },

  createCita(payload: { patientId: string; doctorId: string; startsAt: string; endsAt: string; reason: string }) {
    return request<Appointment>('/api/v1/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  getCitaById(id: string) {
    return request<Appointment>(`/api/v1/appointments/${encodeURIComponent(id)}`)
  },
}
