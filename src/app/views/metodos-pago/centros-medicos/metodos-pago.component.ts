import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { AuthService } from 'src/app/services/auth-service';
import {MetodosPagoService} from "../../../services/metodos-pago-service";

@Component({
  selector: 'metodos-pago',
  templateUrl: './metodos-pago.component.html',
  styles: [`
  :host ::ng-deep .p-dialog .product-image {
      width: 150px;
      margin: 0 auto 2rem auto;
      display: block;
  }
`],
  styleUrls: ['./metodos-pago.component.scss'],
})

export class MetodosPagoComponent implements OnInit {
  metodoPagoDialog: boolean;
  metodosPago: any[];
  selectedMetodosPago: any[];
  submitted: boolean;
  metodoPago: any;
  loading: boolean = false;
  ESTADO_ACTIVO = 'A';
  ROL_ADMINISTRADOR_ID = 1;
  activarCreate = false;
  metodosPagoPadre: any[];
  nivel

  padre

  constructor(
    private messageService: MessageService,
    private metodosPagoService: MetodosPagoService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.loading = true;
    this.refrescarListado();

    let user = await this.authService.obtenerUsuarioLoggeado();
    if (user.rol.id == this.ROL_ADMINISTRADOR_ID) this.activarCreate = true;
    this.loading = false;
  }

  filterGlobal(event: Event, dt: any) {
    dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  async openNew() {
    this.metodoPago = {};
    this.nivel = 1
    this.padre = null
    this.metodosPagoPadre = await this.metodosPagoService.obtenerMetodosPago();
    this.submitted = false;
    this.metodoPagoDialog = true;
  }

  async editMetodoPago(metodoPago: any) {
    this.metodoPago = { ...metodoPago };
    this.nivel = this.metodoPago.nivel
    this.metodosPagoPadre = await this.metodosPagoService.obtenerMetodosPago();
    this.metodosPagoPadre = this.metodosPagoPadre.filter(metodoPago => metodoPago.id != this.metodoPago.id)
    this.padre = this.metodoPago.padre
    this.metodoPagoDialog = true;
  }

  async deleteMetodoPago(metodoPago: any) {
    // this.confirmationService.confirm({
    //   message: 'Estás seguro de eliminar la metodoPago ' + metodoPago.contenido + '?',
    //   header: 'Confirmar',
    //   icon: 'pi pi-exclamation-triangle',
    //   accept: async () => {
    //     await this.metodosPagoService.eliminarMetodoPago(metodoPago.id);
    //     this.refrescarListado();
    //
    //     this.messageService.add({
    //       severity: 'success',
    //       summary: 'Enhorabuena!',
    //       detail: 'Registro eliminado exitosamente',
    //       life: 3000,
    //     });
    //   },
    // });
  }

  hideDialog() {
    this.metodoPagoDialog = false;
    this.submitted = false;
  }

  async saveMetodoPago() {
    this.submitted = true;
    this.loading = true; // Mostrar spinner
    try {
      if (this.metodoPago.id) {
        await this.metodosPagoService.actualizarMetodoPago(this.metodoPago.id, this.metodoPago);
      } else {
        await this.metodosPagoService.guardarMetodoPago(this.metodoPago);
      }
      this.refrescarListado();
      this.metodoPagoDialog = false;
      this.metodoPago = {};
      this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'MetodoPago guardada', life: 3000 });
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar metodoPago', life: 3000 });
    } finally {
      this.loading = false; // Ocultar spinner
    }
  }

  async refrescarListado() {
    this.loading = true;
    this.metodosPago = await this.metodosPagoService.obtenerMetodosPago();
    this.loading = false;
  }

}
