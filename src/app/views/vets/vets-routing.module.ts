import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TipoEventoComponent } from './tipo-evento/tipo-evento.component';
import { TipoMascotaComponent } from './tipo-mascota/tipo-mascota.component';
import { RazaComponent } from './raza/raza.component';
import { CategoriaSolicitudComponent } from './categoria-solicitud/categoria-solicitud.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { RolComponent } from './rol/rol.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Pets'
    },
    children: [
      {
        path: 'tipo-evento',
        component: TipoEventoComponent,
        data: {
          title: 'Tipo Evento'
        }
      },{
        path: 'tipo-mascota',
        component: TipoMascotaComponent,
        data: {
          title: 'Tipo Mascota'
        }
      },{
        path: 'raza',
        component: RazaComponent,
        data: {
          title: 'Raza'
        }
      },{
        path: 'categorias-solicitud',
        component: CategoriaSolicitudComponent,
        data: {
          title: 'Categorías Solcitud'
        }
      },{
        path: 'usuarios',
        component: UsuariosComponent,
        data: {
          title: 'Usuarios'
        }
      }
      ,{
        path: 'roles',
        component: RolComponent,
        data: {
          title: 'Roles'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VetsRoutingModule {
}
