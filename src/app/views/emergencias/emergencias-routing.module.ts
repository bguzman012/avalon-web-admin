import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmergenciasComponent } from './emergencias/emergencias.component';
import { AddEmergenciasComponent } from './add-emergencias/add-emergencias.component';
// import { MedCentrosMedicosAseguradorasComponent } from './clientes-membresias/clientes-membresias.component';

const routes: Routes = [
  {
    path: '',
    data: {
      breadcrumb: 'Emergencias'
    },
    children: [
      {
        path: '',
        data: {
          breadcrumb: null
        },
        component: EmergenciasComponent,
      },
      {
        path: 'detalle-emergencia',
        data: {
          breadcrumb: 'Detalle Emergencia'
        },
        children: [
          {
            path: '',
            data: {
              breadcrumb: null
            },
            component: AddEmergenciasComponent,
          },
        ]
      }
    ]
  }
];

// const routes: Routes = [
//   {
//     path: '#',
//     component: MetodosPagoComponent,
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
export class EmergenciasRoutingModule {
}
