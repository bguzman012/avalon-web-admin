import {Component, OnInit} from '@angular/core';
import {ConfirmationService, SortEvent} from 'primeng/api';
import {MessageService} from 'primeng/api';
import {CentrosMedicosService} from '../../../services/centros-medicos-service';
import {environment} from '../../../../environments/environment';
import {Router} from '@angular/router';
import {AuthService} from 'src/app/services/auth-service';
import {PaisesService} from "../../../services/paises-service";
import {EstadosService} from "../../../services/estados-service";

@Component({
  selector: 'app-migraciones',
  templateUrl: './reportes.component.html',
  styles: [`
    :host ::ng-deep .p-dialog .product-image {
      width: 150px;
      margin: 0 auto 2rem auto;
      display: block;
    }
  `],
  styleUrls: ['./reportes.component.scss'],
})

export class ReportesComponent implements OnInit {

  opciones = [
    {desc: "Clientes por Aseguradora, Seguro, Broker, Agente", code: "CLI_ASEG"},
    {desc: "Cliente titular y dependientes", code: "CLI_TITULAR"},
    {desc: "Vencimiento de membresías (vencidas y por vencer)", code: "CLI_MEMBR_VENC"},
    {desc: "Citas médicas gestionadas, por gestionar, cerrados", code: "CLI_MEDICAS"},
    {desc: "Casos", code: "CASOS"},
    {desc: "Reembolsos gestionados, por gestionar, cerrados", code: "REEMBOLSOS"},
    {desc: "Atenciones por cliente (citas médicas, activación de casos, reembolsos)", code: "CITAS_REEMBOL_EMERGEN"},
    {desc: "Casos y eventos por caso", code: "CASOS_CASO"},
    {desc: "Casos por cliente", code: "CASOS_CLIENTE"}]

  opcion

  constructor() {
  }

  async ngOnInit() {
    this.opcion = "CLI_ASEG"

  }

}
