import {Component, OnInit} from '@angular/core';
import {ConfirmationService, SortEvent} from 'primeng/api';
import {MessageService} from 'primeng/api';
import {AseguradorasService} from '../../../services/aseguradoras-service';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from 'src/app/services/auth-service';
import {MedicoCentroMedicoAseguradorasService} from "../../../services/med-centros-medicos-aseguradoras-service";
import {MedicoService} from "../../../services/medicos-service";
import {CentrosMedicosService} from "../../../services/centros-medicos-service";

@Component({
  selector: 'med-audits-aseguradoras',
  templateUrl: './med-centros-medicos-aseguradoras.component.html',
  styles: [
    `
      :host ::ng-deep .p-dialog .product-image {
        width: 150px;
        margin: 0 auto 2rem auto;
        display: block;
      }
    `,
  ],
  styleUrls: ['./med-centros-medicos-aseguradoras.component.scss'],
})
export class MedCentrosMedicosAseguradorasComponent implements OnInit {
  medicoCentroMedicoAseguradoraDialog: boolean;
  selectedMedicoCentroMedicoAseguradoras: any[];
  submitted: boolean;
  medicoCentroMedicoAseguradora: any;
  loading: boolean = false;

  aseguradora: any;
  medico: any;
  centroMedico: any;

  aseguradoraId;
  medicoId;

  aseguradoras: any[];
  medicos: any[];

  medicoCentroMedicoAseguradoras: any[];

  ESTADO_ACTIVO = 'A';

  ROL_ASESOR_ID = 2;
  ROL_CLIENTE_ID = 3;

  filteredAseguradoras;
  filteredCentrosMedicos;

  nombreCompletoMedico: string = ''

  vigenciaMeses

  user

  first: number = 0;
  pageSize: number = 10;
  totalRecords: number = 0;

  busqueda: string = '';
  sortField
  sortOrder

  constructor(
    private messageService: MessageService,
    private aseguradorasService: AseguradorasService,
    private medicoService: MedicoService,
    private centrosMedicosService: CentrosMedicosService,
    private medicoCentroMedicoAseguradoraService: MedicoCentroMedicoAseguradorasService,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) {
  }

  async ngOnInit() {
    this.loading = true
    this.medicoId = +(await this.getRouteParams('medicoId'));

    if (!this.medicoId)
      this.medicoId = localStorage.getItem('medicoId');

    this.medico = JSON.parse(localStorage.getItem('medico'));

    this.nombreCompletoMedico  = `${this.medico?.nombres} ${this.medico?.nombresDos} ${this.medico?.apellidos} ${this.medico?.apellidosDos}`

    this.user = await this.authService.obtenerUsuarioLoggeado()

    await this.refrescarListado();
    this.loading = false

  }

  async filterGlobal(event: Event, dt: any) {
    this.first = 0;
    this.busqueda = (event.target as HTMLInputElement).value;
    if (this.busqueda.length == 0 || this.busqueda.length >= 3)
      await this.refrescarListado();

    // dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  async onSort(event: SortEvent) {
    if (event.field !== this.sortField || event.order !== this.sortOrder) {
      this.sortField = event.field;
      this.sortOrder = event.order;
      await this.refrescarListado();
    }
  }
  //
  // async prepareData() {
  //   const responseCliente = await this.medicoService.obtenerUsuariosPorRolAndEstado(
  //     this.ROL_CLIENTE_ID,
  //     this.ESTADO_ACTIVO,
  //     0,
  //     10,
  //     this.medico.nombreUsuario
  //   );
  //
  //   const responseAsesor =
  //     await this.medicoService.obtenerUsuariosPorRolAndEstado(
  //       this.ROL_ASESOR_ID,
  //       this.ESTADO_ACTIVO,
  //       0,
  //       10,
  //       this.user.rol.id == this.ROL_ASESOR_ID || this.asesor ? this.asesor.nombreUsuario : ""
  //     );
  //
  //   const responseMembresia =
  //     await this.aseguradorasService.obtenerMembresiasByEstado(
  //       this.ESTADO_ACTIVO,
  //       0,
  //       10,
  //       this.membresia ? this.membresia.nombres : ""
  //     );
  //
  //   this.medicos = responseCliente.data;
  //   this.asesores = responseAsesor.data;
  //   this.membresias = responseMembresia.data;
  //
  // }

  async openNew() {
    this.medicoCentroMedicoAseguradora = {};
    this.loading = true

    // await this.prepareData()

    this.aseguradora = null;
    this.centroMedico = null;

    this.submitted = false;
    this.medicoCentroMedicoAseguradoraDialog = true;
    this.loading = false
  }

  async editMedicoCentroMedicoAseguradora(medicoCentroMedicoAseguradora: any) {
    this.medicoCentroMedicoAseguradora = {...medicoCentroMedicoAseguradora};

    this.aseguradora = this.medicoCentroMedicoAseguradora.aseguradora;
    this.centroMedico = this.medicoCentroMedicoAseguradora.centroMedico;

    // await this.prepareData()

    this.medicoCentroMedicoAseguradoraDialog = true;
  }

  async deleteMedicoCentroMedicoAseguradora(medicoCentroMedicoAseguradora: any) {
    // this.confirmationService.confirm({
    //   message: 'Estás seguro de eliminar la membresía ' + medicoCentroMedicoAseguradora.medico + '?',
    //   header: 'Confirmar',
    //   icon: 'pi pi-exclamation-triangle',
    //   accept: async () => {
    //     await this.medicosMembresiaService.eliminarMedicoCentroMedicoAseguradora(medicoCentroMedicoAseguradora.id);
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

  async onPageChange(event) {
    this.loading = true;
    this.first = event.first;
    this.pageSize = event.rows;
    await this.refrescarListado();
    this.loading = false;
  }


  hideDialog() {
    this.medicoCentroMedicoAseguradoraDialog = false;
    this.submitted = false;
  }

  async saveMedicoCentroMedicoAseguradora() {
    this.submitted = true;
    this.loading = true; // Mostrar spinner

    try {
      if (this.medicoCentroMedicoAseguradora.id) {
        let medicoCentroMedicoAseguradoraToUpdate = {
          aseguradoraId: this.aseguradora.id,
          medicoId: this.medico.id,
          centroMedicoId: this.centroMedico.id
        }
        await this.medicoCentroMedicoAseguradoraService.actualizarmedicoCentroMedicoAseguradora(
          this.medicoCentroMedicoAseguradora.id, medicoCentroMedicoAseguradoraToUpdate
        );
        // await this.guardarMedicoCentroMedicoAseguradora.actualizarMedicoCentroMedicoAseguradora(this.medicoCentroMedicoAseguradora.id, this.medicoCentroMedicoAseguradora);
      } else {
        this.medicoCentroMedicoAseguradora.aseguradoraId = this.aseguradora.id;
        this.medicoCentroMedicoAseguradora.centroMedicoId = this.centroMedico.id;
        this.medicoCentroMedicoAseguradora.medicoId = this.medico.id;

        console.log(this.medicoCentroMedicoAseguradora)

        let medicoCentroMedicoAseguradora = await this.medicoCentroMedicoAseguradoraService.guardarmedicoCentroMedicoAseguradora(
          this.medicoCentroMedicoAseguradora
        );
        console.log(medicoCentroMedicoAseguradora)
      }
      this.first = 0;
      await this.refrescarListado();
      this.medicoCentroMedicoAseguradoraDialog = false;
      this.medicoCentroMedicoAseguradora = {};
      this.messageService.add({
        severity: 'success',
        summary: 'Enhorabuena!',
        detail: 'Operación ejecutada con éxito',
      });
    } catch (error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error!',
          detail: error.error,
          life: 3000,
        });
        return

    } finally {
      this.loading = false; // Ocultar spinner
    }
  }

  async refrescarListado() {
    const response = await this.medicoCentroMedicoAseguradoraService.obtenerMedicoCentroMedicoAseguradorasByMedicoId(
      this.medicoId,
      this.first / this.pageSize,
      this.pageSize,
      this.busqueda,
      this.sortField,
      this.sortOrder
    );

    this.medicoCentroMedicoAseguradoras = response.data
    this.totalRecords = response.totalRecords;

  }

  private getRouteParams(param: string): Promise<string> {
    return new Promise((resolve) => {
      this.route.queryParams.subscribe((params) => resolve(params[param]));
    });
  }

  async filterAseguradoras(event) {
    const responseMembresia = await this.aseguradorasService.obtenerAseguradorasByEstado(
      this.ESTADO_ACTIVO,
      0,
      10,
      event.query
    )

    this.filteredAseguradoras = responseMembresia.data;
  }

  async filterCentrosMedicos(event) {
    const responseCliente = await this.centrosMedicosService.obtenerCentrosMedicos(
      0,
      10,
      event.query
    )

    this.filteredCentrosMedicos = responseCliente.data;
  }

}
