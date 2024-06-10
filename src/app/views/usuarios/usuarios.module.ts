import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
  ButtonGroupModule,
  AlertModule,
  FormModule,
  GridModule,
  ListGroupModule,
  SharedModule
} from '@coreui/angular';


import { UsuariosRoutingModule } from './usuarios-routing.module';
import { AsesoresComponent } from './asesores/asesores.component';
import { FuncionalidadesComponent } from './funcionalidades/funcionalidades.component';

import {TableModule} from 'primeng/table';
import {ToastModule} from 'primeng/toast';
import {CalendarModule} from 'primeng/calendar';
import {SliderModule} from 'primeng/slider';
import {MultiSelectModule} from 'primeng/multiselect';
import {ContextMenuModule} from 'primeng/contextmenu';
import {DialogModule} from 'primeng/dialog';
import {ButtonModule} from 'primeng/button';
import {DropdownModule} from 'primeng/dropdown';
import {ProgressBarModule} from 'primeng/progressbar';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import {InputTextModule} from 'primeng/inputtext';
import {AutoCompleteModule} from 'primeng/autocomplete';
import { CardModule } from 'primeng/card';
import {FileUploadModule} from 'primeng/fileupload';
import {ToolbarModule} from 'primeng/toolbar';
import {RatingModule} from 'primeng/rating';
import {RadioButtonModule} from 'primeng/radiobutton';
import {InputNumberModule} from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { BlockUIModule } from 'primeng/blockui';
import { MessageService } from 'primeng/api';
import { DataViewModule } from 'primeng/dataview';
import {PanelModule} from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ClientesComponent } from './clientes/clientes.component';
import { EditPersonalInfoComponent } from './edit-personal-info/edit-personal-info.component';

@NgModule({
  declarations: [
    FuncionalidadesComponent,
    AsesoresComponent,
    ClientesComponent,
    EditPersonalInfoComponent
  ],
  imports: [
    CommonModule,
    UsuariosRoutingModule,
    FormModule,
    PanelModule,
    GridModule,
    FormsModule,
    ReactiveFormsModule,
    FormModule,
    ButtonGroupModule,
    DropdownModule,
    AlertModule,
    AutoCompleteModule,
    TableModule,
    SharedModule,
    ListGroupModule,
    InputGroupModule,
    InputGroupAddonModule,
    DataViewModule,
    TableModule,
    CalendarModule,
		SliderModule,
		DialogModule,
		MultiSelectModule,
		ContextMenuModule,
		DropdownModule,
		ButtonModule,
		ToastModule,
    CardModule,
    BlockUIModule,
    InputTextModule,
    ProgressBarModule,
    FileUploadModule,
    ToolbarModule,
    RatingModule,
    ProgressSpinnerModule,
    FormsModule,
    RadioButtonModule,
    InputNumberModule,
    ConfirmDialogModule,
    InputTextareaModule,
  ]
})
export class UsuariosModule {
}
