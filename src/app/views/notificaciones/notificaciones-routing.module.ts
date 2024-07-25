import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotificacionesComponent } from './notificaciones/notificaciones.component';

const routes: Routes = [
  {
    path: '',
    data: {
      breadcrumb: 'Notificaciones'
    },
    children: [
      {
        path: '',
        data: {
          breadcrumb: null
        },
        component: NotificacionesComponent,
      }
    ]
  }
];

// const routes: Routes = [
//   {
//     path: '#',
//     component: CentrosMedicosComponent,
//     data: {
//       title: 'Aseguradoras',
//       breadcrumb: 'Aseguradoras'
//     }
//   }
// ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotificacionesRoutingModule {
}
