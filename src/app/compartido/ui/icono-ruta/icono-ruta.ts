import { Component, Input } from '@angular/core';

@Component({
  selector: 'icono-ruta',
  standalone: true,
  template: `
    <svg class="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      @switch (idGrupo ? categoriaDeGrupo(idGrupo) : categoriaDeRuta(ruta)) {
        @case ('usuario') {
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        }
        @case ('calendario') {
          <rect x="3" y="4" width="18" height="18" rx="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        }
        @case ('clipboard') {
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <rect x="8" y="2" width="8" height="4" rx="1"></rect>
          <path d="M9 12h6"></path>
          <path d="M9 16h6"></path>
        }
        @case ('recibo') {
          <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"></path>
          <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
          <path d="M12 17.5v-11"></path>
        }
        @case ('cama') {
          <path d="M2 4v16"></path>
          <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
          <path d="M2 17h20"></path>
          <path d="M6 8v9"></path>
        }
        @case ('mensaje') {
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        }
        @case ('pulso') {
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        }
        @case ('pastilla') {
          <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path>
          <path d="m8.5 8.5 7 7"></path>
        }
        @case ('paquete') {
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
          <polyline points="3.29 7 12 12 20.71 7"></polyline>
          <line x1="12" y1="22" x2="12" y2="12"></line>
        }
        @case ('microscopio') {
          <path d="M6 18h8"></path>
          <path d="M3 22h18"></path>
          <path d="M14 22a7 7 0 1 0 0-14h-1"></path>
          <path d="M9 14h2"></path>
          <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"></path>
          <path d="M12 6V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3"></path>
        }
        @case ('imagen') {
          <rect x="3" y="3" width="18" height="18" rx="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        }
        @case ('camara') {
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
          <circle cx="12" cy="13" r="3"></circle>
        }
        @case ('escudo') {
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        }
        @case ('impresora') {
          <polyline points="6 9 6 2 18 2 18 9"></polyline>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
          <rect x="6" y="14" width="12" height="8"></rect>
        }
        @case ('sliders') {
          <line x1="4" y1="21" x2="4" y2="14"></line>
          <line x1="4" y1="10" x2="4" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12" y2="3"></line>
          <line x1="20" y1="21" x2="20" y2="16"></line>
          <line x1="20" y1="12" x2="20" y2="3"></line>
          <line x1="1" y1="14" x2="7" y2="14"></line>
          <line x1="9" y1="8" x2="15" y2="8"></line>
          <line x1="17" y1="16" x2="23" y2="16"></line>
        }
        @case ('campana') {
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        }
        @case ('llave') {
          <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
        }
        @case ('base') {
          <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
        }
        @case ('casa') {
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        }
        @case ('rama') {
          <line x1="6" y1="3" x2="6" y2="15"></line>
          <circle cx="18" cy="6" r="3"></circle>
          <circle cx="6" cy="18" r="3"></circle>
          <path d="M18 9a9 9 0 0 1-9 9"></path>
        }
        @case ('tablero') {
          <rect x="3" y="3" width="7" height="7" rx="1"></rect>
          <rect x="14" y="3" width="7" height="7" rx="1"></rect>
          <rect x="14" y="14" width="7" height="7" rx="1"></rect>
          <rect x="3" y="14" width="7" height="7" rx="1"></rect>
        }
        @case ('reloj') {
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        }
        @case ('engranaje') {
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        }
        @case ('dolar') {
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        }
        @case ('cruz') {
          <path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h5v5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z"></path>
        }
        @case ('escalpelo') {
          <path d="M12 12 20.5 3.5a2.12 2.12 0 1 0-3-3L9 9"></path>
          <path d="m16.5 5.5 3 3"></path>
          <path d="M9 15 3.5 20.5a2.12 2.12 0 0 1-3-3L9 8"></path>
        }
        @case ('video') {
          <path d="m22 8-6 4 6 4V8Z"></path>
          <rect x="2" y="6" width="14" height="12" rx="2"></rect>
        }
        @default {
          <circle cx="12" cy="12" r="9"></circle>
          <circle cx="12" cy="12" r="2"></circle>
        }
      }
    </svg>
  `
})
export class IconoRuta {
  @Input() ruta: string = '';
  @Input() idGrupo: number = 0;

  // Grupos del menú (ListBarGrupos); los ids son estables en la BD.
  categoriaDeGrupo(id: number): string {
    switch (id) {
      case 100: return 'usuario';            // Consulta externa
      case 200: return 'cruz';               // Emergencia
      case 300: return 'cama';               // Hospitalización
      case 400: return 'calendario';         // Programación General
      case 700: return 'dolar';              // Caja
      case 800: return 'pastilla';           // Farmacia
      case 1200: return 'clipboard';         // General
      case 1300: return 'escudo';            // Seguridad
      case 1500: return 'recibo';            // Facturación
      case 1700: return 'engranaje';         // Fact - Config
      case 1800: return 'microscopio';       // Laboratorio
      case 1900: return 'imagen';            // Imagenología
      case 2000: return 'escudo';            // Seguros
      case 2003: return 'escalpelo';         // Centro Quirúrgico
      case 2100: return 'video';             // TeleMedicina
      case 2101: return 'pulso';             // Epidemiología
      case 2103: return 'tablero';           // BSC
      case 2104: return 'engranaje';         // Configuración
      case 2105: return 'casa';              // ADOGE
      default: return 'generico';
    }
  }

  // Mapa ruta -> categoría de icono. Las rutas (claveWeb) vienen de la API
  // de menús y no cambian de nombre, por lo que el mapa es estable.
  categoriaDeRuta(ruta: string): string {
    const r = ruta.toLowerCase().replace(/\//g, '_');
    if (['pacientes', 'paciente', 'empleados', 'impfuasproc', 'judicial', 'descansomedico', 'listar_referencias', 'usuarios'].includes(r)) return 'usuario';
    if (['citas', 'citasbiopsia', 'programacion', 'cajas', 'servicios', 'progra_image'].includes(r)) return 'calendario';
    if (['triajes', 'atenciones', 'atencionesbi', 'atencionesprebi', 'atenciontel', 'bandejalab', 'laboratorio_patologia_clinica', 'aprobancionrecetas', 'fichaoperatoria', 'solicitudqx', 'templates'].includes(r)) return 'clipboard';
    if (['estadocuenta', 'consumoservicio'].includes(r)) return 'recibo';
    if (['camasobservacion'].includes(r)) return 'cama';
    if (['emer_interconsulta', 'hosp_interconsulta'].includes(r)) return 'mensaje';
    if (['hospitalizacion', 'emergencia_triaje', 'ficha_cancer', 'ficha_diabetes'].includes(r)) return 'pulso';
    if (['farmacia_ventas', 'inventario', 'notas_de_ingreso_al', 'notas_de_salida_al'].includes(r)) return 'pastilla';
    if (['paquetes'].includes(r)) return 'paquete';
    if (['anatomiapatologica'].includes(r)) return 'microscopio';
    if (['imgecografiac', 'imgecografiao', 'imagrayosx', 'bandejaimagen', 'imagtomografia', 'mamografiao'].includes(r)) return 'imagen';
    if (['imagtomoplaca'].includes(r)) return 'camara';
    if (['fuas', 'bandejafuas', 'fuaobs'].includes(r)) return 'escudo';
    if (['impresoras'].includes(r)) return 'impresora';
    if (['parametros'].includes(r)) return 'sliders';
    if (['notificaciones'].includes(r)) return 'campana';
    if (['roles', 'permisos'].includes(r)) return 'llave';
    if (['log'].includes(r)) return 'base';
    if (['adoge'].includes(r)) return 'casa';
    if (['bandejaref'].includes(r)) return 'rama';
    if (['dashboard', 'dashboardmed'].includes(r)) return 'tablero';
    if (['colas'].includes(r)) return 'reloj';
    if (['administrar'].includes(r)) return 'engranaje';
    return 'generico';
  }
}