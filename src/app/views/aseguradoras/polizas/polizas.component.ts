import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { PolizasService } from '../../../services/polizas-service';
import { ClientePolizaService } from '../../../services/polizas-cliente-service';
import { ConfirmationService } from 'primeng/api';
import { AuthService } from 'src/app/services/auth-service';
import { ActivatedRoute, Router } from '@angular/router';
import { AseguradorasService } from 'src/app/services/aseguradoras-service';

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



  constructor(
    private messageService: MessageService,
    private polizasService: PolizasService,
    private clientePolizaService: ClientePolizaService,
    private confirmationService: ConfirmationService,
    private aseguradorasService: AseguradorasService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  async ngOnInit() {
    this.loading = true;
    this.user = await this.authService.obtenerUsuarioLoggeado();

    this.aseguradoraId = +(await this.getRouteParams('aseguradoraId'));

    if (!this.aseguradoraId)
      this.aseguradoraId = localStorage.getItem('aseguradoraId');

    this.refrescarListado();
    this.loading = false;
  }

  private getRouteParams(param: string): Promise<string> {
    return new Promise((resolve) => {
      this.route.queryParams.subscribe((params) => resolve(params[param]));
    });
  }

  async openNew() {
    this.poliza = {};
    this.submitted = false;
    this.aseguradoras =
      await this.aseguradorasService.obtenerAseguradorasByEstado(
        this.ESTADO_ACTIVO
      );

      if (this.aseguradoraId)
        this.aseguradora = this.aseguradoras.find(x => x.id == this.aseguradoraId);

    this.polizaDialog = true;
  }

  
  filterGlobal(event: Event, dt: any) {
    dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  async editPoliza(poliza: any) {
    this.poliza = { ...poliza };
    this.aseguradoras =
    await this.aseguradorasService.obtenerAseguradorasByEstado(
      this.ESTADO_ACTIVO
    );

    if (this.aseguradoraId)
      this.aseguradora = this.aseguradoras.find(x => x.id == this.aseguradoraId);

    this.polizaDialog = true;
  }

  filterAseguradoras(event) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.aseguradoras.length; i++) {
      let aseguradora = this.aseguradoras[i];
      if (aseguradora.nombre.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(aseguradora);
      }
    }

    this.filteredAseguradoras = filtered;
  }

  async deletePoliza(poliza: any) {
    this.confirmationService.confirm({
      message: 'Estás seguro de eliminar la póliza ' + poliza.nombre + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        await this.polizasService.eliminarPoliza(poliza.id);
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

      this.refrescarListado();
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
    this.router.navigate(['aseguradoras/polizas/cliente-polizas'], { queryParams: { polizaId: poliza.id } });
  }

  async refrescarListado() {
    this.polizas = await this.polizasService.obtenerPolizasByAseguradora(this.aseguradoraId);
  }
}