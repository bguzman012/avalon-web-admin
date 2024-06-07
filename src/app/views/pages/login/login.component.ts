// En LoginComponent
import { Component } from '@angular/core';
import { ApiServiceService } from '../../../services/api-service.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

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

      this.apiService.logginButton(username, password)
        .subscribe(
          (response) => {
            // Handle successful login
            console.log('Login successful:', response);
            localStorage.setItem('isLoggedIn', 'true');
            this.router.navigate(['/pets/usuarios']);
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