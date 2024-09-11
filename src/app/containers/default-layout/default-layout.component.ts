import { Component, OnInit } from '@angular/core';

import { navItems, navItemsAdmin } from './_nav';
import { AuthService } from 'src/app/services/auth-service';
import {Router} from "@angular/router";

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
})
export class DefaultLayoutComponent implements OnInit {
  public navItems;
  user;
  ROL_ADMINISTRADOR = 1;

  constructor(private authService: AuthService, private router: Router) {
    const AUTENTICADO_2FA = this.authService.getAutenticadoDosFA();
    if (AUTENTICADO_2FA != "AUTENTICADO_2FA") {
      this.router.navigate(['/login']);
    }else {
      // Verificar si la ruta es "/" o "/#/"
      const currentUrl = this.router.url;
      console.log(this.router.url)
      if (currentUrl === '/' || currentUrl === '/#/' || currentUrl === '/#') {
        this.router.navigate(['/clientes']);
      }
    }
  }

  async ngOnInit() {
    this.user = await this.authService.obtenerUsuarioLoggeado();
    if (this.user.rol.id == this.ROL_ADMINISTRADOR)
      this.navItems = navItemsAdmin;
    else this.navItems = navItems;
  }
}
