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

@Component({
  selector: 'add-reclamaciones',
  templateUrl: './add-reclamaciones.component.html',
  styleUrls: ['./add-reclamaciones.component.scss'],
})
export class AddReclamacionesComponent implements OnInit {
  reclamacionDialog: boolean;
  reclamaciones: any[];
  selectedReclamaciones: any[];
  submitted: boolean;
  reclamacion: any;
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

  constructor(
    private messageService: MessageService,
    private reclamacionesService: ReclamacionesService,
    private aseguradorasService: AseguradorasService,
    private usuariosService: UsuariosService,
    private comentariosService: ComentariosService,
    private confirmationService: ConfirmationService,
    private imagenService: ImagenesService,
    private polizasService: PolizasService,
    private route: ActivatedRoute,
    private clientesPolizasService: ClientePolizaService,
    private authService: AuthService,
    private filterService: FilterService,
    private sanitizer: DomSanitizer
  ) {
  }


  async ngOnInit() {
    this.loading = true;
    this.openNew();
    await this.prepareData();
    console.log(this.reclamacion)

    if (await this.getRouteParams('reclamacionId')) {
      this.nombreDocumento = 'Cargando ...'
      const reclamacion = JSON.parse(localStorage.getItem('reclamacion'));
      this.reclamacionId = +(await this.getRouteParams('reclamacionId'));
      this.reclamacion = reclamacion

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
      this.selectedClientePoliza = clientePolizaParm ? clientePolizaParm : this.reclamacion.clientePoliza

      if (this.selectedClientePoliza && !this.selectedClientePoliza.displayName){
        this.selectedClientePoliza.displayName = `${this.selectedClientePoliza.codigo}-${this.selectedClientePoliza.poliza.nombre}`
      }

      await this.loadPolizas(true);
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

    if (await this.getRouteParams('clientePolizaId'))
      this.clientePolizaId = +(await this.getRouteParams('clientePolizaId'));

    if (this.clientePolizaId) {
      this.clienteId = +(await this.getRouteParams('clienteId'));
      await this.prepareClientePolizaData();
    }

    this.loading = false;
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
    this.reclamacion = {};
    this.submitted = false;
    this.reclamacionDialog = true;
  }

  hideDialog() {
    this.reclamacionDialog = false;
    this.submitted = false;
  }

  async saveReclamacion() {
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

    this.loading = true; // Mostrar spinner
    const formData = new FormData();
    this.reclamacion.clientePolizaId = this.selectedClientePoliza.id
    this.reclamacion.nombreDocumento = this.nombreDocumento
    formData.append('reclamacion', new Blob([JSON.stringify(this.reclamacion)], {type: 'application/json'}));
    if (this.imagen) {
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

    let clientePolizas = responseClientePoliza.data
    if (clientePolizas) {
      clientePolizas = clientePolizas.map(obj => ({
        ...obj,
        displayName: `${obj.codigo}-${obj.poliza.nombre}`
      }));
      console.log(clientePolizas)

      this.filteredPolizas = clientePolizas;
    }

  }

  async loadPolizas(esEdicion: boolean | null = false) {
    if (this.selectedCliente) {
      const responseClientePoliza = await this.clientesPolizasService.obtenerClientesPolizasPorCliente(
        this.selectedCliente.id,
        0,
        10,
        esEdicion ? this.selectedClientePoliza.codigo : "");

      let clientePolizas = responseClientePoliza.data
      if (clientePolizas) {
        clientePolizas = clientePolizas.map(obj => ({
          ...obj,
          displayName: `${obj.codigo}-${obj.poliza.nombre}`
        }));
        console.log(clientePolizas)

        this.clientePolizas = clientePolizas;
      }
    }
  }

}

