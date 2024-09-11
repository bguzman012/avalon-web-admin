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
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  loginForm: FormGroup;
  loginError: boolean = false;
  dosFADialog: boolean = false;
  forgotPassDialog: boolean = false;
  submitted: boolean = false;

  inputDosFa: string = ""
  inputCorreo: string = ""

  loginErrorMessage: string = '';
  verificationCodeMessage: string = '';
  loading: boolean = false;
  ASUNTO_CAMBIO_CONTRASENIA = "CAMBIO_CONTRASENIA"
  ASUNTO_LOGIN_EXITOSO_2FA = "LOGIN_EXITOSO_2FA"

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private router: Router,
              private confirmationService: ConfirmationService,
              private messageService: MessageService,) {
    const AUTENTICADO_2FA = this.authService.getAutenticadoDosFA();

    console.log("CONSTR")

    if (AUTENTICADO_2FA == "AUTENTICADO_2FA")
      this.router.navigate(['/clientes']);

    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  login(): void {
    this.loading = true;

    if (this.loginForm.valid) {
      const username = this.loginForm.get('username')!.value;
      const password = this.loginForm.get('password')!.value;

      this.authService.login(username, password, "SI")
        .subscribe(
          (response) => {
            this.loading = false;

            if (response.asunto === this.ASUNTO_CAMBIO_CONTRASENIA) {

              // Mostrar ConfirmationService si se requiere un cambio de contraseña
              this.confirmationService.confirm({
                message: response.message + ". ¿Desea continuar?",
                header: 'Cambio de contraseña requerido',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                  this.router.navigate(['change-password']);
                },
              });
            }
            if (response.asunto === this.ASUNTO_LOGIN_EXITOSO_2FA) {
              // Lógica para un inicio de sesión exitoso normal
              // this.router.navigate(['/clientes']);
              this.dosFADialog = true
            }
          },
          (error) => {
            // Manejar error de inicio de sesión
            console.error('Login error:', error);
            this.loginError = true;

            if (error.error) {
              this.loginErrorMessage = error.error.message;
            } else {
              this.loginErrorMessage = "Ocurrió un error inesperado en la ejecución de la consulta";
            }

            this.loading = false;
          }
        );
    } else {
      // Manejar errores de validación del formulario
      this.loginErrorMessage = "Formulario inválido";
      this.loading = false;
    }
  }

  enviarCodigoPorCorreo() {
    this.loading = true
    this.authService.sendCodeByMail(this.inputCorreo)
      .subscribe(
        (response) => {
          setTimeout(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Enhorabuena!',
              detail: 'Código enviado exitosamente',
              life: 2000,
            });
          }, 2000); // 2000 milisegundos = 2 segundos

          localStorage.setItem("CORREO_PASS", this.inputCorreo)
          this.router.navigate(['restart-password']);
          this.loading = false;
        },
        (error) => {
          // Manejar error de inicio de sesión
          console.error('Login error:', error);
          this.loginError = true;
          this.loginErrorMessage = "Ocurrió un error inesperado en la ejecución de la consulta";
          this.loading = false;
        }
      );
  }

  async verificarCodigo() {
    this.submitted = true
    if (!this.inputDosFa) return

    if (this.inputDosFa.length != 6) {
      this.verificationCodeMessage = "El código ingresado debe tener 6 dígitos"
      return
    }

    localStorage.setItem("VERIFICANDO_2FA", "SI")

    this.loading = true
    try {
      let user = await this.authService.obtenerUsuarioLoggeado()

      // Llamar al servicio para cambiar la contraseña
      this.authService.verifyCode(user.nombreUsuario, this.inputDosFa)
        .subscribe(
          (response) => {
            this.loading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Enhorabuena!',
              detail: 'Código verificado correctamente',
              life: 3000,
            });
            this.dosFADialog = false
            localStorage.removeItem("VERIFICANDO_2FA")
            this.authService.setAutenticado2FA();
            this.router.navigate(['/clientes']);
          },
          (error) => {
            this.loading = false;
            this.verificationCodeMessage = error.error.message || 'Ocurrió un error al verificar código 2FA';
          }
        );
    } catch (error) {
      this.verificationCodeMessage = 'Ocurrió un error al verificar código 2FA';
      this.loading = false;
    }
  }

  showForgotPasswordDialog() {
    this.forgotPassDialog = true
  }

  async reenviarCodigo() {
    this.loading = true

    let user = await this.authService.obtenerUsuarioLoggeado()

    // Llamar al servicio para cambiar la contraseña
    this.authService.enviarCodigo2FA(user.nombreUsuario)
      .subscribe(
        (response) => {
          this.loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Código 2FA',
            detail: 'Código 2FA enviado exitosamente',
            life: 3000,
          });
        },
        (error) => {
          this.loading = false;
          this.verificationCodeMessage = error.error.message || 'Ocurrió un error al verificar código 2FA';
        }
      );
  }

  cancelar() {
    this.submitted = false
    this.dosFADialog = false
  }
}
