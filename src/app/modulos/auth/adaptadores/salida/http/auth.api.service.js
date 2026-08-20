import { __decorate } from "tslib";
import { Injectable, inject } from '@angular/core';
import { ApiClientService } from '../../../../../compartido/api-client/api-client.service';
let AuthApiService = class AuthApiService {
    apiClient = inject(ApiClientService);
    login(username, password) {
        return this.apiClient.request('/api/v1/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        }, false);
    }
    getMenus() {
        return this.apiClient.request('/api/v1/auth/menus', {
            method: 'GET',
        });
    }
};
AuthApiService = __decorate([
    Injectable({
        providedIn: 'root',
    })
], AuthApiService);
export { AuthApiService };
