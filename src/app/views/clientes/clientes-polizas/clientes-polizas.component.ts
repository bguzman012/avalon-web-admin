import { Component, OnInit } from '@angular/core';
import {MessageService, SortEvent} from 'primeng/api';
import { PolizasService } from '../../../services/polizas-service';
import { ConfirmationService } from 'primeng/api';
import { AuthService } from 'src/app/services/auth-service';
import { ActivatedRoute, Router } from '@angular/router';
import { AseguradorasService } from 'src/app/services/aseguradoras-service';
import { ClientePolizaService } from 'src/app/services/polizas-cliente-service';
import { UsuariosService } from 'src/app/services/usuarios-service';

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
  aseguradora;

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

  clienteId

  vigenciaMeses

  first: number = 0;
  pageSize: number = 10;
  totalRecords: number = 0;

  busqueda: string = '';
  sortField
  sortOrder

  constructor(
    private messageService: MessageService,
    private polizasService: PolizasService,
    private clientesPolizasService: ClientePolizaService,
    private confirmationService: ConfirmationService,
    private usuariosService: UsuariosService,
    private aseguradorasService: AseguradorasService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    this.loading = true;
    this.user = await this.authService.obtenerUsuarioLoggeado();

    this.clienteId = +(await this.getRouteParams('clienteId'));

    if (!this.clienteId) this.clienteId = localStorage.getItem('clienteId');

    this.cliente = JSON.parse(localStorage.getItem('cliente'));

    await this.refrescarListado();
    this.loading = false;
  }

  async filterGlobal(event: Event, dt: any) {
    this.first = 0;
    this.busqueda = (event.target as HTMLInputElement).value;
    if (this.busqueda.length == 0 || this.busqueda.length >= 3)
      await this.refrescarListado();

    // dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
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

  private getRouteParams(param: string): Promise<string> {
    return new Promise((resolve) => {
      this.route.queryParams.subscribe((params) => resolve(params[param]));
    });
  }

  redirectToCargasFamiliaresPage(clientePoliza: any) {
    localStorage.setItem("clientePolizaId", clientePoliza.id);
    localStorage.setItem("clientePoliza", JSON.stringify(clientePoliza));
    this.router.navigate(['clientes/polizas/cargas-familiares'], {
      queryParams: {
        clientePoliza: clientePoliza.id
      },
    });
  }

  async prepareData() {
    if (this.user.rol.id == this.ROL_ASESOR_ID) this.asesor = this.user;

     const responseAseguradora=
      await this.aseguradorasService.obtenerAseguradorasByEstado(
        this.ESTADO_ACTIVO,
        0,
        10,
        this.aseguradora ? this.aseguradora.nombre : ""
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

    this.aseguradoras = responseAseguradora.data;
    this.asesores = responseAsesor.data;
    this.brokers = responseBroker.data;
  }

  async openNew() {
    this.polizaCliente = {};
    this.submitted = false;
    this.loading = true;
    this.polizaCliente.fechaInicio = new Date();

    await this.prepareData();

    // this.calcularFechaFin()
    this.loading = false;
    this.polizaDialog = true;
  }

  async editPoliza(poliza: any) {
    this.loading = true
    this.polizaCliente = { ...poliza };
    this.polizaCliente.fechaInicio = new Date(this.polizaCliente.fechaInicio + 'T23:59:00Z');
    this.polizaCliente.fechaFin = new Date(this.polizaCliente.fechaFin + 'T23:59:00Z');

    this.cliente = this.polizaCliente.cliente
    this.asesor = this.polizaCliente.asesor
    this.broker = this.polizaCliente.agente
    this.aseguradora = this.polizaCliente.poliza.aseguradora

    this.poliza = this.polizaCliente.poliza

    await this.prepareData();

    const response = await this.polizasService.obtenerPolizasByAseguradora(
      this.aseguradora.id,
      0,
      10,
      this.poliza.nombre
    );

    this.polizas = response.data

    this.vigenciaMeses = this.polizaCliente.poliza.vigenciaMeses;
    this.loading = false
    this.polizaDialog = true;
  }

  async filterPolizas(event) {
    const response = await this.polizasService.obtenerPolizasByAseguradora(
      this.aseguradora.id,
      0,
      10,
      event.query
    );

    this.filteredPolizas = response.data
  }

  async changeAseguradora(aseguradora){

    if (aseguradora.id) {
      const response = await this.polizasService.obtenerPolizasByAseguradora(
        aseguradora.id,
        0,
        10,
        ""
      );

      this.polizas = response.data
      this.poliza = null
    }
  }

  async filterAseguradoras(event) {
    const responseAseguradora = await this.aseguradorasService.obtenerAseguradorasByEstado(
      this.ESTADO_ACTIVO,
      0,
      10,
      event.query
    )

    this.filteredAseguradoras = responseAseguradora.data;
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
        this.refrescarListado();
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
      if (this.polizaCliente.id) {
        this.polizaCliente.clienteId = this.clienteId;
        this.polizaCliente.asesorId = this.asesor.id;
        this.polizaCliente.agenteId = this.broker.id;
        this.polizaCliente.polizaId = this.poliza.id;
        await this.clientesPolizasService.actualizarClientePoliza(
          this.polizaCliente.id,
          this.polizaCliente
        );
      } else {
        this.polizaCliente.clienteId = this.clienteId;
        this.polizaCliente.asesorId = this.asesor.id;
        this.polizaCliente.agenteId = this.broker.id;
        this.polizaCliente.polizaId = this.poliza.id;
        await this.clientesPolizasService.crearClientePoliza(
          this.polizaCliente
        );
      }

      this.first = 0
      this.refrescarListado();
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
    const response = await this.clientesPolizasService.obtenerClientesPolizasPorCliente(
      this.clienteId,
      this.first / this.pageSize,
      this.pageSize,
      this.busqueda,
      this.sortField,
      this.sortOrder
    );

    this.clientePolizas = response.data
    this.totalRecords = response.totalRecords;
  }
}
