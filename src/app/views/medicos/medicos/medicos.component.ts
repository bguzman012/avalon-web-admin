import { Component, OnInit } from '@angular/core';
import {ConfirmationService, MessageService, SortEvent} from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientePolizaService } from 'src/app/services/polizas-cliente-service';
import {MedicoService} from "../../../services/medicos-service";
import {PaisesService} from "../../../services/paises-service";
import {EstadosService} from "../../../services/estados-service";
import {environment} from "../../../../environments/environment";
import {EspecialidadService} from "../../../services/especialidades-service";

@Component({
  selector: 'medicos',
  templateUrl: './medicos.component.html',
  styles: [`
  :host ::ng-deep .p-dialog .product-image {
      width: 150px;
      margin: 0 auto 2rem auto;
      display: block;
  }
`],
  styleUrls: ['./medicos.component.scss'],
})
export class MedicosComponent implements OnInit {
  medicoDialog: boolean;
  medicos: any[];
  selectedMedicos: any[];
  submitted: boolean;
  medico: any;
  loading: boolean = false;
  clientePolizaId;
  clientePoliza

  first: number = 0;
  pageSize: number = 10;
  totalRecords: number = 0;

  busqueda: string = '';
  sortField
  sortOrder

  direccion: any;
  especialidad: any;

  paises: any[];
  estados: any[];

  pais: any;
  estado: any;

  filteredPaises: any[];
  filteredEstados: any[];
  filteredEspecialidades

  constructor(
    private messageService: MessageService,
    private medicosService: MedicoService,
    private confirmationService: ConfirmationService,
    private paisesService: PaisesService,
    private estadosService: EstadosService,
    private especialidadesService: EspecialidadService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  async ngOnInit() {
    await this.refrescarListado();
  }

  async filterGlobal(event: Event, dt: any) {
    this.first = 0;
    this.busqueda = (event.target as HTMLInputElement).value;
    if (this.busqueda.length == 0 || this.busqueda.length >= 3)
      await this.refrescarListado();

  }

  async filterEspecialidad(event) {
    const responseMembresia = await this.especialidadesService.getEspecialidades(
      0,
      10,
      event.query
    )

    this.filteredEspecialidades = responseMembresia.data;
  }


  async onSort(event: SortEvent) {
    if (event.field !== this.sortField || event.order !== this.sortOrder) {
      this.loading = true
      this.sortField = event.field;
      this.sortOrder = event.order;
      await this.refrescarListado();
      this.loading = false
    }
  }

  openNew() {
    this.medico = {};
    this.direccion = {};
    this.prepareData();
    this.submitted = false;
    this.medicoDialog = true;
  }

  async prepareData() {
    this.paises = await this.paisesService.obtenerPaises();
  }

  async loadEstados() {
    if (this.pais.id)
      this.estados = await this.estadosService.obtenerEstadosByPais(
        this.pais.id
      );
  }

  filterPaises(event): void {
    let query = event.query;
    this.filteredPaises = this.paises.filter(
      (pais) => pais.nombre.toLowerCase().indexOf(query.toLowerCase()) === 0
    );
  }

  filterEstados(event): void {
    let query = event.query;
    this.filteredEstados = this.estados.filter(
      (obj) => obj.nombre.toLowerCase().indexOf(query.toLowerCase()) === 0
    );
  }

  async onPageChange(event) {
    this.loading = true;
    this.first = event.first;
    this.pageSize = event.rows;
    await this.refrescarListado();
    this.loading = false;
  }


  async editMedico(medico: any) {
    this.medico = { ...medico };

    this.prepareData();
    if (this.medico.direccion) {
      this.direccion = this.medico.direccion;
      this.pais = this.direccion.pais;
    } else this.direccion = {};

    if (this.pais) this.loadEstados();

    if (this.direccion) this.estado = this.direccion.state;

    this.especialidad = this.medico.especialidad;

    this.medicoDialog = true;
  }

  async deleteMedico(medico: any) {
    this.confirmationService.confirm({
      message: 'Estás seguro de eliminar este médico?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        await this.medicosService.deleteMedico(medico.id);
        this.first = 0
        await this.refrescarListado();

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
    this.medicoDialog = false;
    this.submitted = false;
  }

  async saveMedico() {
    this.submitted = true;
    this.loading = true; // Mostrar spinner
    try {
      this.medico.especialidadId = this.especialidad.id
      this.direccion.paisId = this.pais.id;
      this.direccion.estadoId = this.estado.id;
      this.medico.direccion = this.direccion;
      console.log(this.medico)

      if (this.medico.id) {
        await this.medicosService.updateMedico(this.medico.id, this.medico);
      } else {
        this.medico.estado = 'A';
        await this.medicosService.createMedico(this.medico);
      }
      this.first = 0
      await this.refrescarListado();
      this.medicoDialog = false;
      this.medico = {};
      this.messageService.add({ severity: 'success', summary: 'Enhorabuena!', detail: 'Operación ejecutada con éxito' });
    } finally {
      this.loading = false; // Ocultar spinner
    }
  }

  async refrescarListado() {
    const response = await this.medicosService.getMedicos(
      this.first / this.pageSize,
      this.pageSize,
      this.busqueda,
      this.sortField,
      this.sortOrder)

    this.medicos = response.data;
    this.totalRecords = response.totalRecords;

  }

  redirectToCentroMedicoAseguradorasPage(medico: any) {
    localStorage.setItem('medicoId', medico.id);
    localStorage.setItem("medico", JSON.stringify(medico));
    this.router.navigate(['medicos/centros-medicos-aseguradoras'], {
      queryParams: {
        medicoId: medico.id,
      },
    });
  }
}
