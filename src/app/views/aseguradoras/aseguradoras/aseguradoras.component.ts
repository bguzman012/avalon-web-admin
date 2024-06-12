import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { AseguradorasService } from '../../../services/aseguradoras-service';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'aseguradoras',
  templateUrl: './aseguradoras.component.html',
  styles: [`
  :host ::ng-deep .p-dialog .product-image {
      width: 150px;
      margin: 0 auto 2rem auto;
      display: block;
  }
`],
  styleUrls: ['./aseguradoras.component.scss'],
})

export class AseguradorasComponent implements OnInit {
  aseguradoraDialog: boolean;
  aseguradoras: any[];
  selectedAseguradoras: any[];
  submitted: boolean;
  aseguradora: any;
  loading: boolean = false;
  ESTADO_ACTIVO = 'A'

  constructor(
    private messageService: MessageService,
    private aseguradorasService: AseguradorasService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.refrescarListado(this.ESTADO_ACTIVO);
  }

  filterGlobal(event: Event, dt: any) {
    dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openNew() {
    this.aseguradora = {};
    this.submitted = false;
    this.aseguradoraDialog = true;
  }
  
  editAseguradora(aseguradora: any) {
    this.aseguradora = { ...aseguradora };
    this.aseguradoraDialog = true;
  }

  async deleteAseguradora(aseguradora: any) {
    this.confirmationService.confirm({
      message: 'Estás seguro de eliminar la aseguradora ' + aseguradora.nombre + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async  () => {
        await this.aseguradorasService.eliminarAseguradora(aseguradora.id);
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
    this.aseguradoraDialog = false;
    this.submitted = false;
  }
  
  async saveAseguradora() {
    this.submitted = true;
    this.loading = true; // Mostrar spinner
    try {
      if (this.aseguradora.id) {
        await this.aseguradorasService.actualizarAseguradora(this.aseguradora.id, this.aseguradora);
      } else {
        await this.aseguradorasService.guardarAseguradora(this.aseguradora);
      }
      this.refrescarListado(this.ESTADO_ACTIVO);
      this.aseguradoraDialog = false;
      this.aseguradora = {};
      this.messageService.add({severity:'success', summary:'Enhorabuena!', detail:'Operación ejecutada con éxito'});
    } finally {
      this.loading = false; // Ocultar spinner
    }
  }

  async refrescarListado(estado){
    this.aseguradoras = await this.aseguradorasService.obtenerAseguradorasByEstado(estado);
  }

  redirectToMembresiasPage(aseguradora: any) {
    this.router.navigate(['aseguradoras/membresias'], { queryParams: { aseguradoraId: aseguradora.id } });
  }
}
