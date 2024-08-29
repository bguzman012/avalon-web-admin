import { Component, OnInit } from '@angular/core';
import {MessageService, SortEvent} from 'primeng/api';
import { saveAs } from 'file-saver';
import { AuthService } from 'src/app/services/auth-service';
import { ClientePolizaService } from 'src/app/services/polizas-cliente-service';
import {UsuariosService} from "../../../services/usuarios-service";
import {CargaFamiliarService} from "../../../services/cargas-familiares-service";

@Component({
  selector: 'app-clientes-tit-dep',
  templateUrl: './clientes-titular-dependientes.component.html',
  styleUrls: ['./clientes-titular-dependientes.component.scss'],
})
export class ClientesTitularDependientesComponent implements OnInit {
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
  selectedCliente: any; // Cliente seleccionado en el filtro
  selectedClientePoliza: any; // Poliza seleccionada en el filtro

  clienteId

  vigenciaMeses

  first: number = 0;
  pageSize: number = 10;
  totalRecords: number = 0;

  busqueda: string = '';
  sortField = "titular"
  sortOrder = 1

  codigoDocumento: string = 'Nueva Póliza de Cliente'
  validarCreacion = false;
  validarEnable = false;

  constructor(
    private clientesPolizasService: ClientePolizaService,
    private cargasFamiliaresService: CargaFamiliarService,
    private authService: AuthService,
    private usuariosService: UsuariosService
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

  async filterClientes(event) {
    let query = event.query;

    const responseCliente = await this.usuariosService.obtenerUsuariosPorRolAndEstado(
      this.ROL_CLIENTE_ID,
      this.ESTADO_ACTIVO,
      0,
      10,
      query
    );

    this.filteredClientes = responseCliente.data
  }

  async filterPolizas(event) {
    let query = event.query;

    const responseClientePoliza = await this.clientesPolizasService.obtenerClientesPolizasPorCliente(
      this.selectedCliente.id,
      0,
      10,
      query);

    this.filteredPolizas = responseClientePoliza.data;
  }

  exportExcel() {
    this.loading = true
    console.log(this.busqueda)
    this.cargasFamiliaresService.downloadExcel(
      this.busqueda,
      this.sortField,
      this.sortOrder,
      this.selectedClientePoliza?.id ? this.selectedClientePoliza.id : "")
      .subscribe(response => {
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'clientes_dependientes_export_' + new Date().getTime() + '.xlsx');
        this.loading = false
      }, error => {
        console.error('Error downloading the file', error);
        this.loading = false
      });
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

  async cargarCargasFamiliares(){
    this.loading = true
    if (this.selectedClientePoliza?.id){
    const response = await this.cargasFamiliaresService.getCargasFamiliaresByClientePoliza(
      this.selectedClientePoliza.id,
      this.first / this.pageSize,
      this.pageSize,
      this.busqueda,
      this.sortField,
      this.sortOrder
    );

    this.clientePolizas = response.data
    this.totalRecords = response.totalRecords;
    }else {
      this.refrescarListado()
    }
    this.loading = false
  }
}
