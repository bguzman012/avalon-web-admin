import { Component, OnInit } from '@angular/core';
import { ConfirmationService, SortEvent } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { UsuariosService } from '../../../services/usuarios-service';
import { PaisesService } from '../../../services/paises-service';
import { EstadosService } from '../../../services/estados-service';
import { AseguradorasService } from '../../../services/aseguradoras-service';
import { environment } from '../../../../environments/environment';
import { FilterService } from 'primeng/api';
import { AuthService } from 'src/app/services/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'clientes',
  templateUrl: './clientes.component.html',
  styles: [
    `
      :host ::ng-deep .p-dialog .product-image {
        width: 150px;
        margin: 0 auto 2rem auto;
        display: block;
      }
    `,
  ],
  styleUrls: ['./clientes.component.scss'],
})
export class ClientesComponent implements OnInit {
  usuarioDialog: boolean;
  usuarios: any[];

  paises: any[];
  estados: any[];

  pais: any;
  estado: any;

  filteredPaises: any[];
  filteredEstados: any[];

  selectedUsuarios: any[];
  submitted: boolean;
  usuario: any;
  direccion: any;

  ROL_CLIENTE_ID = 3;
  ROL_ADMINISTRADOR_ID = 1;

  ESTADO_ACTIVO = 'A';
  ESTADO_BUSQUEDA = '';
  TIPO_EMPRESA_ID = 1;
  loading: boolean = false;
  rolId;
  validarEnable = false;
  filteredAseguradoras;

  first: number = 0;
  pageSize: number = 10;
  totalRecords: number = 0;

  busqueda: string = '';
  sortField
  sortOrder

  constructor(
    private messageService: MessageService,
    private usuariosService: UsuariosService,
    private paisesService: PaisesService,
    private estadosService: EstadosService,
    private confirmationService: ConfirmationService,
    private aseguradorasService: AseguradorasService,
    private filterService: FilterService,
    private router: Router,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.loading = true;
    await this.refrescarListado(this.ESTADO_BUSQUEDA);
    let user = await this.authService.obtenerUsuarioLoggeado();
    if (user.rol.id == this.ROL_ADMINISTRADOR_ID) this.validarEnable = true;
    this.loading = false;
  }

  async onPageChange(event) {
    this.loading = true;
    this.first = event.first;
    this.pageSize = event.rows;
    await await this.refrescarListado(this.ESTADO_BUSQUEDA);
    this.loading = false;
  }

  async filterGlobal(event: Event, dt: any) {
    this.first = 0;
    this.busqueda = (event.target as HTMLInputElement).value;
    if (this.busqueda.length == 0 || this.busqueda.length >= 3)
      await this.refrescarListado(this.ESTADO_BUSQUEDA);

    // dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  async prepareData() {
    this.paises = await this.paisesService.obtenerPaises();
  }

  async onSort(event: SortEvent) {
    if (event.field !== this.sortField || event.order !== this.sortOrder) {
      this.sortField = event.field;
      this.sortOrder = event.order;
      await this.refrescarListado(this.ESTADO_BUSQUEDA);
    }
  }

  openNew() {
    this.usuario = {};
    this.direccion = {};
    this.submitted = false;
    this.usuario.fechaNacimiento = new Date();

    this.prepareData();
    this.usuarioDialog = true;
  }

  async loadEstados() {
    if (this.pais.id)
      this.estados = await this.estadosService.obtenerEstadosByPais(
        this.pais.id
      );
  }

  redirectToClientePolizaPage(cliente: any) {
    localStorage.setItem('clienteId', cliente.id);
    localStorage.setItem("cliente", JSON.stringify(cliente));
    this.router.navigate(['clientes/polizas'], {
      queryParams: {
        clienteId: cliente.id,
      },
    });
  }

  async editUsuario(usuario: any) {
    this.usuario = { ...usuario };
    this.usuario.rolId = this.usuario.rol.id;


    this.usuario.fechaNacimiento = this.usuario?.fechaNacimiento ? new Date(this.usuario.fechaNacimiento + 'T23:59:00Z') : new Date();

    this.prepareData();
    if (this.usuario.direccion) {
      this.direccion = this.usuario.direccion;
      this.pais = this.direccion.pais;
    } else this.direccion = {};

    if (this.pais) this.loadEstados();

    if (this.direccion) this.estado = this.direccion.state;

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
      message:
        'Estás seguro de activar el usuario ' +
        usuario.nombres +
        ' ' +
        usuario.apellidos +
        '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        this.loading = true
        await this.usuariosService.partiallyUpdateUsuario(
          usuario.id,
          'A',
          this.ROL_CLIENTE_ID
        );
        this.first = 0;
        await this.refrescarListado(this.ESTADO_BUSQUEDA);
        this.loading = false
        this.messageService.add({
          severity: 'success',
          summary: 'Enhorabuena!',
          detail: 'Usario habilitado exitosamente',
          life: 3000,
        });

      },
    });
  }

  async deleteUsuario(usuario: any) {
    this.confirmationService.confirm({
      message:
        'Estás seguro de inhabilitar el usuario ' +
        usuario.nombres +
        ' ' +
        usuario.apellidos +
        '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        await this.usuariosService.eliminarUsuario(
          usuario.id,
          this.ROL_CLIENTE_ID
        );
        this.first = 0;
        await this.refrescarListado(this.ESTADO_BUSQUEDA);

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
    this.submitted = false;
  }

  redirectToMembresiasPage(usuario: any) {
    localStorage.setItem('clienteId', usuario.id);
    localStorage.setItem("cliente", JSON.stringify(usuario));
    this.router.navigate(['clientes/membresias'], {
      queryParams: {
        clienteId: usuario.id,
      },
    });
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

  async saveUsuario() {
    this.submitted = true;
    this.loading = true; // Mostrar spinner
    try {
      if (this.usuario.id) {
        this.usuario.rolId = this.usuario.rol.id;
        this.direccion.paisId = this.pais.id;
        this.direccion.estadoId = this.estado.id;
        this.usuario.direccion = this.direccion;
        await this.usuariosService.actualizarUsuario(
          this.usuario.id,
          this.usuario,
          this.ROL_CLIENTE_ID
        );
      } else {
        this.usuario.rolId = this.ROL_CLIENTE_ID;
        this.usuario.estado = 'P';
        this.direccion.paisId = this.pais.id;
        this.direccion.estadoId = this.estado.id;
        this.usuario.direccion = this.direccion;
        console.log(this.usuario);
        let usuarioSaved = await this.usuariosService.guardarUsuario(
          this.usuario,
          this.ROL_CLIENTE_ID
        );
      }
      this.first = 0;
      await this.refrescarListado(this.ESTADO_BUSQUEDA);
      this.usuarioDialog = false;
      this.usuario = {};
      this.filteredAseguradoras = [];
      this.messageService.add({
        severity: 'success',
        summary: 'Enhorabuena!',
        detail: 'Operación ejecutada con éxito',
      });
    } finally {
      this.loading = false; // Ocultar spinner
    }
  }

  async refrescarListado(estado) {
    const response = await this.usuariosService.obtenerUsuariosPorRolAndEstado(
      this.ROL_CLIENTE_ID,
      estado,
      this.first / this.pageSize,
      this.pageSize,
      this.busqueda,
      this.sortField,
      this.sortOrder
    );

    this.usuarios = response.data;
    this.totalRecords = response.totalRecords;
  }
}
