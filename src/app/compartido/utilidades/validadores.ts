import type {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

export const ValidadoresGalenos = {
  dni(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const valid = /^[0-9]{8}$/.test(value);
      return valid ? null : { dniInvalido: true };
    };
  },

  signosVitales(
    tipo: 'presion' | 'temperatura' | 'frecuencia' | 'saturacion',
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      switch (tipo) {
        case 'temperatura': {
          const temp = parseFloat(value);
          if (temp < 30 || temp > 45) {
            return {
              mensajePersonalizado: 'Temperatura debe estar entre 30 y 45 °C',
            };
          }
          break;
        }
        case 'saturacion': {
          const sat = parseFloat(value);
          if (sat < 0 || sat > 100) {
            return {
              mensajePersonalizado: 'La saturación debe estar entre 0 y 100 %',
            };
          }
          break;
        }
        case 'presion':
          if (!/^[0-9]{2,3}\/[0-9]{2,3}$/.test(value)) {
            return { mensajePersonalizado: 'Formato inválido (Ej: 120/80)' };
          }
          break;
      }
      return null;
    };
  },
};
