import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { AseguradorasService } from '../../../services/aseguradoras-service';
import { MembresiasService } from '../../../services/membresias-service';
import { ClientesMembresiasService } from '../../../services/clientes-membresias-service';
import { UsuarioAseguradorUsuarioMembresiasService } from '../../../services/usu-aseg-usu-memb-service';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuariosService } from 'src/app/services/usuarios-service';
import { UsuariosAseguradorasService } from 'src/app/services/usuarios-aseguradoras-service';

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
  clientesMembresia: any[]; // Lista de clientes membresía
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
  usuariosMembresiasUsuAseguradora: any[];

  ESTADO_ACTIVO = 'A';

  ROL_ASESOR_ID = 2;
  ROL_CLIENTE_ID = 3;
  ROL_BROKER_ID = 4;

  filteredAseguradoras;
  filteredMembresias;
  filteredClientes;
  filteredAsesores;
  filteredBrokers;

  constructor(
    private messageService: MessageService,
    // private clientesMembresiaService: ClientesMembresiaService,
    private aseguradorasService: AseguradorasService,
    private membresiasService: MembresiasService,
    private usuarioService: UsuariosService,
    private clientesMembresiasService: ClientesMembresiasService,
    private confirmationService: ConfirmationService,
    private usuarioAseguradoraService: UsuariosAseguradorasService,
    private route: ActivatedRoute,
    private router: Router,
    private usuarioAseguradorUsuarioMembresiasService: UsuarioAseguradorUsuarioMembresiasService
  ) {}

  async ngOnInit() {
    this.loading = true
    this.membresiaId = +(await this.getRouteParams('membresiaId'));

    if (!this.membresiaId)
      this.membresiaId = localStorage.getItem('membresiaId');

      this.refrescarListado(this.ESTADO_ACTIVO);
      this.loading = false

  }

  armarDataUsuMembresiaUsuAseguradora(usuariosMembresiasUsuAseguradoraTmp) {
    let usuariosAseguradoraUsuariosMembresia = [];
    for (
      let index = 0;
      index < usuariosMembresiasUsuAseguradoraTmp.length;
      index++
    ) {
      const element = usuariosMembresiasUsuAseguradoraTmp[index];
      let usuAsegUsuMembAsesor = element.usuAseguradoraUsuMembresiaList.find(
        (objeto) =>
          objeto.usuarioAseguradora.usuario.rol.id == this.ROL_ASESOR_ID
      );

      let asesorAseguradora = usuAsegUsuMembAsesor.usuarioAseguradora;

      usuariosAseguradoraUsuariosMembresia.push({
        usuario: element.usuario,
        aseguradora: element.aseguradora,
        membresia: element.membresia,
        asesor: asesorAseguradora,
      });
    }
    return usuariosAseguradoraUsuariosMembresia;
  }

  filterGlobal(event: Event, dt: any) {
    dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  async openNew() {
    this.clienteMembresia = {};
    this.loading = true
    
    this.clientes = await this.usuarioService.obtenerUsuariosPorRolAndEstado(
      this.ROL_CLIENTE_ID,
      this.ESTADO_ACTIVO
    ); // Obtener lista de aseguradoras

    this.asesores =
      await this.usuarioService.obtenerUsuariosPorRolAndEstado(
        this.ROL_ASESOR_ID,
        this.ESTADO_ACTIVO
      );

    this.membresias =
      await this.membresiasService.obtenerMembresiasByEstado(
        this.ESTADO_ACTIVO
      );

      console.log(this.membresias)

    if (this.membresiaId) {
      this.membresia = this.membresias.find(
        (membresia) => membresia.id == this.membresiaId
      );
    }
    console.log(this.membresia)

    this.cliente = null;
    this.asesor = null;

    this.submitted = false;
    this.clienteMembresiaDialog = true;
    this.loading = false

  }

  editClienteMembresia(clienteMembresia: any) {
    this.clienteMembresia = { ...clienteMembresia };
    this.clienteMembresiaDialog = true;
    this.aseguradora = this.clienteMembresia.aseguradora;
    this.membresia = this.clienteMembresia.membresia;
    this.cliente = this.clienteMembresia.usuario;
    this.asesor = this.clienteMembresia.asesor;

    console.log(this.clienteMembresia.asesor.usuario)
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
        // await this.guardarClienteMembresia.actualizarClienteMembresia(this.clienteMembresia.id, this.clienteMembresia);
      } else {
        this.clienteMembresia.membresiaId = this.membresia.id;
        this.clienteMembresia.usuarioId = this.cliente.id;
        let usuarioMembresia =
          await this.clientesMembresiasService.guardarClienteMembresia(
            this.clienteMembresia
          );
        await this.guardarUsuaSegUsuMemb(usuarioMembresia.id);
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
    let usuariosMembresiasUsuAseguradoraTmp =
    await this.clientesMembresiasService.obtenerUsuariosMembresiaByMebresiaId(
      this.membresiaId
    );

  this.usuariosMembresiasUsuAseguradora =
    this.armarDataUsuMembresiaUsuAseguradora(
      usuariosMembresiasUsuAseguradoraTmp
    );
    // this.clientesMembresia = await this.clientesMembresiaService.obtenerClientesMembresiaByAseguradora(this.aseguradoraId); // Obtener lista de clientes membresía
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
  }

  async guardarUsuaSegUsuMemb(usuarioMembresiaId) {
    let asesorAsegUsuMemb = {
      usuarioAseguradoraId: this.asesor.id,
      usuarioMembresiaId: usuarioMembresiaId,
    };

    let brokerAsegUsuMemb = {
      usuarioAseguradoraId: this.broker.id,
      usuarioMembresiaId: usuarioMembresiaId,
    };

    await this.usuarioAseguradorUsuarioMembresiasService.guardarUsuAsegUsuMemb(
      asesorAsegUsuMemb
    );
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