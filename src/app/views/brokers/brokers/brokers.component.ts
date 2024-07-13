import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { UsuariosService } from '../../../services/usuarios-service';
import { AseguradorasService } from '../../../services/aseguradoras-service';
import { environment } from '../../../../environments/environment';
import { FilterService } from "primeng/api";
import { BrokersService } from 'src/app/services/brokers-service';
import { ActivatedRoute, Router } from '@angular/router';

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
  loading: boolean = false;
  filteredBrokers: any[];
  selectedBrokers: any[];
  brokers: any[];
  broker
  brokerId

  first: number = 0;
  pageSize: number = 10;
  totalRecords: number = 0;

  constructor(
    private messageService: MessageService,
    private usuariosService: UsuariosService,
    private confirmationService: ConfirmationService,
    private brokersService: BrokersService,
    private route: ActivatedRoute,
    private filterService: FilterService
  ) { }

  async ngOnInit() {
    this.loading=true
    this.brokerId = +(await this.getRouteParams('brokerId'));

    if (!this.brokerId)
      this.brokerId = localStorage.getItem('brokerId');

    await this.refrescarListado(this.ESTADO_ACTIVO);
    this.loading=false
  }

  private getRouteParams(param: string): Promise<string> {
    return new Promise((resolve) => {
      this.route.queryParams.subscribe((params) => resolve(params[param]));
    });
  }

  filterGlobal(event: Event, dt: any) {
    dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  async openNew() {
    this.usuario = {};
    this.submitted = false;
    this.brokers =
      await this.brokersService.obtenerBrokersByEstado(this.ESTADO_ACTIVO);
    
    this.broker = this.brokers.find(x => x.id === this.brokerId)
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
    this.brokers =
      await this.brokersService.obtenerBrokersByEstado(this.ESTADO_ACTIVO);
    this.broker = this.brokers.find(x => x.id === this.usuario.broker.id)
    // this.selectedBrokers = await this.aseguradorasService.obtenerAseguradorasByUsuarioAndEstado(this.usuario.id, 'A');
    // console.log(this.selectedAseguradoras);
    this.usuarioDialog = true;
    // Implementar lógica para editar un usuario
  }

  async deleteUsuario(usuario: any) {
    this.confirmationService.confirm({
      message: 'Estás seguro de inhabilitar el agente ' + usuario.nombres + ' ' + usuario.apellidos + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        await this.usuariosService.eliminarUsuario(usuario.id, this.ROL_BROKER_ID);
        this.first = 0
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
    this.submitted = false;
  }

  async saveUsuario() {
    this.submitted = true;
    this.loading = true; // Mostrar spinner
    try {
      if (this.usuario.id) {
        this.usuario.rolId = this.usuario.rol.id;
        this.usuario.brokerId = this.broker.id;
        await this.usuariosService.actualizarUsuario(this.usuario.id, this.usuario, this.ROL_BROKER_ID);
      } else {
        this.usuario.rolId = this.ROL_BROKER_ID;
        this.usuario.estado = 'A';
        this.usuario.contrasenia = environment.pass_default;
        this.usuario.brokerId = this.broker.id
        await this.usuariosService.guardarUsuario(this.usuario, this.ROL_BROKER_ID);
      }
      this.first = 0
      await this.refrescarListado(this.ESTADO_ACTIVO);
      this.usuarioDialog = false;
      this.usuario = {};
      this.messageService.add({ severity: 'success', summary: 'Enhorabuena!', detail: 'Operación ejecutada con éxito' });
    } finally {
      this.loading = false; // Ocultar spinner
    }
  }

  async refrescarListado(estado: string) {
    const response = await this.usuariosService.obtenerUsuariosPorRolAndEstado(this.ROL_BROKER_ID, estado, this.first / this.pageSize, this.pageSize);
    this.usuarios = response.data;
    this.totalRecords = response.totalRecords;
  }


  async onPageChange(event) {
    this.loading = true
    this.first = event.first;
    this.pageSize = event.rows;
    await this.refrescarListado(this.ESTADO_ACTIVO);
    this.loading = false
  }

  
  filterBrokers(event) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.brokers.length; i++) {
      let aseguradora = this.brokers[i];
      if (aseguradora.nombre.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(aseguradora);
      }
    }

    this.filteredBrokers = filtered;
  }

}
