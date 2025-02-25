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
import {PaisesService} from "../../../services/paises-service";
import {EstadosService} from "../../../services/estados-service";
import {TipoIdentificacion} from "../../../enums/tipo-identificacion";
import {TipoCitaMedica} from "../../../enums/tipo-cita-medica";

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
  selectedCaso: any; // Poliza seleccionada en el filtro

  filteredClientes: any[]; // Clientes filtrados para el autocompletado
  filteredAseguradoras: any[]; // Aseguradoras filtradas para el autocompletado
  filteredPolizas: any[]; // Pólizas filtradas para el autocompletado
  filteredCasos: any[]; // Pólizas filtradas para el autocompletado

  ROL_CLIENTE_ID = 3;
  ESTADO_ACTIVO = 'A';
  clientePolizaId: number;
  casoId: number;

  clienteId: number;
  citaMedicaId: number;
  displayDialog: boolean = false;

  imagenCambiadaEdit: boolean = false;
  editImage = false
  editImageComment = false

  readOnlyForm = false

  imagePreview: SafeUrl | null = null; // Utilizamos SafeUrl para la URL segura de la imagen

  imageComplete: SafeUrl | null = null; // Utilizamos SafeUrl para la URL segura de la imagen

  comentarios: any[] = [];
  nuevoComentario: string = '';
  imagen
  nombreDocumento
  nombreDocumentoComplete
  nombreDocumentoComment = "Seleccionar documento"

  filteredCentrosMedicos
  filteredMedicoCentroMedicoAseguradoras

  medicoCentroMedicoAseguradora: any;
  centroMedico: any;
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
  isPDFNewComment
  direccion: any;


  paises: any[];
  estados: any[];

  pais: any;
  estado: any;

  filteredPaises: any[];
  filteredEstados: any[];

  pdfPreview
  tipoCitaMedicaOptions: { label: string, value: string }[];


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
    private confirmationService: ConfirmationService,
    private paisesService: PaisesService,
    private estadosService: EstadosService,
    private centrosMedicosService: CentrosMedicosService,
    private route: ActivatedRoute,
    private clientesPolizasService: ClientePolizaService,
    private authService: AuthService,
    private casosService: CasosService,
  ) {
  }

  async ngOnInit() {
    this.loading = true;
    this.user = await this.authService.obtenerUsuarioLoggeado()

    this.habilitarCierreTramite = this.rolesCierreTramite.includes(this.user.rol.codigo)


    this.openNew();
    await this.prepareData();

    if (await this.getRouteParams('citaMedicaId') || localStorage.getItem('citaMedica')) {

      this.nombreDocumento = 'Cargando ...'
      const citaMedica = JSON.parse(localStorage.getItem('citaMedica'));

      this.citaMedicaId = +(await this.getRouteParams('citaMedicaId'));
      if (!this.citaMedicaId)
        this.citaMedicaId = citaMedica.id

      this.citaMedica = await this.citasMedicasService.getCitaMedica(citaMedica.id)

      this.citaMedica.fechaTentativa = new Date(this.citaMedica.fechaTentativa + 'T23:59:00Z');

      if (this.citaMedica.fechaTentativaHasta)
        this.citaMedica.fechaTentativaHasta = new Date(this.citaMedica.fechaTentativaHasta + 'T23:59:00Z');

      this.initializeRequisitosAdicionales(this.citaMedica.requisitosAdicionales);

      this.codigoDocumento = "# " + this.citaMedica.codigo
      this.selectedCliente = this.citaMedica.clientePoliza.cliente

      if (this.citaMedica.direccion) {
        this.direccion = this.citaMedica.direccion;
        this.pais = this.direccion.pais;
      } else this.direccion = {};

      if (this.pais) this.loadEstados();

      if (this.direccion) this.estado = this.direccion.state;

      const clientePolizaParm = JSON.parse(localStorage.getItem("clientePoliza"))
      const casoParam = JSON.parse(localStorage.getItem("caso"))

      this.selectedClientePoliza = clientePolizaParm ? clientePolizaParm : this.citaMedica.clientePoliza
      this.selectedCaso = casoParam ? casoParam : this.citaMedica.caso

      this.medicoCentroMedicoAseguradora = this.citaMedica?.medicoCentroMedicoAseguradora
      this.centroMedico = this.citaMedica?.medicoCentroMedicoAseguradora?.centroMedico

      // await this.loadPolizas(true);
      if (this.citaMedica.estado == 'C')
        this.readOnlyForm = true

      this.loading = false;

      this.comentarios = await this.comentariosCitasMedicasService.getComentariosByCitaMedica(this.citaMedicaId);

      if (citaMedica.imagenId) {
        let foto = await this.imagenService.getImagen(citaMedica.imagenId);
        console.log(foto)
        this.imagen = foto.documento
        this.nombreDocumento = foto.nombreDocumento

        if (foto.tipo == "PDF")
          this.isPDF = true

      }

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

    console.log(!this.citaMedica, " BOOLEAN")
    console.log(this.originCaso, " BOOLEAN")

    if (await this.getRouteParams('clientePolizaId'))
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

    if (casoParam) {
      this.selectedCaso = casoParam
    }

    this.citaMedica.fechaTentativa = new Date();

    this.loading = false;
    this.citaMedicaDialog = true;

  }

  async cargarImagenesComentarios() {
    for (const comentario of this.comentarios) {
      if (comentario.imagenId) {
        let foto = await this.imagenService.getImagen(comentario.imagenId);
        comentario.imagen = foto.documento
        comentario.nombreDocumento = foto.nombreDocumento

        if (foto.tipo == "PDF")
          comentario.isPDF = true
      }

      if (comentario.imagen) {
        comentario.imagePreview = comentario.imagen;
      } else {
        comentario.nombreDocumento = undefined
      }
    }

  }

  initializeRequisitosAdicionales(requisitos: { [key: string]: boolean }): void {
    for (const key of Object.keys(this.requisitosAdicionales)) {
      const backendKey = this.RequisitoAdicionalMapping[key as RequisitoAdicional];
      this.requisitosAdicionales[key as RequisitoAdicional] = requisitos[backendKey] || false;
    }
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

  async iniciarEdicion(comentario: any) {
    if (comentario.usuarioComenta.nombreUsuario === this.user.nombreUsuario && !this.readOnlyForm) {
      comentario.enEdicion = true;
      comentario.contenidoOriginal = comentario.contenido;
      this.comentarioEdit = comentario
      this.habilitarEdicionComentario = true
      this.editImageComment = false
    }
  }

  async loadEstados() {
    if (this.pais.id)
      this.estados = await this.estadosService.obtenerEstadosByPais(
        this.pais.id
      );
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
      citaMedicaId: this.citaMedicaId,
      contenido: this.comentarioEdit.contenido,
      usuarioComentaId: this.user.id,
      estado: 'A', // Estado activo
      nombreDocumento: this.comentarioEdit.nombreDocumento
    };

    if (this.comentarioEdit.isPDF)
      comentarioToUpdate['tipoDocumento'] = "PDF"
    else
      comentarioToUpdate['tipoDocumento'] = "IMAGEN"

    const formData = new FormData();
    formData.append('comentarioCitaMedica', new Blob([JSON.stringify(comentarioToUpdate)], {type: 'application/json'}));

    if (this.editCommentImage) {
      formData.append('fotoComentarioCitaMedica', this.editCommentImage);
    }

    try {
      await this.comentariosCitasMedicasService.updateComentario(this.comentarioEdit.id, formData);
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
      citaMedicaId: this.citaMedicaId,
      contenido: this.nuevoComentario,
      usuarioComentaId: currentUser.id,
      estado: 'A', // Estado activo
      nombreDocumento: this.nombreDocumentoComment
    };

    if (this.isPDFNewComment)
      comentario['tipoDocumento'] = "PDF"
    else
      comentario['tipoDocumento'] = "IMAGEN"

    const formData = new FormData();
    formData.append('comentarioCitaMedica', new Blob([JSON.stringify(comentario)], {type: 'application/json'}));

    if (this.newCommentImage) {
      formData.append('fotoComentarioCitaMedica', this.newCommentImage);
    }

    try {
      let comentarioSaved = await this.comentariosCitasMedicasService.createComentario(formData);
      this.citaMedica.estado = comentarioSaved.citaMedica.estado
      this.nuevoComentario = '';

      this.newCommentImage = null;
      this.newCommentImagePreview = null;
      this.nombreDocumentoComment = null
      this.isPDFNewComment = false

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
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'Error al añadir el comentario'});
      this.loading = false
    }
  }

  async cerrarTramite() {
    this.loading = true
    try {
      let currentUser = await this.authService.obtenerUsuarioLoggeado();

      const comentario = {
        citaMedicaId: this.citaMedicaId,
        contenido: this.nuevoComentario,
        usuarioComentaId: currentUser.id,
        estado: 'C' // Estado activo
      };

      const partiallyUpdateObject = {
        estado: 'C',
        comentarioCitaMedicaRequest: comentario
      };

      let citaUpdated = await this.citasMedicasService.partiallyUpdateCitaMedica(this.citaMedica.id, partiallyUpdateObject)

      this.citaMedica.estado = citaUpdated.estado
      this.readOnlyForm = true
      this.loading = false
      await this.loadComentarios();
      await this.cargarImagenesComentarios()
    } catch (error) {
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'Error al cerrar la cita'});
      this.loading = false
    }

  }

  async deleteComentario(comentario: any) {
    this.confirmationService.confirm({
      message: 'Estás seguro de eliminar el comentario ' + comentario.contenido + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        this.loading = true
        await this.comentariosCitasMedicasService.deleteComentario(comentario.id);
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

  async loadComentarios() {
    try {
      this.comentarios = await this.comentariosCitasMedicasService.getComentariosByCitaMedica(this.citaMedicaId);
    } catch (error) {
      console.error('Error al cargar los comentarios', error);
    }
  }


  onNewCommentImageSelect(event: any): void {

    this.newCommentImage = event.files[0];
    this.nombreDocumentoComment = this.newCommentImage.name

    const fileType = this.newCommentImage.type;
    this.isPDFNewComment = false

    if (fileType.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newCommentImagePreview = e.target.result;
      };
      reader.readAsDataURL(this.newCommentImage);
    } else if (fileType === 'application/pdf') {
      // Si es un PDF, simplemente muestra el nombre
      this.isPDFNewComment = true;
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
  }

  onEditCommentImageSelect(event: any): void {
    this.editImageComment = true
    this.editCommentImage = event.files[0];
    this.comentarioEdit.nombreDocumento = this.editCommentImage.name

    const fileType = this.editCommentImage.type;
    this.comentarioEdit.isPDF = false

    if (fileType.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.comentarioEdit.imagePreview = e.target.result;
      };
      reader.readAsDataURL(this.editCommentImage);
    } else if (fileType === 'application/pdf') {
      // Si es un PDF, simplemente muestra el nombre
      this.comentarioEdit.isPDF = true
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
  }

  onFileSelect(event) {
    if (this.citaMedica)
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
    this.downloadFileComment(this.imagen, this.nombreDocumento)
  }

  downloadFileCommentAll(comentario) {
    this.downloadFileComment(comentario.imagePreview, comentario.nombreDocumento)
  }

  downloadNewFileComment() {
    this.downloadFileComment(this.newCommentImage, this.nombreDocumentoComment)
  }

  downloadEditComment() {
    console.log(this.editCommentImage)
    console.log(this.comentarioEdit.nombreDocumento)
    this.downloadFileComment(this.editCommentImage, this.comentarioEdit.nombreDocumento)
  }

  downloadFileComment(image, nombreDocumento) {
    try {
      let file
      if (typeof image === 'string') {
        const base64String = `data:application/pdf;base64,${image}`;
        file = this.base64ToFile(base64String, nombreDocumento);
      } else
        file = image

      const fileURL = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = fileURL;
      a.download = nombreDocumento;
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
    if (this.citaMedica)
      this.editImage = true;

    this.imagen = null;
    this.nombreDocumento = null
    this.imagePreview = null;
    this.isPDF = false; // Restablece el indicador de PDF
    fileUploadRef.clear(); // Limpiar la selección de archivo en el componente de carga
  }

  onFileSelectCommentUpdate(event, comentario) {
    if (comentario.citaMedica)
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
    this.isPDFNewComment = false
    fileUploadRef.clear();
  }

  removeEditCommentImage(fileUploadRef): void {
    this.editImageComment = true;
    this.editCommentImage = null;

    this.comentarioEdit.nombreDocumento = null;
    this.comentarioEdit.imagePreview = null;
    this.comentarioEdit.isPDF = false;
    fileUploadRef.clear();
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
    this.tipoCitaMedicaOptions = Object.keys(TipoCitaMedica).map(key => {
      return { label: key, value: TipoCitaMedica[key] };
    });
  }

  private getRouteParams(param: string): Promise<string> {
    return new Promise((resolve) => {
      this.route.queryParams.subscribe((params) => resolve(params[param]));
    });
  }

  private getRouteParamsBoolean(param: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.route.queryParams.subscribe((params) => resolve(params[param]));
    });
  }

  openNew() {
    this.citaMedica = {};
    this.direccion = {};

    this.centroMedico = null;
    this.submitted = false;
  }

  hideDialog() {
    this.citaMedicaDialog = false;
    this.submitted = false;
  }

  async saveCitaMedica() {
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

    if (!this.citaMedica.tipoCitaMedica || !this.citaMedica.padecimiento) return

    if (
      this.citaMedica.fechaTentativaHasta &&
      this.citaMedica.fechaTentativa >= this.citaMedica.fechaTentativaHasta
    ) {
      // Mostrar un mensaje de error al usuario
      this.messageService.add({
        severity: 'error',
        summary: 'Error de validación',
        detail: 'La fecha hasta debe ser mayor que la fecha desde.',
      });
      return; // Detener el guardado
    }

    this.loading = true; // Mostrar spinner
    const formData = new FormData();
    this.citaMedica.medicoCentroMedicoAseguradoraId = this.medicoCentroMedicoAseguradora?.id
    this.citaMedica.clientePolizaId = this.selectedClientePoliza.id
    this.citaMedica.nombreDocumento = this.nombreDocumento
    if (this.isPDF)
      this.citaMedica.tipoDocumento = "PDF"
    else
      this.citaMedica.tipoDocumento = "IMAGEN"

    this.citaMedica.casoId = this.selectedCaso.id

    this.direccion.paisId = this.pais?.id;
    this.direccion.estadoId = this.estado?.id;
    this.citaMedica.direccion = this.direccion;

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

        this.citaMedica.id = citaSaved.id
        this.citaMedicaId = citaSaved.id
        this.citaMedica.estado = citaSaved.estado
        localStorage.setItem("citaMedicaId", citaSaved.id);
        localStorage.setItem("citaMedica", JSON.stringify(citaSaved));
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

  async filterCasos(event) {
    let query = event.query;

    const filteredCasos = await this.casosService.obtenerCasos(
      0,
      10,
      query,
      this.selectedClientePoliza?.id ? this.selectedClientePoliza?.id : "");

    this.filteredCasos = filteredCasos.data
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

