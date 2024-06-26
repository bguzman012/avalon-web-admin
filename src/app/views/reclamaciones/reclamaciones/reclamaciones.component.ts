import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ReclamacionesService } from '../../../services/reclamaciones-service';
import { UsuariosService } from '../../../services/usuarios-service';
import { environment } from '../../../../environments/environment';
import { FilterService } from "primeng/api";
import { AseguradorasService } from 'src/app/services/aseguradoras-service';
import { PolizasService } from 'src/app/services/polizas-service';
import { ClientePolizaService } from 'src/app/services/polizas-cliente-service';
import { Router } from '@angular/router';

@Component({
  selector: 'reclamaciones',
  templateUrl: './reclamaciones.component.html',
  styleUrls: ['./reclamaciones.component.scss'],
})
export class ReclamacionesComponent implements OnInit {
  reclamacionDialog: boolean;
  reclamaciones: any[];
  selectedReclamaciones: any[];
  submitted: boolean;
  reclamacion: any;
  loading: boolean = false;

  clientes: any[]; // Lista de clientes para el autocompletado
  aseguradoras: any[]; // Lista de aseguradoras para el autocompletado
  clientePolizas: any[]; // Lista de polizas para el autocompletado

  selectedCliente: any; // Cliente seleccionado en el filtro
  selectedAseguradora: any; // Aseguradora seleccionada en el filtro
  selectedClientePoliza: any; // Poliza seleccionada en el filtro

  filteredClientes: any[]; // Clientes filtrados para el autocompletado
  filteredAseguradoras: any[]; // Aseguradoras filtradas para el autocompletado
  filteredPolizas: any[]; // Pólizas filtradas para el autocompletado

  ROL_CLIENTE_ID = 3;
  ESTADO_ACTIVO = 'A';

  constructor(
    private messageService: MessageService,
    private reclamacionesService: ReclamacionesService,
    private aseguradorasService: AseguradorasService,
    private usuariosService: UsuariosService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private polizasService: PolizasService,
    private clientesPolizasService: ClientePolizaService,
    private filterService: FilterService
  ) { }

  async ngOnInit() {

    this.loading = true
    this.prepareData();
    this.reclamaciones = await this.reclamacionesService.obtenerReclamaciones("", "");
    this.loading = false
  }

  async prepareData() {
    this.clientes = await this.usuariosService.obtenerUsuariosPorRolAndEstado(
      this.ROL_CLIENTE_ID,
      this.ESTADO_ACTIVO
    );
  }


  filterGlobal(event: Event, dt: any) {
    dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openNew() {
    this.reclamacion = {};
    this.submitted = false;
    this.reclamacionDialog = true;
  }

  deleteSelectedReclamaciones() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected claims?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // Implementar lógica para eliminar reclamaciones seleccionadas
        this.selectedReclamaciones = [];
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Claims Deleted',
          life: 3000,
        });
      },
    });
  }

  async editReclamacion(reclamacion: any) {
    this.reclamacion = { ...reclamacion };
    let queryParamsClientePoliza = {}
    if (this.selectedClientePoliza && this.selectedClientePoliza.id) {
      queryParamsClientePoliza = {
        clientePolizaId: this.selectedClientePoliza.id,
        clienteId: this.selectedCliente.id
      };
    } 

    if (this.reclamacion && this.reclamacion.id) {
      localStorage.setItem('reclamacion', JSON.stringify(this.reclamacion));
      queryParamsClientePoliza['reclamacionId']= this.reclamacion.id
      this.router.navigate(['reclamaciones/detalle-reclamacion'], {
        queryParams: queryParamsClientePoliza,
      });
    }
 
    this.reclamacionDialog = true;
  }

  async deleteReclamacion(reclamacion: any) {
    this.confirmationService.confirm({
      message: 'Estás seguro de eliminar la reclamación?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        await this.reclamacionesService.eliminarReclamacion(reclamacion.id);
        await this.manageListado()

        this.messageService.add({
          severity: 'success',
          summary: 'Enhorabuena!',
          detail: 'Reclamación eliminada exitosamente',
          life: 3000,
        });
      },
    });
  }

  hideDialog() {
    this.reclamacionDialog = false;
    this.submitted = false;
  }

  async saveReclamacion() {
    this.submitted = true;
    this.loading = true; // Mostrar spinner
    try {
      if (this.reclamacion.id) {
        await this.reclamacionesService.actualizarReclamacion(this.reclamacion.id, this.reclamacion);
      } else {
        let reclamacionSaved = await this.reclamacionesService.guardarReclamacion(this.reclamacion);
      }

      await this.manageListado()

      this.reclamacionDialog = false;
      this.reclamacion = {};
      this.loading = false;
      this.messageService.add({ severity: 'success', summary: 'Enhorabuena!', detail: 'Operación ejecutada con éxito' });
    } finally {
      this.loading = false; // Ocultar spinner
    }
  }

  async refrescarListado(type) {
    if (type == "ALL")
      this.reclamaciones = await this.reclamacionesService.obtenerReclamaciones("", "");
    else
      this.reclamaciones = await this.reclamacionesService.obtenerReclamaciones("", this.selectedClientePoliza.id);
  }

  filterClientes(event): void {
    let query = event.query;
    this.filteredClientes = this.clientes.filter(cliente =>
      cliente.nombreUsuario.toLowerCase().indexOf(query.toLowerCase()) === 0);
  }

  filterAseguradoras(event): void {
    let query = event.query;
    this.filteredAseguradoras = this.aseguradoras.filter(aseguradora =>
      aseguradora.nombre.toLowerCase().indexOf(query.toLowerCase()) === 0);
  }

  filterPolizas(event): void {
    let query = event.query;
    this.filteredPolizas = this.clientePolizas.filter(obj =>
      obj.displayName.toLowerCase().indexOf(query.toLowerCase()) === 0);
  }

  async loadPolizas() {
    if (this.selectedCliente) {
      let clientePolizas = await this.clientesPolizasService.obtenerClientesPolizasPorCliente(this.selectedCliente.id);
      console.log(clientePolizas)
      if (clientePolizas) {
        clientePolizas = clientePolizas.map(obj => ({
          ...obj,
          displayName: `${obj.id}-${obj.poliza.nombre}`
        }));
        console.log(clientePolizas)

        this.clientePolizas = clientePolizas;
      }
    }
  }

  async manageListado() {
    if (this.selectedClientePoliza)
      await this.refrescarListado("CLIENTE_POLIZA");
    else
      await this.refrescarListado("ALL");
  }

  redirectToDetailReclamacionPage() {
    if (this.selectedClientePoliza && this.selectedClientePoliza.id) {
      const queryParamsClientePoliza = {
        clientePolizaId: this.selectedClientePoliza.id,
        clienteId: this.selectedCliente.id
      };
      this.router.navigate(['reclamaciones/detalle-reclamacion'], {
        queryParams: queryParamsClientePoliza,
      });
    } else {
      this.router.navigate(['reclamaciones/detalle-reclamacion']);
    }
  }

}
