// src/app/components/notificaciones/notificaciones.component.ts
import { Component, OnInit } from '@angular/core';
import { NotificacionesService } from '../../../services/notificaciones.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.scss'],
})
export class NotificacionesComponent implements OnInit {
  notificacionDialog: boolean;
  notificaciones: any[];
  selectedNotificaciones: any[];
  submitted: boolean;
  notificacion: any;
  loading: boolean = false;
  tipos_notificaciones
  selectedTipoNotificacion

  constructor(
    private notificacionesService: NotificacionesService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  async ngOnInit() {
    this.tipos_notificaciones = await this.notificacionesService.obtenerTiposNotificacion();
    this.refrescarListado();
  }

  filterGlobal(event: Event, dt: any) {
    dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }


  openNew() {
    this.notificacion = {};
    this.submitted = false;
    this.notificacionDialog = true;
  }

  deleteSelectedNotificaciones() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected notifications?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // Implementar lógica para eliminar notificaciones seleccionadas
        this.selectedNotificaciones = [];
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Notifications Deleted',
          life: 3000,
        });
      },
    });
  }

  editNotificacion(notificacion: any) {
    this.notificacion = { ...notificacion };
    this.selectedTipoNotificacion = this.notificacion.tipoNotificacion
    this.notificacionDialog = true;
  }

  deleteNotificacion(notificacion: any) {
    this.confirmationService.confirm({
      message: `Estás seguro de eliminar la notificación ${notificacion.asunto}?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        await this.notificacionesService.eliminarNotificacion(notificacion.id);
        this.refrescarListado();

        this.messageService.add({
          severity: 'success',
          summary: 'Enhorabuena!',
          detail: 'Notificación eliminada exitosamente',
          life: 3000,
        });
      },
    });
  }

  hideDialog() {
    this.notificacionDialog = false;
    this.submitted = false;
  }

  async saveNotificacion() {
    this.submitted = true;
    this.loading = true; // Mostrar spinner

    try {
      if (this.notificacion.id) {
        this.notificacion.tipoNotificacionId = this.selectedTipoNotificacion.id
        await this.notificacionesService.actualizarNotificacion(this.notificacion.id, this.notificacion);
      } else {
        this.notificacion.tipoNotificacionId = this.selectedTipoNotificacion.id
        await this.notificacionesService.guardarNotificacion(this.notificacion);
      }
      this.refrescarListado();
      this.notificacionDialog = false;
      this.notificacion = {};
      this.messageService.add({ severity: 'success', summary: 'Enhorabuena!', detail: 'Operación ejecutada con éxito' });
    } finally {
      this.loading = false; // Ocultar spinner
    }
  }

  async refrescarListado() {
    this.notificaciones = await this.notificacionesService.obtenerNotificaciones();
  }
}
