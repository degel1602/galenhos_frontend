import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { __decorate } from 'tslib';

let AuthService = class AuthService {
  router = inject(Router);
  TOKEN_KEY = 'galenos.accessToken';
  USERNAME_KEY = 'galenos.username';
  MENUS_KEY = 'galenos.menus';
  PERMISOS_KEY = 'galenos.permisos';
  isAuthenticated = signal(!!this.getToken());
  username = signal(this.getStoredUsername());
  menus = signal(this.getStoredMenus());
  permisos = signal(this.getStoredPermisos());
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }
  getIdEmpleado() {
    const token = this.getToken();
    if (!token) return 0;
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.idEmpleado || 0;
    } catch {
      return 0;
    }
  }
  getStoredUsername() {
    return localStorage.getItem(this.USERNAME_KEY);
  }
  getStoredMenus() {
    const data = localStorage.getItem(this.MENUS_KEY);
    return data ? JSON.parse(data) : [];
  }
  getStoredPermisos() {
    const data = localStorage.getItem(this.PERMISOS_KEY);
    return data ? JSON.parse(data) : [];
  }
  setSession(token, username) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USERNAME_KEY, username);
    this.isAuthenticated.set(true);
    this.username.set(username);
  }
  setMenus(authMenus) {
    localStorage.setItem(this.MENUS_KEY, JSON.stringify(authMenus.menus));
    localStorage.setItem(this.PERMISOS_KEY, JSON.stringify(authMenus.permisos));
    this.menus.set(authMenus.menus);
    this.permisos.set(authMenus.permisos);
  }
  clearSession() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USERNAME_KEY);
    localStorage.removeItem(this.MENUS_KEY);
    localStorage.removeItem(this.PERMISOS_KEY);
    this.isAuthenticated.set(false);
    this.username.set(null);
    this.menus.set([]);
    this.permisos.set([]);
  }
  loginDemo() {
    this.setSession('demo-token', 'demo');
  }
  logout() {
    this.clearSession();
    this.router.navigate(['/login']);
  }
  hasPermission(action, path) {
    const targetPath = path || this.router.url;
    const currentPermiso = this.permisos().find(
      (p) => targetPath.includes(p.claveWeb) && p.claveWeb !== '',
    );
    if (!currentPermiso) {
      return false;
    }
    if (action === 'ver' || action === 'imprimir') {
      return (
        currentPermiso[action] === true ||
        currentPermiso.agregar ||
        currentPermiso.modificar ||
        currentPermiso.eliminar
      );
    }
    return currentPermiso[action] === true;
  }
};
AuthService = __decorate(
  [
    Injectable({
      providedIn: 'root',
    }),
  ],
  AuthService,
);

export { AuthService };
