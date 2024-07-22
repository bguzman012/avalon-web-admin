import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CasosComponent } from './casos/casos.component';
import { AddCasosComponent } from './add-casos/add-casos.component';
// import { ClientesMembresiasComponent } from './clientes-membresias/clientes-membresias.component';

const routes: Routes = [
  {
    path: '',
    data: {
      breadcrumb: 'Casos'
    },
    children: [
      {
        path: '',
        data: {
          breadcrumb: null
        },
        component: CasosComponent,
      },
      {
        path: 'detalle-caso',
        data: {
          breadcrumb: 'Detalle Caso'
        },
        children: [
          {
            path: '',
            data: {
              breadcrumb: null
            },
            component: AddCasosComponent,
          },
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
export class CasosRoutingModule {
}
