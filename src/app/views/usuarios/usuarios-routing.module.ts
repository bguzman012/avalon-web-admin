import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditPersonalInfoComponent } from './edit-personal-info/edit-personal-info.component';

const routes: Routes = [
  {
    path: '',
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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsuariosRoutingModule {
}
