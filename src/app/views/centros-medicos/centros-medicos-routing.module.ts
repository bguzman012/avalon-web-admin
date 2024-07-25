import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {CentrosMedicosComponent} from "./centros-medicos/centros-medicos.component";

const routes: Routes = [
  {
    path: '',
    data: {
      breadcrumb: 'Centros Médicos'
    },
    children: [
      {
        path: '',
        data: {
          breadcrumb: null
        },
        component: CentrosMedicosComponent,
       },
      // {
      //   path: 'beneficios',
      //   data: {
      //     breadcrumb: 'Beneficios'
      //   },
      //   children: [
      //     {
      //       path: '',
      //       data: {
      //         breadcrumb: null
      //       },
      //       component: BeneficiosComponent,
      //     },
      //   ]
      // },
      // {
      //   path: 'clientes',
      //   data: {
      //     breadcrumb: 'Clientes'
      //   },
      //   children: [
      //     {
      //       path: '',
      //       data: {
      //         breadcrumb: null
      //       },
      //       component: ClientesMembresiasComponent,
      //     },
      //   ]
      // }
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
export class CentrosMedicosRoutingModule {
}
