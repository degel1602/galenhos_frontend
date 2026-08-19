import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

interface EtiquetaMotivo {
  etiqueta: string;
  activo: boolean;
}

interface IAdjunto {
  nombre?: string;
  dataB64?: string;
  tipo?: string;
}

interface IFarmaco {
  medicamento?: string;
  dosis?: string;
  frecuencia?: string;
  via?: string;
  duracion?: string;
}

interface IEvolucionDetalle {
  cabecera?: {
    estado?: string;
    medicoTratante?: string;
    [key: string]: unknown;
  };
  motivo?: { detalle?: string; [key: string]: unknown };
  subjetivo?: Record<string, unknown>;
  sintomas?: Record<string, unknown>;
  signosVitales?: Record<string, unknown>;
  examenFisico?: {
    sistema?: string;
    normal?: boolean;
    hallazgo?: string;
    [key: string]: unknown;
  }[];
  diagnosticos?: {
    cie10?: string;
    descripcion?: string;
    tipo?: string;
    condicion?: string;
    [key: string]: unknown;
  }[];
  evaluacion?: Record<string, unknown>;
  plan?: {
    farmacologico?: IFarmaco[];
    procedimientosIndicados?: Record<string, unknown>;
    solicitudExamenes?: Record<string, unknown>;
    interconsultas?: Record<string, unknown>;
    indicacionesGenerales?: Record<string, unknown>;
  };
  evolucionLibre?: string;
  ordenesMedicas?: Record<string, unknown>;
  adjuntos?: IAdjunto[];
  firmaDigital?: string;
  [key: string]: unknown;
}

@Component({
  selector: 'app-ver-evolucion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ver-evolucion.html',
})
export class VerEvolucionComponent {
  @Input({ required: true }) detalle!: IEvolucionDetalle;

  get cabecera(): {
    estado?: string;
    medicoTratante?: string;
    [key: string]: unknown;
  } {
    return this.detalle?.cabecera ?? {};
  }

  get motivos(): EtiquetaMotivo[] {
    const m = this.detalle?.motivo ?? {};
    return [
      { etiqueta: 'Motivo de consulta', activo: !!m.motivoConsulta },
      { etiqueta: 'Seguimiento', activo: !!m.seguimiento },
      { etiqueta: 'Control', activo: !!m.control },
      { etiqueta: 'Reevaluación', activo: !!m.reevaluacion },
      { etiqueta: 'Postoperatorio', activo: !!m.postoperatorio },
      { etiqueta: 'Interconsulta', activo: !!m.interconsulta },
      { etiqueta: 'Emergencia', activo: !!m.emergencia },
    ].filter((x) => x.activo);
  }

  get motivoDetalle(): string {
    return this.detalle?.motivo?.detalle ?? '';
  }

  get sintomas(): string[] {
    return Array.isArray(this.detalle?.sintomas) ? this.detalle.sintomas : [];
  }

  get subjetivo(): Record<string, unknown> {
    return this.detalle?.subjetivo ?? {};
  }

  get subjetivoMarcados(): string[] {
    const s = this.subjetivo;
    const etiquetas: [string, boolean][] = [
      ['Dolor', !!s.dolor],
      ['Fiebre', !!s.fiebre],
      ['Tos', !!s.tos],
      ['Náuseas', !!s.nauseas],
      ['Vómitos', !!s.vomitos],
      ['Mareos', !!s.mareos],
      ['Disnea', !!s.disnea],
    ];
    return etiquetas.filter(([, v]) => v).map(([e]) => e);
  }

  get signosVitales(): { etiqueta: string; valor: string }[] {
    const sv = this.detalle?.signosVitales ?? {};
    const items: [string, unknown][] = [
      ['P/A', sv.presionArterial],
      ['FC', sv.frecuenciaCardiaca],
      ['FR', sv.frecuenciaRespiratoria],
      ['T°', sv.temperatura],
      ['SpO₂', sv.saturacionOxigeno],
      ['Peso', sv.peso],
      ['Talla', sv.talla],
      ['IMC', sv.imc],
      ['Glucemia', sv.glucemia],
    ];
    return items
      .filter(([, v]) => v !== null && v !== undefined && v !== '' && v !== '—')
      .map(([e, v]) => ({ etiqueta: e, valor: String(v) }));
  }

  get examenFisico(): {
    sistema?: string;
    normal?: boolean;
    hallazgo?: string;
    [key: string]: unknown;
  }[] {
    const arr = this.detalle?.examenFisico;
    return Array.isArray(arr) ? arr : [];
  }

  get diagnosticos(): {
    cie10?: string;
    descripcion?: string;
    tipo?: string;
    condicion?: string;
    [key: string]: unknown;
  }[] {
    const arr = this.detalle?.diagnosticos;
    return Array.isArray(arr)
      ? arr.filter((d) => d?.descripcion || d?.cie10)
      : [];
  }

  get evaluacion(): Record<string, unknown> {
    return (this.detalle?.evaluacion as Record<string, unknown>) ?? {};
  }

  get farmacologico(): IFarmaco[] {
    const arr = this.detalle?.plan?.farmacologico;
    return Array.isArray(arr)
      ? arr.filter((m) => m?.medicamento || m?.dosis)
      : [];
  }

  get procedimientosIndicados(): string[] {
    const p = this.detalle?.plan?.procedimientosIndicados ?? {};
    const items: [string, boolean][] = [
      ['Curaciones', !!p.curaciones],
      ['Suturas', !!p.suturas],
      ['Catéter', !!p.cateter],
      ['Intubación', !!p.intubacion],
    ];
    const activos = items.filter(([, v]) => v).map(([e]) => e);
    if (p.otro) activos.push(String(p.otro));
    return activos;
  }

  get solicitudExamenes(): { etiqueta: string; valor: string }[] {
    const e = this.detalle?.plan?.solicitudExamenes ?? {};
    const items: [string, unknown][] = [
      ['Laboratorio', e.laboratorio],
      ['Imágenes', e.imagenes],
      ['Otros', e.otros],
    ];
    return items
      .filter(([, v]) => v && String(v).trim())
      .map(([et, v]) => ({ etiqueta: et, valor: String(v) }));
  }

  get interconsultasSolicitadas(): string[] {
    const i = this.detalle?.plan?.interconsultas ?? {};
    const items: [string, boolean][] = [
      ['Cardiología', !!i.cardiologia],
      ['Cirugía', !!i.cirugia],
      ['Nutrición', !!i.nutricion],
      ['Psicología', !!i.psicologia],
    ];
    const activos = items.filter(([, v]) => v).map(([e]) => e);
    if (i.otra) activos.push(String(i.otra));
    return activos;
  }

  get indicacionesGenerales(): { etiqueta: string; valor: string }[] {
    const ig = this.detalle?.plan?.indicacionesGenerales ?? {};
    const items: [string, unknown][] = [
      ['Dieta', ig.dieta],
      ['Reposo', ig.reposo],
      ['Hidratación', ig.hidratacion],
      ['Oxígeno', ig.oxigeno],
      ['Restricciones', ig.restricciones],
    ];
    return items
      .filter(([, v]) => v && String(v).trim())
      .map(([e, v]) => ({ etiqueta: e, valor: String(v) }));
  }

  get evolucionLibre(): string {
    return this.detalle?.evolucionLibre ?? '';
  }

  get ordenesMedicas(): Record<string, unknown> {
    return this.detalle?.ordenesMedicas ?? {};
  }

  get ordenesTexto(): string {
    const o = this.ordenesMedicas as Record<string, unknown>;
    if (o.orden && o.detalle) return `${o.orden}: ${o.detalle}`;
    if (o.detalle) return String(o.detalle);
    return '';
  }

  get adjuntos(): IAdjunto[] {
    const arr = this.detalle?.adjuntos;
    return Array.isArray(arr) ? arr : [];
  }

  get firmaDigital(): string {
    return this.detalle?.firmaDigital ?? '';
  }
}
