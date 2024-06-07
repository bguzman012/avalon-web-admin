import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
  ButtonGroupModule,
  ButtonModule,
  AlertModule,
  CardModule,
  DropdownModule,
  TableModule,
  FormModule,
  GridModule,
  ListGroupModule,
  SharedModule
} from '@coreui/angular';

import { DocsComponentsModule } from '@docs-components/docs-components.module';

import { VetsRoutingModule } from './vets-routing.module';
import { TipoEventoComponent } from './tipo-evento/tipo-evento.component';
import { TipoMascotaComponent } from './tipo-mascota/tipo-mascota.component';
import { RazaComponent } from './raza/raza.component';
import { CategoriaSolicitudComponent } from './categoria-solicitud/categoria-solicitud.component'
import { UsuariosComponent } from './usuarios/usuarios.component'
import { RolComponent } from './rol/rol.component'

@NgModule({
  declarations: [
    TipoEventoComponent,
    TipoMascotaComponent,
    RazaComponent,
    CategoriaSolicitudComponent,
    UsuariosComponent,
    RolComponent
  ],
  imports: [
    CommonModule,
    VetsRoutingModule,
    CardModule,
    FormModule,
    DocsComponentsModule,
    GridModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    FormModule,
    ButtonModule,
    ButtonGroupModule,
    DropdownModule,
    AlertModule,
    TableModule,
    SharedModule,
    ListGroupModule
  ]
})
export class VetsModule {
}
