import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AseguradorasComponent } from './aseguradoras/aseguradoras.component';
import { PolizasComponent } from './polizas/polizas.component';
import { ClientesPolizasComponent } from './clientes-polizas/clientes-polizas.component';

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
        path: 'polizas',
        data: {
          breadcrumb: 'Polizas'
        },
        children: [
          {
            path: '',
            data: {
              breadcrumb: null
            },
            component: PolizasComponent,
          },
          {
            path: 'cliente-polizas',
            data: {
              breadcrumb: 'Polizas de Clientes'
            },
            children: [
              {
                path: '',
                data: {
                  breadcrumb: null
                },
                component: ClientesPolizasComponent,
              },
            ]
          }
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
export class AseguradorasRoutingModule {
}
