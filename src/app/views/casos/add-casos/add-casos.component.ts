import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UsuariosService } from '../../../services/usuarios-service';
import { environment } from '../../../../environments/environment';
import { FilterService } from "primeng/api";
import { AseguradorasService } from 'src/app/services/aseguradoras-service';
import { PolizasService } from 'src/app/services/polizas-service';
import { ComentariosCasosService } from 'src/app/services/comentarios-casos-service';
import { CasosService } from 'src/app/services/casos-service';
import { ClientePolizaService } from 'src/app/services/polizas-cliente-service';
import { ImagenesService } from 'src/app/services/imagenes-service';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AuthService } from 'src/app/services/auth-service';

@Component({
  selector: 'add-casos',
  templateUrl: './add-casos.component.html',
  styleUrls: ['./add-casos.component.scss'],
})
export class AddCasosComponent implements OnInit {
  casoDialog: boolean;
  casos: any[];
  selectedCasos: any[];
  submitted: boolean;
  caso: any;
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
  casoId: number;
  displayDialog: boolean = false;
  editImage = false
  readOnlyForm = false

  imagePreview: SafeUrl | null = null; // Utilizamos SafeUrl para la URL segura de la imagen

  comentarios: any[] = [];
  nuevoComentario: string = '';
  imagen
  nombreDocumento

  codigoDocumento: string = 'Nuevo Caso'

  constructor(
    private messageService: MessageService,
    private casosService: CasosService,
    private aseguradorasService: AseguradorasService,
    private usuariosService: UsuariosService,
    private comentariosCasosService: ComentariosCasosService,
    private confirmationService: ConfirmationService,
    private imagenService: ImagenesService,
    private polizasService: PolizasService,
    private route: ActivatedRoute,
    private clientesPolizasService: ClientePolizaService,
    private authService: AuthService,
    private filterService: FilterService,
    private sanitizer: DomSanitizer
  ) { }

  async ngOnInit() {
    this.loading = true;
    this.openNew();
    await this.prepareData();

    if (await this.getRouteParams('casoId')) {
      this.nombreDocumento = 'Cargando ...'
      const caso = JSON.parse(localStorage.getItem('caso'));

      this.casoId = +(await this.getRouteParams('casoId'));
      this.caso = caso

      this.codigoDocumento = "# " + this.caso.codigo

      this.selectedCliente = this.caso.clientePoliza.cliente

      const responseCliente = await this.usuariosService.obtenerUsuariosPorRolAndEstado(
        this.ROL_CLIENTE_ID,
        this.ESTADO_ACTIVO,
        0,
        10,
        this.selectedCliente.nombreUsuario
      );

      this.clientes = responseCliente.data

      const clientePolizaParm = JSON.parse(localStorage.getItem("clientePoliza"))
      this.selectedClientePoliza = clientePolizaParm ? clientePolizaParm : this.caso.clientePoliza

      if (this.selectedClientePoliza && !this.selectedClientePoliza.displayName){
        this.selectedClientePoliza.displayName = `${this.selectedClientePoliza.codigo}-${this.selectedClientePoliza.poliza.nombre}`
      }

      await this.loadPolizas(true);
      console.log(this.caso.clientePoliza)
      console.log(this.clientePolizas )
      this.comentarios = await this.comentariosCasosService.getComentariosByCaso(this.casoId);
      this.loading = false;

      if (caso.imagenId){
        let foto = await this.imagenService.getImagen(caso.imagenId);
        this.imagen =  foto.documento
        this.nombreDocumento = foto.nombreDocumento
      }
      // this.caso.fotoReclamo = casoFoto.fotoReclamo

      if (this.imagen) {
        this.imagePreview = this.imagen;
      }else{
        this.nombreDocumento = undefined
      }

      if (caso.estado == 'C')
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
      casoId: this.casoId,
      contenido: this.nuevoComentario,
      usuarioComentaId: currentUser.id,
      estado: 'A' // Estado activo
    };

    try {
      await this.comentariosCasosService.createComentario(comentario);
      this.nuevoComentario = '';
      await this.loadComentarios();
      this.messageService.add({ severity: 'success', summary: 'Comentario añadido', detail: 'Comentario añadido con éxito' });
      this.loading = false
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al añadir el comentario' });
      this.loading = false
    }
  }

  async cerrarTramite() {
    this.loading = true
    let currentUser = await this.authService.obtenerUsuarioLoggeado();
    const comentario = {
      casoId: this.casoId,
      contenido: this.nuevoComentario,
      usuarioComentaId: currentUser.id,
      estado: 'C' // Estado activo
    };

    await this.casosService.partiallyUpdateCaso(this.caso.id, 'C')

    this.readOnlyForm = true

    try {
      await this.comentariosCasosService.createComentario(comentario);
      this.nuevoComentario = '';
      await this.loadComentarios();
      this.messageService.add({ severity: 'success', summary: 'Comentario añadido', detail: 'Cita médica cerrada con éxito' });
      this.loading = false
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al añadir el comentario' });
      this.loading = false
    }
  }

  async deleteComentario(comentarioId: number) {
    try {
      await this.comentariosCasosService.deleteComentario(comentarioId);
      await this.loadComentarios();
      this.messageService.add({ severity: 'success', summary: 'Comentario eliminado', detail: 'Comentario eliminado con éxito' });
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar el comentario' });
    }
  }

  async loadComentarios() {
    try {
      this.comentarios = await this.comentariosCasosService.getComentariosByCaso(this.casoId);
    } catch (error) {
      console.error('Error al cargar los comentarios', error);
    }
  }

  onFileSelect(event) {
    if (this.caso)
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
    if (this.caso)
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
    this.caso = {};
    this.submitted = false;
    this.casoDialog = true;
  }

  hideDialog() {
    this.casoDialog = false;
    this.submitted = false;
  }

  async saveCaso() {
    this.submitted = true;

    if (!this.imagen){
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
    this.caso.clientePolizaId = this.selectedClientePoliza.id
    this.caso.nombreDocumento = this.nombreDocumento
    formData.append('caso', new Blob([JSON.stringify(this.caso)], { type: 'application/json' }));
    if (this.imagen) {
      formData.append('fotoCaso', this.imagen);
    }

    try {
      if (this.caso.id) {
        await this.casosService.actualizarCaso(this.caso.id, formData);
      } else {
        let casoSaved = await this.casosService.guardarCaso(formData);
        this.codigoDocumento = "# " + casoSaved.codigo
      }

      this.loading = false;
      this.messageService.add({ severity: 'success', summary: 'Enhorabuena!', detail: 'Operación ejecutada con éxito' });
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar el caso' });
    } finally {
      this.loading = false; // Ocultar spinner
    }
  }

  async filterClientes(event){
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
      console.log(this.selectedClientePoliza)
      console.log(clientePolizas)
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

