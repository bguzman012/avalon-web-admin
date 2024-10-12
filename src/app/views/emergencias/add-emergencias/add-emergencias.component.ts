import {Component, OnInit} from '@angular/core';
import {ConfirmationService, MessageService} from 'primeng/api';
import {UsuariosService} from '../../../services/usuarios-service';
import {environment} from '../../../../environments/environment';
import {FilterService} from "primeng/api";
import {AseguradorasService} from 'src/app/services/aseguradoras-service';
import {PolizasService} from 'src/app/services/polizas-service';
import {ComentariosEmergenciasService} from 'src/app/services/comentarios-emergencias-service';
import {EmergenciasService} from '../../../services/emergencias-service';
import {ClientePolizaService} from 'src/app/services/polizas-cliente-service';
import {ImagenesService} from 'src/app/services/imagenes-service';
import {ActivatedRoute} from '@angular/router';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {AuthService} from 'src/app/services/auth-service';
import {MedicoCentroMedicoAseguradorasService} from "../../../services/med-centros-medicos-aseguradoras-service";
import {CentrosMedicosService} from "../../../services/centros-medicos-service";
import {PaisesService} from "../../../services/paises-service";
import {EstadosService} from "../../../services/estados-service";
import {CasosService} from "../../../services/casos-service";


@Component({
  selector: 'app-add-emergencias',
  templateUrl: './add-emergencias.component.html',
  styleUrls: ['./add-emergencias.component.scss'],
})
export class AddEmergenciasComponent implements OnInit {
  emergenciaDialog: boolean;
  emergencias: any[];
  submitted: boolean;
  emergencia: any;
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
  emergenciaId: number;
  displayDialog: boolean = false;
  imagenCambiadaEdit: boolean = false;

  editImageComment = false
  editImage = false
  readOnlyForm = false

  imagePreview: SafeUrl | null = null; // Utilizamos SafeUrl para la URL segura de la imagen

  imageComplete: SafeUrl | null = null; // Utilizamos SafeUrl para la URL segura de la imagen

  comentarios: any[] = [];
  nuevoComentario: string = '';
  imagen
  nombreDocumento
  nombreDocumentoComplete
  nombreDocumentoComment = "Seleccionar imagen"

  medicoCentroMedicoAseguradora: any;

  filteredCentrosMedicos
  filteredMedicoCentroMedicoAseguradoras
  direccion: any;

  codigoDocumento: string = 'Nuevo Emergencia'
  centroMedico: any;

  paises: any[];
  estados: any[];

  pais: any;
  estado: any;

  filteredPaises: any[];
  filteredEstados: any[];

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
  isPDF
  pdfPreview

  constructor(
    private messageService: MessageService,
    private emergenciasService: EmergenciasService,
    private paisesService: PaisesService,
    private estadosService: EstadosService,
    private usuariosService: UsuariosService,
    private comentariosEmergenciasService: ComentariosEmergenciasService,
    private imagenService: ImagenesService,
    private route: ActivatedRoute,
    private clientesPolizasService: ClientePolizaService,
    private confirmationService: ConfirmationService,
    private authService: AuthService,
    private medicoCentroMedicoAseguradoraService: MedicoCentroMedicoAseguradorasService,
    private centrosMedicosService: CentrosMedicosService,
    private casosService: CasosService,

  ) {
  }

  async ngOnInit() {
    this.loading = true;
    this.user = await this.authService.obtenerUsuarioLoggeado()

    this.habilitarCierreTramite = this.rolesCierreTramite.includes(this.user.rol.codigo)

    this.openNew();
    await this.prepareData();

    if (await this.getRouteParams('emergenciaId') || localStorage.getItem('emergencia')) {
      this.nombreDocumento = 'Cargando ...'
      const emergencia = JSON.parse(localStorage.getItem('emergencia'));

      this.emergenciaId = +(await this.getRouteParams('emergenciaId'));
      if (!this.emergenciaId)
        this.emergenciaId = emergencia.id

      this.emergencia = await this.emergenciasService.getEmergencia(emergencia.id)

      this.codigoDocumento = "# " + this.emergencia.codigo
      this.selectedCliente = this.emergencia.clientePoliza.cliente

      if (this.emergencia.direccion) {
        this.direccion = this.emergencia.direccion;
        this.pais = this.direccion.pais;
      } else this.direccion = {};

      if (this.pais) this.loadEstados();

      if (this.direccion) this.estado = this.direccion.state;

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

      this.selectedClientePoliza = clientePolizaParm ? clientePolizaParm : this.emergencia.clientePoliza
      this.selectedCaso = casoParam ? casoParam : this.emergencia.caso

      this.medicoCentroMedicoAseguradora = this.emergencia?.medicoCentroMedicoAseguradora
      this.centroMedico = this.emergencia?.medicoCentroMedicoAseguradora?.centroMedico
      if (this.emergencia.estado == 'C')
        this.readOnlyForm = true

      this.loading = false;

      this.comentarios = await this.comentariosEmergenciasService.getComentariosByEmergencia(this.emergenciaId);

      if (emergencia.imagenId) {
        let foto = await this.imagenService.getImagen(emergencia.imagenId);
        this.imagen = foto.documento
        this.nombreDocumento = foto.nombreDocumento

        if (foto.tipo == "PDF")
          this.isPDF = true
      }
      // this.emergencia.fotoReembolso = emergenciaFoto.fotoReembolso

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

    if (await this.getRouteParams('casoId'))
      this.casoId = +(await this.getRouteParams('casoId'));

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
    this.emergenciaDialog = true;
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
      emergenciaId: this.emergenciaId,
      contenido: this.comentarioEdit.contenido,
      usuarioComentaId: this.user.id,
      estado: 'A', // Estado activo
      nombreDocumento: this.comentarioEdit.nombreDocumento
    };

    const formData = new FormData();
    formData.append('comentarioEmergencia', new Blob([JSON.stringify(comentarioToUpdate)], {type: 'application/json'}));

    if (this.editCommentImage) {
      formData.append('fotoComentarioEmergencia', this.editCommentImage);
    }

    try {
      await this.comentariosEmergenciasService.updateComentario(this.comentarioEdit.id, formData);
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
      emergenciaId: this.emergenciaId,
      contenido: this.nuevoComentario,
      usuarioComentaId: currentUser.id,
      estado: 'A', // Estado activo
      nombreDocumento: this.nombreDocumentoComment
    };
    const formData = new FormData();
    formData.append('comentarioEmergencia', new Blob([JSON.stringify(comentario)], {type: 'application/json'}));

    if (this.newCommentImage) {
      formData.append('fotoComentarioEmergencia', this.newCommentImage);
    }

    try {
      let comentarioSaved = await this.comentariosEmergenciasService.createComentario(formData);
      this.emergencia.estado = comentarioSaved.emergencia.estado
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
    } catch (error) {
      console.log(error)
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'Error al añadir el comentario'});
      this.loading = false
    }
  }

  async cerrarTramite() {
    this.loading = true
    try {
    let currentUser = await this.authService.obtenerUsuarioLoggeado();
    const comentario = {
      emergenciaId: this.emergenciaId,
      contenido: this.nuevoComentario,
      usuarioComentaId: currentUser.id,
      estado: 'C' // Estado activo
    };

      const partiallyUpdateObject = {
        estado: 'C',
        comentarioEmergenciaRequest: comentario
      };

      let emergenciaUpdated = await this.emergenciasService.partiallyUpdateEmergencia(this.emergencia.id, partiallyUpdateObject)

      this.emergencia.estado = emergenciaUpdated.estado
      this.readOnlyForm = true
      this.loading = false
      await this.loadComentarios();
      await this.cargarImagenesComentarios()
    } catch (error) {
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'Error al cerrar la emergencia'});
      this.loading = false
    }
  }

  async loadComentarios() {
    try {
      this.comentarios = await this.comentariosEmergenciasService.getComentariosByEmergencia(this.emergenciaId);
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
        await this.comentariosEmergenciasService.deleteComentario(comentario.id);
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
    if (this.emergencia)
      this.editImage = true;

    const file = event.files[0];
    this.imagen = file;
    this.nombreDocumento = this.imagen.name

    const fileType = file.type;

    // Resetear variables de vista previa
    this.imagePreview = null;
    this.isPDF = false;

    if (fileType.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    } else if (fileType === 'application/pdf') {
      // Si es un PDF, simplemente muestra el nombre
      this.isPDF = true;
      this.messageService.add({
        severity: 'info',
        summary: 'PDF seleccionado',
        detail: 'El archivo PDF se ha seleccionado.'
      });
    } else {
      // Si no es ni imagen ni PDF, puedes manejar el error aquí
      this.messageService.add({
        severity: 'error',
        summary: 'Tipo de archivo no soportado',
        detail: 'Por favor selecciona un archivo válido (imagen o PDF).'
      });
    }

    this.imagenCambiadaEdit = true
  }

  downloadFile() {
    try {
      let file
      if (typeof this.imagen === 'string') {
        const base64String = `data:application/pdf;base64,${this.imagen}`;
        file = this.base64ToFile(base64String, this.nombreDocumento);
      } else
        file = this.imagen

      console.log(file)
      const fileURL = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = fileURL;
      a.download = this.nombreDocumento;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(fileURL);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  }

  base64ToFile(base64String: string, fileName: string): File {
    if (!base64String) {
      throw new Error('Base64 string is null or empty');
    }

    const arr = base64String.split(',');
    if (arr.length < 2) {
      throw new Error('Invalid base64 string');
    }

    const mime = arr[0].match(/:(.*?);/)?.[1]; // Verifica que la coincidencia no sea null
    const bstr = atob(arr[1]);
    const n = bstr.length;
    const u8arr = new Uint8Array(n);

    for (let i = 0; i < n; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }

    return new File([u8arr], fileName, {type: mime});
  }


  clearImageSelection(fileUploadRef) {
    if (this.emergencia)
      this.editImage = true;

    this.imagen = null;
    this.nombreDocumento = null
    this.imagePreview = null;
    this.isPDF = false; // Restablece el indicador de PDF

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
    if (comentario.emergencia)
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
    this.paises = await this.paisesService.obtenerPaises();
  }

  private getRouteParams(param: string): Promise<string> {
    return new Promise((resolve) => {
      this.route.queryParams.subscribe((params) => resolve(params[param]));
    });
  }

  openNew() {
    this.emergencia = {};
    this.direccion = {};

    this.submitted = false;
    this.emergenciaDialog = true;
  }

  async loadEstados() {
    if (this.pais.id)
      this.estados = await this.estadosService.obtenerEstadosByPais(
        this.pais.id
      );
  }

  private getRouteParamsBoolean(param: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.route.queryParams.subscribe((params) => resolve(params[param]));
    });
  }

  async saveEmergencia() {
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

    this.loading = true; // Mostrar spinner
    const formData = new FormData();
    this.emergencia.medicoCentroMedicoAseguradoraId = this.medicoCentroMedicoAseguradora?.id
    this.emergencia.clientePolizaId = this.selectedClientePoliza.id
    this.emergencia.nombreDocumento = this.nombreDocumento
    if (this.isPDF)
      this.emergencia.tipoDocumento = "PDF"
    else
      this.emergencia.tipoDocumento = "IMAGEN"

    this.emergencia.casoId = this.selectedCaso.id

    this.direccion.paisId = this.pais.id;
    this.direccion.estadoId = this.estado.id;
    this.emergencia.direccion = this.direccion;

    formData.append('emergencia', new Blob([JSON.stringify(this.emergencia)], {type: 'application/json'}));
    if (this.imagen  && this.imagenCambiadaEdit) {
      formData.append('fotoEmergencia', this.imagen);
    }

    try {
      if (this.emergencia.id) {
        await this.emergenciasService.actualizarEmergencia(this.emergencia.id, formData);
      } else {
        let emergenciaSaved = await this.emergenciasService.guardarEmergencia(formData);
        this.codigoDocumento = "# " + emergenciaSaved.codigo

        this.emergencia.id = emergenciaSaved.id
        this.emergenciaId = emergenciaSaved.id
        this.emergencia.estado = emergenciaSaved.estado
        localStorage.setItem("emergenciaId", emergenciaSaved.id);
        localStorage.setItem("emergencia", JSON.stringify(emergenciaSaved));
      }

      this.loading = false;
      this.messageService.add({severity: 'success', summary: 'Enhorabuena!', detail: 'Operación ejecutada con éxito'});
    } catch (error) {
      console.log(error)
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'Error al guardar el emergencia'});
    } finally {
      this.loading = false; // Ocultar spinner
    }
  }

  hideDialog() {
    this.submitted = false;
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

  async filterCasos(event) {
    let query = event.query;

    const filteredCasos = await this.casosService.obtenerCasos(
      0,
      10,
      query,
      this.selectedClientePoliza?.id ? this.selectedClientePoliza?.id : "");

    this.filteredCasos = filteredCasos.data
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

