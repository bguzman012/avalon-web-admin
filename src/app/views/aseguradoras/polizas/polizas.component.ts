import {Component, OnInit} from '@angular/core';
import {MessageService, SortEvent} from 'primeng/api';
import {PolizasService} from '../../../services/polizas-service';
import {ClientePolizaService} from '../../../services/polizas-cliente-service';
import {ConfirmationService} from 'primeng/api';
import {AuthService} from 'src/app/services/auth-service';
import {ActivatedRoute, Router} from '@angular/router';
import {AseguradorasService} from 'src/app/services/aseguradoras-service';

@Component({
  selector: 'app-polizas',
  templateUrl: './polizas.component.html',
  styleUrls: ['./polizas.component.scss'],
})
export class PolizasComponent implements OnInit {
  polizaDialog: boolean;
  polizas: any[]; // Lista de pólizas
  selectedPolizas: any[];
  submitted: boolean;
  poliza: any;
  loading: boolean = false;
  user: any;
  aseguradoras: any[];
  filteredAseguradoras;
  aseguradora

  ESTADO_ACTIVO = 'A';
  TIPO_EMPRESA_ID = 1
  aseguradoraId
  polizaId

  first: number = 0;
  pageSize: number = 10;
  totalRecords: number = 0;

  busqueda: string = '';
  sortField
  sortOrder

  constructor(
    private messageService: MessageService,
    private polizasService: PolizasService,
    private confirmationService: ConfirmationService,
    private aseguradorasService: AseguradorasService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  async ngOnInit() {
    this.loading = true;
    this.user = await this.authService.obtenerUsuarioLoggeado();

    this.aseguradoraId = +(await this.getRouteParams('aseguradoraId'));

    if (!this.aseguradoraId)
      this.aseguradoraId = localStorage.getItem('aseguradoraId');

    this.aseguradora = JSON.parse(localStorage.getItem('aseguradora'));

    await this.refrescarListado();
    this.loading = false;
  }

  private getRouteParams(param: string): Promise<string> {
    return new Promise((resolve) => {
      this.route.queryParams.subscribe((params) => resolve(params[param]));
    });
  }

  async onPageChange(event) {
    this.loading = true;
    this.first = event.first;
    this.pageSize = event.rows;
    await this.refrescarListado();
    this.loading = false;
  }


  async filterGlobal(event: Event, dt: any) {
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

  redirectToCoberturasPage(poliza: any) {
    localStorage.setItem("polizaId", poliza.id);
    localStorage.setItem("aseguradoraId", poliza.aseguradora.id);
    localStorage.setItem("poliza", JSON.stringify(poliza));
    this.router.navigate(['aseguradoras/polizas/coberturas'], {
      queryParams: {
        polizaId: poliza.id,
        aseguradoraId: poliza.aseguradora.id
      },
    });
  }

  async openNew() {
    this.poliza = {};
    this.submitted = false;
    const responseAseguradora =
      await this.aseguradorasService.obtenerAseguradorasByEstado(
        this.ESTADO_ACTIVO,
        0,
        10,
        this.aseguradora.nombre
      );

    this.aseguradoras = responseAseguradora.data
    this.polizaDialog = true;
  }

  async editPoliza(poliza: any) {
    this.poliza = {...poliza};
    const responseAseguradora =
      await this.aseguradorasService.obtenerAseguradorasByEstado(
        this.ESTADO_ACTIVO,
        0,
        10,
        this.aseguradora.nombre
      );

    this.aseguradoras = responseAseguradora.data
    this.polizaDialog = true;
  }

  async filterAseguradoras(event) {
    const responseAseguradora =
      await this.aseguradorasService.obtenerAseguradorasByEstado(
        this.ESTADO_ACTIVO,
        0,
        10,
        event.query
      );

    this.filteredAseguradoras = responseAseguradora.data;
  }

  async deletePoliza(poliza: any) {
    this.confirmationService.confirm({
      message: 'Estás seguro de eliminar la póliza ' + poliza.nombre + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        await this.polizasService.eliminarPoliza(poliza.id);
        this.first = 0
        await this.refrescarListado();
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
    this.polizaDialog = false;
    this.submitted = false;
  }

  async savePoliza() {
    this.submitted = true;
    this.loading = true;

    try {
      if (this.poliza.id) {
        this.poliza.aseguradoraId = this.aseguradora.id
        await this.polizasService.actualizarPoliza(this.poliza.id, this.poliza);
      } else {
        this.poliza.aseguradoraId = this.aseguradora.id
        await this.polizasService.guardarPoliza(this.poliza);
      }

      this.first = 0
      await this.refrescarListado();
      this.polizaDialog = false;
      this.poliza = {};
      this.messageService.add({
        severity: 'success',
        summary: 'Enhorabuena!',
        detail: 'Operación ejecutada con éxito',
      });
    } finally {
      this.loading = false;
    }
  }

  redirectToMembresiasPage(poliza: any) {
    localStorage.setItem("polizaId", poliza.id);
    localStorage.setItem("aseguradoraId", poliza.aseguradora.id);
    localStorage.setItem("poliza", JSON.stringify(poliza));
    this.router.navigate(['aseguradoras/polizas/cliente-polizas'],
      {
        queryParams:
          {
            polizaId: poliza.id,
            aseguradoraId: poliza.aseguradora.id
          },
      });
  }

  async refrescarListado() {
    const response = await this.polizasService.obtenerPolizasByAseguradora(
      this.aseguradoraId,
      0,
      10,
      this.busqueda,
      this.sortField,
      this.sortOrder
    );

    this.polizas = response.data
    this.totalRecords = response.totalRecords;
  }
}
