import { Injectable, inject } from '@angular/core';
import { ApiClientService } from '../../../../../compartido/api-client/api-client.service';
import { ILoginResponse } from '../../../../../compartido/tipos/tipos';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private apiClient = inject(ApiClientService);

  login(username: string, password: string): Promise<ILoginResponse> {
    return this.apiClient.request<ILoginResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }, false);
  }
}
