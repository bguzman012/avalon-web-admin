import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientesComponent } from './clientes/clientes.component';
import { ClientesMembresiasComponent } from './clientes-membresias/clientes-membresias.component';
import { ClientesPolizasComponent } from './clientes-polizas/clientes-polizas.component';
import { CargasFamiliaresComponent } from './cargas-familiares/cargas-familiares.component';
// import { MedCentrosMedicosAseguradorasComponent } from './clientes-membresias/clientes-membresias.component';

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
      },
      {
        path: 'polizas',
        data: {
          breadcrumb: 'Polizas Cliente'
        },
        children: [
          {
            path: '',
            data: {
              breadcrumb: null
            },
            component: ClientesPolizasComponent,
          },
          {
            path: 'cargas-familiares',
            data: {
              breadcrumb: 'Cargas Familiares'
            },
            children: [
              {
                path: '',
                data: {
                  breadcrumb: null
                },
                component: CargasFamiliaresComponent,
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
export class ClientesRoutingModule {
}
