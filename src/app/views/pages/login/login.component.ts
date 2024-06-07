// En LoginComponent
import { Component } from '@angular/core';
import { ApiServiceService } from '../../../services/api-service.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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

  constructor(private fb: FormBuilder, private apiService: ApiServiceService, private router: Router) {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn == true)
      this.router.navigate(['/pets/usuarios']);

    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  login(): void {
    if (this.loginForm.valid) {
      const username = this.loginForm.get('username')!.value; // Add '!' here
      const password = this.loginForm.get('password')!.value; // Add '!' here

      this.apiService.loggin(username, password)
        .subscribe(
          (response) => {
            const credenciales = {
              username: username,
              password: password
            };
            // Handle successful login
            const credencialesEncriptadas = CryptoJS.AES.encrypt(JSON.stringify(credenciales), environment.secret).toString();

            localStorage.setItem('cred', credencialesEncriptadas);
            localStorage.setItem('isLoggedIn', 'true');
            this.router.navigate(['/usuarios/funcionalidades']);
          },
          (error) => {
            // Handle login error
            console.error('Login error:', error);
          }
        );
    } else {
      // Handle form validation errors
      console.error('Form is not valid');
    }
  }
}