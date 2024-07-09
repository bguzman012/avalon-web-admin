import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { PreguntasService } from '../../../services/preguntas-service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth-service';

@Component({
  selector: 'preguntas',
  templateUrl: './preguntas.component.html',
  styles: [
    `
      :host ::ng-deep .p-dialog .product-image {
        width: 150px;
        margin: 0 auto 2rem auto;
        display: block;
      }
    `,
  ],
  styleUrls: ['./preguntas.component.scss'],
})
export class PreguntasComponent implements OnInit {
  preguntaDialog: boolean;
  preguntas: any[];
  selectedPreguntas: any[];
  submitted: boolean;
  pregunta: any;
  loading: boolean = false;
  ESTADO_ACTIVO = 'A';
  ROL_ADMINISTRADOR_ID = 1;
  activarCreate = false;

  constructor(
    private messageService: MessageService,
    private preguntasService: PreguntasService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.loading = true;
    this.refrescarListado();
    let user = await this.authService.obtenerUsuarioLoggeado();
    if (user.rol.id == this.ROL_ADMINISTRADOR_ID) this.activarCreate = true;
    this.loading = false;
  }

  filterGlobal(event: Event, dt: any) {
    dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openNew() {
    this.pregunta = {};
    this.submitted = false;
    this.preguntaDialog = true;
  }

  editPregunta(pregunta: any) {
    this.pregunta = { ...pregunta };
    this.preguntaDialog = true;
  }

  async deletePregunta(pregunta: any) {
    this.confirmationService.confirm({
      message: 'Estás seguro de eliminar la pregunta ' + pregunta.contenido + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        await this.preguntasService.eliminarPregunta(pregunta.id);
        this.refrescarListado();

        this.messageService.add({
          severity: 'success',
          summary: 'Enhorabuena!',
          detail: 'Registro eliminado exitosamente',
          life: 3000,
        });
      },
    });
  }

  hideDialog() {
    this.preguntaDialog = false;
    this.submitted = false;
  }

  async savePregunta() {
    this.submitted = true;
    this.loading = true; // Mostrar spinner
    try {
      if (this.pregunta.id) {
        await this.preguntasService.actualizarPregunta(this.pregunta.id, this.pregunta);
      } else {
        await this.preguntasService.guardarPregunta(this.pregunta);
      }
      this.refrescarListado();
      this.preguntaDialog = false;
      this.pregunta = {};
      this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Pregunta guardada', life: 3000 });
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar pregunta', life: 3000 });
    } finally {
      this.loading = false; // Ocultar spinner
    }
  }

  async refrescarListado() {
    this.loading = true;
    this.preguntas = await this.preguntasService.obtenerPreguntas();
    this.loading = false;
  }
  
  async redirectToDetallesPage(pregunta: any) {
    this.router.navigate(['/preguntas-detalle', pregunta.id]);
  }
}
