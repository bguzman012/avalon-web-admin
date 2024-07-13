import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UsuariosService } from '../../../services/usuarios-service';
import { environment } from '../../../../environments/environment';
import { FilterService } from "primeng/api";
import { AseguradorasService } from 'src/app/services/aseguradoras-service';
import { PolizasService } from 'src/app/services/polizas-service';
import { ComentariosCitasMedicasService } from 'src/app/services/comentarios-citas-medicas-service';
import { CitasMedicasService } from 'src/app/services/citas-medicas-service';
import { ClientePolizaService } from 'src/app/services/polizas-cliente-service';
import { ImagenesService } from 'src/app/services/imagenes-service';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AuthService } from 'src/app/services/auth-service';

@Component({
  selector: 'add-citas-medicas',
  templateUrl: './add-citas-medicas.component.html',
  styleUrls: ['./add-citas-medicas.component.scss'],
})
export class AddCitasMedicasComponent implements OnInit {
  citaMedicaDialog: boolean;
  citasMedicas: any[];
  selectedCitasMedicas: any[];
  submitted: boolean;
  citaMedica: any;
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
  citaMedicaId: number;
  displayDialog: boolean = false;
  editImage = false
  readOnlyForm = false

  imagePreview: SafeUrl | null = null; // Utilizamos SafeUrl para la URL segura de la imagen

  comentarios: any[] = [];
  nuevoComentario: string = '';
  imagen
  nombreDocumento

  constructor(
    private messageService: MessageService,
    private citasMedicasService: CitasMedicasService,
    private aseguradorasService: AseguradorasService,
    private usuariosService: UsuariosService,
    private comentariosCitasMedicasService: ComentariosCitasMedicasService,
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

    if (await this.getRouteParams('citaMedicaId')) {
      this.nombreDocumento = 'Cargando ...'
      const citaMedica = JSON.parse(localStorage.getItem('citaMedica'));

      this.citaMedicaId = +(await this.getRouteParams('citaMedicaId'));
     
      this.citaMedica = citaMedica
      // this.citaMedica = await this.citasMedicasService.getCitaMedica(this.citaMedicaId);

      this.selectedCliente = this.citaMedica.clientePoliza.cliente
      await this.loadPolizas();
      this.selectedClientePoliza = this.clientePolizas.find(x => x.id === this.citaMedica.clientePoliza.id);
      this.comentarios = await this.comentariosCitasMedicasService.getComentariosByCitaMedica(this.citaMedicaId);


      this.loading = false;

      if (citaMedica.imagenId){
        let foto = await this.imagenService.getImagen(citaMedica.imagenId);
        this.imagen =  foto.documento
        this.nombreDocumento = foto.nombreDocumento
      }
      // this.citaMedica.fotoReclamo = citaMedicaFoto.fotoReclamo 
      
      if (this.imagen) {
        this.imagePreview = this.imagen;
      }else{
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
      this.messageService.add({ severity: 'success', summary: 'Comentario añadido', detail: 'Cita médica cerrada con éxito' });
      this.loading = false
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al añadir el comentario' });
      this.loading = false
    }
  }

  async deleteComentario(comentarioId: number) {
    try {
      await this.comentariosCitasMedicasService.deleteComentario(comentarioId);
      await this.loadComentarios();
      this.messageService.add({ severity: 'success', summary: 'Comentario eliminado', detail: 'Comentario eliminado con éxito' });
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar el comentario' });
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
    console.log('Nombre del archivo:', file.name);

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
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
    this.clientes = await this.usuariosService.obtenerUsuariosPorRolAndEstado(
      this.ROL_CLIENTE_ID,
      this.ESTADO_ACTIVO,
      0,
      10
    );
  }

  private getRouteParams(param: string): Promise<string> {
    return new Promise((resolve) => {
      this.route.queryParams.subscribe((params) => resolve(params[param]));
    });
  }


  filterGlobal(event: Event, dt: any) {
    dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openNew() {
    this.citaMedica = {};
    this.submitted = false;
    this.citaMedicaDialog = true;
  }

  deleteSelectedCitasMedicas() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected claims?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // Implementar lógica para eliminar citasMedicas seleccionadas
        this.selectedCitasMedicas = [];
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Claims Deleted',
          life: 3000,
        });
      },
    });
  }

  async editCitaMedica(citaMedica: any) {
    this.citaMedica = { ...citaMedica };
    this.citaMedicaDialog = true;
  }

  async deleteCitaMedica(citaMedica: any) {
    this.confirmationService.confirm({
      message: 'Estás seguro de eliminar la cita médica?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        await this.citasMedicasService.eliminarCitaMedica(citaMedica.id);
        await this.manageListado()
        
        this.messageService.add({
          severity: 'success',
          summary: 'Enhorabuena!',
          detail: 'Cita médica eliminada exitosamente',
          life: 3000,
        });
      },
    });
  }

  hideDialog() {
    this.citaMedicaDialog = false;
    this.submitted = false;
  }

  async saveCitaMedica() {
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
    this.citaMedica.clientePolizaId = this.selectedClientePoliza.id
    this.citaMedica.nombreDocumento = this.nombreDocumento
    formData.append('citaMedica', new Blob([JSON.stringify(this.citaMedica)], { type: 'application/json' }));
    if (this.imagen) {
      formData.append('fotoCitaMedica', this.imagen);
    }

    try {
      if (this.citaMedica.id) {
        await this.citasMedicasService.actualizarCitaMedica(this.citaMedica.id, formData);
      } else {
        await this.citasMedicasService.guardarCitaMedica(formData);
      }

      this.loading = false;
      this.messageService.add({ severity: 'success', summary: 'Enhorabuena!', detail: 'Operación ejecutada con éxito' });
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar la cita médica' });
    } finally {
      this.loading = false; // Ocultar spinner
    }
  }


  async refrescarListado(type) {
    console.log(this.selectedClientePoliza, this.selectedCliente)
    if (type == "ALL")
      this.citasMedicas = await this.citasMedicasService.obtenerCitasMedicas(this.ESTADO_ACTIVO, null);
    else
      this.citasMedicas = await this.citasMedicasService.obtenerCitasMedicas(undefined, this.selectedClientePoliza.id);
  }

  filterClientes(event): void {
    let query = event.query;
    this.filteredClientes = this.clientes.filter(cliente =>
      cliente.nombres.toLowerCase().indexOf(query.toLowerCase()) === 0);
    }
  
    filterAseguradoras(event): void {
      let query = event.query;
      this.filteredAseguradoras = this.aseguradoras.filter(aseguradora =>
        aseguradora.nombre.toLowerCase().indexOf(query.toLowerCase()) === 0);
    }
  
    filterPolizas(event): void {
      let query = event.query;
      this.filteredPolizas = this.clientePolizas.filter(obj =>
        obj.displayName.toLowerCase().indexOf(query.toLowerCase()) === 0);
    }
  
    async loadPolizas() {
      console.log(this.clientePolizaId)
      if (this.selectedCliente) {
        let clientePolizas = await this.clientesPolizasService.obtenerClientesPolizasPorCliente(this.selectedCliente.id);
        
        if (clientePolizas) {
          clientePolizas = clientePolizas.map(obj => ({
            ...obj,
            displayName: `${obj.id}-${obj.poliza.nombre}`
          }));
          console.log(clientePolizas)
          
          this.clientePolizas = clientePolizas; 
        }
      }
    }
  
    async manageListado(){
      if (this.selectedClientePoliza)
        await this.refrescarListado("CLIENTE_POLIZA");
      else
        await this.refrescarListado("ALL");
    }
  }
  
