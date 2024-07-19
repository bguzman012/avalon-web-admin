import { Component, OnInit } from '@angular/core';
import {MessageService, SortEvent} from 'primeng/api';
import { BeneficiosService } from '../../../services/beneficios-service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth-service';
import { MembresiasService } from 'src/app/services/membresias-service';

@Component({
  selector: 'app-beneficios',
  templateUrl: './beneficios.component.html',
  styleUrls: ['./beneficios.component.scss'],
})
export class BeneficiosComponent implements OnInit {
  beneficioDialog: boolean;
  beneficios: any[];
  selectedBeneficios: any[];
  membresias: any[];
  submitted: boolean;
  beneficio: any;
  loading: boolean = false;
  activarCreate = false;

  ESTADO_ACTIVO = "A"

  membresiaId
  membresia

  first: number = 0;
  pageSize: number = 10;
  totalRecords: number = 0;

  busqueda: string = '';
  sortField
  sortOrder

  constructor(
    private messageService: MessageService,
    private beneficioService: BeneficiosService,
    private membresiasService: MembresiasService,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.loading = true;

    this.membresiaId = +(await this.getRouteParams('membresiaId'));

    if (!this.membresiaId)
      this.membresiaId = localStorage.getItem('membresiaId');


    this.membresia = JSON.parse(localStorage.getItem('membresia'));

    this.refrescarListado();
    let user = await this.authService.obtenerUsuarioLoggeado();
    if (user.rol.id === 1) this.activarCreate = true;
    this.loading = false;
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

  async openNew() {
    this.beneficio = {};
    this.membresia = {};
    this.submitted = false;
    const responseMembresias = await this.membresiasService.obtenerMembresiasByEstado(
      this.ESTADO_ACTIVO,
      0, 10, this.membresia.nombres
    );

    this.membresias = responseMembresias.data

    this.beneficioDialog = true;
  }

  async editBeneficio(beneficio: any) {
    this.beneficio = { ...beneficio };
    const responseMembresias = await this.membresiasService.obtenerMembresiasByEstado(
      this.ESTADO_ACTIVO,
      0, 10, this.membresia.nombres
    );

    this.membresias = responseMembresias.data
    this.beneficioDialog = true;
  }

  async deleteBeneficio(beneficio: any) {
    await this.beneficioService.eliminarBeneficio(beneficio.id)
    this.first = 0;
    this.refrescarListado();
    this.messageService.add({
      severity: 'success',
      summary: 'Enhorabuena!',
      detail: 'Registro eliminado exitosamente',
      life: 3000,
    });
  }

  hideDialog() {
    this.beneficioDialog = false;
    this.submitted = false;
  }

  async saveBeneficio() {
    this.submitted = true;
    this.loading = true;
    try {
      this.beneficio.membresiaId = this.membresiaId
      if (this.beneficio.id) {
        this.beneficio.membresiaId = this.membresiaId
        await this.beneficioService.actualizarBeneficio(this.beneficio.id, this.beneficio)
      } else {
        await this.beneficioService.guardarBeneficio(this.beneficio)
      }
      this.first = 0;
      this.refrescarListado();
      this.beneficioDialog = false;
      this.beneficio = {};
      this.messageService.add({
        severity: 'success',
        summary: 'Enhorabuena!',
        detail: 'Operación ejecutada con éxito',
        life: 3000,
      });
    } finally {
      this.loading = false;
    }
  }

  async onPageChange(event) {
    this.loading = true;
    this.first = event.first;
    this.pageSize = event.rows;
    await this.refrescarListado();
    this.loading = false;
  }

  async refrescarListado() {
    const response = await this.beneficioService.obtenerBeneficiosByMembresia(
      this.membresiaId,
      this.first / this.pageSize,
      this.pageSize,
      this.busqueda,
      this.sortField,
      this.sortOrder);

    this.beneficios = response.data
    this.totalRecords = response.totalRecords

  }



  private getRouteParams(param: string): Promise<string> {
    return new Promise((resolve) => {
      this.route.queryParams.subscribe((params) => resolve(params[param]));
    });
  }
}
