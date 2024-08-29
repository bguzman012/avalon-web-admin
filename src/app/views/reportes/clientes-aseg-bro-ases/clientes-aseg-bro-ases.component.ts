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
  selector: 'app-reportes-clientes-aseg',
  templateUrl: './clientes-aseg-bro-ases.component.html',
  styleUrls: ['./clientes-aseg-bro-ases.component.scss'],
})
export class ClientesAsegBroAsesComponent implements OnInit {
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
  ROL_ADMINISTRADOR_ID = 1;
  ROL_BROKER_ID = 4;

  clienteId

  vigenciaMeses

  first: number = 0;
  pageSize: number = 10;
  totalRecords: number = 0;

  busqueda: string = '';
  sortField = "cliente"
  sortOrder

  codigoDocumento: string = 'Nueva Póliza de Cliente'
  validarCreacion = false;
  validarEnable = false;

  constructor(
    private clientesPolizasService: ClientePolizaService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.loading = true;

    await this.refrescarListado();

    this.user = await this.authService.obtenerUsuarioLoggeado();

    if (this.user.rol.id == this.ROL_ADMINISTRADOR_ID) this.validarEnable = true;
    if (this.user.rol.id != this.ROL_CLIENTE_ID) this.validarCreacion = true;

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

  async refrescarListado() {
    const response = await this.clientesPolizasService.obtenerClientesPolizas(
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
