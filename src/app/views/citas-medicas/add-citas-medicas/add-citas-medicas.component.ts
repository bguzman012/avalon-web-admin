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

@Component({
  selector: 'add-emergencias',
  templateUrl: './add-citas-medicas.component.html',
  styleUrls: ['./add-citas-medicas.component.scss'],
})
export class AddCitasMedicasComponent implements OnInit {
  citaMedicaDialog: boolean;
  submitted: boolean;
  citaMedica: any;
  loading: boolean = false;

  clientes: any[]; // Lista de clientes para el autocompletado
  aseguradoras: any[]; // Lista de aseguradoras para el autocompletado
  clientePolizas: any[]; // Lista de polizas para el autocompletado

  selectedCliente: any; // Cliente seleccionado en el filtro
  selectedClientePoliza: any; // Poliza seleccionada en el filtro

  filteredClientes: any[]; // Clientes filtrados para el autocompletado
  filteredAseguradoras: any[]; // Aseguradoras filtradas para el autocompletado
  filteredPolizas: any[]; // Pólizas filtradas para el autocompletado

  ROL_CLIENTE_ID = 3;
  ESTADO_ACTIVO = 'A';
  clientePolizaId: number;
  clienteId: number;
  citaMedicaId: number;
  displayDialog: boolean = false;
  imagenCambiadaEdit: boolean = false;
  editImage = false
  readOnlyForm = false

  imagePreview: SafeUrl | null = null; // Utilizamos SafeUrl para la URL segura de la imagen

  comentarios: any[] = [];
  nuevoComentario: string = '';
  imagen
  nombreDocumento
  filteredCentrosMedicos
  filteredMedicoCentroMedicoAseguradoras

  medicoCentroMedicoAseguradora: any;
  centroMedico: any;

  requisitosAdicionales: { [key in RequisitoAdicional]: boolean } = {
    [RequisitoAdicional.VIAJES]: false,
    [RequisitoAdicional.HOSPEDAJE]: false,
    [RequisitoAdicional.SER_TRANSPORTE]: false,
    [RequisitoAdicional.AMB_TERRESTRE]: false,
    [RequisitoAdicional.AMB_AEREA]: false,
    [RequisitoAdicional.SILLA_RUEDAS]: false,
    [RequisitoAdicional.RECETA_MEDICA]: false
  };

  RequisitoAdicionalMapping = {
    "VIAJES": "VIAJES",
    "HOSPEDAJE": "HOSPEDAJE",
    "SER. TRANSPORTE": "SER_TRANSPORTE",
    "AMB. TERRESTRE": "AMB_TERRESTRE",
    "AMB. AEREA": "AMB_AEREA",
    "SILLA RUEDAS": "SILLA_RUEDAS",
    "RECETA MEDICA": "RECETA_MEDICA"
  };

  codigoDocumento: string = 'Nueva Cita Médica'

  constructor(
    private messageService: MessageService,
    private citasMedicasService: CitasMedicasService,
    private usuariosService: UsuariosService,
    private comentariosCitasMedicasService: ComentariosCitasMedicasService,
    private medicoCentroMedicoAseguradoraService: MedicoCentroMedicoAseguradorasService,
    private imagenService: ImagenesService,
    private centrosMedicosService: CentrosMedicosService,
    private route: ActivatedRoute,
    private clientesPolizasService: ClientePolizaService,
    private authService: AuthService
  ) {
  }

  async ngOnInit() {
    this.loading = true;
    this.openNew();
    await this.prepareData();

    if (await this.getRouteParams('citaMedicaId')) {
      this.nombreDocumento = 'Cargando ...'
      const citaMedica = JSON.parse(localStorage.getItem('citaMedica'));

      this.citaMedicaId = +(await this.getRouteParams('citaMedicaId'));
      this.citaMedica = citaMedica

      this.initializeRequisitosAdicionales(this.citaMedica.requisitosAdicionales);
      this.citaMedica.fechaTentativa = new Date(this.citaMedica.fechaTentativa + 'T23:59:00Z');

      this.codigoDocumento = "# " + this.citaMedica.codigo
      this.selectedCliente = this.citaMedica.clientePoliza.cliente

      const responseCliente = await this.usuariosService.obtenerUsuariosPorRolAndEstado(
        this.ROL_CLIENTE_ID,
        this.ESTADO_ACTIVO,
        0,
        10,
        this.selectedCliente.nombreUsuario
      );

      this.clientes = responseCliente.data

      const clientePolizaParm = JSON.parse(localStorage.getItem("clientePoliza"))
      this.selectedClientePoliza = clientePolizaParm ? clientePolizaParm : this.citaMedica.clientePoliza
      this.medicoCentroMedicoAseguradora = this.citaMedica.medicoCentroMedicoAseguradora
      this.centroMedico = this.citaMedica.medicoCentroMedicoAseguradora.centroMedico

      await this.loadPolizas(true);
      this.comentarios = await this.comentariosCitasMedicasService.getComentariosByCitaMedica(this.citaMedicaId);
      this.loading = false;

      if (citaMedica.imagenId) {
        let foto = await this.imagenService.getImagen(citaMedica.imagenId);
        this.imagen = foto.documento
        this.nombreDocumento = foto.nombreDocumento
      }
      // this.citaMedica.fotoReclamo = citaMedicaFoto.fotoReclamo

      if (this.imagen) {
        this.imagePreview = this.imagen;
      } else {
        this.nombreDocumento = undefined
      }

      if (citaMedica.estado == 'C')
        this.readOnlyForm = true

      return
    }

    if (await this.getRouteParams('clientePolizaId'))
      this.clientePolizaId = +(await this.getRouteParams('clientePolizaId'));

    if (this.clientePolizaId) {
      this.clienteId = +(await this.getRouteParams('clienteId'));
      await this.prepareClientePolizaData();
    }

    this.loading = false;
  }

  initializeRequisitosAdicionales(requisitos: { [key: string]: boolean }): void {
    for (const key of Object.keys(this.requisitosAdicionales)) {
      const backendKey = this.RequisitoAdicionalMapping[key as RequisitoAdicional];
      this.requisitosAdicionales[key as RequisitoAdicional] = requisitos[backendKey] || false;
    }
  }

  async addComentario() {
    this.loading = true
    let currentUser = await this.authService.obtenerUsuarioLoggeado();
    const comentario = {
      citaMedicaId: this.citaMedicaId,
      contenido: this.nuevoComentario,
      usuarioComentaId: currentUser.id,
      estado: 'A' // Estado activo
    };

    try {
      await this.comentariosCitasMedicasService.createComentario(comentario);
      this.nuevoComentario = '';
      await this.loadComentarios();
      this.messageService.add({
        severity: 'success',
        summary: 'Comentario añadido',
        detail: 'Comentario añadido con éxito'
      });
      this.loading = false
    } catch (error) {
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'Error al añadir el comentario'});
      this.loading = false
    }
  }

  async cerrarTramite() {
    this.loading = true
    let currentUser = await this.authService.obtenerUsuarioLoggeado();
    const comentario = {
      citaMedicaId: this.citaMedicaId,
      contenido: this.nuevoComentario,
      usuarioComentaId: currentUser.id,
      estado: 'C' // Estado activo
    };

    await this.citasMedicasService.partiallyUpdateCitaMedica(this.citaMedica.id, 'C')

    this.readOnlyForm = true

    try {
      await this.comentariosCitasMedicasService.createComentario(comentario);
      this.nuevoComentario = '';
      await this.loadComentarios();
      this.messageService.add({
        severity: 'success',
        summary: 'Comentario añadido',
        detail: 'Cita médica cerrada con éxito'
      });
      this.loading = false
    } catch (error) {
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'Error al añadir el comentario'});
      this.loading = false
    }
  }

  async deleteComentario(comentarioId: number) {
    try {
      await this.comentariosCitasMedicasService.deleteComentario(comentarioId);
      await this.loadComentarios();
      this.messageService.add({
        severity: 'success',
        summary: 'Comentario eliminado',
        detail: 'Comentario eliminado con éxito'
      });
    } catch (error) {
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'Error al eliminar el comentario'});
    }
  }

  async loadComentarios() {
    try {
      this.comentarios = await this.comentariosCitasMedicasService.getComentariosByCitaMedica(this.citaMedicaId);
    } catch (error) {
      console.error('Error al cargar los comentarios', error);
    }
  }

  onFileSelect(event) {
    if (this.citaMedica)
      this.editImage = true;

    const file = event.files[0];
    this.imagen = file;
    this.nombreDocumento = this.imagen.name

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);

    this.imagenCambiadaEdit = true
  }

  clearImageSelection(fileUploadRef) {
    if (this.citaMedica)
      this.editImage = true;

    this.imagen = null;
    this.nombreDocumento = null
    this.imagePreview = null;
    fileUploadRef.clear(); // Limpiar la selección de archivo en el componente de carga
  }

  showDialogImage() {
    this.displayDialog = true;
  }

  hideDialogImage() {
    this.displayDialog = false;
  }

  async prepareClientePolizaData() {
    this.selectedCliente = this.clientes.find(x => x.id === this.clienteId);
    await this.loadPolizas();
    this.selectedClientePoliza = this.clientePolizas.find(x => x.id === this.clientePolizaId);
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

  openNew() {
    this.citaMedica = {};
    this.centroMedico = null;

    this.submitted = false;
    this.citaMedicaDialog = true;
  }

  hideDialog() {
    this.citaMedicaDialog = false;
    this.submitted = false;
  }

  async saveCitaMedica() {
    this.submitted = true;

    if (!this.imagen) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error!',
        detail: 'Imagen es requerido',
        life: 3000,
      });
      return
    }

    if (!this.medicoCentroMedicoAseguradora?.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error!',
        detail: 'Médico es requerido',
        life: 3000,
      });
      return
    }

    this.loading = true; // Mostrar spinner
    const formData = new FormData();
    this.citaMedica.medicoCentroMedicoAseguradoraId = this.medicoCentroMedicoAseguradora.id
    this.citaMedica.clientePolizaId = this.selectedClientePoliza.id
    this.citaMedica.nombreDocumento = this.nombreDocumento
    const requisitosAdicionalesBackend = {};

    for (const [key, value] of Object.entries(this.requisitosAdicionales)) {
      requisitosAdicionalesBackend[this.RequisitoAdicionalMapping[key]] = value;
    }

    this.citaMedica.requisitosAdicionales = requisitosAdicionalesBackend

    formData.append('citaMedica', new Blob([JSON.stringify(this.citaMedica)], {type: 'application/json'}));

    if (this.imagen && this.imagenCambiadaEdit) {
      formData.append('fotoCitaMedica', this.imagen);
    }

    try {
      if (this.citaMedica.id) {
        await this.citasMedicasService.actualizarCitaMedica(this.citaMedica.id, formData);
      } else {

        let citaSaved = await this.citasMedicasService.guardarCitaMedica(formData);
        this.codigoDocumento = "# " + citaSaved.codigo
      }

      this.loading = false;
      this.messageService.add({severity: 'success', summary: 'Enhorabuena!', detail: 'Operación ejecutada con éxito'});
    } catch (error) {
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'Error al guardar la cita médica'});
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

  async filterCentrosMedicos(event) {
    const responseCliente = await this.centrosMedicosService.obtenerCentrosMedicos(
      0,
      10,
      event.query
    )

    this.filteredCentrosMedicos = responseCliente.data;
  }

  async filterMedicoCentroMedicoAseguradora(event) {
    const responseMedicoCentroMedicoAseguradora = await this.medicoCentroMedicoAseguradoraService.obtenerMedicoCentroMedicoAseguradorasByAseguradoraAndCentroMedico(
      this.selectedClientePoliza.poliza.aseguradora.id,
      this.centroMedico.id,
      0,
      10,
      event.query
    )

    this.filteredMedicoCentroMedicoAseguradoras = responseMedicoCentroMedicoAseguradora.data;
  }

}

