import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { AseguradorasService } from '../../../services/aseguradoras-service';
import { MembresiasService } from '../../../services/membresias-service';
import { ClientesMembresiasService } from '../../../services/clientes-membresias-service';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuariosService } from 'src/app/services/usuarios-service';
import { AuthService } from 'src/app/services/auth-service';

@Component({
  selector: 'app-clientes-membresias',
  templateUrl: './clientes-membresias.component.html',
  styles: [
    `
      :host ::ng-deep .p-dialog .product-image {
        width: 150px;
        margin: 0 auto 2rem auto;
        display: block;
      }
    `,
  ],
  styleUrls: ['./clientes-membresias.component.scss'],
})
export class ClientesMembresiasComponent implements OnInit {
  clienteMembresiaDialog: boolean;
  clienteMembresias: any[]; // Lista de clientes membresía
  selectedClientesMembresia: any[];
  submitted: boolean;
  clienteMembresia: any;
  loading: boolean = false;

  aseguradora: any;
  membresia: any;
  cliente: any;
  asesor: any;
  broker: any;

  aseguradoraId;
  membresiaId;
  clienteId;
  asesorId;
  brokerId;

  aseguradoras: any[];
  membresias: any[];
  clientes: any[];
  asesores: any[];
  brokers: any[];

  ESTADO_ACTIVO = 'A';

  ROL_ASESOR_ID = 2;
  ROL_CLIENTE_ID = 3;
  ROL_BROKER_ID = 4;

  filteredAseguradoras;
  filteredMembresias;
  filteredClientes;
  filteredAsesores;
  filteredBrokers;

  vigenciaMeses

  user

  constructor(
    private messageService: MessageService,
    // private clientesMembresiaService: ClientesMembresiaService,
    private aseguradorasService: AseguradorasService,
    private membresiasService: MembresiasService,
    private usuarioService: UsuariosService,
    private clientesMembresiasService: ClientesMembresiasService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) { }

  async ngOnInit() {
    this.loading = true
    this.membresiaId = +(await this.getRouteParams('membresiaId'));

    if (!this.membresiaId)
      this.membresiaId = localStorage.getItem('membresiaId');

    this.user = await this.authService.obtenerUsuarioLoggeado()

    this.refrescarListado(this.ESTADO_ACTIVO);
    this.loading = false

  }

  filterGlobal(event: Event, dt: any) {
    dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  async openNew() {
    this.clienteMembresia = {};
    this.loading = true

    this.clienteMembresia.fechaInicio = new Date();
    
    await this.prepareData()

    this.membresia = this.membresias.find(
        (membresia) => membresia.id == this.membresiaId
      );
    

    this.cliente = null;
    this.asesor = null;
    this.vigenciaMeses = this.membresia.vigenciaMeses;

    if (this.user.rol.id == this.ROL_ASESOR_ID) this.asesor = this.user

    this.calcularFechaFin()
    this.submitted = false;
    this.clienteMembresiaDialog = true;
    this.loading = false

  }

  async editClienteMembresia(clienteMembresia: any) {
    this.clienteMembresia = { ...clienteMembresia };
    this.clienteMembresia.fechaInicio = new Date(this.clienteMembresia.fechaInicio + 'T23:59:00Z');
    this.clienteMembresia.fechaFin = new Date(this.clienteMembresia.fechaFin + 'T23:59:00Z');

    await this.prepareData()
    this.membresia = this.clienteMembresia.membresia;
    this.cliente = this.clienteMembresia.cliente;
    this.asesor = this.clienteMembresia.asesor;
    this.vigenciaMeses = this.membresia.vigenciaMeses;
    this.clienteMembresiaDialog = true;
  }

  async prepareData(){
    this.clientes = await this.usuarioService.obtenerUsuariosPorRolAndEstado(
      this.ROL_CLIENTE_ID,
      this.ESTADO_ACTIVO,
      0,
      10,
      ""
    );

    this.asesores =
      await this.usuarioService.obtenerUsuariosPorRolAndEstado(
        this.ROL_ASESOR_ID,
        this.ESTADO_ACTIVO,
        0,
        10,
        ""
      );

    this.membresias =
      await this.membresiasService.obtenerMembresiasByEstado(
        this.ESTADO_ACTIVO
      );

  }

  calcularFechaFin() {
    if (this.membresia.vigenciaMeses) {
      this.vigenciaMeses = `${this.membresia.vigenciaMeses} ${this.membresia.vigenciaMeses > 1 ? 'meses' : 'mes'}`;
    } else {
      this.vigenciaMeses = undefined;
    }

    if (this.membresia.vigenciaMeses && this.clienteMembresia.fechaInicio) {
        const fechaInicio = new Date(this.clienteMembresia.fechaInicio);
        const vigenciaMeses = this.membresia.vigenciaMeses;
        const fechaFin = new Date(fechaInicio.setMonth(fechaInicio.getMonth() + vigenciaMeses));
        this.clienteMembresia.fechaFin = fechaFin;
    }
  }

  async deleteClienteMembresia(clienteMembresia: any) {
    // this.confirmationService.confirm({
    //   message: 'Estás seguro de eliminar la membresía ' + clienteMembresia.cliente + '?',
    //   header: 'Confirmar',
    //   icon: 'pi pi-exclamation-triangle',
    //   accept: async () => {
    //     await this.clientesMembresiaService.eliminarClienteMembresia(clienteMembresia.id);
    //     this.refrescarListado(this.ESTADO_ACTIVO);
    //     this.messageService.add({
    //       severity: 'success',
    //       summary: 'Enhorabuena!',
    //       detail: 'Registro eliminado exitosamente',
    //       life: 3000,
    //     });
    //   },
    // });
  }

  hideDialog() {
    this.clienteMembresiaDialog = false;
    this.submitted = false;
  }

  async saveClienteMembresia() {
    this.submitted = true;
    this.loading = true; // Mostrar spinner
    try {
      if (this.clienteMembresia.id) {
        let clienteMembresiaToUpdate = {
          membresiaId: this.membresia.id,
          clienteId: this.cliente.id,
          asesorId: this.asesor.id,
          fechaInicio: this.clienteMembresia.fechaInicio,
          fechaFin: this.clienteMembresia.fechaFin
        }
        await this.clientesMembresiasService.actualizarClienteMembresia(
          this.clienteMembresia.id, clienteMembresiaToUpdate
        );
        
      } else {
        this.clienteMembresia.membresiaId = this.membresia.id;
        this.clienteMembresia.clienteId = this.cliente.id;
        this.clienteMembresia.asesorId = this.asesor.id;
        console.log(this.clienteMembresia)
        await this.clientesMembresiasService.guardarClienteMembresia(
          this.clienteMembresia
        );
      }

      this.refrescarListado(this.ESTADO_ACTIVO);
      this.clienteMembresiaDialog = false;
      this.clienteMembresia = {};
      this.messageService.add({
        severity: 'success',
        summary: 'Enhorabuena!',
        detail: 'Operación ejecutada con éxito',
      });
    } finally {
      this.loading = false; // Ocultar spinner
    }
  }

  async refrescarListado(estado: string) {
    this.clienteMembresias =
      await this.clientesMembresiasService.obtenerUsuariosMembresiaByMebresiaId(
        this.membresiaId
      );

  }

  private getRouteParams(param: string): Promise<string> {
    return new Promise((resolve) => {
      this.route.queryParams.subscribe((params) => resolve(params[param]));
    });
  }

  filterAseguradora(event) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.aseguradoras.length; i++) {
      let aseguradora = this.aseguradoras[i];
      if (aseguradora.nombre.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(aseguradora);
      }
    }

    this.filteredAseguradoras = filtered;
  }

  filterMembresia(event) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.membresias.length; i++) {
      let membresia = this.membresias[i];
      if (membresia.nombres.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(membresia);
      }
    }

    this.filteredMembresias = filtered;
  }

  filterClientes(event) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.clientes.length; i++) {
      let cliente = this.clientes[i];
      if (
        cliente.nombreUsuario.toLowerCase().indexOf(query.toLowerCase()) == 0
      ) {
        filtered.push(cliente);
      }
    }

    this.filteredClientes = filtered;
  }

  filterAsesores(event) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.asesores.length; i++) {
      let asesor = this.asesores[i];
      if (
        asesor.nombreUsuario
          .toLowerCase()
          .indexOf(query.toLowerCase()) == 0
      ) {
        filtered.push(asesor);
      }
    }

    this.filteredAsesores = filtered;
    console.log(this.filteredAsesores)
  }


  filterBrokers(event) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.brokers.length; i++) {
      let broker = this.brokers[i];
      if (
        broker.usuario.nombreUsuario
          .toLowerCase()
          .indexOf(query.toLowerCase()) == 0
      ) {
        filtered.push(broker);
      }
    }

    this.filteredBrokers = filtered;
  }
}
