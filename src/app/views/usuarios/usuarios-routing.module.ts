import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FuncionalidadesComponent } from './funcionalidades/funcionalidades.component';
import { AsesoresComponent } from './asesores/asesores.component';

const routes: Routes = [
  {
    path: '',
    data: {
      breadcrumb: 'Usuarios'
    },
    children: [
      {
        path: '',
        data: {
          breadcrumb: null
        },
        component: FuncionalidadesComponent,
      },
      {
        path: 'asesores',
        data: {
          breadcrumb: 'Asesores'
        },
        children: [
          {
            path: '',
            data: {
              breadcrumb: null
            },
            component: AsesoresComponent,
          }
        ],
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsuariosRoutingModule {
}
