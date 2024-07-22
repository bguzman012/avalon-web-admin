import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService, SortEvent } from 'primeng/api';
import { CasosService } from '../../../services/casos-service';
import { UsuariosService } from '../../../services/usuarios-service';
import { environment } from '../../../../environments/environment';
import { FilterService } from "primeng/api";
import { AseguradorasService } from 'src/app/services/aseguradoras-service';
import { PolizasService } from 'src/app/services/polizas-service';
import { ClientePolizaService } from 'src/app/services/polizas-cliente-service';
import { Router } from '@angular/router';

@Component({
  selector: 'casos',
  templateUrl: './casos.component.html',
  styleUrls: ['./casos.component.scss'],
})
export class CasosComponent implements OnInit {
  casoDialog: boolean;
  casos: any[];
  selectedCasos: any[];
  submitted: boolean;
  caso: any;
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
    private casosService: CasosService,
    private usuariosService: UsuariosService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private clientesPolizasService: ClientePolizaService
  ) { }

  async ngOnInit() {

    this.loading = true
    this.prepareData();
    const response = await this.casosService.obtenerCasos(
      "",
      "",
      0,
      10,
      "",
      this.sortField,
      this.sortOrder);

    this.casos = response.data;
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

  async editCaso(caso: any) {
    this.caso = { ...caso };
    let queryParamsClientePoliza = {}
    if (this.selectedClientePoliza && this.selectedClientePoliza.id) {
      queryParamsClientePoliza = {
        clientePolizaId: this.selectedClientePoliza.id,
        clienteId: this.selectedCliente.id
      };
    }

    if (this.caso && this.caso.id) {
      localStorage.setItem('caso', JSON.stringify(this.caso));
      queryParamsClientePoliza['casoId']= this.caso.id
      this.router.navigate(['casos/detalle-caso'], {
        queryParams: queryParamsClientePoliza,
      });
    }

    this.casoDialog = true;
  }

  async deleteCaso(caso: any) {
    this.confirmationService.confirm({
      message: 'Estás seguro de eliminar el caso?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        await this.casosService.eliminarCaso(caso.id);
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

      response = await this.casosService.obtenerCasos(
        "",
        "",
        this.first / this.pageSize,
        10,
        this.busqueda,
        this.sortField,
        this.sortOrder);
    else
      response = await this.casosService.obtenerCasos(
        "",
        this.selectedClientePoliza.id,
        this.first / this.pageSize,
        10,
        this.busqueda,
        this.sortField,
        this.sortOrder);

    this.casos = response.data
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

    let clientePolizas = responseClientePoliza.data
    if (clientePolizas) {
      clientePolizas = clientePolizas.map(obj => ({
        ...obj,
        displayName: `${obj.codigo}-${obj.poliza.nombre}`
      }));
      console.log(clientePolizas)

      this.filteredPolizas = clientePolizas;
    }

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

      let clientePolizas = responseClientePoliza.data
      if (clientePolizas) {
        clientePolizas = clientePolizas.map(obj => ({
          ...obj,
          displayName: `${obj.codigo}-${obj.poliza.nombre}`
        }));
        console.log(clientePolizas)

        this.clientePolizas = clientePolizas;
      }
    }
  }

  async manageListado() {
    if (this.selectedClientePoliza)
      await this.refrescarListado("CLIENTE_POLIZA");
    else
      await this.refrescarListado("ALL");
  }

  redirectToDetailCasoPage() {
    if (this.selectedClientePoliza && this.selectedClientePoliza.id) {
      localStorage.setItem("clientePoliza", JSON.stringify(this.selectedClientePoliza));
      const queryParamsClientePoliza = {
        clientePolizaId: this.selectedClientePoliza.id,
        clienteId: this.selectedCliente.id
      };
      this.router.navigate(['casos/detalle-caso'], {
        queryParams: queryParamsClientePoliza,
      });
    } else {
      localStorage.removeItem("clientePoliza");
      this.router.navigate(['casos/detalle-caso']);
    }
  }

}
