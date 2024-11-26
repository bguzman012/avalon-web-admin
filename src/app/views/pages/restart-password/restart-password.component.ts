// En RestartPasswordComponent
import {Component} from '@angular/core';
import {AuthService} from '../../../services/auth-service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ConfirmationService, MessageService} from 'primeng/api';
import {Router} from '@angular/router';
import {environment} from '../../../../environments/environment'
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-restart',
  templateUrl: './restart-password.component.html',
  styleUrls: ['./restart-password.component.scss']
})
export class RestartPasswordComponent {

  loginForm: FormGroup;
  loginError: boolean = false;
  loginErrorMessage: string = '';
  loading: boolean = false;
  formularioContrasenia: FormGroup;

  correoElectronico: string;

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private router: Router,
              private confirmationService: ConfirmationService,
              private messageService: MessageService,) {

    this.formularioContrasenia = this.fb.group({
      codigo2FARestartPass: ['', Validators.required],
      nuevaContrasenia: ['', Validators.required],
      confirmarContrasenia: ['', Validators.required],
    });

    this.correoElectronico = localStorage.getItem("CORREO_PASS")
  }
  async cancelar(){
    this.router.navigate(['/login']);
    localStorage.removeItem("CORREO_PASS")
  }

  async confirmar() {
    this.loading = true

    if (this.formularioContrasenia.valid) {
      const codigo2FA = this.formularioContrasenia.get('codigo2FARestartPass')!.value; // Add '!' here
      const nuevaContrasenia = this.formularioContrasenia.get('nuevaContrasenia')!.value; // Add '!' here
      const confirmarContrasenia = this.formularioContrasenia.get('confirmarContrasenia')!.value; // Add '!' here

      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;

      if (!regex.test(nuevaContrasenia)) {
        this.loginErrorMessage = "La nueva contraseña no cumple con los parametros de seguridad"
        this.loading = false
        return
      }

      if (nuevaContrasenia != confirmarContrasenia) {
        this.loginErrorMessage = "Las contraseñas no coinciden"
        this.loading = false
        return
      }

      if (!this.correoElectronico) {
        this.loginErrorMessage = "Correo electrónico es requerido"
        this.loading = false
        return
      }

      // Llamar al servicio para cambiar la contraseña
      this.authService.restartPassw(this.correoElectronico, codigo2FA, nuevaContrasenia)
        .subscribe(
          (response) => {
            this.loading = false;
            console.log(response, "  7776677")

            if (response.asunto == "CODIGO_ERROR")
              return this.messageService.add({
                severity: 'error',
                summary: 'Error!',
                detail: response.message,
                life: 3000,
              });

            this.confirmationService.confirm({
              message: "Su contraseña ha sido cambiada con éxito. ¿Desea continuar a la pantalla para iniciar sesión?",
              header: 'Contraseña cambiada',
              icon: 'pi pi-exclamation-triangle',
              accept: () => {
                this.router.navigate(['/login']);  // Navegar a la página de login u otra página
              },
            });
            localStorage.removeItem("CORREO_PASS")

          },
          (error) => {
            this.loading = false;
            this.loginErrorMessage = error.error.message || 'Ocurrió un error al cambiar la contraseña';
          }
        );
    } else {
      this.loginErrorMessage = "Formulario inválido"
      this.loading = false
    }
  }
}
