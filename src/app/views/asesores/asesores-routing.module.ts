import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AsesoresComponent } from './asesores/asesores.component';
// import { MedCentrosMedicosAseguradorasComponent } from './clientes-membresias/clientes-membresias.component';

const routes: Routes = [
  {
    path: '',
    data: {
      breadcrumb: 'Asesores'
    },
    children: [
      {
        path: '',
        data: {
          breadcrumb: null
        },
        component: AsesoresComponent,
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
export class AsesoresRoutingModule {
}
