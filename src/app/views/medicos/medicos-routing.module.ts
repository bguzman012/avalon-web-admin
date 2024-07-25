import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {MedicosComponent} from "./medicos/medicos.component";

const routes: Routes = [
  {
    path: '',
    data: {
      breadcrumb: 'Medicos'
    },
    children: [
      {
        path: '',
        data: {
          breadcrumb: null
        },
        component: MedicosComponent,
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
export class MedicosRoutingModule {
}
