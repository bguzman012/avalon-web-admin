import { Component, OnInit } from '@angular/core';
import { ConfirmationService, SortEvent } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { BrokersService } from '../../../services/brokers-service';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth-service';

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
  brokerDialog: boolean;
  brokers: any[];
  selectedBrokers: any[];
  submitted: boolean;
  broker: any;
  loading: boolean = false;
  ESTADO_ACTIVO = 'A'
  ROL_ADMINISTRADOR_ID = 1
  TIPO_EMPRESA_ID = 2

  first: number = 0;
  pageSize: number = 10;
  totalRecords: number = 0;

  busqueda: string = '';
  sortField
  sortOrder
  
  activarCreate = false

  constructor(
    private messageService: MessageService,
    private brokersService: BrokersService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.loading = true
    this.refrescarListado(this.ESTADO_ACTIVO);
    let user = await this.authService.obtenerUsuarioLoggeado()
    if (user.rol.id == this.ROL_ADMINISTRADOR_ID) this.activarCreate = true
    this.loading = false
  }

  filterGlobal(event: Event, dt: any) {
    this.first = 0;
    this.busqueda = (event.target as HTMLInputElement).value;
    if (this.busqueda.length == 0 || this.busqueda.length >= 3)
      this.refrescarListado(this.ESTADO_ACTIVO);

    // dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  onSort(event: SortEvent) {
    if (event.field !== this.sortField || event.order !== this.sortOrder) {
      this.sortField = event.field;
      this.sortOrder = event.order;
      this.refrescarListado(this.ESTADO_ACTIVO);
    }
  }

  openNew() {
    this.broker = {};
    this.submitted = false;
    this.brokerDialog = true;
  }
  
  editBroker(broker: any) {
    this.broker = { ...broker };
    this.brokerDialog = true;
  }

  async deleteBroker(broker: any) {
    this.confirmationService.confirm({
      message: 'Estás seguro de eliminar el broker ' + broker.nombre + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async  () => {
        await this.brokersService.eliminarBroker(broker.id);
        this.first = 0;
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
    this.brokerDialog = false;
    this.submitted = false;
  }
  
  async saveBroker() {
    this.submitted = true;
    this.loading = true; // Mostrar spinner
    try {
      if (this.broker.id) {
        await this.brokersService.actualizarBroker(this.broker.id, this.broker);
      } else {
        await this.brokersService.guardarBroker(this.broker);
      }
      this.first = 0;
      this.refrescarListado(this.ESTADO_ACTIVO);
      this.brokerDialog = false;
      this.broker = {};
      this.messageService.add({severity:'success', summary:'Enhorabuena!', detail:'Operación ejecutada con éxito'});
    } finally {
      this.loading = false; // Ocultar spinner
    }
  }

  async onPageChange(event) {
    this.loading = true;
    this.first = event.first;
    this.pageSize = event.rows;
    await this.refrescarListado(this.ESTADO_ACTIVO);
    this.loading = false;
  }

  async refrescarListado(estado){
    const response = await this.brokersService.obtenerBrokersByEstado(
      estado, 
      this.first / this.pageSize,
      this.pageSize,
      this.busqueda,
      this.sortField,
      this.sortOrder);
    this.brokers = response.data;
    this.totalRecords = response.totalRecords;
  }

  redirectToAgentesPage(broker: any) {
    localStorage.setItem("brokerId", broker.id);
    localStorage.setItem('broker', JSON.stringify(broker));
      
    this.router.navigate(['brokers/agentes'], { queryParams: { brokerId: broker.id } });
  }
}
