import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesRoutingModule } from './pages-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { Page404Component } from './page404/page404.component';
import { Page500Component } from './page500/page500.component';
import { ButtonModule, CardModule, FormModule, GridModule } from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BlockUIModule } from 'primeng/blockui';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ChangePasswordComponent} from "./change-password/change-password.component";
import {PasswordModule} from "primeng/password";
import {DividerModule} from "primeng/divider";
import {AutoCompleteModule} from "primeng/autocomplete";
import {CalendarModule} from "primeng/calendar";
import {DialogModule} from "primeng/dialog";
import {InputTextModule} from "primeng/inputtext";
import {ToastModule} from "primeng/toast";


@NgModule({
  declarations: [
    ChangePasswordComponent,
    LoginComponent,
    RegisterComponent,
    Page404Component,
    Page500Component
  ],
    imports: [
        CommonModule,
        PagesRoutingModule,
        CardModule,
        DividerModule,
        ButtonModule,
        ReactiveFormsModule,
        GridModule,
        PasswordModule,
        IconModule,
        FormModule,
        FormModule,
        BlockUIModule,
        ProgressSpinnerModule,
        ConfirmDialogModule,
        FormsModule,
        AutoCompleteModule,
        CalendarModule,
        DialogModule,
        InputTextModule,
        ToastModule,

    ]
})
export class PagesModule {
}
