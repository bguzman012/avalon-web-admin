import {Component, OnInit} from '@angular/core';
import {ConfirmationService, MessageService} from 'primeng/api';
import {UsuariosService} from '../../../services/usuarios-service';
import {environment} from '../../../../environments/environment';
import {FilterService} from "primeng/api";
import {AseguradorasService} from 'src/app/services/aseguradoras-service';
import {PolizasService} from 'src/app/services/polizas-service';
import {ComentariosCitasMedicasService} from 'src/app/services/comentarios-citas-medicas-service';
import {CitasMedicasService} from 'src/app/services/citas-medicas-service';
import {ClientePolizaService} from 'src/app/services/polizas-cliente-service';
import {ImagenesService} from 'src/app/services/imagenes-service';
import {ActivatedRoute} from '@angular/router';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {AuthService} from 'src/app/services/auth-service';
import {CentrosMedicosService} from "../../../services/centros-medicos-service";
import {MedicoCentroMedicoAseguradorasService} from "../../../services/med-centros-medicos-aseguradoras-service";
import {RequisitoAdicional} from "../../../enums/requisito-adicional";
import {CasosService} from "../../../services/casos-service";

@Component({
  selector: 'add-emergencias',
  templateUrl: './add-casos.component.html',
  styleUrls: ['./add-casos.component.scss'],
})
export class AddCasosComponent implements OnInit {
  citaMedicaDialog: boolean;
  submitted: boolean;
  casoId: number;

  caso: any = {};
  loading: boolean = false;

  clientes: any[]; // Lista de clientes para el autocompletado
  clientePolizas: any[]; // Lista de polizas para el autocompletado

  selectedCliente: any; // Cliente seleccionado en el filtro
  selectedClientePoliza: any; // Poliza seleccionada en el filtro

  filteredClientes: any[]; // Clientes filtrados para el autocompletado
  filteredPolizas: any[]; // Pólizas filtradas para el autocompletado

  ROL_CLIENTE_ID = 3;
  ESTADO_ACTIVO = 'A';
  clientePolizaId: number;
  clienteId: number;
  readOnlyForm = false

  codigoDocumento: string = 'Nuevo Caso'

  constructor(
    private messageService: MessageService,
    private casosService: CasosService,
    private usuariosService: UsuariosService,
    private route: ActivatedRoute,
    private clientesPolizasService: ClientePolizaService
  ) {
  }

  async ngOnInit() {
    this.loading = true;
    await this.prepareData();

    if (await this.getRouteParams('casoId')) {
      const caso = JSON.parse(localStorage.getItem('caso'));

      this.casoId = +(await this.getRouteParams('casoId'));
      this.caso = caso

      this.codigoDocumento = "# " + this.caso.codigo
      this.selectedCliente = this.caso.clientePoliza.cliente

      const clientePolizaParm = JSON.parse(localStorage.getItem("clientePoliza"))
      this.selectedClientePoliza = clientePolizaParm ? clientePolizaParm : this.caso.clientePoliza

      this.loading = false;

      if (caso.estado == 'C')
        this.readOnlyForm = true

      return
    }

    const clientePolizaParm = JSON.parse(localStorage.getItem("clientePoliza"))
    const casoParam = JSON.parse(localStorage.getItem("caso"))

    if (clientePolizaParm) {
      this.selectedClientePoliza = clientePolizaParm
      this.selectedCliente = clientePolizaParm.cliente
    }

    if (casoParam){
      this.caso = casoParam
      this.codigoDocumento = "# " + this.caso.codigo
    }

    this.loading = false;
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

  private getRouteParams(param: string): Promise<string> {
    return new Promise((resolve) => {
      this.route.queryParams.subscribe((params) => resolve(params[param]));
    });
  }

  hideDialog() {
    this.citaMedicaDialog = false;
    this.submitted = false;
  }

  async saveCitaMedica() {
    this.submitted = true;

    this.loading = true; // Mostrar spinner
    this.caso.clientePolizaId = this.selectedClientePoliza.id

    try {
      if (this.caso.id) {
        await this.casosService.actualizarCaso(this.caso.id, this.caso);
      } else {
        this.caso = await this.casosService.guardarCaso(this.caso);
        this.codigoDocumento = "# " + this.caso.codigo
      }

      this.loading = false;
      this.messageService.add({severity: 'success', summary: 'Enhorabuena!', detail: 'Operación ejecutada con éxito'});
    } catch (error) {
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'Error al guardar el caso'});
    } finally {
      this.loading = false; // Ocultar spinner
    }
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

    this.filteredPolizas = responseClientePoliza.data
  }

  async loadPolizas(esEdicion: boolean | null = false) {
    if (this.selectedCliente) {
      const responseClientePoliza = await this.clientesPolizasService.obtenerClientesPolizasPorCliente(
        this.selectedCliente.id,
        0,
        10,
        esEdicion ? this.selectedClientePoliza.codigo : "");

      this.clientePolizas = responseClientePoliza.data
    }
  }


}

