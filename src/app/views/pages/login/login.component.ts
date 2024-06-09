// En LoginComponent
import { Component } from '@angular/core';
import { ApiServiceService } from '../../../services/api-service.service';
import { AuthService } from '../../../services/auth.service';
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

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
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

      this.authService.login(username, password)
        .subscribe(
          (response) => {
            this.router.navigate(['/usuarios']);
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