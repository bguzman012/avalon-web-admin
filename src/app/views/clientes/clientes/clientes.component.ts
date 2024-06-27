import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { UsuariosService } from '../../../services/usuarios-service';
import { AseguradorasService } from '../../../services/aseguradoras-service';
import { UsuariosAseguradorasService } from '../../../services/usuarios-aseguradoras-service';
import { environment } from '../../../../environments/environment';
import { FilterService } from "primeng/api";
import { AuthService } from 'src/app/services/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'clientes',
  templateUrl: './clientes.component.html',
  styles: [`
  :host ::ng-deep .p-dialog .product-image {
      width: 150px;
      margin: 0 auto 2rem auto;
      display: block;
  }
`],
  styleUrls: ['./clientes.component.scss'],
})

export class ClientesComponent implements OnInit {
  usuarioDialog: boolean;
  usuarios: any[];
  selectedUsuarios: any[];
  submitted: boolean;
  usuario: any;
  ROL_CLIENTE_ID = 3
  ROL_ADMINISTRADOR_ID = 1

  ESTADO_ACTIVO = 'A'
  ESTADO_BUSQUEDA = ''
  TIPO_EMPRESA_ID = 1
  loading: boolean = false;
  rolId
  validarEnable = false
  filteredAseguradoras
  selectedAseguradoras

  constructor(
    private messageService: MessageService,
    private usuariosService: UsuariosService,
    private usuariosAseguradorasService: UsuariosAseguradorasService,
    private confirmationService: ConfirmationService,
    private aseguradorasService: AseguradorasService,
    private filterService: FilterService,
    private router: Router,    
    private authService: AuthService
  
  ) { }

  async ngOnInit() {
    this.refrescarListado(this.ESTADO_BUSQUEDA)
    let user = await this.authService.obtenerUsuarioLoggeado()
    if (user.rol.id == this.ROL_ADMINISTRADOR_ID) this.validarEnable = true
  }

  filterGlobal(event: Event, dt: any) {
    dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openNew() {
    this.usuario = {};
    this.submitted = false;
    this.usuarioDialog = true;
  }

  deleteSelectedUsuarios() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected users?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // Implementar lógica para eliminar usuarios seleccionados
        this.selectedUsuarios = [];
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Users Deleted',
          life: 3000,
        });
      },
    });
  }

  async editUsuario(usuario: any) {
    this.usuario = { ...usuario };
    this.usuario.rolId = this.usuario.rol.id
    this.selectedAseguradoras = await this.aseguradorasService.obtenerAseguradorasByUsuarioAndEstado(this.usuario.id, "A")
    console.log(this.selectedAseguradoras)
    this.usuarioDialog = true;
    // Implementar lógica para editar un usuario
  }
  getEstadoLabel(estado: string): string {
    switch (estado) {
      case 'I':
        return 'Inhabilitado';
      case 'P':
        return 'Pendiente';
      case 'A':
        return 'Activo';
      default:
        return '';
    }
  }
  
  async activar(usuario: any) {
    this.confirmationService.confirm({
      message: 'Estás seguro de activar el usuario ' + usuario.nombres + ' ' + usuario.apellidos + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        await this.usuariosService.partiallyUpdateUsuario(usuario.id, "A", this.ROL_CLIENTE_ID);
        this.refrescarListado(this.ESTADO_BUSQUEDA)

        this.messageService.add({
          severity: 'success',
          summary: 'Enhorabuena!',
          detail: 'Usario habilitado exitosamente',
          life: 3000,
        });
      },
    })
  }

  async deleteUsuario(usuario: any) {
    this.confirmationService.confirm({
      message: 'Estás seguro de inhabilitar el usuario ' + usuario.nombres + ' ' + usuario.apellidos + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        await this.usuariosService.eliminarUsuario(usuario.id, this.ROL_CLIENTE_ID);
        this.refrescarListado(this.ESTADO_BUSQUEDA)

        this.messageService.add({
          severity: 'success',
          summary: 'Enhorabuena!',
          detail: 'Registro inhabilitado exitosamente',
          life: 3000,
        });
      },
    });
  }

  hideDialog() {
    this.usuarioDialog = false;
    this.selectedAseguradoras = []
    this.submitted = false;
  }

  redirectToMembresiasPage(usuario: any) {
    localStorage.setItem("clienteId", usuario.id);
    this.router.navigate(['clientes/membresias'], {
      queryParams: {
        clienteId: usuario.id,
      },
    });
  }

  async saveUsuario() {
    this.submitted = true;
    this.loading = true; // Mostrar spinner
    console.log(this.selectedAseguradoras)
    try {
      if (this.usuario.id) {
        this.usuario.rolId = this.usuario.rol.id
        await this.usuariosService.actualizarUsuario(this.usuario.id, this.usuario, this.ROL_CLIENTE_ID);
        // this.saveUsuariosAseguradoras(this.usuario.id)
      } else {
        this.usuario.rolId = this.ROL_CLIENTE_ID;
        this.usuario.estado = 'P';
        this.usuario.contrasenia = environment.pass_default;
        let usuarioSaved = await this.usuariosService.guardarUsuario(this.usuario, this.ROL_CLIENTE_ID);
        // this.saveUsuariosAseguradoras(usuarioSaved.id)
      }
      this.refrescarListado(this.ESTADO_BUSQUEDA)
      this.usuarioDialog = false;
      this.usuario = {};
      this.filteredAseguradoras = []
      this.messageService.add({ severity: 'success', summary: 'Enhorabuena!', detail: 'Operación ejecutada con éxito' });
    } finally {
      this.loading = false; // Ocultar spinner
    }
  }

  async refrescarListado(estado) {
    this.usuarios = await this.usuariosService.obtenerUsuariosPorRolAndEstado(this.ROL_CLIENTE_ID, estado);
  }

  async filterAseguradoras(event) {
    let filtered: any[] = [];
    let query = event.query;

    let aseguradoras = await this.aseguradorasService.obtenerAseguradorasByEstado('A')

    for (let i = 0; i < aseguradoras.length; i++) {
      let aseguradora = aseguradoras[i];
      if (aseguradora.nombre.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(aseguradora);
      }
    }

    this.filteredAseguradoras = filtered;
  }

  async armarSelectedAseguradorasData(usuarioId) {
    let usuariosAseguradorasIds = []
    console.log(this.selectedAseguradoras)
    for (let index = 0; index < this.selectedAseguradoras.length; index++) {
      const aseguradora = this.selectedAseguradoras[index];
      usuariosAseguradorasIds.push({ aseguradoraId: aseguradora.id, usuarioId: usuarioId })
    }
    return usuariosAseguradorasIds
  }
  async saveUsuariosAseguradoras(usuarioId) {
    let usuariosAseguradorasIds = this.armarSelectedAseguradorasData(usuarioId)

    if (!this.usuario.id)
      await this.usuariosAseguradorasService.guardarUsuariosAseguradoras({ usuariosAseguradoras: usuariosAseguradorasIds });
    else
      await this.usuariosAseguradorasService.updateUsuariosAseguradoras({ usuariosAseguradoras: usuariosAseguradorasIds }, usuarioId);
  }
}
