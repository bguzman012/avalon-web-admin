import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AseguradorasComponent } from './aseguradoras/aseguradoras.component';
import { MembresiasComponent } from './membresias/membresias.component';
import { ClientesMembresiasComponent } from './clientes-membresias/clientes-membresias.component';

const routes: Routes = [
  {
    path: '',
    data: {
      breadcrumb: 'Aseguradoras'
    },
    children: [
      {
        path: '',
        data: {
          breadcrumb: null
        },
        component: AseguradorasComponent,
      },
      {
        path: 'membresias',
        data: {
          breadcrumb: 'Membresías'
        },
        children: [
          {
            path: '',
            data: {
              breadcrumb: null
            },
            component: MembresiasComponent,
          },{
            path: 'clientes',
            data: {
              breadcrumb: 'Clientes'
            },
            children: [
              {
                path: '',
                data: {
                  breadcrumb: null
                },
                component: ClientesMembresiasComponent,
              }
            ],
          }
        ],
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
export class AseguradorasRoutingModule {
}
