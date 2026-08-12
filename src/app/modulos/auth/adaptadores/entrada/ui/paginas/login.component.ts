import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../aplicacion/auth.service';
import { AuthApiService } from '../../../salida/http/auth.api.service';
import { ApiRequestError } from '../../../../../../compartido/api-client/api-client.service';
import { Logotipo } from '../../../../../../compartido/ui/logotipo/logotipo';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, Logotipo],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private authApi = inject(AuthApiService);
  private router = inject(Router);

  user = '';
  pass = '';
  error = '';
  loading = false;
  showPassword = false;

  async handleLogin() {
    if (!this.user || !this.pass) {
      this.error = 'Ingrese usuario y contraseña.';
      return;
    }

    this.error = '';
    this.loading = true;

    try {
      const response = await this.authApi.login(this.user, this.pass);
      this.authService.setSession(response.accessToken, this.user);
      this.router.navigate(['/dashboard']);
    } catch (err: unknown) {
      if (err instanceof ApiRequestError && err.code === 'INVALID_CREDENTIALS') {
        this.error = 'Usuario o contraseña incorrectos.';
      } else if (err instanceof ApiRequestError && err.status === 0) {
        this.error = 'No se pudo conectar con el servidor. Verifique la URL de la API.';
      } else if (err instanceof ApiRequestError) {
        this.error = err.message;
      } else {
        this.error = 'Ocurrió un error inesperado.';
      }
    } finally {
      this.loading = false;
    }
  }

  loginDemo() {
    this.authService.loginDemo();
    this.router.navigate(['/dashboard']);
  }
}
