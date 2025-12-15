import { Routes } from '@angular/router';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { EcommerceComponent } from './pages/dashboard/ecommerce/ecommerce.component';
import { DetalleComponent } from './shared/components/tutor/detalle/detalle.component';
import { SesionesComponent } from './shared/components/tutor/sesiones/sesiones.component';
import { TutoradosComponent } from './shared/components/tutor/tutorados/tutorados.component';
import { RecursosComponent } from './shared/components/tutor/recursos/recursos.component';

export const routes: Routes = [
  { path: '', redirectTo: 'intranet', pathMatch: 'full' },

  {
    path: 'intranet',
    component: AppLayoutComponent,
    children: [
      {
        path: '',
        component: EcommerceComponent,
        pathMatch: 'full',
      },

      // 👇 RUTA PADRE (Ingeniería Química Ambiental apunta AQUÍ)
      {
        path: 'tutor/:year/:semester',
        component: DetalleComponent,
        children: [
          { path: '', redirectTo: 'sesiones', pathMatch: 'full' },
          { path: 'sesiones', component: SesionesComponent },
          { path: 'tutorados', component: TutoradosComponent },
          { path: 'recursos', component: RecursosComponent },
        ]
      }
    ]
  }
];
