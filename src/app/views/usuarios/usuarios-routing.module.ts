import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { FuncionalidadesComponent } from './funcionalidades/funcionalidades.component';
import { AsesoresComponent } from './asesores/asesores.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Usuarios'
    },
    children: [
      {
        path: 'usuarios',
        component: UsuariosComponent,
        data: {
          title: 'Usuarios'
        }
      },
      {
        path: 'funcionalidades',
        component: FuncionalidadesComponent,
        data: {
          title: 'Funcionalidades'
        }
      },
      {
        path: 'asesores',
        component: AsesoresComponent,
        data: {
          title: 'Asesores'
        }
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
