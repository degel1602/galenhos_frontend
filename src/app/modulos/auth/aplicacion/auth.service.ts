import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IMenu, IMenuPermiso, IAuthMenus } from '../../../compartido/tipos/tipos';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private readonly TOKEN_KEY = 'galenos.accessToken';
  private readonly USERNAME_KEY = 'galenos.username';
  private readonly MENUS_KEY = 'galenos.menus';
  private readonly PERMISOS_KEY = 'galenos.permisos';

  // UI State Signals
  readonly isAuthenticated = signal<boolean>(!!this.getToken());
  readonly username = signal<string | null>(this.getStoredUsername());
  readonly menus = signal<IMenu[]>(this.getStoredMenus());
  readonly permisos = signal<IMenuPermiso[]>(this.getStoredPermisos());

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getStoredUsername(): string | null {
    return localStorage.getItem(this.USERNAME_KEY);
  }

  getStoredMenus(): IMenu[] {
    const data = localStorage.getItem(this.MENUS_KEY);
    return data ? JSON.parse(data) : [];
  }

  getStoredPermisos(): IMenuPermiso[] {
    const data = localStorage.getItem(this.PERMISOS_KEY);
    return data ? JSON.parse(data) : [];
  }

  setSession(token: string, username: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USERNAME_KEY, username);
    this.isAuthenticated.set(true);
    this.username.set(username);
  }

  setMenus(authMenus: IAuthMenus): void {
    localStorage.setItem(this.MENUS_KEY, JSON.stringify(authMenus.menus));
    localStorage.setItem(this.PERMISOS_KEY, JSON.stringify(authMenus.permisos));
    this.menus.set(authMenus.menus);
    this.permisos.set(authMenus.permisos);
  }

  clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USERNAME_KEY);
    localStorage.removeItem(this.MENUS_KEY);
    localStorage.removeItem(this.PERMISOS_KEY);
    this.isAuthenticated.set(false);
    this.username.set(null);
    this.menus.set([]);
    this.permisos.set([]);
  }

  loginDemo(): void {
    this.setSession('demo-token', 'demo');
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }
}
