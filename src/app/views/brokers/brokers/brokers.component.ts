import { Component, OnInit } from '@angular/core';
import { ConfirmationService, SortEvent } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { UsuariosService } from '../../../services/usuarios-service';
import { AgentesService } from '../../../services/agentes-service';
import { environment } from '../../../../environments/environment';
import { FilterService } from 'primeng/api';
import { BrokersService } from 'src/app/services/brokers-service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'brokers',
  templateUrl: './brokers.component.html',
  styles: [
    `
      :host ::ng-deep .p-dialog .product-image {
        width: 150px;
        margin: 0 auto 2rem auto;
        display: block;
      }
    `,
  ],
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
  broker;
  brokerId;

  first: number = 0;
  pageSize: number = 10;
  totalRecords: number = 0;

  busqueda: string = '';
  sortField
  sortOrder

  constructor(
    private messageService: MessageService,
    private usuariosService: UsuariosService,
    private confirmationService: ConfirmationService,
    private brokersService: BrokersService,
    private agentesService: AgentesService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.loading = true;
    this.brokerId = +(await this.getRouteParams('brokerId'));

    if (!this.brokerId) this.brokerId = localStorage.getItem('brokerId');

    this.broker = JSON.parse(localStorage.getItem('broker'));

    await this.refrescarListado(this.ESTADO_ACTIVO);
    this.loading = false;
  }

  private getRouteParams(param: string): Promise<string> {
    return new Promise((resolve) => {
      this.route.queryParams.subscribe((params) => resolve(params[param]));
    });
  }

  async  filterGlobal(event: Event, dt: any) {
    this.first = 0;
    this.busqueda = (event.target as HTMLInputElement).value;
    if (this.busqueda.length == 0 || this.busqueda.length >= 3)
      await this.refrescarListado(this.ESTADO_ACTIVO);

    // dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  async onSort(event: SortEvent) {
    if (event.field !== this.sortField || event.order !== this.sortOrder) {
      this.loading = true
      this.sortField = event.field;
      this.sortOrder = event.order;
      await this.refrescarListado(this.ESTADO_ACTIVO);
      this.loading = false
    }
  }

  async openNew() {
    this.usuario = {};
    this.submitted = false;
    const responseBrokers = await this.brokersService.obtenerBrokersByEstado(
      this.ESTADO_ACTIVO,
      0, 10, this.broker.correoElectronico
    );

    this.brokers = responseBrokers.data

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
    const responseBrokers = await this.brokersService.obtenerBrokersByEstado(
      this.ESTADO_ACTIVO,
      0, 10, this.usuario.broker.correoElectronico
    );

    this.brokers = responseBrokers.data
    console.log(this.brokers)
    this.broker = this.brokers.find((x) => x.id === this.usuario.broker.id);

    this.usuarioDialog = true;
  }

  async deleteUsuario(usuario: any) {
    this.confirmationService.confirm({
      message:
        'Estás seguro de inhabilitar el agente ' +
        usuario.nombres +
        ' ' +
        usuario.apellidos +
        '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        await this.usuariosService.eliminarUsuario(
          usuario.id,
          this.ROL_BROKER_ID
        );
        this.first = 0;
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
        await this.usuariosService.actualizarUsuario(
          this.usuario.id,
          this.usuario,
          this.ROL_BROKER_ID
        );
      } else {
        this.usuario.rolId = this.ROL_BROKER_ID;
        this.usuario.estado = 'A';
        this.usuario.contrasenia = environment.pass_default;
        this.usuario.brokerId = this.broker.id;
        await this.usuariosService.guardarUsuario(
          this.usuario,
          this.ROL_BROKER_ID
        );
      }
      this.first = 0;
      await this.refrescarListado(this.ESTADO_ACTIVO);
      this.usuarioDialog = false;
      this.usuario = {};
      this.messageService.add({
        severity: 'success',
        summary: 'Enhorabuena!',
        detail: 'Operación ejecutada con éxito',
      });
    } finally {
      this.loading = false; // Ocultar spinner
    }
  }

  async refrescarListado(estado: string) {
    const response = await this.agentesService.obtenerAgentesPorBrokerAndEstado(
      this.brokerId,
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

  async filterBrokers(event) {
    const responseBrokers = await this.brokersService.obtenerBrokersByEstado(
      this.ESTADO_ACTIVO,
      0, 10, event.query
    );

    this.filteredBrokers = responseBrokers.data;
  }
}
