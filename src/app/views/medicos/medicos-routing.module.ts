import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {MedicosComponent} from "./medicos/medicos.component";
import {
  MedCentrosMedicosAseguradorasComponent
} from "./med-centros-medicos-aseguradoras/med-centros-medicos-aseguradoras.component";

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
      {
        path: 'centros-medicos-aseguradoras',
        data: {
          breadcrumb: 'Centros Médicos'
        },
        children: [
          {
            path: '',
            data: {
              breadcrumb: null
            },
            component: MedCentrosMedicosAseguradorasComponent,
          },
        ]
      },
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
export class MedicosRoutingModule {
}
