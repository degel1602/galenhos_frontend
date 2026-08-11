import { Routes } from '@angular/router';
import { ContenedorPrincipal } from '../compartido/ui/contenedor-principal/contenedor-principal';
import { LoginComponent } from '../modulos/auth/adaptadores/entrada/ui/paginas/login.component';
import { DashboardComponent } from '../modulos/dashboard/adaptadores/entrada/ui/paginas/dashboard.component';
import { PacientesListaComponent } from '../modulos/pacientes/adaptadores/entrada/ui/paginas/pacientes-lista.component';
import { ConfiguracionComponent } from '../modulos/configuracion/adaptadores/entrada/ui/paginas/configuracion.component';
import { CitasComponent } from '../modulos/citas/adaptadores/entrada/ui/paginas/citas.component';
import { TriajeComponent } from '../modulos/triaje/adaptadores/entrada/ui/paginas/triaje.component';
import { AdmisionesComponent } from '../modulos/admisiones/adaptadores/entrada/ui/paginas/admisiones.component';
import { authGuard, unauthGuard } from '../modulos/auth/aplicacion/auth.guard';

export const rutasPrincipales: Routes = [
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [unauthGuard] 
  },
  {
    path: '',
    component: ContenedorPrincipal,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent, data: { title: 'Dashboard' } },
      { path: 'pacientes', component: PacientesListaComponent, data: { title: 'Pacientes' } },
      { path: 'citas', component: CitasComponent, data: { title: 'Citas' } },
      { path: 'triaje', component: TriajeComponent, data: { title: 'Triaje' } },
      { path: 'admisiones', component: AdmisionesComponent, data: { title: 'Admisiones' } },
      { path: 'configuracion', component: ConfiguracionComponent, data: { title: 'Configuración' } },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
