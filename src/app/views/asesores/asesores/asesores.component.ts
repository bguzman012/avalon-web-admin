import { Component, OnInit } from '@angular/core';
import { ConfirmationService, SortEvent } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { UsuariosService } from '../../../services/usuarios-service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'asesores',
  templateUrl: './asesores.component.html',
  styles: [
    `
      :host ::ng-deep .p-dialog .product-image {
        width: 150px;
        margin: 0 auto 2rem auto;
        display: block;
      }
    `,
  ],
  styleUrls: ['./asesores.component.scss'],
})
export class AsesoresComponent implements OnInit {
  usuarioDialog: boolean;
  usuarios: any[];
  selectedUsuarios: any[];
  submitted: boolean;
  usuario: any;
  ROL_ASESOR_ID = 2;
  ESTADO_ACTIVO = 'A';
  loading: boolean = false;
  rolId;

  first: number = 0;
  pageSize: number = 10;
  totalRecords: number = 0;

  busqueda: string = '';
  sortField
  sortOrder

  constructor(
    private messageService: MessageService,
    private usuariosService: UsuariosService,
    private confirmationService: ConfirmationService
  ) {}

  async ngOnInit() {
    this.loading = true;
    await this.refrescarListado(this.ESTADO_ACTIVO);
    this.loading = false;
  }

  filterGlobal(event: Event, dt: any) {
    this.first = 0;
    this.busqueda = (event.target as HTMLInputElement).value;
    if (this.busqueda.length == 0 || this.busqueda.length >= 3)
      this.refrescarListado(this.ESTADO_ACTIVO);

    // dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openNew() {
    this.usuario = {};
    this.submitted = false;
    this.usuarioDialog = true;
  }

  onSort(event: SortEvent) {
    if (event.field !== this.sortField || event.order !== this.sortOrder) {
      this.sortField = event.field;
      this.sortOrder = event.order;
      this.refrescarListado(this.ESTADO_ACTIVO);
    }
  }

  deleteSelectedUsuarios() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected users?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // Implementar lógica para eliminar usuarios seleccionados
        this.selectedUsuarios = [];
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Users Deleted',
          life: 3000,
        });
      },
    });
  }

  async editUsuario(usuario: any) {
    this.usuario = { ...usuario };
    this.usuario.rolId = this.usuario.rol.id;
    this.usuarioDialog = true;
    // Implementar lógica para editar un usuario
  }

  async deleteUsuario(usuario: any) {
    this.confirmationService.confirm({
      message:
        'Estás seguro de inhabilitar el usuario ' +
        usuario.nombres +
        ' ' +
        usuario.apellidos +
        '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        await this.usuariosService.eliminarUsuario(
          usuario.id,
          this.ROL_ASESOR_ID
        );
        this.first = 0;
        this.refrescarListado(this.ESTADO_ACTIVO);

        this.messageService.add({
          severity: 'success',
          summary: 'Enhorabuena!',
          detail: 'Registro inhabilitado exitosamente',
          life: 3000,
        });
      },
    });
  }

  hideDialog() {
    this.usuarioDialog = false;
    this.submitted = false;
  }

  async saveUsuario() {
    this.submitted = true;
    this.loading = true; // Mostrar spinner
    try {
      if (this.usuario.id) {
        this.usuario.rolId = this.usuario.rol.id;
        await this.usuariosService.actualizarUsuario(
          this.usuario.id,
          this.usuario,
          this.ROL_ASESOR_ID
        );
      } else {
        this.usuario.rolId = this.ROL_ASESOR_ID;
        this.usuario.estado = 'A';
        this.usuario.contrasenia = environment.pass_default;
        let usuarioSaved = await this.usuariosService.guardarUsuario(
          this.usuario,
          this.ROL_ASESOR_ID
        );
      }
      this.first = 0;
      this.refrescarListado(this.ESTADO_ACTIVO);
      this.usuarioDialog = false;
      this.usuario = {};
      this.loading = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Enhorabuena!',
        detail: 'Operación ejecutada con éxito',
      });
    } catch (error) {
      this.messageService.add({severity: 'error', summary: 'Error', detail: error.error});
    } finally {
      this.loading = false; // Ocultar spinner
    }
  }

  async refrescarListado(estado) {
    const response = await this.usuariosService.obtenerUsuariosPorRolAndEstado(
      this.ROL_ASESOR_ID,
      estado,
      this.first / this.pageSize,
      this.pageSize,
      this.busqueda,
      this.sortField,
      this.sortOrder
    );
    this.usuarios = response.data;
    this.totalRecords = response.totalRecords;
  }

  async onPageChange(event) {
    this.loading = true;
    this.first = event.first;
    this.pageSize = event.rows;
    await this.refrescarListado(this.ESTADO_ACTIVO);
    this.loading = false;
  }
}
