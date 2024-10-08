import {Component, Input, OnInit, SimpleChanges} from '@angular/core';
import {ConfirmationService, MessageService, SortEvent} from 'primeng/api';
import {CitasMedicasService} from '../../../services/citas-medicas-service';
import {UsuariosService} from '../../../services/usuarios-service';
import {environment} from '../../../../environments/environment';
import {FilterService} from "primeng/api";
import {AseguradorasService} from 'src/app/services/aseguradoras-service';
import {PolizasService} from 'src/app/services/polizas-service';
import {ClientePolizaService} from 'src/app/services/polizas-cliente-service';
import {Router} from '@angular/router';
import {CasosService} from "../../../services/casos-service";

@Component({
  selector: 'app-citas',
  templateUrl: './citas-medicas.component.html',
  styleUrls: ['./citas-medicas.component.scss'],
})
export class CitasMedicasComponent implements OnInit {
  @Input() originCaso: boolean = false;
  @Input() caso: any;

  citaMedicaDialog: boolean;
  citasMedicas: any[];
  selectedCitasMedicas: any[];
  submitted: boolean;
  citaMedica: any;
  loading: boolean = false;

  clientes: any[]; // Lista de clientes para el autocompletado
  aseguradoras: any[]; // Lista de aseguradoras para el autocompletado
  clientePolizas: any[]; // Lista de polizas para el autocompletado

  selectedCliente: any; // Cliente seleccionado en el filtro
  selectedClientePoliza: any; // Poliza seleccionada en el filtro
  selectedCaso: any; // Poliza seleccionada en el filtro


  filteredClientes: any[]; // Clientes filtrados para el autocompletado
  filteredAseguradoras: any[]; // Aseguradoras filtradas para el autocompletado
  filteredPolizas: any[]; // Pólizas filtradas para el autocompletado
  filteredCasos: any[]; // Pólizas filtradas para el autocompletado


  ROL_CLIENTE_ID = 3;
  ESTADO_ACTIVO = 'A';

  first: number = 0;
  pageSize: number = 10;
  totalRecords: number = 0;

  busqueda: string = '';
  sortField
  sortOrder


  async ngOnInit() {

    this.loading = true
    if (!this.originCaso) {
      this.prepareData();
      const response = await this.citasMedicasService.obtenerCitasMedicas(
        "",
        "",
        0,
        this.pageSize,
        "",
        this.sortField,
        this.sortOrder);

      this.citasMedicas = response.data;
      this.totalRecords = response.totalRecords;
    }else
      this.pageSize = 5

    this.loading = false
    console.log(this.caso, "CASO ")
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['caso']) {
      await this.onChangeCaso()
    }
  }

  getEstadoLabel(estado: string): string {
    switch (estado) {
      case 'C':
        return 'CERRADO';
      case 'N':
        return 'POR GESTIONAR';
      case 'G':
        return 'GESTIONANDO';
      case 'I':
        return 'ELIMINADO';
      default:
        return 'DRAFT';
    }
  }


  constructor(
    private messageService: MessageService,
    private citasMedicasService: CitasMedicasService,
    private usuariosService: UsuariosService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private clientesPolizasService: ClientePolizaService,
    private casosService: CasosService
  ) {
  }

  async filterCasos(event) {
    let query = event.query;

    const filteredCasos = await this.casosService.obtenerCasos(
      0,
      10,
      query,
      this.selectedClientePoliza?.id ? this.selectedClientePoliza?.id : "");

    this.filteredCasos = filteredCasos.data
  }

  async onChangeCaso() {
    if (this.caso?.id) {
      const response = await this.citasMedicasService.obtenerCitasMedicas(
        "",
        this.caso.clientePoliza.id,
        0,
        this.pageSize,
        "",
        this.sortField,
        this.sortOrder,
        this.caso.id);

      this.citasMedicas = response.data;
      this.totalRecords = response.totalRecords;
      this.selectedClientePoliza = this.caso.clientePoliza
      this.selectedCliente = this.caso.clientePoliza.cliente
      this.selectedCaso = this.caso
    }
  }

  async prepareData() {
    const responseCliente = await this.usuariosService.obtenerUsuariosPorRolAndEstado(
      this.ROL_CLIENTE_ID,
      this.ESTADO_ACTIVO,
      0,
      10,
      ""
    );

    this.clientes = responseCliente.data
  }

  async filterGlobal(event: Event, dt: any) {
    this.first = 0;
    this.busqueda = (event.target as HTMLInputElement).value;
    if (this.busqueda.length == 0 || this.busqueda.length >= 3)
      await this.manageListado()
    // dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  async editCitaMedica(citaMedica: any) {
    this.citaMedica = {...citaMedica};
    let redirect = !this.originCaso ? 'citas-medicas/detalle-cita-medica' : 'casos/detalle-caso/detalle-cita-medica';

    let queryParamsClientePoliza = {}
    if (this.selectedCaso?.id) {
      queryParamsClientePoliza = {
        clientePolizaId: this.selectedClientePoliza.id,
        clienteId: this.selectedCliente.id,
        casoId: this.selectedCaso.id,
        originCaso: this.originCaso
      };
    }

    if (this.citaMedica && this.citaMedica.id) {
      localStorage.setItem('citaMedica', JSON.stringify(this.citaMedica));
      queryParamsClientePoliza['citaMedicaId'] = this.citaMedica.id
      this.router.navigate([redirect], {
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
        if (citaMedica.estado != "N")
          return this.messageService.add({
            severity: 'error',
            summary: 'Error!',
            detail: 'No es posible eliminar una cita médica en estado GESTIONANDO o CERRADO',
            life: 3000,
          });

        this.loading = true
        await this.citasMedicasService.eliminarCitaMedica(citaMedica.id);
        this.first = 0
        await this.manageListado()
        this.loading = false

        this.messageService.add({
          severity: 'success',
          summary: 'Enhorabuena!',
          detail: 'Cita médica eliminada exitosamente',
          life: 3000,
        });
      },
    });
  }

  async refrescarListado(type) {
    console.log(this.selectedClientePoliza, this.selectedCaso)
    let response;
    if (type == "ALL")
      response = await this.citasMedicasService.obtenerCitasMedicas(
        "",
        "",
        this.first / this.pageSize,
        this.pageSize,
        this.busqueda,
        this.sortField,
        this.sortOrder,
        "");
    else
      response = await this.citasMedicasService.obtenerCitasMedicas(
        "",
        this.selectedClientePoliza.id,
        this.first / this.pageSize,
        this.pageSize,
        this.busqueda,
        this.sortField,
        this.sortOrder,
        this.selectedCaso.id);

    this.citasMedicas = response.data
    this.totalRecords = response.totalRecords
  }

  async filterClientes(event) {
    let query = event.query;

    const responseCliente = await this.usuariosService.obtenerUsuariosPorRolAndEstado(
      this.ROL_CLIENTE_ID,
      this.ESTADO_ACTIVO,
      0,
      10,
      query
    );

    this.filteredClientes = responseCliente.data
  }

  async filterPolizas(event) {
    let query = event.query;

    const responseClientePoliza = await this.clientesPolizasService.obtenerClientesPolizasPorCliente(
      this.selectedCliente.id,
      0,
      10,
      query);

    this.filteredPolizas = responseClientePoliza.data;

  }

  async onPageChange(event) {
    this.loading = true;
    this.first = event.first;
    this.pageSize = event.rows;
    await this.manageListado();
    this.loading = false;
  }


  async onSort(event: SortEvent) {
    if (event.field !== this.sortField || event.order !== this.sortOrder) {
      this.loading = true
      this.sortField = event.field;
      this.sortOrder = event.order;
      await this.manageListado();
      this.loading = false
    }
  }


  async loadPolizas() {
    if (this.selectedCliente?.id) {
      const responseClientePoliza = await this.clientesPolizasService.obtenerClientesPolizasPorCliente(
        this.selectedCliente.id,
        0,
        10,
        "");

      this.clientePolizas = responseClientePoliza.data
    }
  }

  async manageListado() {
    console.log(this.selectedCaso, " SELECT ")
    if (this.selectedCaso)
      await this.refrescarListado("CLIENTE_POLIZA");
    else
      await this.refrescarListado("ALL");
  }

  redirectToDetailCitaMedicaPage() {
    let redirect = !this.originCaso ? 'citas-medicas/detalle-cita-medica' : 'casos/detalle-caso/detalle-cita-medica';

    if (this.selectedCaso?.id) {
      localStorage.setItem("clientePoliza", JSON.stringify(this.selectedClientePoliza));
      localStorage.setItem("caso", JSON.stringify(this.selectedCaso));
      localStorage.removeItem('citaMedica')
      const queryParamsClientePoliza = {
        clientePolizaId: this.selectedClientePoliza.id,
        clienteId: this.selectedCliente.id,
        casoId: this.selectedCaso.id,
        originCaso: this.originCaso
      };
      this.router.navigate([redirect], {
        queryParams: queryParamsClientePoliza,
      });
      return
    }

    localStorage.removeItem("clientePoliza");
    localStorage.removeItem("caso");
    localStorage.removeItem('citaMedica')

    this.router.navigate([redirect]);

  }

}
