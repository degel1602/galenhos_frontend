import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'galenos.accessToken';
  private readonly USERNAME_KEY = 'galenos.username';

  // UI State Signals
  readonly isAuthenticated = signal<boolean>(!!this.getToken());
  readonly username = signal<string | null>(this.getStoredUsername());

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getStoredUsername(): string | null {
    return localStorage.getItem(this.USERNAME_KEY);
  }

  setSession(token: string, username: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USERNAME_KEY, username);
    this.isAuthenticated.set(true);
    this.username.set(username);
  }

  clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USERNAME_KEY);
    this.isAuthenticated.set(false);
    this.username.set(null);
  }

  loginDemo(): void {
    this.setSession('demo-token', 'demo');
  }

  logout(): void {
    this.clearSession();
  }
}
