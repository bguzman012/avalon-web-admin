import { Component, OnInit } from '@angular/core';
import { ConfirmationService, SortEvent } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { EmpresasService } from '../../../services/empresas-service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth-service';
import {PaisesService} from "../../../services/paises-service";
import {EstadosService} from "../../../services/estados-service";

@Component({
  selector: 'app-empresas',
  templateUrl: './empresas.component.html',
  styles: [`
  :host ::ng-deep .p-dialog .product-image {
      width: 150px;
      margin: 0 auto 2rem auto;
      display: block;
  }
`],
  styleUrls: ['./empresas.component.scss'],
})

export class EmpresasComponent implements OnInit {
  empresaDialog: boolean;
  empresas: any[];
  selectedEmpresas: any[];
  submitted: boolean;
  empresa: any;
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

  activarCreate = false

  constructor(
    private messageService: MessageService,
    private empresasService: EmpresasService,
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
    this.empresa = {};
    this.submitted = false;
    this.empresaDialog = true;
  }

  editEmpresa(empresa: any) {
    this.empresa = { ...empresa };
    this.empresaDialog = true;
  }

  async deleteEmpresa(empresa: any) {
    this.confirmationService.confirm({
      message: 'Estás seguro de eliminar la empresa ' + empresa.nombre + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async  () => {
        await this.empresasService.eliminarEmpresa(empresa.id);
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
    this.empresaDialog = false;
    this.submitted = false;
  }

  async saveEmpresa() {
    this.submitted = true;
    this.loading = true; // Mostrar spinner
    try {

      if (this.empresa.id) {
        await this.empresasService.actualizarEmpresa(this.empresa.id, this.empresa);
      } else {
        await this.empresasService.guardarEmpresa(this.empresa);
      }
      this.first = 0;
      this.refrescarListado();
      this.empresaDialog = false;
      this.empresa = {};
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
    const response = await this.empresasService.obtenerEmpresas(
      this.first / this.pageSize,
      this.pageSize,
      this.busqueda,
      this.sortField,
      this.sortOrder
    );

    this.empresas = response.data;
    this.totalRecords = response.totalRecords;
  }

}
