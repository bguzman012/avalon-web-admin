import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { ClassToggleService, HeaderComponent } from '@coreui/angular';

@Component({
  selector: 'app-default-header',
  templateUrl: './default-header.component.html',
})
export class DefaultHeaderComponent extends HeaderComponent {

  @Input() sidebarId: string = "sidebar";

  public newMessages = new Array(4)
  public newTasks = new Array(5)
  public newNotifications = new Array(5)

  constructor(private classToggler: ClassToggleService, private router: Router) {
    super();
  }

  redirigirMenu(){
    this.router.navigate([`/usuarios/edit-personal-info`]);
  }

  cerrarSesion() {
    // Aquí puedes realizar las acciones necesarias para cerrar la sesión, como limpiar el token, redirigir a la página de inicio de sesión, etc.
    console.log('Cerrando sesión...');
    // Ejemplo: Redirigir a la página de inicio de sesión
    localStorage.removeItem('isLoggedIn')
    this.router.navigate(['/login']);
  }
}
