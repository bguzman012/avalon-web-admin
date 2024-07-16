import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
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

  vigenciaMeses

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

    this.polizaId = +(await this.getRouteParams('polizaId'));

    if (!this.polizaId) this.polizaId = localStorage.getItem('polizaId');

    this.aseguradoraId = +(await this.getRouteParams('aseguradoraId'));

    if (!this.aseguradoraId)
      this.aseguradoraId = localStorage.getItem('aseguradoraId');

    this.refrescarListado();
    this.loading = false;
  }

  private getRouteParams(param: string): Promise<string> {
    return new Promise((resolve) => {
      this.route.queryParams.subscribe((params) => resolve(params[param]));
    });
  }

  async prepareData() {
    this.polizas = await this.polizasService.obtenerPolizasByAseguradora(
      this.aseguradoraId
    );

    this.aseguradoras =
      await this.aseguradorasService.obtenerAseguradorasByEstado(
        this.ESTADO_ACTIVO
      );

    this.clientes = await this.usuariosService.obtenerUsuariosPorRolAndEstado(
      this.ROL_CLIENTE_ID,
      this.ESTADO_ACTIVO,
      0,
      100,
      ""
    );

    this.asesores = await this.usuariosService.obtenerUsuariosPorRolAndEstado(
      this.ROL_ASESOR_ID,
      this.ESTADO_ACTIVO,
      0,
      10,
      ""
    );

    this.brokers = await this.usuariosService.obtenerUsuariosPorRolAndEstado(
      this.ROL_BROKER_ID,
      this.ESTADO_ACTIVO,
      0,
      10,
      ""
    );
  }

  async openNew() {
    this.polizaCliente = {};
    this.submitted = false;
    this.loading = true;
    this.polizaCliente.fechaInicio = new Date();

    await this.prepareData();

    if (this.polizaId)
      this.poliza = this.polizas.find((x) => x.id == this.polizaId);

    console.log(this.poliza)
    this.vigenciaMeses = this.poliza.vigenciaMeses;
    if (this.user.rol.id == this.ROL_ASESOR_ID) this.asesor = this.user;

    this.calcularFechaFin()
    this.loading = false;
    this.polizaDialog = true;
  }

  filterGlobal(event: Event, dt: any) {
    dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  async editPoliza(poliza: any) {
    this.polizaCliente = { ...poliza };
    this.polizaCliente.fechaInicio = new Date(this.polizaCliente.fechaInicio + 'T23:59:00Z');
    this.polizaCliente.fechaFin = new Date(this.polizaCliente.fechaFin + 'T23:59:00Z');
    await this.prepareData();

    this.poliza = this.polizaCliente.poliza
    this.cliente = this.polizaCliente.cliente
    this.asesor = this.polizaCliente.asesor
    this.broker = this.polizaCliente.agente
    this.vigenciaMeses = this.polizaCliente.poliza.vigenciaMeses;
    this.polizaDialog = true;
  }

  filterPolizas(event) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.polizas.length; i++) {
      let poliza = this.polizas[i];
      if (poliza.nombre.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(poliza);
      }
    }

    this.filteredPolizas = filtered;
  }

  filterAseguradoras(event) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.aseguradoras.length; i++) {
      let aseguradora = this.aseguradoras[i];
      if (aseguradora.nombre.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(aseguradora);
      }
    }

    this.filteredAseguradoras = filtered;
  }

  filterAsesores(event) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.asesores.length; i++) {
      let asesor = this.asesores[i];
      if (
        asesor.nombreUsuario.toLowerCase().indexOf(query.toLowerCase()) == 0
      ) {
        filtered.push(asesor);
      }
    }

    this.filteredAsesores = filtered;
  }

  filterClientes(event) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.clientes.length; i++) {
      let cliente = this.clientes[i];
      if (
        cliente.nombreUsuario.toLowerCase().indexOf(query.toLowerCase()) == 0
      ) {
        filtered.push(cliente);
      }
    }

    this.filteredClientes = filtered;
  }

  filterBrokers(event) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.brokers.length; i++) {
      let broker = this.brokers[i];
      if (
        broker.nombreUsuario.toLowerCase().indexOf(query.toLowerCase()) == 0
      ) {
        filtered.push(broker);
      }
    }

    this.filteredBrokers = filtered;
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
        this.polizaCliente.clienteId = this.cliente.id;
        this.polizaCliente.asesorId = this.asesor.id;
        this.polizaCliente.agenteId = this.broker.id;
        this.polizaCliente.polizaId = this.poliza.id;
        await this.clientesPolizasService.actualizarClientePoliza(
          this.polizaCliente.id,
          this.polizaCliente
        );
      } else {
        this.polizaCliente.clienteId = this.cliente.id;
        this.polizaCliente.asesorId = this.asesor.id;
        this.polizaCliente.agenteId = this.broker.id;
        this.polizaCliente.polizaId = this.poliza.id;
        await this.clientesPolizasService.crearClientePoliza(
          this.polizaCliente
        );
      }

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
    this.clientePolizas =
      await this.clientesPolizasService.obtenerClientesPolizasPorPoliza(
        this.polizaId
      );
  }
}
