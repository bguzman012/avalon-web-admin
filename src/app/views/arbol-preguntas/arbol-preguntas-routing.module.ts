import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PreguntasComponent } from './preguntas/preguntas.component';
// import { ClientesMembresiasComponent } from './clientes-membresias/clientes-membresias.component';

const routes: Routes = [
  {
    path: '',
    data: {
      breadcrumb: 'Preguntas'
    },
    children: [
      {
        path: '',
        data: {
          breadcrumb: null
        },
        component: PreguntasComponent,
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
export class PreguntasRoutingModule {
}
