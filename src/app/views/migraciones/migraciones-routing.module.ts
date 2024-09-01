import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {MigracionesComponent} from "./migraciones/migraciones.component";

const routes: Routes = [
  {
    path: '',
    data: {
      breadcrumb: 'Migraciones'
    },
    children: [
      {
        path: '',
        data: {
          breadcrumb: null
        },
        component: MigracionesComponent,
       }
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
export class MigracionesRoutingModule {
}
