import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FuncionalidadesComponent } from './funcionalidades/funcionalidades.component';
import { AsesoresComponent } from './asesores/asesores.component';
import { ClientesComponent } from './clientes/clientes.component';

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
      {
        path: 'clientes',
        data: {
          breadcrumb: 'Clientes'
        },
        children: [
          {
            path: '',
            data: {
              breadcrumb: null
            },
            component: ClientesComponent,
          }
        ],
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsuariosRoutingModule {
}
