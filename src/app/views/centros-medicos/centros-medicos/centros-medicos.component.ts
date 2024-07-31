import { Component, OnInit } from '@angular/core';
import { ConfirmationService, SortEvent } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { CentrosMedicosService } from '../../../services/centros-medicos-service';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth-service';
import {PaisesService} from "../../../services/paises-service";
import {EstadosService} from "../../../services/estados-service";

@Component({
  selector: 'audits',
  templateUrl: './centros-medicos.component.html',
  styles: [`
  :host ::ng-deep .p-dialog .product-image {
      width: 150px;
      margin: 0 auto 2rem auto;
      display: block;
  }
`],
  styleUrls: ['./centros-medicos.component.scss'],
})

export class CentrosMedicosComponent implements OnInit {
  centroMedicoDialog: boolean;
  centrosMedicos: any[];
  selectedCentrosMedicos: any[];
  submitted: boolean;
  centroMedico: any;
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

  direccion: any;

  paises: any[];
  estados: any[];

  pais: any;
  estado: any;

  filteredPaises: any[];
  filteredEstados: any[];

  activarCreate = false

  constructor(
    private messageService: MessageService,
    private centrosMedicosService: CentrosMedicosService,
    private confirmationService: ConfirmationService,
    private paisesService: PaisesService,
    private estadosService: EstadosService,
    private router: Router,
    private authService: AuthService
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

  onSort(event: SortEvent) {
    if (event.field !== this.sortField || event.order !== this.sortOrder) {
      this.sortField = event.field;
      this.sortOrder = event.order;
      this.refrescarListado();
    }
  }

  openNew() {
    this.centroMedico = {};
    this.direccion = {};
    this.prepareData();
    this.submitted = false;
    this.centroMedicoDialog = true;
  }

  async prepareData() {
    this.paises = await this.paisesService.obtenerPaises();
  }

  async loadEstados() {
    if (this.pais.id)
      this.estados = await this.estadosService.obtenerEstadosByPais(
        this.pais.id
      );
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

  editCentroMedico(centroMedico: any) {
    this.centroMedico = { ...centroMedico };

    this.prepareData();
    if (this.centroMedico.direccion) {
      this.direccion = this.centroMedico.direccion;
      this.pais = this.direccion.pais;
    } else this.direccion = {};

    if (this.pais) this.loadEstados();

    if (this.direccion) this.estado = this.direccion.state;

    this.centroMedicoDialog = true;
  }

  async deleteCentroMedico(centroMedico: any) {
    this.confirmationService.confirm({
      message: 'Estás seguro de eliminar el centro médico ' + centroMedico.nombre + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async  () => {
        await this.centrosMedicosService.eliminarCentroMedico(centroMedico.id);
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

  hideDialog() {
    this.centroMedicoDialog = false;
    this.submitted = false;
  }

  async saveCentroMedico() {
    this.submitted = true;
    this.loading = true; // Mostrar spinner
    try {
      this.direccion.paisId = this.pais.id;
      this.direccion.estadoId = this.estado.id;
      this.centroMedico.direccion = this.direccion;

      if (this.centroMedico.id) {
        await this.centrosMedicosService.actualizarCentroMedico(this.centroMedico.id, this.centroMedico);
      } else {
        await this.centrosMedicosService.guardarCentroMedico(this.centroMedico);
      }
      this.first = 0;
      this.refrescarListado();
      this.centroMedicoDialog = false;
      this.centroMedico = {};
      this.messageService.add({severity:'success', summary:'Enhorabuena!', detail:'Operación ejecutada con éxito'});
    } finally {
      this.loading = false; // Ocultar spinner
    }
  }

  async onPageChange(event) {
    this.loading = true;
    this.first = event.first;
    this.pageSize = event.rows;
    await this.refrescarListado();
    this.loading = false;
  }

  async refrescarListado(){
    const response = await this.centrosMedicosService.obtenerCentrosMedicos(
      this.first / this.pageSize,
      this.pageSize,
      this.busqueda,
      this.sortField,
      this.sortOrder
    );

    this.centrosMedicos = response.data;
    this.totalRecords = response.totalRecords;
  }

}
