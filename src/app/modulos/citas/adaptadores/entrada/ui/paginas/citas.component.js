import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { __decorate } from 'tslib';
import { ApiRequestError } from '../../../../../../compartido/api-client/api-client.service';
import { Etiqueta } from '../../../../../../compartido/ui/etiqueta/etiqueta';
import { AuthService } from '../../../../../auth/aplicacion/auth.service';
import { CitasApiService } from '../../../salida/http/citas.api.service';

const errorMessages = {
  INVALID_APPOINTMENT:
    'Los datos de la cita no son válidos. Revise pacienteId, doctorId, fechas y motivo.',
  DOCTOR_NOT_AVAILABLE:
    'El médico no tiene disponibilidad en el horario solicitado.',
  APPOINTMENT_NOT_FOUND: 'No existe ninguna cita con ese id.',
};
function friendlyError(err, fallback) {
  if (err instanceof ApiRequestError) {
    return errorMessages[err.code] ?? err.message ?? fallback;
  }
  return fallback;
}
let CitasComponent = class CitasComponent {
  citasApi = inject(CitasApiService);
  authService = inject(AuthService);
  agendarState = {
    patientId: '',
    doctorId: '',
    startsAt: '',
    endsAt: '',
    reason: '',
    loading: false,
    error: '',
    created: null,
  };
  buscarState = {
    id: '',
    loading: false,
    error: '',
    appointment: null,
  };
  async handleAgendarSubmit() {
    const s = this.agendarState;
    if (!s.patientId || !s.doctorId || !s.startsAt || !s.endsAt || !s.reason) {
      s.error = 'Complete todos los campos.';
      return;
    }
    s.loading = true;
    s.error = '';
    s.created = null;
    try {
      s.created = await this.citasApi.createCita({
        patientId: s.patientId,
        doctorId: s.doctorId,
        startsAt: new Date(s.startsAt).toISOString(),
        endsAt: new Date(s.endsAt).toISOString(),
        reason: s.reason,
      });
    } catch (err) {
      s.error = friendlyError(err, 'No se pudo agendar la cita.');
    } finally {
      s.loading = false;
    }
  }
  async handleBuscar() {
    const s = this.buscarState;
    if (!s.id.trim()) {
      s.error = 'Ingrese el id de la cita.';
      return;
    }
    s.loading = true;
    s.error = '';
    s.appointment = null;
    try {
      s.appointment = await this.citasApi.getCitaById(s.id.trim());
    } catch (err) {
      s.error = friendlyError(err, 'No se pudo obtener la cita.');
    } finally {
      s.loading = false;
    }
  }
  getStatusBadgeType(status) {
    switch (status) {
      case 'SCHEDULED':
        return 'neutral';
      case 'CONFIRMED':
        return 'success';
      case 'CANCELLED':
        return 'danger';
      case 'COMPLETED':
        return 'success';
      default:
        return 'neutral';
    }
  }
};
CitasComponent = __decorate(
  [
    Component({
      selector: 'app-citas',
      standalone: true,
      imports: [FormsModule, CommonModule, Etiqueta],
      templateUrl: './citas.component.html',
    }),
  ],
  CitasComponent,
);

export { CitasComponent };
