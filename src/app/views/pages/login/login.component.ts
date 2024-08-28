// En ChangePasswordComponent
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
  loginErrorMessage: string = '';
  loading: boolean = false;
  ASUNTO_CAMBIO_CONTRASENIA = "CAMBIO_CONTRASENIA"

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private router: Router,
              private confirmationService: ConfirmationService,
              private messageService: MessageService,) {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn == true)
      this.router.navigate(['/pets/usuarios']);

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

      this.authService.login(username, password)
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
            } else {
              // Lógica para un inicio de sesión exitoso normal
              this.router.navigate(['/clientes']);
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
}
