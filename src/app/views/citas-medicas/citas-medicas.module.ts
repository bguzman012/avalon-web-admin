import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
  ButtonGroupModule,
  AlertModule,
  CardModule,
  FormModule,
  GridModule,
  ListGroupModule,
  SharedModule
} from '@coreui/angular';


import { CitasMedicasRoutingModule } from './citas-medicas-routing.module';

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
import {InputTextModule} from 'primeng/inputtext';
import {FileUploadModule} from 'primeng/fileupload';
import {ToolbarModule} from 'primeng/toolbar';
import {RatingModule} from 'primeng/rating';
import {RadioButtonModule} from 'primeng/radiobutton';
import {InputNumberModule} from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { BlockUIModule } from 'primeng/blockui';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextareaModule } from 'primeng/inputtextarea';
// import { MembresiasComponent } from './membresias/membresias.component';
import { AutoCompleteModule } from 'primeng/autocomplete';
import {PanelModule} from 'primeng/panel';
import { CitasMedicasComponent } from './citas-medicas/citas-medicas.component';
import { AddCitasMedicasComponent } from './add-citas-medicas/add-citas-medicas.component';
// import { ClientesMembresiasComponent } from './clientes-membresias/clientes-membresias.component';


@NgModule({
  declarations: [
    CitasMedicasComponent,
    AddCitasMedicasComponent
  ],
  imports: [
    CommonModule,
    CitasMedicasRoutingModule,
    CardModule,
    FormModule,
    GridModule,
    FormsModule,
    PanelModule,
    ReactiveFormsModule,
    FormModule,
    ButtonGroupModule,
    DropdownModule,
    AlertModule,
    TableModule,
    SharedModule,
    ListGroupModule,
    AutoCompleteModule,
    
    
    TableModule,
    CalendarModule,
		SliderModule,
		DialogModule,
    BlockUIModule,
    ProgressSpinnerModule,
		MultiSelectModule,
		ContextMenuModule,
		DropdownModule,
		ButtonModule,
		ToastModule,
    InputTextModule,
    ProgressBarModule,
    FileUploadModule,
    ToolbarModule,
    RatingModule,
    FormsModule,
    RadioButtonModule,
    InputNumberModule,
    ConfirmDialogModule,
    InputTextareaModule,
  ]
})
export class CitasMedicasModule {
}
