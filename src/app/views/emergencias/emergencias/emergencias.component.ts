import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService, SortEvent } from 'primeng/api';
import { EmergenciasService } from '../../../services/emergencias-service';
import { UsuariosService } from '../../../services/usuarios-service';
import { environment } from '../../../../environments/environment';
import { FilterService } from "primeng/api";
import { AseguradorasService } from 'src/app/services/aseguradoras-service';
import { PolizasService } from 'src/app/services/polizas-service';
import { ClientePolizaService } from 'src/app/services/polizas-cliente-service';
import { Router } from '@angular/router';

@Component({
  selector: 'emergencias',
  templateUrl: './emergencias.component.html',
  styleUrls: ['./emergencias.component.scss'],
})
export class EmergenciasComponent implements OnInit {
  emergenciaDialog: boolean;
  emergencias: any[];
  selectedEmergencias: any[];
  submitted: boolean;
  emergencia: any;
  loading: boolean = false;

  clientes: any[]; // Lista de clientes para el autocompletado
  aseguradoras: any[]; // Lista de aseguradoras para el autocompletado
  clientePolizas: any[]; // Lista de polizas para el autocompletado

  selectedCliente: any; // Cliente seleccionado en el filtro
  selectedAseguradora: any; // Aseguradora seleccionada en el filtro
  selectedClientePoliza: any; // Poliza seleccionada en el filtro

  filteredClientes: any[]; // Clientes filtrados para el autocompletado
  filteredAseguradoras: any[]; // Aseguradoras filtradas para el autocompletado
  filteredPolizas: any[]; // Pólizas filtradas para el autocompletado

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
    private emergenciasService: EmergenciasService,
    private usuariosService: UsuariosService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private clientesPolizasService: ClientePolizaService
  ) { }

  async ngOnInit() {

    this.loading = true
    this.prepareData();
    const response = await this.emergenciasService.obtenerEmergencias(
      "",
      "",
      0,
      10,
      "",
      this.sortField,
      this.sortOrder);

    this.emergencias = response.data;
    this.totalRecords = response.totalRecords;

    this.loading = false
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

  async filterGlobal(event: Event, dt: any) {
    this.first = 0;
    this.busqueda = (event.target as HTMLInputElement).value;
    if (this.busqueda.length == 0 || this.busqueda.length >= 3)
      await this.manageListado()
    // dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  async editEmergencia(emergencia: any) {
    this.emergencia = { ...emergencia };
    let queryParamsClientePoliza = {}
    if (this.selectedClientePoliza && this.selectedClientePoliza.id) {
      queryParamsClientePoliza = {
        clientePolizaId: this.selectedClientePoliza.id,
        clienteId: this.selectedCliente.id
      };
    }

    if (this.emergencia && this.emergencia.id) {
      localStorage.setItem('emergencia', JSON.stringify(this.emergencia));
      queryParamsClientePoliza['emergenciaId']= this.emergencia.id
      this.router.navigate(['emergencias/detalle-emergencia'], {
        queryParams: queryParamsClientePoliza,
      });
    }

    this.emergenciaDialog = true;
  }

  async deleteEmergencia(emergencia: any) {
    this.confirmationService.confirm({
      message: 'Estás seguro de eliminar el emergencia?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        await this.emergenciasService.eliminarEmergencia(emergencia.id);
        this.first = 0
        await this.manageListado()

        this.messageService.add({
          severity: 'success',
          summary: 'Enhorabuena!',
          detail: 'Cita médica eliminada exitosamente',
          life: 3000,
        });
      },
    });
  }

  async refrescarListado(type) {
    let response;
    if (type == "ALL")

      response = await this.emergenciasService.obtenerEmergencias(
        "",
        "",
        this.first / this.pageSize,
        10,
        this.busqueda,
        this.sortField,
        this.sortOrder);
    else
      response = await this.emergenciasService.obtenerEmergencias(
        "",
        this.selectedClientePoliza.id,
        this.first / this.pageSize,
        10,
        this.busqueda,
        this.sortField,
        this.sortOrder);

    this.emergencias = response.data
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

  async filterPolizas(event) {
    let query = event.query;

    const responseClientePoliza = await this.clientesPolizasService.obtenerClientesPolizasPorCliente(
      this.selectedCliente.id,
      0,
      10,
      query);

    this.filteredPolizas = responseClientePoliza.data
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

      this.clientePolizas = responseClientePoliza.data
    }
  }

  async manageListado() {
    if (this.selectedClientePoliza)
      await this.refrescarListado("CLIENTE_POLIZA");
    else
      await this.refrescarListado("ALL");
  }

  redirectToDetailEmergenciaPage() {
    if (this.selectedClientePoliza && this.selectedClientePoliza.id) {
      localStorage.setItem("clientePoliza", JSON.stringify(this.selectedClientePoliza));
      const queryParamsClientePoliza = {
        clientePolizaId: this.selectedClientePoliza.id,
        clienteId: this.selectedCliente.id
      };
      this.router.navigate(['emergencias/detalle-emergencia'], {
        queryParams: queryParamsClientePoliza,
      });
    } else {
      localStorage.removeItem("clientePoliza");
      this.router.navigate(['emergencias/detalle-emergencia']);
    }
  }

}
