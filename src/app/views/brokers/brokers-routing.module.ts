import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AseguradorasComponent } from './aseguradoras/aseguradoras.component';
import { BrokersComponent } from './brokers/brokers.component';

const routes: Routes = [
  {
    path: '',
    data: {
      breadcrumb: 'Brokers'
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
        path: 'agentes',
        data: {
          breadcrumb: 'Agentes'
        },
        children: [
          {
            path: '',
            data: {
              breadcrumb: null
            },
            component: BrokersComponent,
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
export class BrokersRoutingModule {
}
