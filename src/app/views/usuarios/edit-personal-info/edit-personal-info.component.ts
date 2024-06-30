import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../services/auth-service';

import { AseguradorasService } from '../../../services/aseguradoras-service';
import { environment } from '../../../../environments/environment';
import { FilterService } from "primeng/api";
import { UsuariosService } from 'src/app/services/usuarios-service';

@Component({
  selector: 'app-personal-info',
  templateUrl: './edit-personal-info.component.html',
  styles: [`
  :host ::ng-deep .p-dialog .product-image {
      width: 150px;
      margin: 0 auto 2rem auto;
      display: block;
  }
`],
  styleUrls: ['./edit-personal-info.component.scss'],
})

export class EditPersonalInfoComponent implements OnInit {
  usuario
  submitted = false;
  loading = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private messageService: MessageService,
    private usuariosService: UsuariosService
  ) { }

  async ngOnInit() {
    this.usuario = await this.authService.obtenerUsuarioLoggeado()
  }

  async saveUsuario(){
    this.loading = true
    await this.usuariosService.actualizarUsuario(this.usuario.id, this.armarData(), this.usuario.rol.id);
    this.loading = false
    this.messageService.add({ severity: 'success', summary: 'Enhorabuena!', detail: 'Operación ejecutada con éxito' });
  }

  armarData(){
    return {
      nombres: this.usuario.nombres,
      apellidos: this.usuario.apellidos,
      correoElectronico: this.usuario.correoElectronico,
      numeroTelefono: this.usuario.numeroTelefono,
      estado: this.usuario.estado,
      rolId: this.usuario.rol.id
    }
  }

}
