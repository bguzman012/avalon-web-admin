import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CargaFamiliarService } from '../../../services/cargas-familiares-service';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientePolizaService } from 'src/app/services/polizas-cliente-service';

@Component({
  selector: 'cargas-familiares',
  templateUrl: './cargas-familiares.component.html',
  styles: [`
  :host ::ng-deep .p-dialog .product-image {
      width: 150px;
      margin: 0 auto 2rem auto;
      display: block;
  }
`],
  styleUrls: ['./cargas-familiares.component.scss'],
})
export class CargasFamiliaresComponent implements OnInit {
  cargaFamiliarDialog: boolean;
  cargasFamiliares: any[];
  selectedCargasFamiliares: any[];
  submitted: boolean;
  cargaFamiliar: any;
  loading: boolean = false;
  clientePolizaId;
  clientePoliza

  constructor(
    private messageService: MessageService,
    private cargasFamiliaresService: CargaFamiliarService,
    private confirmationService: ConfirmationService,
    private clientePolizaService: ClientePolizaService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  async ngOnInit() {
    
    this.clientePolizaId = +(await this.getRouteParams('clienteId'));
    
    if (!this.clientePolizaId) this.clientePolizaId = localStorage.getItem('clientePolizaId');

    this.clientePoliza = await this.clientePolizaService.obtenerClientePoliza(this.clientePolizaId)
    console.log(this.clientePoliza)
    
    await this.refrescarListado();
  }

  private getRouteParams(param: string): Promise<string> {
    return new Promise((resolve) => {
      this.route.queryParams.subscribe((params) => resolve(params[param]));
    });
  }

  filterGlobal(event: Event, dt: any) {
    dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openNew() {
    this.cargaFamiliar = {};
    this.submitted = false;
    this.cargaFamiliarDialog = true;
  }

  deleteSelectedCargasFamiliares() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected family members?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // Implementar lógica para eliminar cargas familiares seleccionadas
        this.selectedCargasFamiliares = [];
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Family Members Deleted',
          life: 3000,
        });
      },
    });
  }

  async editCargaFamiliar(cargaFamiliar: any) {
    this.cargaFamiliar = { ...cargaFamiliar };
    this.cargaFamiliarDialog = true;
  }

  async deleteCargaFamiliar(cargaFamiliar: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this family member?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        await this.cargasFamiliaresService.deleteCargaFamiliar(cargaFamiliar.id);
        this.refrescarListado();

        this.messageService.add({
          severity: 'success',
          summary: 'Enhorabuena!',
          detail: 'Registro inhabilitado exitosamente',
          life: 3000,
        });
      },
    });
  }

  hideDialog() {
    this.cargaFamiliarDialog = false;
    this.submitted = false;
  }

  async saveCargaFamiliar() {
    this.submitted = true;
    this.loading = true; // Mostrar spinner
    try {
      this.cargaFamiliar.clientePolizaId = this.clientePolizaId;

      if (this.cargaFamiliar.id) {
        await this.cargasFamiliaresService.updateCargaFamiliar(this.cargaFamiliar.id, this.cargaFamiliar);
      } else {
        await this.cargasFamiliaresService.createCargaFamiliar(this.cargaFamiliar);
      }
      this.refrescarListado();
      this.cargaFamiliarDialog = false;
      this.cargaFamiliar = {};
      this.messageService.add({ severity: 'success', summary: 'Enhorabuena!', detail: 'Operación ejecutada con éxito' });
    } finally {
      this.loading = false; // Ocultar spinner
    }
  }

  async refrescarListado() {
    this.cargasFamiliares = await this.cargasFamiliaresService.getCargasFamiliaresByClientePoliza(this.clientePolizaId);
  }
}
