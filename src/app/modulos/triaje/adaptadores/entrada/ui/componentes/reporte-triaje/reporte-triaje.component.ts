import { Component, Input, Output, EventEmitter, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VentanaModal } from '../../../../../../../compartido/ui/ventana-modal/ventana-modal';
import { TriajeApiService } from '../../../../salida/http/triaje.api.service';
import { MaestrosApiService } from '../../../../../../../compartido/api/maestros.api.service';
import { IFilaBackend } from '../../../../../../../compartido/tipos/api-tipos';
import { imprimirHtml } from '../../../../../../../compartido/utilidades/print.util';

function v(x: string | number | null | undefined): string {
  if (x === null || x === undefined || x === '') return '—';
  return String(x);
}

function formatFecha(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('es-PE');
}

export function decodificarBase64Reporte(valor: string | null | undefined): string {
  if (!valor) return '—';
  try {
    if (/^[A-Za-z0-9+/]+={0,2}$/.test(valor)) return atob(valor);
  } catch { /* no es base64 válido */ }
  return valor;
}

@Component({
  selector: 'app-reporte-triaje',
  standalone: true,
  imports: [CommonModule, VentanaModal],
  templateUrl: './reporte-triaje.component.html'
})
export class ReporteTriajeComponent implements OnInit {
  @Input() idTriaje!: number;
  @Output() alCerrar = new EventEmitter<void>();

  private readonly triajeApi = inject(TriajeApiService);
  private readonly maestrosApi = inject(MaestrosApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  cabecera: IFilaBackend | null = null;
  institucion: IFilaBackend | null = null;
  cargando = true;
  error = '';

  readonly fechaImp = new Date().toLocaleString('es-PE', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  ngOnInit(): void {
    this.cargar();
  }

  private async cargar(): Promise<void> {
    try {
      const [reporte, inst] = await Promise.all([
        this.triajeApi.obtenerReporte({ id: this.idTriaje }),
        this.maestrosApi.getDatosInstitucion()
      ]);

      const arr = Array.isArray(reporte) ? reporte : [];
      if (arr.length === 0) {
        this.error = 'No se encontró el reporte del triaje.';
      } else {
        this.cabecera = arr[0];
      }
      this.institucion = inst as IFilaBackend | null;
    } catch {
      this.error = 'No se pudo cargar el reporte del triaje.';
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  campo(...claves: string[]): string {
    if (!this.cabecera) return '—';
    for (const k of claves) {
      const val = this.cabecera[k];
      if (val !== undefined && val !== null && val !== '') return String(val);
    }
    return '—';
  }

  campoBase64(...claves: string[]): string {
    if (!this.cabecera) return '—';
    for (const k of claves) {
      const val = this.cabecera[k];
      if (val !== undefined && val !== null && val !== '') return decodificarBase64Reporte(String(val));
    }
    return '—';
  }

  inst(campo: string): string {
    if (!this.institucion) return '—';
    const val = this.institucion[campo];
    return (val !== undefined && val !== null && val !== '') ? String(val) : '—';
  }

  logoMinsa(): string {
    if (!this.institucion) return '';
    const val = this.institucion['logoMinsa'];
    return (val && typeof val === 'string') ? val : '';
  }

  imprimirReporte(): void {
    if (!this.cabecera) return;
    const c = this.cabecera;
    const inst = this.institucion;
    const v2 = (x: string | number | null | undefined) => (x === null || x === undefined || x === '' ? '—' : String(x));
    const celda = (value: string | number | null | undefined, centro = false) =>
      `<td style="border:1px solid #000;font-size:10px;text-align:${centro ? 'center' : 'left'};text-transform:uppercase;padding:2px 5px">${v2(value)}</td>`;
    const celdaSpan = (n: number, value: string | number | null | undefined, centro = false) =>
      `<td colspan="${n}" style="border:1px solid #000;font-size:10px;text-align:${centro ? 'center' : 'left'};text-transform:uppercase;padding:2px 5px">${v2(value)}</td>`;
    const etiqueta = (t: string) =>
      `<td style="background:#cccccc;border:1px solid #000;font-size:10px;text-align:center">${t}</td>`;

    const r = (k: string) => {
      const val = c[k];
      return (val !== undefined && val !== null && val !== '') ? String(val) : '';
    };
    const rd = (k: string) => {
      const val = c[k];
      return (val !== undefined && val !== null && val !== '') ? decodificarBase64Reporte(String(val)) : '—';
    };
    const ri = (k: string) => {
      const val = inst?.[k];
      return (val !== undefined && val !== null && val !== '') ? String(val) : '—';
    };
    const logo = this.logoMinsa();

    const tmpl = `<!doctype html><html><head><meta charset="utf-8"><title>Reporte de Triaje N° ${this.idTriaje}</title>
      <style>
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        @page { margin: 1cm; font-family: Arial; }
        body { font-family: Arial, sans-serif; margin: 1cm; color: #000; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 2px 5px; }
        .centrar { text-align: center; }
      </style></head><body>
        <table style="width:100%"><tr><td style="width:50%;text-align:left">${logo ? `<img src="data:image/png;base64,${logo}" style="width:90px">` : ''}</td>
        <td style="text-align:right;font-size:7px;color:#4c4c4c">Fecha: ${this.fechaImp}<br>U. Impresión: Usuario</td></tr></table>
        <table style="width:100%;margin-top:8px"><tr><td style="text-align:center;font-size:14px" class="centrar"><b>TRIAJE</b></td></tr></table>
        <table style="width:100%;text-align:center;font-size:9.5px">
          <tr><td style="text-align:center">RUC: ${ri('rucEess')}</td></tr>
          <tr><td style="text-align:center">DIRECCIÓN: ${ri('direccion')}</td></tr>
          <tr><td style="text-align:center">Telef.: ${ri('telefono')}</td></tr>
          <tr><td colspan="35">&nbsp;</td></tr>
        </table>
        <table style="width:100%;border-collapse:collapse;font-size:11px">
          <tr>
            ${etiqueta('N° DOCUMENTO')} ${celdaSpan(3, r('NroDocumento'), false)} ${etiqueta('N° DE TRIAJE')} ${celda(c['idTriaje'] as string | number, true)} ${etiqueta('FUEN. FIN')} ${celda(r('fuentefinanciamiento'), true)}
          </tr>
          <tr>${etiqueta('PACIENTE')} ${celdaSpan(7, r('Paciente'), false)}</tr>
          <tr>
            ${etiqueta('F.NACIMIENTO')} ${celdaSpan(2, formatFecha(r('FechaNacimiento')), false)}
            ${etiqueta('ESTADO CIVIL')} ${celdaSpan(2, r('EstadoCivil'), true)}
            ${etiqueta('SEXO')} ${celdaSpan(2, r('Sexo'), true)}
          </tr>
          <tr>
            ${etiqueta('EDAD')} ${celda(r('Edad'), true)}
            ${etiqueta('DIRECCIÓN')} ${celdaSpan(5, r('Direccion') !== '—' ? (r('Direccion') + (r('Distrito') !== '—' ? ', ' + r('Distrito') : '')) : '—', false)}
          </tr>
        </table>
        <table style="width:100%;border-collapse:collapse;margin-top:10px">
          <tr><td colspan="8" style="border:1px solid #000;background:#cccccc;text-align:center;font-size:6.5px;font-weight:bold">FUNCIONES VITALES</td></tr>
          <tr>
            ${['TEM.','P.A.','F.R.','F.C.','PESO','TALLA','IMC','GLASGOW / DOLOR'].map(h => etiqueta(h)).join('')}
          </tr>
          <tr>
            ${celda(rd('temperatura'), true)}
            ${celda(r('presion_arterial'), true)}
            ${celda(r('frecuencia_respiratoria'), true)}
            ${celda(r('frecuencia_cardiaca'), true)}
            ${celda(rd('peso'), true)}
            ${celda(r('talla'), true)}
            ${celda(rd('IMC'), true)}
            ${celda((r('escala_glasgow') !== '—' ? r('escala_glasgow') : '—') + ' / ' + (r('escala_dolor') !== '—' ? r('escala_dolor') : '—'), true)}
          </tr>
        </table>
        <table style="width:100%;border-collapse:collapse;margin-top:10px">
          <tr><td colspan="8" style="border:1px solid #000;background:#cccccc;text-align:center;font-size:6.5px"><b>MOTIVO DE CONSULTA</b></td></tr>
          <tr>
            ${etiqueta('Síntomas principales')} ${celdaSpan(5, r('sintoma_principal'), false)}
            ${etiqueta('Tiempo de evolución')} ${celda((r('tiempo_evolucion_cantidad') !== '—' ? r('tiempo_evolucion_cantidad') : '') + ' ' + (r('tiempo_evolucion_unidad') !== '—' ? r('tiempo_evolucion_unidad') : ''), true)}
          </tr>
        </table>
        <table style="width:100%;border-collapse:collapse;margin-top:10px">
          <tr><td colspan="8" style="border:1px solid #000;background:#cccccc;text-align:center;font-size:11px"><b>CLASIFICACIÓN Y DERIVACIÓN</b></td></tr>
          <tr>
            ${etiqueta('Tipo de gravedad')} ${celdaSpan(3, r('Gravedad'), false)}
            ${etiqueta('Servicio')} ${celdaSpan(3, r('Servicio'), true)}
          </tr>
        </table>
      </body></html>`;
    imprimirHtml(tmpl);
  }
}
