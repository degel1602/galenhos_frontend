import { Injectable, inject } from '@angular/core';
import { IApiErrorPayload } from '../tipos/tipos';
import { AuthService } from '../../modulos/auth/aplicacion/auth.service';

export class ApiRequestError extends Error {
  constructor(public code: string, message: string, public status: number) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: IApiErrorPayload;
}

@Injectable({
  providedIn: 'root'
})
export class ApiClientService {
  private authService = inject(AuthService);
  private readonly API_BASE_URL_KEY = 'galenos.apiBaseUrl';

  getApiBaseUrl(): string {
    return localStorage.getItem(this.API_BASE_URL_KEY) || 'http://localhost:8080';
  }

  setApiBaseUrl(url: string): void {
    localStorage.setItem(this.API_BASE_URL_KEY, url.trim().replace(/\/+$/, ''));
  }

  async request<T>(path: string, options: RequestInit = {}, requiresAuth = true): Promise<T> {
    const headers = new Headers(options.headers);
    headers.set('Accept', 'application/json');
    if (options.body) headers.set('Content-Type', 'application/json');

    if (requiresAuth) {
      const token = this.authService.getToken();
      if (token) headers.set('Authorization', `Bearer ${token}`);
    }

    let response: Response;
    try {
      response = await fetch(`${this.getApiBaseUrl()}${path}`, { ...options, headers });
    } catch {
      throw new ApiRequestError('NETWORK_ERROR', 'No se pudo conectar con el servidor. Verifique la URL configurada y su conexión.', 0);
    }

    const envelope: ApiEnvelope<T> = await response.json().catch(() => ({
      success: false,
      error: { code: 'PARSE_ERROR', message: 'La respuesta del servidor no es válida.' }
    }));

    if (!response.ok || !envelope.success) {
      if (response.status === 401 && requiresAuth) {
        this.authService.logout();
      }
      throw new ApiRequestError(
        envelope.error?.code ?? 'UNKNOWN_ERROR',
        envelope.error?.message ?? 'Ocurrió un error inesperado.',
        response.status
      );
    }

    return envelope.data as T;
  }
}
