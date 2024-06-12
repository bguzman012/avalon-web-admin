// En LoginComponent
import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment'
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

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private messageService: MessageService,) {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn == true)
      this.router.navigate(['/pets/usuarios']);

    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  login(): void {
    this.loading = true
    if (this.loginForm.valid) {
      const username = this.loginForm.get('username')!.value; // Add '!' here
      const password = this.loginForm.get('password')!.value; // Add '!' here

      this.authService.login(username, password)
        .subscribe(
          (response) => {
            this.loading = false
            this.router.navigate(['/usuarios']);
          },
          (error) => {
            // Handle login error
            console.error('Login error:', error);
            this.loginError = true

            if (error.error) {
              this.loginErrorMessage = error.error.message
            }else{
              this.loginErrorMessage = "Ocurrió un error inesperado en la ejecución de la consulta"
            }

            this.loading = false

          }
        );
    } else {
      // Handle form validation errors

      this.loginErrorMessage = "Formulario inválido"
      this.loading = false
    }
  }
}