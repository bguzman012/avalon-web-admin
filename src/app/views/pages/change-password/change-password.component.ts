// En RestartPasswordComponent
import {Component} from '@angular/core';
import {AuthService} from '../../../services/auth-service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ConfirmationService, MessageService} from 'primeng/api';
import {Router} from '@angular/router';
import {environment} from '../../../../environments/environment'
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-login',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {

  loginForm: FormGroup;
  loginError: boolean = false;
  loginErrorMessage: string = '';
  loading: boolean = false;
  ASUNTO_CAMBIO_CONTRASENIA = "CAMBIO_CONTRASENIA"
  formularioContrasenia: FormGroup;

  contraseniaActual: string;
  nuevaContrasenia: string;
  confirmaContrasenia: string;

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private router: Router,
              private confirmationService: ConfirmationService,
              private messageService: MessageService,) {

    this.formularioContrasenia = this.fb.group({
      contraseniaActual: ['', Validators.required],
      nuevaContrasenia: ['', Validators.required],
      confirmarContrasenia: ['', Validators.required],
    });
  }

  async confirmar() {
    this.loading = true
    console.log("CONFIRMAR")

    if (this.formularioContrasenia.valid) {
      const contraseniaActual = this.formularioContrasenia.get('contraseniaActual')!.value; // Add '!' here
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


      let user = await this.authService.obtenerUsuarioLoggeado()

      // Llamar al servicio para cambiar la contraseña
      this.authService.changePassw(user.nombreUsuario, contraseniaActual, nuevaContrasenia)
        .subscribe(
          (response) => {
            this.loading = false;
            console.log(response, "  7776677")

            this.confirmationService.confirm({
              message: "Su contraseña ha sido cambiada con éxito. ¿Desea continuar a la pantalla para iniciar sesión?",
              header: 'Contraseña cambiada',
              icon: 'pi pi-exclamation-triangle',
              accept: () => {
                this.router.navigate(['/login']);  // Navegar a la página de login u otra página
              },
            });

          },
          (error) => {
            this.loading = false;
            this.loginErrorMessage = error.error.message || 'Ocurrió un error al cambiar la contraseña';
          }
        );
      //   this.authService.login(username, password)
      //     .subscribe(
      //       (response) => {
      //         this.loading = false
      //         this.router.navigate(['/clientes']);
      //       },
      //       (error) => {
      //         // Handle login error
      //         console.error('Login error:', error);
      //         this.loginError = true
      //
      //         if (error.error) {
      //           if (error?.error?.asunto == this.ASUNTO_CAMBIO_CONTRASENIA) {
      //             this.confirmationService.confirm({
      //               message:
      //               error.error.message + ". ¿Desea continuar?",
      //               header: 'Cambio de contraseña requerido',
      //               icon: 'pi pi-exclamation-triangle',
      //               accept: async () => {
      //
      //               },
      //             });
      //           } else
      //             this.loginErrorMessage = error.error.message
      //
      //
      //         } else {
      //           this.loginErrorMessage = "Ocurrió un error inesperado en la ejecución de la consulta"
      //         }
      //         this.loading = false
      //
      //       }
      //     );
    } else {
      // Handle form validation errors

      this.loginErrorMessage = "Formulario inválido"
      this.loading = false
    }
  }
}
