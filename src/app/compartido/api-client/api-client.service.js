import { __decorate } from "tslib";
import { Injectable, inject } from '@angular/core';
import { AuthService } from '../../modulos/auth/aplicacion/auth.service';
export class ApiRequestError extends Error {
    code;
    status;
    constructor(code, message, status) {
        super(message);
        this.code = code;
        this.status = status;
        this.name = 'ApiRequestError';
    }
}
let ApiClientService = class ApiClientService {
    authService = inject(AuthService);
    API_BASE_URL_KEY = 'galenos.apiBaseUrl';
    getApiBaseUrl() {
        const savedUrl = localStorage.getItem(this.API_BASE_URL_KEY);
        if (savedUrl) {
            return savedUrl;
        }
        const hostname = window.location.hostname;
        return `http://${hostname}:8080`;
    }
    setApiBaseUrl(url) {
        let cleanUrl = url.trim();
        while (cleanUrl.endsWith('/')) {
            cleanUrl = cleanUrl.slice(0, -1);
        }
        localStorage.setItem(this.API_BASE_URL_KEY, cleanUrl);
    }
    async request(path, options = {}, requiresAuth = true) {
        const headers = new Headers(options.headers);
        headers.set('Accept', 'application/json');
        if (options.body)
            headers.set('Content-Type', 'application/json');
        if (requiresAuth) {
            const token = this.authService.getToken();
            if (token)
                headers.set('Authorization', `Bearer ${token}`);
        }
        let response;
        try {
            response = await fetch(`${this.getApiBaseUrl()}${path}`, {
                ...options,
                headers,
            });
        }
        catch {
            throw new ApiRequestError('NETWORK_ERROR', 'No se pudo conectar con el servidor. Verifique la URL configurada y su conexión.', 0);
        }
        const envelope = await response
            .json()
            .catch(() => ({
            success: false,
            error: {
                code: 'PARSE_ERROR',
                message: 'La respuesta del servidor no es válida.',
            },
        }));
        if (!response.ok || !envelope.success) {
            if (response.status === 401 && requiresAuth) {
                this.authService.logout();
            }
            throw new ApiRequestError(envelope.error?.code ?? 'UNKNOWN_ERROR', envelope.error?.message ?? 'Ocurrió un error inesperado.', response.status);
        }
        return envelope.data;
    }
};
ApiClientService = __decorate([
    Injectable({
        providedIn: 'root',
    })
], ApiClientService);
export { ApiClientService };
