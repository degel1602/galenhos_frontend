import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { OrdenService, OrdenMedica, ProductoCatalogo } from '../../../servicios/orden.service';
import { EvolucionService } from '../../../servicios/evolucion.service';
import { AuthService } from '../../../../auth/aplicacion/auth.service';
import { ErrorMensajeComponent } from '../../../../../compartido/ui/validacion/error-mensaje.component';
import { TablaComponent, ColumnaTabla } from '../../../../../compartido/componentes/tabla/tabla.component';
import { ColumnaTemplateDirective } from '../../../../../compartido/componentes/tabla/columna-template.directive';

@Component({
  selector: 'app-ordenes-medicas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ErrorMensajeComponent, TablaComponent, ColumnaTemplateDirective],
  templateUrl: './ordenes-medicas.html',
  // No usamos OnPush porque cargamos datos de API asíncronamente
})
export class OrdenesMedicasComponent implements OnInit {
  @Input({ required: true }) formGroup!: FormGroup; // The parent will pass the root form or a subset. We assume root form.

  private readonly ordenService = inject(OrdenService);
  private readonly evolucionService = inject(EvolucionService);
  private readonly fb = inject(FormBuilder);
  public readonly authService = inject(AuthService);

  public readonly ordenesPrevias = signal<OrdenMedica[]>([]);
  public readonly isLoading = signal<boolean>(false);
  public readonly isSubmitting = signal<boolean>(false);
  public readonly errorMessage = signal<string>('');
  public readonly successMessage = signal<string>('');

  public readonly sugerencias = signal<ProductoCatalogo[]>([]);
  private debounceTimer: any;

  columnasPrescripcion: ColumnaTabla[] = [
    { campo: 'medicamentoCustom', cabecera: 'Medicamento y Presentación' },
    { campo: 'cantidadCustom', cabecera: 'Cantidad', ancho: '100px' },
    { campo: 'indicacionesCustom', cabecera: 'Indicaciones para el paciente' },
    { campo: 'accionesCustom', cabecera: '', alineacion: 'center', ancho: '60px' }
  ];

  columnasHistorial: ColumnaTabla[] = [
    { campo: 'fechaCustom', cabecera: 'Fecha' },
    { campo: 'medicoCustom', cabecera: 'Médico' },
    { campo: 'observacionCustom', cabecera: 'Observación General' },
    { campo: 'itemsCustom', cabecera: 'Items de Receta' }
  ];

  ngOnInit() {
    this.cargarOrdenes();
  }

  async cargarOrdenes() {
    const paciente = this.evolucionService.activePatient();
    if (!paciente?.idRegAtencion) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const datos = await this.ordenService.listarPorCuenta(paciente.idRegAtencion);
      this.ordenesPrevias.set(datos);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
      this.errorMessage.set('No se pudieron cargar las órdenes previas.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async guardarOrden() {
    const paciente = this.evolucionService.activePatient();
    if (!paciente) return;

    this.errorMessage.set('');
    this.successMessage.set('');

    // Extraer datos del formulario
    const detallesForm = this.prescripcionArray.value;
    const ordenData = this.ordenesGroup.value;
    
    if (!ordenData.detalle && detallesForm.length === 0) {
      this.errorMessage.set('Debe ingresar detalles de la orden o añadir prescripciones médicas.');
      return;
    }

    const detalles = detallesForm.filter((d: any) => d.idProducto);
    if (detallesForm.length > 0 && detalles.length === 0) {
      this.errorMessage.set('Seleccione cada medicamento desde el catálogo (escriba y elija el producto real).');
      return;
    }

    this.isSubmitting.set(true);

    const request: OrdenMedica = {
      idRegAtencion: paciente.idRegAtencion,
      observacion: `${ordenData.orden ? '[' + ordenData.orden + '] ' : ''}${ordenData.detalle || ''}`,
      detalles: detalles.map((d: any) => ({
        idProducto: d.idProducto,
        cantidad: d.cantidad || 1,
        indicaciones: d.indicaciones || ''
      }))
    };

    const success = await this.ordenService.crearOrden(request);
    this.isSubmitting.set(false);

    if (success) {
      this.successMessage.set('Orden médica creada exitosamente.');
      this.ordenesGroup.reset();
      this.prescripcionArray.clear();
      this.agregarPrescripcion();
      await this.cargarOrdenes(); // Refrescar historial
      
      // Limpiar mensaje de éxito después de 4 segundos
      setTimeout(() => this.successMessage.set(''), 4000);
    } else {
      this.errorMessage.set('Hubo un error al crear la orden médica. Inténtalo nuevamente.');
    }
  }

  get ordenesGroup(): FormGroup {
    return this.formGroup.get('ordenesMedicas') as FormGroup;
  }

  get prescripcionArray(): FormArray {
    return this.formGroup.get('prescripcion') as FormArray;
  }

  agregarPrescripcion() {
    this.prescripcionArray.push(this.fb.group({
      idProducto: [null],
      medicamento: ['', Validators.required],
      cantidad: [null, Validators.required],
      indicaciones: ['']
    }));
  }

  removerPrescripcion(index: number) {
    this.prescripcionArray.removeAt(index);
    this.sugerencias.set([]);
  }

  getPrescripcionGroup(index: number): FormGroup {
    return this.prescripcionArray.at(index) as FormGroup;
  }

  buscarMedicamento(index: number) {
    clearTimeout(this.debounceTimer);
    const grupo = this.getPrescripcionGroup(index);
    const texto = (grupo.get('medicamento')?.value || '').trim();
    if (texto.length < 2) {
      this.sugerencias.set([]);
      return;
    }

    this.debounceTimer = setTimeout(async () => {
      const productos = await this.ordenService.buscarProductos(texto);
      this.sugerencias.set(productos);
    }, 300);
  }

  seleccionarProducto(index: number, producto: ProductoCatalogo) {
    const grupo = this.getPrescripcionGroup(index);
    grupo.patchValue({
      idProducto: producto.idProducto,
      medicamento: `${producto.nombre}${producto.presentacion ? ' - ' + producto.presentacion : ''}`
    });
    this.sugerencias.set([]);
  }

  cerrarSugerencias() {
    setTimeout(() => this.sugerencias.set([]), 200);
  }
}