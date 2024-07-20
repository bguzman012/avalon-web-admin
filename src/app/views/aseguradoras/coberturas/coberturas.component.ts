import { Component, OnInit } from '@angular/core';
import {MessageService, SortEvent} from 'primeng/api';
import { CoberturasService } from '../../../services/coberturas-service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth-service';
import { PolizasService } from 'src/app/services/polizas-service';

@Component({
  selector: 'app-coberturas',
  templateUrl: './coberturas.component.html',
  styleUrls: ['./coberturas.component.scss'],
})
export class CoberturasComponent implements OnInit {
  coberturaDialog: boolean;
  coberturas: any[];
  selectedCoberturas: any[];
  polizas: any[];
  submitted: boolean;
  cobertura: any;
  loading: boolean = false;
  activarCreate = false;

  ESTADO_ACTIVO = "A"

  polizaId: number;
  poliza: any;

  aseguradoraId: number;
  aseguradora: any;

  first: number = 0;
  pageSize: number = 10;
  totalRecords: number = 0;

  busqueda: string = '';
  sortField
  sortOrder


  constructor(
    private messageService: MessageService,
    private coberturaService: CoberturasService,
    private polizasService: PolizasService,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.loading = true;

    this.aseguradoraId = +(await this.getRouteParams('aseguradoraId'));

    if (!this.aseguradoraId) {
      this.aseguradoraId = +localStorage.getItem('aseguradoraId');
    }

    this.polizaId = +(await this.getRouteParams('polizaId'));

    if (!this.polizaId) {
      this.polizaId = +localStorage.getItem('polizaId');
    }

    this.poliza = JSON.parse(localStorage.getItem('poliza'));

    await this.refrescarListado();
    let user = await this.authService.obtenerUsuarioLoggeado();
    if (user.rol.id === 1) this.activarCreate = true;
    this.loading = false;
  }

 async  filterGlobal(event: Event, dt: any) {
    this.first = 0;
    this.busqueda = (event.target as HTMLInputElement).value;
    if (this.busqueda.length == 0 || this.busqueda.length >= 3)
      await this.refrescarListado();

    // dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
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

  async openNew() {
    this.cobertura = {};
    this.submitted = false;

    const response = await this.polizasService.obtenerPolizasByAseguradora(
      this.aseguradoraId,
      0,
      10,
      this.poliza.nombre
    );

    this.polizas = response.data

    this.coberturaDialog = true;
  }

  async editCobertura(cobertura: any) {
    this.cobertura = { ...cobertura };
    const response = await this.polizasService.obtenerPolizasByAseguradora(
      this.aseguradoraId,
      0,
      10,
      this.poliza.nombre
    );

    this.polizas = response.data
    this.coberturaDialog = true;
  }

  async deleteCobertura(cobertura: any) {
    await this.coberturaService.eliminarCobertura(cobertura.id);
    this.first = 0
    await this.refrescarListado();
    this.messageService.add({
      severity: 'success',
      summary: 'Enhorabuena!',
      detail: 'Registro eliminado exitosamente',
      life: 3000,
    });
  }

  hideDialog() {
    this.coberturaDialog = false;
    this.submitted = false;
  }

  async saveCobertura() {
    this.submitted = true;
    this.loading = true;
    try {
      this.cobertura.polizaId = this.polizaId;
      if (this.cobertura.id) {
        await this.coberturaService.actualizarCobertura(this.cobertura.id, this.cobertura);
      } else {
        await this.coberturaService.guardarCobertura(this.cobertura);
      }
      this.first = 0
      await this.refrescarListado();
      this.coberturaDialog = false;
      this.cobertura = {};
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
    const response = await this.coberturaService.obtenerCoberturasByPoliza(
      this.polizaId,
      this.first / this.pageSize,
      this.pageSize,
      this.busqueda,
      this.sortField,
      this.sortOrder);

    this.coberturas = response.data
    this.totalRecords = response.totalRecords

  }

  private getRouteParams(param: string): Promise<string> {
    return new Promise((resolve) => {
      this.route.queryParams.subscribe((params) => resolve(params[param]));
    });
  }
}
