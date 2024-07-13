import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { UsuariosService } from '../../../services/usuarios-service';
import { AseguradorasService } from '../../../services/aseguradoras-service';
import { environment } from '../../../../environments/environment';
import { FilterService } from "primeng/api";

@Component({
  selector: 'brokers',
  templateUrl: './brokers.component.html',
  styles: [`
  :host ::ng-deep .p-dialog .product-image {
      width: 150px;
      margin: 0 auto 2rem auto;
      display: block;
  }
`],
  styleUrls: ['./brokers.component.scss'],
})

export class BrokersComponent implements OnInit {
  usuarioDialog: boolean;
  usuarios: any[];
  selectedUsuarios: any[];
  submitted: boolean;
  usuario: any;
  ROL_BROKER_ID = 4;
  ESTADO_ACTIVO = 'A';
  TIPO_EMPRESA_ID = 2
  loading: boolean = false;
  filteredAseguradoras: any[];
  selectedAseguradoras: any[];

  constructor(
    private messageService: MessageService,
    private usuariosService: UsuariosService,
    private confirmationService: ConfirmationService,
    private aseguradorasService: AseguradorasService,
    private filterService: FilterService
  ) { }

  async ngOnInit() {
    console.log(environment.production);
    await this.refrescarListado(this.ESTADO_ACTIVO);
    console.log(this.usuarios);
  }

  filterGlobal(event: Event, dt: any) {
    dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openNew() {
    this.usuario = {};
    this.submitted = false;
    this.usuarioDialog = true;
  }

  deleteSelectedUsuarios() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected brokers?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // Implementar lógica para eliminar brokers seleccionados
        this.selectedUsuarios = [];
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Brokers Deleted',
          life: 3000,
        });
      },
    });
  }

  async editUsuario(usuario: any) {
    this.usuario = { ...usuario };
    this.usuario.rolId = this.usuario.rol.id;
    this.selectedAseguradoras = await this.aseguradorasService.obtenerAseguradorasByUsuarioAndEstado(this.usuario.id, 'A');
    console.log(this.selectedAseguradoras);
    this.usuarioDialog = true;
    // Implementar lógica para editar un usuario
  }

  async deleteUsuario(usuario: any) {
    this.confirmationService.confirm({
      message: 'Estás seguro de inhabilitar el broker ' + usuario.nombres + ' ' + usuario.apellidos + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        await this.usuariosService.eliminarUsuario(usuario.id, this.ROL_BROKER_ID);
        await this.refrescarListado(this.ESTADO_ACTIVO);

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
    this.selectedAseguradoras = [];
    this.submitted = false;
  }

  async saveUsuario() {
    this.submitted = true;
    this.loading = true; // Mostrar spinner
    console.log(this.selectedAseguradoras);
    try {
      if (this.usuario.id) {
        this.usuario.rolId = this.usuario.rol.id;
        await this.usuariosService.actualizarUsuario(this.usuario.id, this.usuario, this.ROL_BROKER_ID);
      } else {
        this.usuario.rolId = this.ROL_BROKER_ID;
        this.usuario.estado = 'A';
        this.usuario.contrasenia = environment.pass_default;
        let usuarioSaved = await this.usuariosService.guardarUsuario(this.usuario, this.ROL_BROKER_ID);

      }
      await this.refrescarListado(this.ESTADO_ACTIVO);
      this.usuarioDialog = false;
      this.usuario = {};
      this.filteredAseguradoras = [];
      this.messageService.add({ severity: 'success', summary: 'Enhorabuena!', detail: 'Operación ejecutada con éxito' });
    } finally {
      this.loading = false; // Ocultar spinner
    }
  }

  async refrescarListado(estado: string) {
    this.usuarios = await this.usuariosService.obtenerUsuariosPorRolAndEstado(this.ROL_BROKER_ID, estado, 0, 10);
  }

  async filterAseguradoras(event: any) {
    let filtered: any[] = [];
    let query = event.query;

    let aseguradoras = await this.aseguradorasService.obtenerAseguradorasByEstado('A');

    for (let i = 0; i < aseguradoras.length; i++) {
      let aseguradora = aseguradoras[i];
      if (aseguradora.nombre.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(aseguradora);
      }
    }

    this.filteredAseguradoras = filtered;
  }

  async armarSelectedAseguradorasData(usuarioId: number) {
    let usuariosAseguradorasIds: any[] = [];
    console.log(this.selectedAseguradoras);
    for (let index = 0; index < this.selectedAseguradoras.length; index++) {
      const aseguradora = this.selectedAseguradoras[index];
      usuariosAseguradorasIds.push({ aseguradoraId: aseguradora.id, usuarioId: usuarioId });
    }
    return usuariosAseguradorasIds;
  }

}
