import { Component, OnInit } from '@angular/core';
import {ConfirmationService, MessageService, SortEvent} from 'primeng/api';
import { CargaFamiliarService } from '../../../services/cargas-familiares-service';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientePolizaService } from 'src/app/services/polizas-cliente-service';
import {PaisesService} from "../../../services/paises-service";
import {EstadosService} from "../../../services/estados-service";
import {UsuariosService} from "../../../services/usuarios-service";

@Component({
  selector: 'cargas-familiares',
  templateUrl: './cargas-familiares.component.html',
  styles: [`
  :host ::ng-deep .p-dialog .product-image {
      width: 150px;
      margin: 0 auto 2rem auto;
      display: block;
  }
`],
  styleUrls: ['./cargas-familiares.component.scss'],
})
export class CargasFamiliaresComponent implements OnInit {
  cargaFamiliarDialog: boolean;
  cargasFamiliares: any[];
  selectedCargasFamiliares: any[];
  submitted: boolean;
  cargaFamiliar: any;
  selectedCliente: any; // Cliente seleccionado en el filtro

  direccion: any;

  paises: any[];
  estados: any[];

  pais: any;
  estado: any;

  filteredPaises: any[];
  filteredEstados: any[];
  filteredClientes: any[]; // Clientes filtrados para el autocompletado

  loading: boolean = false;
  clientePolizaId;
  clientePoliza

  first: number = 0;
  pageSize: number = 10;
  totalRecords: number = 0;

  busqueda: string = '';
  sortField
  sortOrder
  ROL_CLIENTE_ID = 3;
  ESTADO_ACTIVO = 'A';

  constructor(
    private messageService: MessageService,
    private cargasFamiliaresService: CargaFamiliarService,
    private confirmationService: ConfirmationService,
    private clientePolizaService: ClientePolizaService,
    private paisesService: PaisesService,
    private estadosService: EstadosService,
    private route: ActivatedRoute,
    private router: Router,
    private usuariosService: UsuariosService
  ) { }

  async ngOnInit() {

    this.clientePolizaId = +(await this.getRouteParams('clienteId'));

    if (!this.clientePolizaId) this.clientePolizaId = localStorage.getItem('clientePolizaId');

    this.clientePoliza = JSON.parse(localStorage.getItem('clientePoliza'));

    console.log(this.clientePoliza)

    await this.refrescarListado();
  }

  private getRouteParams(param: string): Promise<string> {
    return new Promise((resolve) => {
      this.route.queryParams.subscribe((params) => resolve(params[param]));
    });
  }

  async filterGlobal(event: Event, dt: any) {
    this.first = 0;
    this.busqueda = (event.target as HTMLInputElement).value;
    if (this.busqueda.length == 0 || this.busqueda.length >= 3)
      await this.refrescarListado();

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
    this.filteredClientes = this.filteredClientes.filter(cliente => cliente.id != this.clientePoliza.cliente.id)
  }


  filterPaises(event): void {
    let query = event.query;
    this.filteredPaises = this.paises.filter(
      (pais) => pais.nombre.toLowerCase().indexOf(query.toLowerCase()) === 0
    );
  }

  filterEstados(event): void {
    let query = event.query;
    this.filteredEstados = this.estados.filter(
      (obj) => obj.nombre.toLowerCase().indexOf(query.toLowerCase()) === 0
    );
  }

  async loadEstados() {
    if (this.pais.id)
      this.estados = await this.estadosService.obtenerEstadosByPais(
        this.pais.id
      );
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

  openNew() {
    this.cargaFamiliar = {};
    this.direccion = {};

    this.cargaFamiliar.fechaNacimiento = new Date();

    this.submitted = false;
    this.prepareData()
    this.cargaFamiliarDialog = true;
  }

  async prepareData() {
    this.paises = await this.paisesService.obtenerPaises();
  }

  async onPageChange(event) {
    this.loading = true;
    this.first = event.first;
    this.pageSize = event.rows;
    await this.refrescarListado();
    this.loading = false;
  }


  async editCargaFamiliar(cargaFamiliar: any) {
    this.cargaFamiliar = { ...cargaFamiliar };
    this.cargaFamiliarDialog = true;
  }

  async deleteCargaFamiliar(cargaFamiliar: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this family member?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        await this.cargasFamiliaresService.deleteCargaFamiliar(cargaFamiliar.id);
        this.first = 0
        await this.refrescarListado();

        this.messageService.add({
          severity: 'success',
          summary: 'Enhorabuena!',
          detail: 'Registro inhabilitado exitosamente',
          life: 3000,
        });
      },
    });
  }

  hideDialog() {
    this.cargaFamiliarDialog = false;
    this.submitted = false;
  }

  async saveCargaFamiliar() {
    this.submitted = true;
    this.loading = true; // Mostrar spinner
    try {
      this.cargaFamiliar.clientePolizaId = this.clientePolizaId;

      if (this.cargaFamiliar.id) {
        await this.cargasFamiliaresService.updateCargaFamiliar(this.cargaFamiliar.id, this.cargaFamiliar);
      } else {
        await this.cargasFamiliaresService.createCargaFamiliar(this.cargaFamiliar);
      }
      this.first = 0
      await this.refrescarListado();
      this.cargaFamiliarDialog = false;
      this.cargaFamiliar = {};
      this.messageService.add({ severity: 'success', summary: 'Enhorabuena!', detail: 'Operación ejecutada con éxito' });
    } finally {
      this.loading = false; // Ocultar spinner
    }
  }

  async refrescarListado() {
    const response = await this.cargasFamiliaresService.getCargasFamiliaresByClientePoliza(
      this.clientePolizaId,
      this.first / this.pageSize,
      this.pageSize,
      this.busqueda,
      this.sortField,
      this.sortOrder)

    this.cargasFamiliares = response.data;
    this.totalRecords = response.totalRecords;

  }
}
