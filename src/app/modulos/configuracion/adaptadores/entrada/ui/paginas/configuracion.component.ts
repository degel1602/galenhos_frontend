import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiClientService } from '../../../../../../compartido/api-client/api-client.service';
import { AuthService } from '../../../../../auth/aplicacion/auth.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './configuracion.component.html',
})
export class ConfiguracionComponent {
  authService = inject(AuthService);
  private apiClient = inject(ApiClientService);

  url = this.apiClient.getApiBaseUrl();
  saved = false;

  handleSave() {
    this.apiClient.setApiBaseUrl(this.url);
    this.url = this.apiClient.getApiBaseUrl();
    this.saved = true;
    setTimeout(() => (this.saved = false), 2000);
  }
}
