import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { AseguradorasService } from '../../../services/aseguradoras-service';
import { MembresiasService } from '../../../services/membresias-service';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-membresias',
  templateUrl: './membresias.component.html',
  styles: [`
  :host ::ng-deep .p-dialog .product-image {
      width: 150px;
      margin: 0 auto 2rem auto;
      display: block;
  }
`],
  styleUrls: ['./membresias.component.scss'],
})

export class MembresiasComponent implements OnInit {
  membresiaDialog: boolean;
  membresias: any[];
  selectedMembresias: any[];
  submitted: boolean;
  membresia: any;
  loading: boolean = false;
  aseguradoraId
  aseguradoras: any[]; // Lista de aseguradoras para el dropdown
  ESTADO_ACTIVO = 'A';

  constructor(
    private messageService: MessageService,
    private membresiasService: MembresiasService,
    private aseguradorasService: AseguradorasService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    this.aseguradoraId = +await this.getRouteParams('aseguradoraId');
    this.refrescarListado(this.ESTADO_ACTIVO);
    this.aseguradoras = await this.aseguradorasService.obtenerAseguradorasByEstado(this.ESTADO_ACTIVO); // Obtener lista de aseguradoras
  }

  filterGlobal(event: Event, dt: any) {
    dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openNew() {
    this.membresia = {};
    this.submitted = false;
    this.membresiaDialog = true;
  }

  editMembresia(membresia: any) {
    this.membresia = { ...membresia };
    this.membresiaDialog = true;
  }

  async deleteMembresia(membresia: any) {
    this.confirmationService.confirm({
      message: 'Estás seguro de eliminar la membresía ' + membresia.nombres + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        await this.membresiasService.eliminarMembresia(membresia.id);
        this.refrescarListado(this.ESTADO_ACTIVO);
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
    this.membresiaDialog = false;
    this.submitted = false;
  }

  async saveMembresia() {
    this.submitted = true;
    this.loading = true; // Mostrar spinner
    try {
      if (this.membresia.id) {
        this.membresia.aseguradoraId = this.membresia.aseguradoraId.id
        await this.membresiasService.actualizarMembresia(this.membresia.id, this.membresia);
      } else {
        console.log(this.membresia)
        this.membresia.aseguradoraId = this.membresia.aseguradoraId.id
        await this.membresiasService.guardarMembresia(this.membresia);
      }
      this.refrescarListado(this.ESTADO_ACTIVO);
      this.membresiaDialog = false;
      this.membresia = {};
      this.messageService.add({severity: 'success', summary: 'Enhorabuena!', detail: 'Operación ejecutada con éxito'});
    } finally {
      this.loading = false; // Ocultar spinner
    }
  }

  async refrescarListado(estado: string) {
    this.aseguradoraId = +await this.getRouteParams('aseguradoraId');
    this.membresias = await this.membresiasService.obtenerMembresiasByAseguradora(this.aseguradoraId); // Obtener lista de aseguradoras
  }

  private getRouteParams(param: string): Promise<string> {
    return new Promise((resolve) => {
      this.route.queryParams.subscribe(params => resolve(params[param]));
    });
  }

  redirectToMembresiasPage(membresia: any) {
    this.router.navigate(['aseguradoras/membresias/clientes'], { queryParams: { membresiaId: membresia.id } });
  }

}
