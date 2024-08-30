import {Component, Input, OnInit, SimpleChanges} from '@angular/core';
import {ConfirmationService, MessageService, SortEvent} from 'primeng/api';
import {ReclamacionesService} from '../../../services/reclamaciones-service';
import {UsuariosService} from '../../../services/usuarios-service';
import {environment} from '../../../../environments/environment';
import {FilterService} from "primeng/api";
import {AseguradorasService} from 'src/app/services/aseguradoras-service';
import {PolizasService} from 'src/app/services/polizas-service';
import {ClientePolizaService} from 'src/app/services/polizas-cliente-service';
import {Router} from '@angular/router';
import {CasosService} from "../../../services/casos-service";

@Component({
  selector: 'app-reclamaciones',
  templateUrl: './reclamaciones.component.html',
  styleUrls: ['./reclamaciones.component.scss'],
})
export class ReclamacionesComponent implements OnInit {
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
    private messageService: MessageService,
    private reclamacionesService: ReclamacionesService,
    private aseguradorasService: AseguradorasService,
    private usuariosService: UsuariosService,
    private confirmationService: ConfirmationService,
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

  async onChangeCaso() {
    if (this.caso?.id) {
      const response = await this.reclamacionesService.obtenerReclamaciones(
        "",
        this.caso.clientePoliza.id,
        0,
        this.pageSize,
        "",
        this.sortField,
        this.sortOrder,
        this.caso.id);

      this.reclamaciones = response.data;
      this.totalRecords = response.totalRecords;
      this.selectedClientePoliza = this.caso.clientePoliza
      this.selectedCliente = this.caso.clientePoliza.cliente
      this.selectedCaso = this.caso
    }
  }


  async ngOnChanges(changes: SimpleChanges) {
    if (changes['caso']) {
      await this.onChangeCaso()
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

  async editReclamacion(reclamacion: any) {
    this.reclamacion = {...reclamacion};
    let redirect = !this.originCaso ? 'reclamaciones/detalle-reclamacion' : 'casos/detalle-caso/detalle-reclamacion';

    let queryParamsClientePoliza = {}
    if (this.selectedCaso?.id) {
      queryParamsClientePoliza = {
        clientePolizaId: this.selectedClientePoliza.id,
        clienteId: this.selectedCliente.id,
        casoId: this.selectedCaso.id,
        originCaso: this.originCaso
      };
    }

    if (this.reclamacion && this.reclamacion.id) {
      localStorage.setItem('reclamacion', JSON.stringify(this.reclamacion));
      queryParamsClientePoliza['reclamacionId'] = this.reclamacion.id
      this.router.navigate([redirect], {
        queryParams: queryParamsClientePoliza,
      });
    }

    this.reclamacionDialog = true;
  }

  async deleteReclamacion(reclamacion: any) {
    this.confirmationService.confirm({
      message: 'Estás seguro de eliminar la reclamo?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        if (reclamacion.estado != "N")
          return this.messageService.add({
            severity: 'error',
            summary: 'Error!',
            detail: 'No es posible eliminar un reclamo en estado GESTIONANDO o CERRADO',
            life: 3000,
          });

        this.loading = true

        await this.reclamacionesService.eliminarReclamacion(reclamacion.id);
        this.first = 0
        await this.manageListado()
        this.loading = false

        this.messageService.add({
          severity: 'success',
          summary: 'Enhorabuena!',
          detail: 'Reembolso eliminado exitosamente',
          life: 3000,
        });
      },
    });
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

  redirectToDetailReclamacionPage() {
    let redirect = !this.originCaso ? 'reclamaciones/detalle-reclamacion' : 'casos/detalle-caso/detalle-reclamacion';

    if (this.selectedCaso?.id) {
      localStorage.setItem("clientePoliza", JSON.stringify(this.selectedClientePoliza));
      localStorage.setItem("caso", JSON.stringify(this.selectedCaso));
      localStorage.removeItem('reclamacion')

      const queryParamsClientePoliza = {
        clientePolizaId: this.selectedClientePoliza.id,
        clienteId: this.selectedCliente.id,
        casoId: this.selectedCaso.id,
        originCaso: this.originCaso
      };

      this.router.navigate([redirect], {
        queryParams: queryParamsClientePoliza,
      });
      return
    }
    localStorage.removeItem("clientePoliza");
    localStorage.removeItem("caso");
    localStorage.removeItem('reclamacion')

    this.router.navigate([redirect]);

  }

}
