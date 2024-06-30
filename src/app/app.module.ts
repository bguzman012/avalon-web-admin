import { NgModule } from '@angular/core';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { CalendarModule } from 'primeng/calendar';
import { SliderModule } from 'primeng/slider';
import { MultiSelectModule } from 'primeng/multiselect';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import {BreadcrumbModule} from 'primeng/breadcrumb';

import { NgScrollbarModule } from 'ngx-scrollbar';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DefaultFooterComponent, DefaultHeaderComponent, DefaultLayoutComponent } from './containers';
import { IconModule, IconSetService } from '@coreui/icons-angular';
import { FooterModule, DropdownModule as CuiDropdownModule, GridModule, HeaderModule, SidebarModule, NavModule, FormModule, UtilitiesModule, ButtonGroupModule, SharedModule, TabsModule, ListGroupModule, ProgressModule, BadgeModule, CardModule } from '@coreui/angular';
import { MessageService, ConfirmationService, FilterService } from 'primeng/api';import { AuthInterceptor } from './auth.interceptor';
import { BreadcrumbComponent } from './containers/breadcrumb/breadcrumb.component'

import { AvatarModule } from "primeng/avatar";


const APP_CONTAINERS = [
  DefaultFooterComponent,
  DefaultHeaderComponent,
  DefaultLayoutComponent,
  BreadcrumbComponent  
];

@NgModule({
  declarations: [AppComponent, ...APP_CONTAINERS],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    TableModule,
    CalendarModule,
    SliderModule,
    DialogModule,
    MultiSelectModule,
    ContextMenuModule,
    DropdownModule,
    InputTextModule,
    ProgressBarModule,
    HttpClientModule,
    BreadcrumbModule,
    FileUploadModule,
    ToolbarModule,
    ToastModule,
    RatingModule,
    RadioButtonModule,
    InputNumberModule,
    ConfirmDialogModule,
    InputTextareaModule,
    ButtonModule,
    AppRoutingModule,
    AvatarModule,
    FooterModule,
    SidebarModule,
    HttpClientModule,
    CuiDropdownModule,
    GridModule,
    HeaderModule,
    SidebarModule,
    IconModule,
    NavModule,
    UtilitiesModule,
    ButtonGroupModule,
    ReactiveFormsModule,
    SharedModule,
    TabsModule,
    ListGroupModule,
    ProgressModule,
    BadgeModule,
    CardModule,
    NgScrollbarModule
  ],
  providers: [
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    IconSetService,
    Title,
    MessageService,
    ConfirmationService,
    FilterService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
