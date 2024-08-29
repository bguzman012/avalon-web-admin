import { Component, OnInit } from '@angular/core';
import {MessageService, SortEvent} from 'primeng/api';
import { saveAs } from 'file-saver';
import { AuthService } from 'src/app/services/auth-service';
import { ClientePolizaService } from 'src/app/services/polizas-cliente-service';
import {UsuariosService} from "../../../services/usuarios-service";
import {CargaFamiliarService} from "../../../services/cargas-familiares-service";
import {ClientesMembresiasService} from "../../../services/clientes-membresias-service";
import {MembresiasService} from "../../../services/membresias-service";

@Component({
  selector: 'app-clientes-memb-venc',
  templateUrl: './clientes-membresias-vencid.component.html',
  styleUrls: ['./clientes-membresias-vencid.component.scss'],
})
export class ClientesMembresiasVencidComponent implements OnInit {
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
  clienteMembresias: any[]; // Lista de clientes membresía
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
  sortField = "fechaFin"
  sortOrder = 1

  codigoDocumento: string = 'Nueva Póliza de Cliente'
  validarCreacion = false;
  validarEnable = false;
  membresia
  filteredMembresias

  constructor(
    private clientesPolizasService: ClientePolizaService,
    private cargasFamiliaresService: CargaFamiliarService,
    private authService: AuthService,
    private membresiasService: MembresiasService,
    private clientesMembresiasService: ClientesMembresiasService,
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

  getEstadoLabel(estado: string): string {
    switch (estado) {
      case 'A':
        return 'ACTIVA';
      case 'V':
        return 'VENCIDA';
      default:
        return 'OTRO';
    }
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

  async filterMembresia(event) {
    const responseMembresia = await this.membresiasService.obtenerMembresiasByEstado(
      this.ESTADO_ACTIVO, 0, 10, event.query
    )

    this.filteredMembresias = responseMembresia.data;
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


  exportExcel() {
    this.loading = true
    console.log(this.busqueda)
    this.clientesMembresiasService.downloadExcel(
      this.busqueda,
      this.sortField,
      this.sortOrder,
      this.selectedCliente?.id ? this.selectedCliente.id : "",
      this.membresia?.id ? this.membresia.id : "")
      .subscribe(response => {
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'clientes_membresias_export_' + new Date().getTime() + '.xlsx');
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

  async refrescarListado(){
    const response = await this.clientesMembresiasService.obtenerUsuariosMembresias(
      this.first / this.pageSize,
      this.pageSize,
      this.busqueda,
      this.sortField,
      this.sortOrder,
      this.selectedCliente?.id ? this.selectedCliente.id : "" ,
      this.membresia?.id ? this.membresia?.id : ""
    );

    this.clienteMembresias = response.data
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
