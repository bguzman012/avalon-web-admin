import { Component, OnInit } from '@angular/core';
import {MessageService, SortEvent} from 'primeng/api';
import { PolizasService } from '../../../services/polizas-service';
import { ConfirmationService } from 'primeng/api';
import { AuthService } from 'src/app/services/auth-service';
import { ActivatedRoute, Router } from '@angular/router';
import { AseguradorasService } from 'src/app/services/aseguradoras-service';
import { ClientePolizaService } from 'src/app/services/polizas-cliente-service';
import { UsuariosService } from 'src/app/services/usuarios-service';
import {EmpresasService} from "../../../services/empresas-service";

@Component({
  selector: 'app-clientes-polizas',
  templateUrl: './clientes-polizas.component.html',
  styleUrls: ['./clientes-polizas.component.scss'],
})
export class ClientesPolizasComponent implements OnInit {
  polizaDialog: boolean;
  clientePolizas: any[]; // Lista de pólizas
  selectedClientesPolizas: any[];
  submitted: boolean;
  loading: boolean = false;
  user: any;
  polizaCliente: any;

  polizas: any[];
  filteredPolizas;
  poliza;

  aseguradoras: any[];
  filteredAseguradoras;
  filteredEmpresas;

  aseguradora;
  empresa;

  clientes: any[];
  filteredClientes;
  cliente;

  asesores: any[];
  filteredAsesores;
  asesor;

  brokers: any[];
  filteredBrokers;
  broker;

  ESTADO_ACTIVO = 'A';
  TIPO_EMPRESA_ID = 1;
  aseguradoraId;
  polizaId;

  ROL_ASESOR_ID = 2;
  ROL_CLIENTE_ID = 3;
  ROL_BROKER_ID = 4;

  vigenciaMeses

  first: number = 0;
  pageSize: number = 10;
  totalRecords: number = 0;

  busqueda: string = '';
  sortField
  sortOrder
  ROL_ADMINISTRADOR_ID = 1


  constructor(
    private messageService: MessageService,
    private polizasService: PolizasService,
    private clientesPolizasService: ClientePolizaService,
    private confirmationService: ConfirmationService,
    private usuariosService: UsuariosService,
    private authService: AuthService,
    private empresasService: EmpresasService,
    private route: ActivatedRoute,
  ) {}

  async ngOnInit() {
    this.loading = true;
    this.user = await this.authService.obtenerUsuarioLoggeado();

    this.polizaId = +(await this.getRouteParams('polizaId'));

    if (!this.polizaId) this.polizaId = localStorage.getItem('polizaId');

    this.aseguradoraId = +(await this.getRouteParams('aseguradoraId'));

    if (!this.aseguradoraId)
      this.aseguradoraId = localStorage.getItem('aseguradoraId');

    this.poliza = JSON.parse(localStorage.getItem('poliza'));

    await this.refrescarListado();
    this.loading = false;
  }

  private getRouteParams(param: string): Promise<string> {
    return new Promise((resolve) => {
      this.route.queryParams.subscribe((params) => resolve(params[param]));
    });
  }

  async prepareData() {
    if (this.user.rol.id == this.ROL_ASESOR_ID) this.asesor = this.user;

    const response = await this.polizasService.obtenerPolizasByAseguradora(
      this.aseguradoraId,
      0,
      10,
      this.poliza.nombre
    );

    const responseCliente =
      await this.usuariosService.obtenerUsuariosPorRolAndEstado(
        this.ROL_CLIENTE_ID,
        this.ESTADO_ACTIVO,
        0,
        10,
        this.cliente ? this.cliente.nombreUsuario : ""
      );

    const responseAsesor =
      await this.usuariosService.obtenerUsuariosPorRolAndEstado(
        this.ROL_ASESOR_ID,
        this.ESTADO_ACTIVO,
        0,
        10,
        this.user.rol.id == this.ROL_ASESOR_ID || this.asesor ? this.asesor.nombreUsuario : ""
      );

    const responseBroker = await this.usuariosService.obtenerUsuariosPorRolAndEstado(
      this.ROL_BROKER_ID,
      this.ESTADO_ACTIVO,
      0,
      10,
      this.broker ? this.broker.nombreUsuario : ""
    );

    this.polizas = response.data
    this.clientes = responseCliente.data;
    this.asesores = responseAsesor.data;
    this.brokers = responseBroker.data;

  }

  async openNew() {
    this.polizaCliente = {};
    this.submitted = false;
    this.loading = true;
    this.polizaCliente.fechaInicio = new Date();

    await this.prepareData();

    this.vigenciaMeses = this.poliza.vigenciaMeses;

    this.calcularFechaFin()
    this.loading = false;
    this.polizaDialog = true;
  }

  async filterGlobal(event: Event, dt: any) {
    this.first = 0;
    this.busqueda = (event.target as HTMLInputElement).value;
    if (this.busqueda.length == 0 || this.busqueda.length >= 3)
      await this.refrescarListado();

    // dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  async filterEmpresas(event) {
    const responseAseguradora = await this.empresasService.obtenerEmpresas(
      0,
      10,
      event.query
    )

    this.filteredEmpresas = responseAseguradora.data;
  }

  async onPageChange(event) {
    this.loading = true;
    this.first = event.first;
    this.pageSize = event.rows;
    await this.refrescarListado();
    this.loading = false;
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

  async editPoliza(poliza: any) {
    this.loading = true
    this.polizaCliente = { ...poliza };
    this.polizaCliente.fechaInicio = new Date(this.polizaCliente.fechaInicio + 'T23:59:00Z');
    this.polizaCliente.fechaFin = new Date(this.polizaCliente.fechaFin + 'T23:59:00Z');

    this.poliza = this.polizaCliente.poliza
    this.cliente = this.polizaCliente.cliente
    this.asesor = this.polizaCliente.asesor
    this.broker = this.polizaCliente.agente

    await this.prepareData();

    this.vigenciaMeses = this.polizaCliente.poliza.vigenciaMeses;
    this.loading = false
    this.polizaDialog = true;
  }


  async filterPolizas(event) {
    const response = await this.polizasService.obtenerPolizasByAseguradora(
      this.aseguradoraId,
      0,
      10,
      event.query
    );

    this.filteredPolizas = response.data
  }


  async filterAsesores(event) {
    const responseAsesor = await this.usuariosService.obtenerUsuariosPorRolAndEstado(
      this.ROL_ASESOR_ID,
      this.ESTADO_ACTIVO,
      0,
      10,
      event.query
    )

    this.filteredAsesores = responseAsesor.data;
  }

  async filterClientes(event) {
    const responseAsesor = await this.usuariosService.obtenerUsuariosPorRolAndEstado(
      this.ROL_CLIENTE_ID,
      this.ESTADO_ACTIVO,
      0,
      10,
      event.query
    )

    this.filteredClientes = responseAsesor.data;
  }

  async filterBrokers(event) {
    const responseBroker = await this.usuariosService.obtenerUsuariosPorRolAndEstado(
      this.ROL_BROKER_ID,
      this.ESTADO_ACTIVO,
      0,
      10,
      event.query
    )

    this.filteredBrokers = responseBroker.data;
  }

  async deletePoliza(polizaCliente: any) {
    this.confirmationService.confirm({
      message:
        'Estás seguro de eliminar la póliza ' +
        polizaCliente.poliza.nombre +
        '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        await this.clientesPolizasService.eliminarClientePoliza(
          polizaCliente.id
        );
        this.first = 0
        await this.refrescarListado();
        this.messageService.add({
          severity: 'success',
          summary: 'Enhorabuena!',
          detail: 'Registro eliminado exitosamente',
          life: 3000,
        });
      },
    });
  }

  calcularFechaFin() {
    if (this.poliza.vigenciaMeses) {
      this.vigenciaMeses = `${this.poliza.vigenciaMeses} ${this.poliza.vigenciaMeses > 1 ? 'meses' : 'mes'}`;
    } else {
      this.vigenciaMeses = undefined;
    }

    if (this.poliza.vigenciaMeses && this.polizaCliente.fechaInicio) {
        const fechaInicio = new Date(this.polizaCliente.fechaInicio);
        const vigenciaMeses = this.poliza.vigenciaMeses;
        const fechaFin = new Date(fechaInicio.setMonth(fechaInicio.getMonth() + vigenciaMeses));
        this.polizaCliente.fechaFin = fechaFin;
    }
  }

  hideDialog() {
    this.polizaDialog = false;
    this.submitted = false;
  }

  async savePoliza() {
    this.submitted = true;
    this.loading = true;

    try {
      this.polizaCliente.clienteId = this.cliente.id;
      this.polizaCliente.asesorId = this.asesor.id;
      this.polizaCliente.agenteId = this.broker.id;
      this.polizaCliente.polizaId = this.poliza.id;
      this.polizaCliente.empresaId = this.empresa?.id;

      if (this.polizaCliente.id) {
        await this.clientesPolizasService.actualizarClientePoliza(
          this.polizaCliente.id,
          this.polizaCliente
        );
      } else {
        await this.clientesPolizasService.crearClientePoliza(
          this.polizaCliente
        );
      }

      this.first = 0
      await this.refrescarListado();
      this.polizaDialog = false;
      this.polizaCliente = {};
      this.messageService.add({
        severity: 'success',
        summary: 'Enhorabuena!',
        detail: 'Operación ejecutada con éxito',
      });
    } finally {
      this.loading = false;
    }
  }

  async refrescarListado() {
    const response = await this.clientesPolizasService.obtenerClientesPolizasPorPoliza(
      this.polizaId,
      this.first / this.pageSize,
      this.pageSize,
      this.busqueda,
      this.sortField,
      this.sortOrder
    );

    console.log(response)

    this.clientePolizas = response.data
    this.totalRecords = response.totalRecords;
  }
}
