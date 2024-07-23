import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UsuariosService } from '../../../services/usuarios-service';
import { environment } from '../../../../environments/environment';
import { FilterService } from "primeng/api";
import { AseguradorasService } from 'src/app/services/aseguradoras-service';
import { PolizasService } from 'src/app/services/polizas-service';
import { ComentariosEmergenciasService } from 'src/app/services/comentarios-emergencias-service';
import { EmergenciasService } from '../../../services/emergencias-service';
import { ClientePolizaService } from 'src/app/services/polizas-cliente-service';
import { ImagenesService } from 'src/app/services/imagenes-service';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AuthService } from 'src/app/services/auth-service';

@Component({
  selector: 'add-emergencias',
  templateUrl: './add-emergencias.component.html',
  styleUrls: ['./add-emergencias.component.scss'],
})
export class AddEmergenciasComponent implements OnInit {
  emergenciaDialog: boolean;
  emergencias: any[];
  selectedEmergencias: any[];
  submitted: boolean;
  emergencia: any;
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
  emergenciaId: number;
  displayDialog: boolean = false;
  editImage = false
  readOnlyForm = false

  imagePreview: SafeUrl | null = null; // Utilizamos SafeUrl para la URL segura de la imagen

  comentarios: any[] = [];
  nuevoComentario: string = '';
  imagen
  nombreDocumento

  codigoDocumento: string = 'Nuevo Emergencia'

  constructor(
    private messageService: MessageService,
    private emergenciasService: EmergenciasService,
    private aseguradorasService: AseguradorasService,
    private usuariosService: UsuariosService,
    private comentariosEmergenciasService: ComentariosEmergenciasService,
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

    if (await this.getRouteParams('emergenciaId')) {
      this.nombreDocumento = 'Cargando ...'
      const emergencia = JSON.parse(localStorage.getItem('emergencia'));

      this.emergenciaId = +(await this.getRouteParams('emergenciaId'));
      this.emergencia = emergencia

      this.codigoDocumento = "# " + this.emergencia.codigo

      this.selectedCliente = this.emergencia.clientePoliza.cliente

      const responseCliente = await this.usuariosService.obtenerUsuariosPorRolAndEstado(
        this.ROL_CLIENTE_ID,
        this.ESTADO_ACTIVO,
        0,
        10,
        this.selectedCliente.nombreUsuario
      );

      this.clientes = responseCliente.data

      const clientePolizaParm = JSON.parse(localStorage.getItem("clientePoliza"))
      this.selectedClientePoliza = clientePolizaParm ? clientePolizaParm : this.emergencia.clientePoliza

      if (this.selectedClientePoliza && !this.selectedClientePoliza.displayName){
        this.selectedClientePoliza.displayName = `${this.selectedClientePoliza.codigo}-${this.selectedClientePoliza.poliza.nombre}`
      }

      await this.loadPolizas(true);
      console.log(this.emergencia.clientePoliza)
      console.log(this.clientePolizas )
      this.comentarios = await this.comentariosEmergenciasService.getComentariosByEmergencia(this.emergenciaId);
      this.loading = false;

      if (emergencia.imagenId){
        let foto = await this.imagenService.getImagen(emergencia.imagenId);
        this.imagen =  foto.documento
        this.nombreDocumento = foto.nombreDocumento
      }
      // this.emergencia.fotoReclamo = emergenciaFoto.fotoReclamo

      if (this.imagen) {
        this.imagePreview = this.imagen;
      }else{
        this.nombreDocumento = undefined
      }

      if (emergencia.estado == 'C')
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
      emergenciaId: this.emergenciaId,
      contenido: this.nuevoComentario,
      usuarioComentaId: currentUser.id,
      estado: 'A' // Estado activo
    };

    try {
      await this.comentariosEmergenciasService.createComentario(comentario);
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
      emergenciaId: this.emergenciaId,
      contenido: this.nuevoComentario,
      usuarioComentaId: currentUser.id,
      estado: 'C' // Estado activo
    };

    await this.emergenciasService.partiallyUpdateEmergencia(this.emergencia.id, 'C')

    this.readOnlyForm = true

    try {
      await this.comentariosEmergenciasService.createComentario(comentario);
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
      await this.comentariosEmergenciasService.deleteComentario(comentarioId);
      await this.loadComentarios();
      this.messageService.add({ severity: 'success', summary: 'Comentario eliminado', detail: 'Comentario eliminado con éxito' });
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar el comentario' });
    }
  }

  async loadComentarios() {
    try {
      this.comentarios = await this.comentariosEmergenciasService.getComentariosByEmergencia(this.emergenciaId);
    } catch (error) {
      console.error('Error al cargar los comentarios', error);
    }
  }

  onFileSelect(event) {
    if (this.emergencia)
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
    if (this.emergencia)
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
    this.emergencia = {};
    this.submitted = false;
    this.emergenciaDialog = true;
  }

  hideDialog() {
    this.emergenciaDialog = false;
    this.submitted = false;
  }

  async saveEmergencia() {
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
    this.emergencia.clientePolizaId = this.selectedClientePoliza.id
    this.emergencia.nombreDocumento = this.nombreDocumento
    formData.append('emergencia', new Blob([JSON.stringify(this.emergencia)], { type: 'application/json' }));
    if (this.imagen) {
      formData.append('fotoEmergencia', this.imagen);
    }

    try {
      if (this.emergencia.id) {
        await this.emergenciasService.actualizarEmergencia(this.emergencia.id, formData);
      } else {
        let emergenciaSaved = await this.emergenciasService.guardarEmergencia(formData);
        this.codigoDocumento = "# " + emergenciaSaved.codigo
      }

      this.loading = false;
      this.messageService.add({ severity: 'success', summary: 'Enhorabuena!', detail: 'Operación ejecutada con éxito' });
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar el emergencia' });
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

