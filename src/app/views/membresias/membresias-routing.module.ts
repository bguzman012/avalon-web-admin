import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MembresiasComponent } from './membresias/membresias.component';
import { BeneficiosComponent } from './beneficios/beneficios.component';
import { ClientesMembresiasComponent } from './clientes-membresias/clientes-membresias.component';

const routes: Routes = [
  {
    path: '',
    data: {
      breadcrumb: 'Membresias'
    },
    children: [
      {
        path: '',
        data: {
          breadcrumb: null
        },
        component: MembresiasComponent,
      },
      {
        path: 'beneficios',
        data: {
          breadcrumb: 'Beneficios'
        },
        children: [
          {
            path: '',
            data: {
              breadcrumb: null
            },
            component: BeneficiosComponent,
          },
        ]
      },
      {
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
          },
        ]
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
export class MembresiasRoutingModule {
}
