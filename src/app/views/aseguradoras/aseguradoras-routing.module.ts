import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AseguradorasComponent } from './aseguradoras/aseguradoras.component';

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
