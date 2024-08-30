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

  editImageComment = false
  editImage = false
  readOnlyForm = false
  imagePreview: SafeUrl | null = null; // Utilizamos SafeUrl para la URL segura de la imagen
  imageComplete: SafeUrl | null = null; // Utilizamos SafeUrl para la URL segura de la imagen

  nombreDocumentoComplete
  nombreDocumentoComment = "Seleccionar imagen"

  comentarios: any[] = [];
  nuevoComentario: string = '';
  imagen
  nombreDocumento
  codigoDocumento: string = 'Nuevo Reembolso'

  filteredCentrosMedicos
  filteredMedicoCentroMedicoAseguradoras

  medicoCentroMedicoAseguradora: any;
  centroMedico: any;

  tipoAdmOptions: { label: string, value: string }[];
  selectedTipoAdm: TipoAdm;
  imagenCambiadaEdit: boolean = false;

  originCaso: boolean = false

  habilitarCierreTramite: boolean = false
  habilitarEdicionComentario: boolean = false

  rolesCierreTramite = ["ASR", "BRO"]
  user

  comentarioEdit
  newCommentImage: File | null = null;
  editCommentImage: File | null = null;
  editingCommentImageComplete: boolean = false;

  newCommentImagePreview: string | null = null;

  constructor(
    private messageService: MessageService,
    private reclamacionesService: ReclamacionesService,
    private usuariosService: UsuariosService,
    private comentariosService: ComentariosService,
    private imagenService: ImagenesService,
    private centrosMedicosService: CentrosMedicosService,
    private route: ActivatedRoute,
    private clientesPolizasService: ClientePolizaService,
    private confirmationService: ConfirmationService,
    private authService: AuthService,
    private medicoCentroMedicoAseguradoraService: MedicoCentroMedicoAseguradorasService,
    private casosService: CasosService
  ) {
  }


  async ngOnInit() {
    this.loading = true;
    this.user = await this.authService.obtenerUsuarioLoggeado()

    this.habilitarCierreTramite = this.rolesCierreTramite.includes(this.user.rol.codigo)
    this.openNew();
    await this.prepareData();

    if (await this.getRouteParams('reclamacionId') || localStorage.getItem('reclamacion')) {
      this.nombreDocumento = 'Cargando ...'
      const reclamacion = JSON.parse(localStorage.getItem('reclamacion'));
      this.reclamacionId = +(await this.getRouteParams('reclamacionId'));
      if (!this.reclamacionId)
        this.reclamacionId = reclamacion.id

      this.reclamacion = await this.reclamacionesService.getReclamacion(reclamacion.id)

      this.reclamacion.fechaServicio = new Date(this.reclamacion.fechaServicio + 'T23:59:00Z');
      this.selectedTipoAdm = this.reclamacion.tipoAdm

      this.codigoDocumento = "# " + this.reclamacion.codigo
      this.selectedCliente = this.reclamacion.clientePoliza.cliente

      const clientePolizaParm = JSON.parse(localStorage.getItem("clientePoliza"))
      const casoParam = JSON.parse(localStorage.getItem("caso"))

      this.selectedClientePoliza = clientePolizaParm ? clientePolizaParm : this.reclamacion.clientePoliza
      this.selectedCaso = casoParam ? casoParam : this.reclamacion.caso


      this.medicoCentroMedicoAseguradora = this.reclamacion.medicoCentroMedicoAseguradora
      this.centroMedico = this.reclamacion.medicoCentroMedicoAseguradora.centroMedico

      // await this.loadPolizas(true);
      if (this.reclamacion.estado == 'C')
        this.readOnlyForm = true

      this.loading = false;

      this.comentarios = await this.comentariosService.getComentariosByReclamacion(this.reclamacionId);

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

      this.cargarImagenesComentarios()
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

    this.reclamacion.fechaServicio = new Date();
    this.loading = false;
    this.reclamacionDialog = true;
  }

  async iniciarEdicion(comentario: any) {
    if (comentario.usuarioComenta.nombreUsuario === this.user.nombreUsuario && !this.readOnlyForm) {
      comentario.enEdicion = true;
      comentario.contenidoOriginal = comentario.contenido;
      this.comentarioEdit = comentario
      this.habilitarEdicionComentario = true
      this.editImageComment = false
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

  async actualizarComentario() {
    this.loading = true
    const comentarioToUpdate = {
      reclamacionId: this.reclamacionId,
      contenido: this.comentarioEdit.contenido,
      usuarioComentaId: this.user.id,
      estado: 'A', // Estado activo
      nombreDocumento: this.comentarioEdit.nombreDocumento
    };

    const formData = new FormData();
    formData.append('comentarioReclamacion', new Blob([JSON.stringify(comentarioToUpdate)], {type: 'application/json'}));

    if (this.editCommentImage) {
      formData.append('fotoComentarioReclamacion', this.editCommentImage);
    }

    try {
      await this.comentariosService.updateComentario(this.comentarioEdit.id, formData);
      this.messageService.add({
        severity: 'success',
        summary: 'Comentario actualizado',
        detail: 'Comentario actualizado con éxito'
      });

      this.habilitarEdicionComentario = false
      await this.loadComentarios();
      this.loading = false
      await this.cargarImagenesComentarios();
    } catch (error) {
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'Error al actualizar el comentario'});
      this.loading = false
    }
    this.loading = false
  }

  async cancelarEdicion() {
    this.loading = true
    await this.loadComentarios()
    this.habilitarEdicionComentario = false
    this.comentarioEdit = {}
    this.loading = false
    await this.cargarImagenesComentarios()
  }

  async cargarImagenesComentarios(){
    for (const comentario of this.comentarios) {
      if (comentario.imagenId) {
        let foto = await this.imagenService.getImagen(comentario.imagenId);
        comentario.imagen = foto.documento
        comentario.nombreDocumento = foto.nombreDocumento
      }

      if (comentario.imagen) {
        comentario.imagePreview = comentario.imagen;
      } else {
        comentario.nombreDocumento = undefined
      }
    }

    console.log(this.comentarios)
  }

  async filterCentrosMedicos(event) {
    const responseCliente = await this.centrosMedicosService.obtenerCentrosMedicos(
      0,
      10,
      event.query
    )

    this.filteredCentrosMedicos = responseCliente.data;
  }

  async addComentario(fileUploadRefNew) {
    this.loading = true
    if (this.nuevoComentario == "") {
      this.loading = false
      return this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al añadir el comentario, está vacío el texto'
      });
    }

    let currentUser = await this.authService.obtenerUsuarioLoggeado();
    const comentario = {
      reclamacionId: this.reclamacionId,
      contenido: this.nuevoComentario,
      usuarioComentaId: currentUser.id,
      estado: 'A', // Estado activo
      nombreDocumento: this.nombreDocumentoComment
    };

    const formData = new FormData();
    formData.append('comentarioReclamacion', new Blob([JSON.stringify(comentario)], {type: 'application/json'}));

    if (this.newCommentImage) {
      formData.append('fotoComentarioReclamacion', this.newCommentImage);
    }
    try {
      let comentarioSaved = await this.comentariosService.createComentario(formData);
      this.reclamacion.estado = comentarioSaved.reclamacion.estado

      this.nuevoComentario = '';
      this.newCommentImage = null;
      this.newCommentImagePreview = null;
      this.nombreDocumentoComment = null

      fileUploadRefNew.clear()
      await this.loadComentarios();
      this.loading = false
      await this.cargarImagenesComentarios()
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
    try {
      let currentUser = await this.authService.obtenerUsuarioLoggeado();
      const comentario = {
        reclamacionId: this.reclamacionId,
        contenido: this.nuevoComentario,
        usuarioComentaId: currentUser.id,
        estado: 'C' // Estado activo
      };

      const partiallyUpdateObject = {
        estado: 'C',
        comentarioReclamacionRequest: comentario
      };

      let reclamacionUpdated = await this.reclamacionesService.partiallyUpdateReclamacion(this.reclamacion.id, partiallyUpdateObject)

      this.reclamacion.estado = reclamacionUpdated.estado
      this.readOnlyForm = true
      this.loading = false
      await this.loadComentarios();
      await this.cargarImagenesComentarios()
    } catch (error) {
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'Error al cerrar la reclamacion'});
      this.loading = false
    }
  }

  async loadComentarios() {
    try {
      this.comentarios = await this.comentariosService.getComentariosByReclamacion(this.reclamacionId);
    } catch (error) {
      console.error('Error al cargar los comentarios', error);
    }
  }

  onNewCommentImageSelect(event: any): void {

    this.newCommentImage = event.files[0];
    this.nombreDocumentoComment = this.newCommentImage.name

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.newCommentImagePreview = e.target.result;
    };
    reader.readAsDataURL(this.newCommentImage);
  }

  onEditCommentImageSelect(event: any): void {
    this.editImageComment = true
    this.editCommentImage = event.files[0];
    this.comentarioEdit.nombreDocumento = this.editCommentImage.name

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.comentarioEdit.imagePreview = e.target.result;
    };
    reader.readAsDataURL(this.editCommentImage);
  }


  async deleteComentario(comentario: any) {
    this.confirmationService.confirm({
      message: 'Estás seguro de eliminar el comentario ' + comentario.contenido + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        this.loading = true
        await this.comentariosService.deleteComentario(comentario.id);
        await this.loadComentarios();
        this.loading = false

        await this.cargarImagenesComentarios()

        this.messageService.add({
          severity: 'success',
          summary: 'Enhorabuena!',
          detail: 'Registro eliminado exitosamente',
          life: 3000,
        });
      },
    });
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
    this.imageComplete = this.imagePreview
    this.editingCommentImageComplete = this.editImage
    this.nombreDocumentoComplete = this.nombreDocumento
    this.displayDialog = true;
  }

  showDialogImageComments(comentario) {
    this.imageComplete = comentario.imagePreview
    this.editingCommentImageComplete = false
    this.nombreDocumentoComplete = comentario.nombreDocumento
    this.displayDialog = true;
  }

  showDialogNuevaImageComments() {
    this.imageComplete = this.newCommentImagePreview
    this.editingCommentImageComplete = true
    this.nombreDocumentoComplete = this.nombreDocumentoComment
    this.displayDialog = true;
  }

  onFileSelectCommentUpdate(event, comentario) {
    if (comentario.reclamacion)
      comentario.editImage = true;

    const file = event.files[0];
    comentario.imagen = file;
    comentario.nombreDocumento = comentario.name

    const reader = new FileReader();
    reader.onload = (e: any) => {
      comentario.imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);

    comentario.imagenCambiadaEdit = true
  }

  removeNewCommentImage(fileUploadRef): void {
    this.newCommentImage = null;
    this.newCommentImagePreview = null;
    this.nombreDocumentoComment = null
    fileUploadRef.clear();
  }

  removeEditCommentImage(fileUploadRef): void {
    this.editImageComment = true;
    this.editCommentImage = null;

    this.comentarioEdit.nombreDocumento  = null;
    this.comentarioEdit.imagePreview  = null;
    fileUploadRef.clear();
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

        this.reclamacion.id = reclamoSaved.id
        this.reclamacionId = reclamoSaved.id
        this.reclamacion.estado = reclamoSaved.estado
        localStorage.setItem("reclamacionId", reclamoSaved.id);
        localStorage.setItem("reclamacion", JSON.stringify(reclamoSaved));
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

