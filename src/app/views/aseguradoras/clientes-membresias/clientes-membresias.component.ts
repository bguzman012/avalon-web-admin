import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { AseguradorasService } from '../../../services/aseguradoras-service';
import { MembresiasService } from '../../../services/membresias-service';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-clientes-membresias',
  templateUrl: './clientes-membresias.component.html',
  styles: [`
  :host ::ng-deep .p-dialog .product-image {
      width: 150px;
      margin: 0 auto 2rem auto;
      display: block;
  }
`],
  styleUrls: ['./clientes-membresias.component.scss'],
})

export class ClientesMembresiasComponent implements OnInit {
  clienteMembresiaDialog: boolean;
  clientesMembresia: any[]; // Lista de clientes membresía
  selectedClientesMembresia: any[];
  submitted: boolean;
  clienteMembresia: any;
  loading: boolean = false;
  aseguradoraId: number;
  aseguradoras: any[]; // Lista de aseguradoras para el dropdown
  ESTADO_ACTIVO = 'A';

  constructor(
    private messageService: MessageService,
    // private clientesMembresiaService: ClientesMembresiaService,
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
    this.clienteMembresia = {};
    this.submitted = false;
    this.clienteMembresiaDialog = true;
  }

  editClienteMembresia(clienteMembresia: any) {
    this.clienteMembresia = { ...clienteMembresia };
    this.clienteMembresiaDialog = true;
  }

  async deleteClienteMembresia(clienteMembresia: any) {
    // this.confirmationService.confirm({
    //   message: 'Estás seguro de eliminar la membresía ' + clienteMembresia.cliente + '?',
    //   header: 'Confirmar',
    //   icon: 'pi pi-exclamation-triangle',
    //   accept: async () => {
    //     await this.clientesMembresiaService.eliminarClienteMembresia(clienteMembresia.id);
    //     this.refrescarListado(this.ESTADO_ACTIVO);
    //     this.messageService.add({
    //       severity: 'success',
    //       summary: 'Enhorabuena!',
    //       detail: 'Registro eliminado exitosamente',
    //       life: 3000,
    //     });
    //   },
    // });
  }

  hideDialog() {
    this.clienteMembresiaDialog = false;
    this.submitted = false;
  }

  async saveClienteMembresia() {
    // this.submitted = true;
    // this.loading = true; // Mostrar spinner
    // try {
    //   if (this.clienteMembresia.id) {
    //     await this.clientesMembresiaService.actualizarClienteMembresia(this.clienteMembresia.id, this.clienteMembresia);
    //   } else {
    //     await this.clientesMembresiaService.guardarClienteMembresia(this.clienteMembresia);
    //   }
    //   this.refrescarListado(this.ESTADO_ACTIVO);
    //   this.clienteMembresiaDialog = false;
    //   this.clienteMembresia = {};
    //   this.messageService.add({severity: 'success', summary: 'Enhorabuena!', detail: 'Operación ejecutada con éxito'});
    // } finally {
    //   this.loading = false; // Ocultar spinner
    // }
  }

  async refrescarListado(estado: string) {
    // this.aseguradoraId = +await this.getRouteParams('aseguradoraId');
    // this.clientesMembresia = await this.clientesMembresiaService.obtenerClientesMembresiaByAseguradora(this.aseguradoraId); // Obtener lista de clientes membresía
  }

  private getRouteParams(param: string): Promise<string> {
    return new Promise((resolve) => {
      this.route.queryParams.subscribe(params => resolve(params[param]));
    });
  }


}
