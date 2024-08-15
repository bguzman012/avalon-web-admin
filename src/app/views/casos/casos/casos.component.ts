import { Component, OnInit } from '@angular/core';
import { ConfirmationService, SortEvent } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { CasosService } from '../../../services/casos-service';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth-service';
import {PaisesService} from "../../../services/paises-service";
import {EstadosService} from "../../../services/estados-service";
import {UsuariosService} from "../../../services/usuarios-service";
import {ClientePolizaService} from "../../../services/polizas-cliente-service";

@Component({
  selector: 'app-casos',
  templateUrl: './casos.component.html',
  styles: [`
  :host ::ng-deep .p-dialog .product-image {
      width: 150px;
      margin: 0 auto 2rem auto;
      display: block;
  }
`],
  styleUrls: ['./casos.component.scss'],
})

export class CasosComponent implements OnInit {
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
    private messageService: MessageService,
    private casosService: CasosService,
    private confirmationService: ConfirmationService,
    private router: Router,
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

  openNew() {
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
      localStorage.removeItem("caso");
      this.router.navigate(['casos/detalle-caso']);
    }
  }

  editCaso(caso: any) {
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
      queryParamsClientePoliza['casoId'] = this.caso.id
      this.router.navigate(['casos/detalle-caso'], {
        queryParams: queryParamsClientePoliza,
      });
    }

    this.casoDialog = true;
  }

  async deleteCaso(caso: any) {
    this.confirmationService.confirm({
      message: 'Estás seguro de eliminar el centro médico ' + caso.nombre + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async  () => {
        await this.casosService.eliminarCaso(caso.id);
        this.first = 0;
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

  async refrescarListado(){
    const response = await this.casosService.obtenerCasos(
      this.first / this.pageSize,
      this.pageSize,
      this.busqueda,
      this.sortField,
      this.sortOrder,
      this.selectedClientePoliza?.id ? this.selectedClientePoliza?.id : ""
    );

    this.casos = response.data;
    this.totalRecords = response.totalRecords;
  }

}
