import { Component, OnInit } from '@angular/core';
import { SortEvent } from 'primeng/api';
import { CasosService } from '../../../services/casos-service';
import {saveAs} from 'file-saver';
import { AuthService } from 'src/app/services/auth-service';
import {UsuariosService} from "../../../services/usuarios-service";
import {ClientePolizaService} from "../../../services/polizas-cliente-service";

@Component({
  selector: 'app-casos-track-reportes',
  templateUrl: './casos-track-reportes.component.html',
  styles: [`
  :host ::ng-deep .p-dialog .product-image {
      width: 150px;
      margin: 0 auto 2rem auto;
      display: block;
  }
`],
  styleUrls: ['./casos-track-reportes.component.scss'],
})

export class CasosTrackReportesComponent implements OnInit {
  casoDialog: boolean;
  casos: any[];
  selectedCasos: any[];
  submitted: boolean;
  caso: any;
  loading: boolean = false;
  ESTADO_ACTIVO = 'A'
  ROL_ADMINISTRADOR_ID = 1
  TIPO_EMPRESA_ID = 1

  first: number = 0;
  pageSize: number = 10;
  totalRecords: number = 0;

  busqueda: string = '';
  sortField
  sortOrder
  clientePolizas: any[]; // Lista de polizas para el autocompletado
  filteredPolizas: any[]; // Pólizas filtradas para el autocompletado

  direccion: any;

  filteredClientes: any[]; // Clientes filtrados para el autocompletado

  selectedCliente: any; // Cliente seleccionado en el filtro

  activarCreate = false
  selectedClientePoliza: any; // Poliza seleccionada en el filtro

  ROL_CLIENTE_ID = 3;

  constructor(
    private casosService: CasosService,
    private authService: AuthService,
    private usuariosService: UsuariosService,
    private clientesPolizasService: ClientePolizaService
  ) {}

  async ngOnInit() {
    this.loading = true
    this.refrescarListado();
    let user = await this.authService.obtenerUsuarioLoggeado()
    if (user.rol.id == this.ROL_ADMINISTRADOR_ID) this.activarCreate = true
    this.loading = false
  }
  filterGlobal(event: Event, dt: any) {
    this.first = 0;
    this.busqueda = (event.target as HTMLInputElement).value;
    if (this.busqueda.length == 0 || this.busqueda.length >= 3)
      this.refrescarListado();

    // dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  exportExcel() {
    this.loading = true
    console.log(this.busqueda)
    this.casosService.downloadTrackExcel(
      this.busqueda)
      .subscribe(response => {
        const blob = new Blob([response], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
        saveAs(blob, 'casos_track_export_' + new Date().getTime() + '.xlsx');
        this.loading = false
      }, error => {
        console.error('Error downloading the file', error);
        this.loading = false
      });
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

  onSort(event: SortEvent) {
    if (event.field !== this.sortField || event.order !== this.sortOrder) {
      this.sortField = event.field;
      this.sortOrder = event.order;
      this.refrescarListado();
    }
  }

  async loadPolizas() {
    if (this.selectedCliente?.id) {
      const responseClientePoliza = await this.clientesPolizasService.obtenerClientesPolizasPorCliente(
        this.selectedCliente.id,
        0,
        10,
        "");

      this.clientePolizas = responseClientePoliza.data
    }
  }

  async filterClientes(event){
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

  async onPageChange(event) {
    this.loading = true;
    this.first = event.first;
    this.pageSize = event.rows;
    await this.refrescarListado();
    this.loading = false;
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

  async refrescarListado(){
    const response = await this.casosService.obtenerCasosTrack(
      this.first / this.pageSize,
      this.pageSize,
      this.busqueda,
    );

    this.casos = response.data;
    console.log(this.casos)
    this.totalRecords = response.totalRecords;
  }

}
