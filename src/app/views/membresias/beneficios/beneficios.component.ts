import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
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
    this.membresias =
    await this.membresiasService.obtenerMembresiasByEstado(
      this.ESTADO_ACTIVO
    );

    this.membresiaId = +(await this.getRouteParams('membresiaId'));

    if (!this.membresiaId)
      this.membresiaId = localStorage.getItem('membresiaId');

    this.membresia = this.membresias.find(x => x.id === this.membresiaId)

    this.refrescarListado();
    let user = await this.authService.obtenerUsuarioLoggeado();
    if (user.rol.id === 1) this.activarCreate = true;
    this.loading = false;
  }

  filterGlobal(event: Event, dt: any) {
    dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openNew() {
    this.beneficio = {};
    this.submitted = false;
    this.beneficioDialog = true;
  }

  editBeneficio(beneficio: any) {
    this.beneficio = { ...beneficio };
    this.beneficioDialog = true;
  }

  async deleteBeneficio(beneficio: any) {
    await this.beneficioService.eliminarBeneficio(beneficio.id)
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

  async refrescarListado() {
    this.beneficios = await this.beneficioService.obtenerBeneficiosByMembresia(this.membresiaId)
  }

  private getRouteParams(param: string): Promise<string> {
    return new Promise((resolve) => {
      this.route.queryParams.subscribe((params) => resolve(params[param]));
    });
  }
}
