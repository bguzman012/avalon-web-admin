import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FuncionalidadesComponent } from './funcionalidades/funcionalidades.component';
import { AsesoresComponent } from './asesores/asesores.component';
import { ClientesComponent } from './clientes/clientes.component';
import { EditPersonalInfoComponent } from './edit-personal-info/edit-personal-info.component';
import { BrokersComponent } from './brokers/brokers.component';

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
      },
      {
        path: 'brokers',
        data: {
          breadcrumb: 'Brokers'
        },
        children: [
          {
            path: '',
            data: {
              breadcrumb: null
            },
            component: BrokersComponent,
          }
        ],
      },
      {
        path: 'edit-personal-info',
        data: {
          breadcrumb: 'Editar perfil'
        },
        children: [
          {
            path: '',
            data: {
              breadcrumb: null
            },
            component: EditPersonalInfoComponent,
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
