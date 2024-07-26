import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {MetodosPagoComponent} from "./centros-medicos/metodos-pago.component";

const routes: Routes = [
  {
    path: '',
    data: {
      breadcrumb: 'Métodos de Pago'
    },
    children: [
      {
        path: '',
        data: {
          breadcrumb: null
        },
        component: MetodosPagoComponent,
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
      //       component: MedCentrosMedicosAseguradorasComponent,
      //     },
      //   ]
      // }
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
export class MetodosPagoRoutingModule {
}
