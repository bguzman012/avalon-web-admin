import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CitasMedicasService } from '../../../services/citas-medicas-service';
import { UsuariosService } from '../../../services/usuarios-service';
import { environment } from '../../../../environments/environment';
import { FilterService } from "primeng/api";
import { AseguradorasService } from 'src/app/services/aseguradoras-service';
import { PolizasService } from 'src/app/services/polizas-service';
import { ClientePolizaService } from 'src/app/services/polizas-cliente-service';
import { Router } from '@angular/router';

@Component({
  selector: 'citas-medicas',
  templateUrl: './citas-medicas.component.html',
  styleUrls: ['./citas-medicas.component.scss'],
})
export class CitasMedicasComponent implements OnInit {
  citaMedicaDialog: boolean;
  citasMedicas: any[];
  selectedCitaMedicas: any[];
  submitted: boolean;
  citaMedica: any;
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
    private citasMedicasService: CitasMedicasService,
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
    this.citasMedicas = await this.citasMedicasService.obtenerCitasMedicas("", "");
    this.loading = false
  }

  async prepareData() {
    this.clientes = await this.usuariosService.obtenerUsuariosPorRolAndEstado(
      this.ROL_CLIENTE_ID,
      this.ESTADO_ACTIVO,
      0,
      10,
      ""
    );
  }


  filterGlobal(event: Event, dt: any) {
    dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openNew() {
    this.citaMedica = {};
    this.submitted = false;
    this.citaMedicaDialog = true;
  }

  deleteSelectedCitasMedicass() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected claims?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // Implementar lógica para eliminar citasMedicas seleccionadas
        this.selectedCitaMedicas = [];
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Claims Deleted',
          life: 3000,
        });
      },
    });
  }

  async editCitaMedica(citaMedica: any) {
    this.citaMedica = { ...citaMedica };
    let queryParamsClientePoliza = {}
    if (this.selectedClientePoliza && this.selectedClientePoliza.id) {
      queryParamsClientePoliza = {
        clientePolizaId: this.selectedClientePoliza.id,
        clienteId: this.selectedCliente.id
      };
    } 

    if (this.citaMedica && this.citaMedica.id) {
      localStorage.setItem('citaMedica', JSON.stringify(this.citaMedica));
      queryParamsClientePoliza['citaMedicaId']= this.citaMedica.id
      this.router.navigate(['citas-medicas/detalle-cita-medica'], {
        queryParams: queryParamsClientePoliza,
      });
    }
 
    this.citaMedicaDialog = true;
  }

  async deleteCitaMedica(citaMedica: any) {
    this.confirmationService.confirm({
      message: 'Estás seguro de eliminar la cita médica?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        await this.citasMedicasService.eliminarCitaMedica(citaMedica.id);
        await this.manageListado()

        this.messageService.add({
          severity: 'success',
          summary: 'Enhorabuena!',
          detail: 'Cita médica eliminada exitosamente',
          life: 3000,
        });
      },
    });
  }

  hideDialog() {
    this.citaMedicaDialog = false;
    this.submitted = false;
  }

  async saveCitaMedica() {
    this.submitted = true;
    this.loading = true; // Mostrar spinner
    try {
      if (this.citaMedica.id) {
        await this.citasMedicasService.actualizarCitaMedica(this.citaMedica.id, this.citaMedica);
      } else {
        let citaMedicaSaved = await this.citasMedicasService.guardarCitaMedica(this.citaMedica);
      }

      await this.manageListado()

      this.citaMedicaDialog = false;
      this.citaMedica = {};
      this.loading = false;
      this.messageService.add({ severity: 'success', summary: 'Enhorabuena!', detail: 'Operación ejecutada con éxito' });
    } finally {
      this.loading = false; // Ocultar spinner
    }
  }

  async refrescarListado(type) {
    if (type == "ALL")
      this.citasMedicas = await this.citasMedicasService.obtenerCitasMedicas("", "");
    else
      this.citasMedicas = await this.citasMedicasService.obtenerCitasMedicas("", this.selectedClientePoliza.id);
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

  redirectToDetailCitaMedicaPage() {
    if (this.selectedClientePoliza && this.selectedClientePoliza.id) {
      const queryParamsClientePoliza = {
        clientePolizaId: this.selectedClientePoliza.id,
        clienteId: this.selectedCliente.id
      };
      this.router.navigate(['citas-medicas/detalle-cita-medica'], {
        queryParams: queryParamsClientePoliza,
      });
    } else {
      this.router.navigate(['citas-medicas/detalle-cita-medica']);
    }
  }

}
