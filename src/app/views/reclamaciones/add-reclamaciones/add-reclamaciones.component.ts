import {Component, OnInit} from '@angular/core';
import {ConfirmationService, MessageService} from 'primeng/api';
import {ReclamacionesService} from '../../../services/reclamaciones-service';
import {UsuariosService} from '../../../services/usuarios-service';
import {environment} from '../../../../environments/environment';
import {FilterService} from "primeng/api";
import {AseguradorasService} from 'src/app/services/aseguradoras-service';
import {PolizasService} from 'src/app/services/polizas-service';
import {ComentariosService} from 'src/app/services/comentarios-service';
import {ClientePolizaService} from 'src/app/services/polizas-cliente-service';
import {ImagenesService} from 'src/app/services/imagenes-service';
import {ActivatedRoute} from '@angular/router';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {AuthService} from 'src/app/services/auth-service';
import {CentrosMedicosService} from "../../../services/centros-medicos-service";
import {MedicoCentroMedicoAseguradorasService} from "../../../services/med-centros-medicos-aseguradoras-service";
import {TipoAdm} from "../../../enums/tipo-adm";
import {CasosService} from "../../../services/casos-service";

@Component({
  selector: 'add-reclamaciones',
  templateUrl: './add-reclamaciones.component.html',
  styleUrls: ['./add-reclamaciones.component.scss'],
})
export class AddReclamacionesComponent implements OnInit {
  reclamacionDialog: boolean;
  reclamaciones: any[];
  submitted: boolean;
  reclamacion: any;
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

  casoId: number;

  ROL_CLIENTE_ID = 3;
  ESTADO_ACTIVO = 'A';
  clientePolizaId: number;
  clienteId: number;
  reclamacionId: number;
  displayDialog: boolean = false;
  editImage = false
  readOnlyForm = false
  imagePreview: SafeUrl | null = null; // Utilizamos SafeUrl para la URL segura de la imagen

  comentarios: any[] = [];
  nuevoComentario: string = '';
  imagen
  nombreDocumento
  codigoDocumento: string = 'Nuevo Reclamo'

  filteredCentrosMedicos
  filteredMedicoCentroMedicoAseguradoras

  medicoCentroMedicoAseguradora: any;
  centroMedico: any;

  tipoAdmOptions: { label: string, value: string }[];
  selectedTipoAdm: TipoAdm;
  imagenCambiadaEdit: boolean = false;

  originCaso: boolean = false

  constructor(
    private messageService: MessageService,
    private reclamacionesService: ReclamacionesService,
    private usuariosService: UsuariosService,
    private comentariosService: ComentariosService,
    private imagenService: ImagenesService,
    private centrosMedicosService: CentrosMedicosService,
    private route: ActivatedRoute,
    private clientesPolizasService: ClientePolizaService,
    private authService: AuthService,
    private medicoCentroMedicoAseguradoraService: MedicoCentroMedicoAseguradorasService,
    private casosService: CasosService
  ) {
  }


  async ngOnInit() {
    this.loading = true;
    this.openNew();
    await this.prepareData();

    if (await this.getRouteParams('reclamacionId')) {
      this.nombreDocumento = 'Cargando ...'
      const reclamacion = JSON.parse(localStorage.getItem('reclamacion'));
      this.reclamacionId = +(await this.getRouteParams('reclamacionId'));
      this.reclamacion = reclamacion

      this.reclamacion.fechaServicio = new Date(this.reclamacion.fechaServicio + 'T23:59:00Z');
      this.selectedTipoAdm = this.reclamacion.tipoAdm

      this.codigoDocumento = "# " + this.reclamacion.codigo
      this.selectedCliente = this.reclamacion.clientePoliza.cliente

      const responseCliente = await this.usuariosService.obtenerUsuariosPorRolAndEstado(
        this.ROL_CLIENTE_ID,
        this.ESTADO_ACTIVO,
        0,
        10,
        this.selectedCliente.nombreUsuario
      );

      this.clientes = responseCliente.data

      const clientePolizaParm = JSON.parse(localStorage.getItem("clientePoliza"))
      const casoParam = JSON.parse(localStorage.getItem("caso"))

      this.selectedClientePoliza = clientePolizaParm ? clientePolizaParm : this.reclamacion.clientePoliza
      this.selectedCaso = casoParam ? casoParam : this.reclamacion.caso


      this.medicoCentroMedicoAseguradora = this.reclamacion.medicoCentroMedicoAseguradora
      this.centroMedico = this.reclamacion.medicoCentroMedicoAseguradora.centroMedico

      this.comentarios = await this.comentariosService.getComentariosByReclamacion(this.reclamacionId);
      this.loading = false;

      if (reclamacion.imagenId) {
        let foto = await this.imagenService.getImagen(reclamacion.imagenId);
        this.imagen = foto.documento
        this.nombreDocumento = foto.nombreDocumento
      }
      // this.reclamacion.fotoReclamo = reclamacionFoto.fotoReclamo

      if (this.imagen) {
        this.imagePreview = this.imagen;
      } else {
        this.nombreDocumento = undefined
      }

      if (reclamacion.estado == 'C')
        this.readOnlyForm = true

      return
    }

    if (await this.getRouteParamsBoolean('originCaso'))
      this.originCaso = await this.getRouteParamsBoolean('originCaso');

    if (await this.getRouteParams('clientePolizaId'))
      this.clientePolizaId = +(await this.getRouteParams('clientePolizaId'));

    const clientePolizaParm = JSON.parse(localStorage.getItem("clientePoliza"))
    const casoParam = JSON.parse(localStorage.getItem("caso"))

    if (clientePolizaParm) {
      this.selectedClientePoliza = clientePolizaParm
      this.selectedCliente = clientePolizaParm.cliente
    }

    if (casoParam){
      this.selectedCaso = casoParam
    }

    this.loading = false;
  }

  async filterCentrosMedicos(event) {
    const responseCliente = await this.centrosMedicosService.obtenerCentrosMedicos(
      0,
      10,
      event.query
    )

    this.filteredCentrosMedicos = responseCliente.data;
  }

  async addComentario() {
    this.loading = true
    let currentUser = await this.authService.obtenerUsuarioLoggeado();
    const comentario = {
      reclamacionId: this.reclamacionId,
      contenido: this.nuevoComentario,
      usuarioComentaId: currentUser.id,
      estado: 'A' // Estado activo
    };

    try {
      await this.comentariosService.createComentario(comentario);
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

  private getRouteParamsBoolean(param: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.route.queryParams.subscribe((params) => resolve(params[param]));
    });
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

  async cerrarReclamo() {
    this.loading = true
    let currentUser = await this.authService.obtenerUsuarioLoggeado();
    const comentario = {
      reclamacionId: this.reclamacionId,
      contenido: this.nuevoComentario,
      usuarioComentaId: currentUser.id,
      estado: 'C' // Estado activo
    };

    await this.reclamacionesService.partiallyUpdateReclamacion(this.reclamacion.id, 'C')

    this.readOnlyForm = true

    try {
      await this.comentariosService.createComentario(comentario);
      this.nuevoComentario = '';
      await this.loadComentarios();
      this.messageService.add({
        severity: 'success',
        summary: 'Comentario añadido',
        detail: 'Reclamo cerrado con éxito'
      });
      this.loading = false
    } catch (error) {
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'Error al añadir el comentario'});
      this.loading = false
    }
  }

  async deleteComentario(comentarioId: number) {
    try {
      await this.comentariosService.deleteComentario(comentarioId);
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
      this.comentarios = await this.comentariosService.getComentariosByReclamacion(this.reclamacionId);
    } catch (error) {
      console.error('Error al cargar los comentarios', error);
    }
  }

  onFileSelect(event) {
    if (this.reclamacion)
      this.editImage = true;

    const file = event.files[0];
    this.imagen = file;
    this.nombreDocumento = this.imagen.name
    console.log('Nombre del archivo:', file.name);

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);

    this.imagenCambiadaEdit = true
  }

  clearImageSelection(fileUploadRef) {
    if (this.reclamacion)
      this.editImage = true;

    this.imagen = null;
    this.nombreDocumento = null
    this.imagePreview = null;
    fileUploadRef.clear(); // Limpiar la selección de archivo en el componente de carga
  }

  showDialogImage() {
    this.displayDialog = true;
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

    this.tipoAdmOptions = Object.keys(TipoAdm).map(key => {
      return { label: key, value: TipoAdm[key] };
    });

  }

  private getRouteParams(param: string): Promise<string> {
    return new Promise((resolve) => {
      this.route.queryParams.subscribe((params) => resolve(params[param]));
    });
  }

  openNew() {
    this.reclamacion = {};
    this.centroMedico = null;

    this.submitted = false;
    this.reclamacionDialog = true;
  }

  hideDialog() {
    this.reclamacionDialog = false;
    this.submitted = false;
  }

  async saveReclamacion() {
    this.submitted = true;

    if (!this.selectedCaso?.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error!',
        detail: 'Caso es requerido',
        life: 3000,
      });
      return
    }

    if (!this.imagen) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error!',
        detail: 'Imagen es requerido',
        life: 3000,
      });
      return
    }

    if (!this.selectedTipoAdm) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error!',
        detail: 'Tipo adm. es requerido',
        life: 3000,
      });
      return
    }

    if (!this.medicoCentroMedicoAseguradora) {
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
    this.reclamacion.clientePolizaId = this.selectedClientePoliza.id
    this.reclamacion.tipoAdm = this.selectedTipoAdm
    this.reclamacion.medicoCentroMedicoAseguradoraId = this.medicoCentroMedicoAseguradora.id
    this.reclamacion.nombreDocumento = this.nombreDocumento
    this.reclamacion.casoId = this.selectedCaso.id

    formData.append('reclamacion', new Blob([JSON.stringify(this.reclamacion)], {type: 'application/json'}));

    if (this.imagen && this.imagenCambiadaEdit) {
      formData.append('fotoReclamo', this.imagen);
    }

    try {
      if (this.reclamacion.id) {
        await this.reclamacionesService.actualizarReclamacion(this.reclamacion.id, formData);
      } else {
        let reclamoSaved = await this.reclamacionesService.guardarReclamacion(formData);
        this.codigoDocumento = "# " + reclamoSaved.codigo
      }

      this.loading = false;
      this.messageService.add({severity: 'success', summary: 'Enhorabuena!', detail: 'Operación ejecutada con éxito'});
    } catch (error) {
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'Error al guardar el reclamo'});
    } finally {
      this.loading = false; // Ocultar spinner
    }
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

