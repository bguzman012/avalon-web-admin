import {Component, Input, OnInit, SimpleChanges} from '@angular/core';
import {ConfirmationService, MessageService, SortEvent} from 'primeng/api';
import {ReclamacionesService} from '../../../services/reclamaciones-service';
import {UsuariosService} from '../../../services/usuarios-service';
import {ClientePolizaService} from 'src/app/services/polizas-cliente-service';
import {Router} from '@angular/router';
import {CasosService} from "../../../services/casos-service";
import {saveAs} from 'file-saver';


@Component({
  selector: 'app-reclamaciones-reportes',
  templateUrl: './reclamaciones-reportes.component.html',
  styleUrls: ['./reclamaciones-reportes.component.scss'],
})
export class ReclamacionesReportesComponent implements OnInit {
  @Input() originCaso: boolean = false;
  @Input() caso: any;

  reclamacionDialog: boolean;
  reclamaciones: any[];
  selectedReclamaciones: any[];
  submitted: boolean;
  reclamacion: any;
  loading: boolean = false;

  clientes: any[]; // Lista de clientes para el autocompletado
  aseguradoras: any[]; // Lista de aseguradoras para el autocompletado
  clientePolizas: any[]; // Lista de polizas para el autocompletado

  selectedCliente: any; // Cliente seleccionado en el filtro
  selectedClientePoliza: any; // Poliza seleccionada en el filtro
  selectedCaso: any; // Poliza seleccionada en el filtro

  filteredClientes: any[]; // Clientes filtrados para el autocompletado
  filteredAseguradoras: any[]; // Aseguradoras filtradas para el autocompletado
  filteredPolizas: any[]; // Pólizas filtradas para el autocompletado
  filteredCasos: any[]; // Pólizas filtradas para el autocompletado

  ROL_CLIENTE_ID = 3;
  ESTADO_ACTIVO = 'A';

  first: number = 0;
  pageSize: number = 10;
  totalRecords: number = 0;

  busqueda: string = '';
  sortField
  sortOrder

  constructor(
    private reclamacionesService: ReclamacionesService,
    private usuariosService: UsuariosService,
    private router: Router,
    private clientesPolizasService: ClientePolizaService,
    private casosService: CasosService
  ) {
  }

  async ngOnInit() {

    this.loading = true
    if (!this.originCaso) {
      this.prepareData();
      const response = await this.reclamacionesService.obtenerReclamaciones(
        "",
        "",
        0,
        10,
        "",
        this.sortField,
        this.sortOrder);

      this.reclamaciones = response.data;
      this.totalRecords = response.totalRecords;

    } else
      this.pageSize = 5
    this.loading = false
  }

  async filterCasos(event) {
    let query = event.query;

    const filteredCasos = await this.casosService.obtenerCasos(
      0,
      10,
      query,
      this.selectedClientePoliza?.id ? this.selectedClientePoliza?.id : "");

    this.filteredCasos = filteredCasos.data
  }

  exportExcel() {
    this.loading = true
    console.log(this.busqueda)
    this.reclamacionesService.downloadExcel(
      this.busqueda,
      this.sortField,
      this.sortOrder,
      this.selectedCaso?.id ? this.selectedCaso.id : "")
      .subscribe(response => {
        const blob = new Blob([response], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
        saveAs(blob, 'reembolsos_export_' + new Date().getTime() + '.xlsx');
        this.loading = false
      }, error => {
        console.error('Error downloading the file', error);
        this.loading = false
      });
  }

  getEstadoLabel(estado: string): string {
    switch (estado) {
      case 'C':
        return 'CERRADO';
      case 'N':
        return 'POR GESTIONAR';
      case 'G':
        return 'GESTIONANDO';
      case 'I':
        return 'ELIMINADO';
      default:
        return 'DRAFT';
    }
  }


  async filterGlobal(event: Event, dt: any) {
    this.first = 0;
    this.busqueda = (event.target as HTMLInputElement).value;
    if (this.busqueda.length == 0 || this.busqueda.length >= 3)
      await this.manageListado()
    // dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  async prepareData() {
    const responseCliente = await this.usuariosService.obtenerUsuariosPorRolAndEstado(
      this.ROL_CLIENTE_ID,
      this.ESTADO_ACTIVO,
      0,
      10,
      ""
    );

    this.clientes = responseCliente.data
  }

  async refrescarListado(type) {
    let response;
    if (type == "ALL")

      response = await this.reclamacionesService.obtenerReclamaciones(
        "",
        "",
        this.first / this.pageSize,
        this.pageSize,
        this.busqueda,
        this.sortField,
        this.sortOrder);
    else
      response = await this.reclamacionesService.obtenerReclamaciones(
        "",
        this.selectedClientePoliza.id,
        this.first / this.pageSize,
        this.pageSize,
        this.busqueda,
        this.sortField,
        this.sortOrder,
        this.selectedCaso.id);

    this.reclamaciones = response.data
    this.totalRecords = response.totalRecords
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

  async onPageChange(event) {
    this.loading = true;
    this.first = event.first;
    this.pageSize = event.rows;
    await this.manageListado();
    this.loading = false;
  }


  async onSort(event: SortEvent) {
    if (event.field !== this.sortField || event.order !== this.sortOrder) {
      this.loading = true
      this.sortField = event.field;
      this.sortOrder = event.order;
      await this.manageListado();
      this.loading = false
    }
  }


  async loadPolizas() {
    if (this.selectedCliente?.id) {
      const responseClientePoliza = await this.clientesPolizasService.obtenerClientesPolizasPorCliente(
        this.selectedCliente.id,
        0,
        10,
        "");

      this.clientePolizas = responseClientePoliza.data;
    }
  }

  async manageListado() {
    if (this.selectedClientePoliza)
      await this.refrescarListado("CLIENTE_POLIZA");
    else
      await this.refrescarListado("ALL");
  }

}
