import {Component, OnInit} from '@angular/core';
import {ConfirmationService, MessageService, SortEvent} from 'primeng/api';
import {CargaFamiliarService} from '../../../services/cargas-familiares-service';
import {ActivatedRoute, Router} from '@angular/router';
import {ClientePolizaService} from 'src/app/services/polizas-cliente-service';
import {PaisesService} from "../../../services/paises-service";
import {EstadosService} from "../../../services/estados-service";
import {UsuariosService} from "../../../services/usuarios-service";
import {environment} from "../../../../environments/environment";
import {AuthService} from "../../../services/auth-service";
import {MembresiasService} from "../../../services/membresias-service";
import {ClientesMembresiasService} from "../../../services/clientes-membresias-service";
import {TipoIdentificacion} from "../../../enums/tipo-identificacion";

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
  membresia: any;

  paises: any[];
  estados: any[];

  pais: any;
  estado: any;

  filteredPaises: any[];
  filteredEstados: any[];
  filteredClientes: any[]; // Clientes filtrados para el autocompletado
  filteredMembresias: any[];

  loading: boolean = false;
  clientePolizaId;
  clientePoliza
  clienteMembresia

  numeroCertificado
  numeroMembresia
  parentesco

  first: number = 0;
  pageSize: number = 10;
  totalRecords: number = 0;

  busqueda: string = '';
  sortField
  sortOrder
  ROL_CLIENTE_ID = 3;
  ROL_ADMINISTRADOR_ID = 1;
  ESTADO_ACTIVO = 'A';
  validarEnable = false;
  validarCreacion = false;
  vigenciaMeses
  noMembresia = false
  tipoDocumentoIdentOptions: { label: string, value: string }[];

  constructor(
    private messageService: MessageService,
    private cargasFamiliaresService: CargaFamiliarService,
    private confirmationService: ConfirmationService,
    private clienteMembresiaService: ClientesMembresiasService,
    private paisesService: PaisesService,
    private estadosService: EstadosService,
    private route: ActivatedRoute,
    private membresiasService: MembresiasService,
    private usuariosService: UsuariosService,
    private authService: AuthService
  ) {
  }

  async ngOnInit() {
    this.loading = true
    this.clientePolizaId = +(await this.getRouteParams('clienteId'));

    if (!this.clientePolizaId) this.clientePolizaId = localStorage.getItem('clientePolizaId');

    this.clientePoliza = JSON.parse(localStorage.getItem('clientePoliza'));

    let user = await this.authService.obtenerUsuarioLoggeado();

    if (user.rol.id == this.ROL_ADMINISTRADOR_ID) this.validarEnable = true;
    if (user.rol.id != this.ROL_CLIENTE_ID) this.validarCreacion = true;

    await this.refrescarListado();
    await this.cargarMembresiasCliente()
    this.loading = false
  }

  async cargarMembresiasCliente(){
    console.log(this.clientePoliza.cliente)
    let response = await this.clienteMembresiaService.obtenerUsuariosMembresiaByUsuarioId(
      this.clientePoliza.cliente.id,
      0,
      1,
      "",
      "fechaFin",
      -1,
      "A")

    const clienteMembresiasTitular = response.data
    if (clienteMembresiasTitular.length >= 1 ){
      this.membresia = clienteMembresiasTitular[0].membresia;
      this.clienteMembresia = clienteMembresiasTitular[0]
      this.clienteMembresia.fechaInicio = new Date(this.clienteMembresia.fechaInicio + 'T23:59:00Z');
      this.clienteMembresia.fechaFin = new Date(this.clienteMembresia.fechaFin + 'T23:59:00Z');

      if (this.membresia.vigenciaMeses) {
        this.vigenciaMeses = `${this.membresia.vigenciaMeses} ${this.membresia.vigenciaMeses > 1 ? 'meses' : 'mes'}`;
      } else {
        this.vigenciaMeses = undefined;
      }
    }

    if (clienteMembresiasTitular.length == 0 ){
      this.noMembresia = true
      this.messageService.add({severity: 'error', summary: 'Error!', detail: 'El cliente titular no tiene una membresía en estado activo, no es posible crear cargas familiares'});
    }

  }

  private getRouteParams(param: string): Promise<string> {
    return new Promise((resolve) => {
      this.route.queryParams.subscribe((params) => resolve(params[param]));
    });
  }

  async filterMembresia(event) {
    const responseMembresia = await this.membresiasService.obtenerMembresiasByEstado(
      this.ESTADO_ACTIVO, 0, 10, event.query
    )

    this.filteredMembresias = responseMembresia.data;
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
    this.selectedCliente = null
    this.direccion = {};
    this.numeroCertificado = this.clientePoliza.numeroCertificado
    this.cargaFamiliar.fechaNacimiento = new Date();

    this.submitted = false;
    this.prepareData()
    this.cargaFamiliarDialog = true;
  }

  async prepareData() {
    this.paises = await this.paisesService.obtenerPaises();

    this.tipoDocumentoIdentOptions = Object.keys(TipoIdentificacion).map(key => {
      return { label: key, value: TipoIdentificacion[key] };
    });

  }

  async onPageChange(event) {
    this.loading = true;
    this.first = event.first;
    this.pageSize = event.rows;
    await this.refrescarListado();
    this.loading = false;
  }


  async editCargaFamiliar(cargaFamiliar: any) {
    this.cargaFamiliar = {...cargaFamiliar};
    this.selectedCliente = this.cargaFamiliar.cliente
    this.parentesco = this.cargaFamiliar.parentesco
    this.numeroCertificado = this.cargaFamiliar.numeroCertificado

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

      this.cargaFamiliar.parentesco = this.parentesco
      this.cargaFamiliar.numeroCertificado = this.numeroCertificado

      if (this.cargaFamiliar.id) {
        if (!this.selectedCliente?.id)
          this.cargaFamiliar.clienteId = this.selectedCliente.id

        await this.cargasFamiliaresService.updateCargaFamiliar(this.cargaFamiliar.id, this.cargaFamiliar);
      } else {
        if (!this.selectedCliente?.id) {
          this.direccion.paisId = this.pais?.id;
          this.direccion.estadoId = this.estado?.id;
          this.cargaFamiliar.direccion = this.direccion;
        } else
          this.cargaFamiliar.clienteId = this.selectedCliente.id

        this.cargaFamiliar.clienteMembresiaTitularId = this.clienteMembresia.id
        this.cargaFamiliar.codigoMembresia = this.numeroMembresia

        this.cargaFamiliar.rolId = this.ROL_CLIENTE_ID
        this.cargaFamiliar.estado = 'A';
        this.cargaFamiliar.clientePolizaTitularId = this.clientePolizaId;

        await this.cargasFamiliaresService.createCargaFamiliar(this.cargaFamiliar);
      }
      this.first = 0
      await this.refrescarListado();
      this.cargaFamiliarDialog = false;
      this.cargaFamiliar = {};
      this.messageService.add({severity: 'success', summary: 'Enhorabuena!', detail: 'Operación ejecutada con éxito'});
    } catch (error) {
      this.messageService.add({severity: 'error', summary: 'Error', detail: error.error});
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
