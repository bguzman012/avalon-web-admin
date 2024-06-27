import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
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

    this.polizas = await this.polizasService.obtenerPolizasByAseguradora(this.aseguradoraId);

    this.poliza = this.polizas.find(x => x.id === this.polizaId);

    this.refrescarListado();
    let user = await this.authService.obtenerUsuarioLoggeado();
    if (user.rol.id === 1) this.activarCreate = true;
    this.loading = false;
  }

  filterGlobal(event: Event, dt: any) {
    dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openNew() {
    this.cobertura = {};
    this.submitted = false;
    this.coberturaDialog = true;
  }

  editCobertura(cobertura: any) {
    this.cobertura = { ...cobertura };
    this.coberturaDialog = true;
  }

  async deleteCobertura(cobertura: any) {
    await this.coberturaService.eliminarCobertura(cobertura.id);
    this.refrescarListado();
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
      this.refrescarListado();
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

  async refrescarListado() {
    this.coberturas = await this.coberturaService.obtenerCoberturasByPoliza(this.polizaId);
  }

  private getRouteParams(param: string): Promise<string> {
    return new Promise((resolve) => {
      this.route.queryParams.subscribe((params) => resolve(params[param]));
    });
  }
}
