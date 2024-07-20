import {Component, OnInit} from '@angular/core';
import {ConfirmationService, SortEvent} from 'primeng/api';
import {MessageService} from 'primeng/api';
import {AseguradorasService} from '../../../services/aseguradoras-service';
import {MembresiasService} from '../../../services/membresias-service';
import {ClientesMembresiasService} from '../../../services/clientes-membresias-service';
import {environment} from '../../../../environments/environment';
import {ActivatedRoute, Router} from '@angular/router';
import {UsuariosService} from 'src/app/services/usuarios-service';
import {AuthService} from 'src/app/services/auth-service';

@Component({
  selector: 'app-clientes-membresias',
  templateUrl: './clientes-membresias.component.html',
  styles: [
    `
      :host ::ng-deep .p-dialog .product-image {
        width: 150px;
        margin: 0 auto 2rem auto;
        display: block;
      }
    `,
  ],
  styleUrls: ['./clientes-membresias.component.scss'],
})
export class ClientesMembresiasComponent implements OnInit {
  clienteMembresiaDialog: boolean;
  clienteMembresias: any[]; // Lista de clientes membresía
  selectedClientesMembresia: any[];
  submitted: boolean;
  clienteMembresia: any;
  loading: boolean = false;

  aseguradora: any;
  membresia: any;
  cliente: any;
  asesor: any;
  broker: any;

  aseguradoraId;
  membresiaId;
  clienteId;
  asesorId;
  brokerId;

  aseguradoras: any[];
  membresias: any[];
  clientes: any[];
  asesores: any[];
  brokers: any[];

  ESTADO_ACTIVO = 'A';

  ROL_ASESOR_ID = 2;
  ROL_CLIENTE_ID = 3;
  ROL_BROKER_ID = 4;

  filteredAseguradoras;
  filteredMembresias;
  filteredClientes;
  filteredAsesores;
  filteredBrokers;

  vigenciaMeses
  user

  first: number = 0;
  pageSize: number = 10;
  totalRecords: number = 0;

  busqueda: string = '';
  sortField
  sortOrder

  constructor(
    private messageService: MessageService,
    private membresiasService: MembresiasService,
    private usuarioService: UsuariosService,
    private clientesMembresiasService: ClientesMembresiasService,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) {
  }

  async ngOnInit() {
    this.loading = true
    this.membresiaId = +(await this.getRouteParams('membresiaId'));

    if (!this.membresiaId)
      this.membresiaId = localStorage.getItem('membresiaId');

    this.membresia = JSON.parse(localStorage.getItem('membresia'));

    this.user = await this.authService.obtenerUsuarioLoggeado()

    await this.refrescarListado();
    this.loading = false

  }

  async filterGlobal(event: Event, dt: any) {
    this.first = 0;
    this.busqueda = (event.target as HTMLInputElement).value;
    if (this.busqueda.length == 0 || this.busqueda.length >= 3) {
      await this.refrescarListado();
    }
    // dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  async onSort(event: SortEvent) {
    if (event.field !== this.sortField || event.order !== this.sortOrder) {
      this.loading = true
      this.sortField = event.field;
      this.sortOrder = event.order;
      await this.refrescarListado();
      this.loading = false
    }
  }

  async openNew() {
    this.clienteMembresia = {};
    this.loading = true

    this.clienteMembresia.fechaInicio = new Date();

    await this.prepareData()

    this.cliente = null;
    this.asesor = null;
    this.vigenciaMeses = this.membresia.vigenciaMeses;

    if (this.user.rol.id == this.ROL_ASESOR_ID) this.asesor = this.user

    this.calcularFechaFin()
    this.submitted = false;
    this.clienteMembresiaDialog = true;
    this.loading = false

  }

  async editClienteMembresia(clienteMembresia: any) {
    this.clienteMembresia = {...clienteMembresia};
    this.clienteMembresia.fechaInicio = new Date(this.clienteMembresia.fechaInicio + 'T23:59:00Z');
    this.clienteMembresia.fechaFin = new Date(this.clienteMembresia.fechaFin + 'T23:59:00Z');


    this.membresia = this.clienteMembresia.membresia;
    this.cliente = this.clienteMembresia.cliente;
    this.asesor = this.clienteMembresia.asesor;

    await this.prepareData()

    this.vigenciaMeses = this.membresia.vigenciaMeses;
    this.clienteMembresiaDialog = true;
  }

  async prepareData() {
    const responseCliente= await this.usuarioService.obtenerUsuariosPorRolAndEstado(
      this.ROL_CLIENTE_ID,
      this.ESTADO_ACTIVO,
      0,
      10,
      this.cliente ? this.cliente.nombreUsuario : ""
    );

    const responseAsesor =
      await this.usuarioService.obtenerUsuariosPorRolAndEstado(
        this.ROL_ASESOR_ID,
        this.ESTADO_ACTIVO,
        0,
        10,
        this.user.rol.id == this.ROL_ASESOR_ID || this.asesor ? this.asesor.nombreUsuario : ""
      );

    const responseMembresia =
      await this.membresiasService.obtenerMembresiasByEstado(
        this.ESTADO_ACTIVO,
        0,
        10,
        this.membresia.nombres
      );

    this.clientes = responseCliente.data;
    this.asesores = responseAsesor.data;
    this.membresias= responseMembresia.data;

  }

  calcularFechaFin() {
    if (this.membresia.vigenciaMeses) {
      this.vigenciaMeses = `${this.membresia.vigenciaMeses} ${this.membresia.vigenciaMeses > 1 ? 'meses' : 'mes'}`;
    } else {
      this.vigenciaMeses = undefined;
    }

    if (this.membresia.vigenciaMeses && this.clienteMembresia.fechaInicio) {
      const fechaInicio = new Date(this.clienteMembresia.fechaInicio);
      const vigenciaMeses = this.membresia.vigenciaMeses;
      const fechaFin = new Date(fechaInicio.setMonth(fechaInicio.getMonth() + vigenciaMeses));
      this.clienteMembresia.fechaFin = fechaFin;
    }
  }

  async deleteClienteMembresia(clienteMembresia: any) {
    // this.confirmationService.confirm({
    //   message: 'Estás seguro de eliminar la membresía ' + clienteMembresia.cliente + '?',
    //   header: 'Confirmar',
    //   icon: 'pi pi-exclamation-triangle',
    //   accept: async () => {
    //     await this.clientesMembresiaService.eliminarClienteMembresia(clienteMembresia.id);
    //     this.refrescarListado(this.ESTADO_ACTIVO);
    //     this.messageService.add({
    //       severity: 'success',
    //       summary: 'Enhorabuena!',
    //       detail: 'Registro eliminado exitosamente',
    //       life: 3000,
    //     });
    //   },
    // });
  }


  async onPageChange(event) {
    this.loading = true;
    this.first = event.first;
    this.pageSize = event.rows;
    await this.refrescarListado();
    this.loading = false;
  }

  hideDialog() {
    this.clienteMembresiaDialog = false;
    this.submitted = false;
  }

  async saveClienteMembresia() {
    this.submitted = true;
    this.loading = true; // Mostrar spinner
    try {
      if (this.clienteMembresia.id) {
        let clienteMembresiaToUpdate = {
          membresiaId: this.membresia.id,
          clienteId: this.cliente.id,
          asesorId: this.asesor.id,
          fechaInicio: this.clienteMembresia.fechaInicio,
          fechaFin: this.clienteMembresia.fechaFin
        }
        await this.clientesMembresiasService.actualizarClienteMembresia(
          this.clienteMembresia.id, clienteMembresiaToUpdate
        );

      } else {
        this.clienteMembresia.membresiaId = this.membresia.id;
        this.clienteMembresia.clienteId = this.cliente.id;
        this.clienteMembresia.asesorId = this.asesor.id;
        console.log(this.clienteMembresia)
        await this.clientesMembresiasService.guardarClienteMembresia(
          this.clienteMembresia
        );
      }
      this.first = 0;
      await this.refrescarListado();
      this.clienteMembresiaDialog = false;
      this.clienteMembresia = {};
      this.messageService.add({
        severity: 'success',
        summary: 'Enhorabuena!',
        detail: 'Operación ejecutada con éxito',
      });
    } finally {
      this.loading = false; // Ocultar spinner
    }
  }

  async refrescarListado() {
    console.log(this.membresiaId)
    const response = await this.clientesMembresiasService.obtenerUsuariosMembresiaByMebresiaId(
      this.membresiaId,
      this.first / this.pageSize,
      this.pageSize,
      this.busqueda,
      this.sortField,
      this.sortOrder
    );

    this.clienteMembresias = response.data
    this.totalRecords = response.totalRecords;

  }

  private getRouteParams(param: string): Promise<string> {
    return new Promise((resolve) => {
      this.route.queryParams.subscribe((params) => resolve(params[param]));
    });
  }

  async filterMembresia(event) {
    const responseMembresia = await this.membresiasService.obtenerMembresiasByEstado(
      this.ESTADO_ACTIVO, 0, 10, event.query
    )

    this.filteredMembresias = responseMembresia.data;
  }

  async filterClientes(event) {
    const responseCliente = await this.usuarioService.obtenerUsuariosPorRolAndEstado(
      this.ROL_CLIENTE_ID,
      this.ESTADO_ACTIVO, 0, 10, event.query
    )

    this.filteredClientes = responseCliente.data;
  }

  async filterAsesores(event) {
    const responseAsesor = await this.usuarioService.obtenerUsuariosPorRolAndEstado(
      this.ROL_ASESOR_ID,
      this.ESTADO_ACTIVO, 0, 10, event.query
    )

    this.filteredAsesores = responseAsesor.data;
  }

}
