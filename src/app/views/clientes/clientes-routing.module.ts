import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientesComponent } from './clientes/clientes.component';
import { ClientesMembresiasComponent } from './clientes-membresias/clientes-membresias.component';
// import { ClientesMembresiasComponent } from './clientes-membresias/clientes-membresias.component';

const routes: Routes = [
  {
    path: '',
    data: {
      breadcrumb: 'Clientes'
    },
    children: [
      {
        path: '',
        data: {
          breadcrumb: null
        },
        component: ClientesComponent,
      },
      {
        path: 'membresias',
        data: {
          breadcrumb: 'Membresias'
        },
        children: [
          {
            path: '',
            data: {
              breadcrumb: null
            },
            component: ClientesMembresiasComponent,
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
export class ClientesRoutingModule {
}
