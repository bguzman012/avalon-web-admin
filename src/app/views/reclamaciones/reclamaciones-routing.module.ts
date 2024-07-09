import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReclamacionesComponent } from './reclamaciones/reclamaciones.component';
import { AddReclamacionesComponent } from './add-reclamaciones/add-reclamaciones.component';
// import { ClientesMembresiasComponent } from './clientes-membresias/clientes-membresias.component';

const routes: Routes = [
  {
    path: '',
    data: {
      breadcrumb: 'Reclamos'
    },
    children: [
      {
        path: '',
        data: {
          breadcrumb: null
        },
        component: ReclamacionesComponent,
      },
      {
        path: 'detalle-reclamacion',
        data: {
          breadcrumb: 'Detalle Reclamo'
        },
        children: [
          {
            path: '',
            data: {
              breadcrumb: null
            },
            component: AddReclamacionesComponent,
          },
        ]
      }
    ]
  }
];

// const routes: Routes = [
//   {
//     path: '#',
//     component: AseguradorasComponent,
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
export class ReclamacionesRoutingModule {
}
