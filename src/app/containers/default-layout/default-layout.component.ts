import { Component, OnInit } from '@angular/core';

import { navItems, navItemsAdmin } from './_nav';
import { AuthService } from 'src/app/services/auth-service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
})
export class DefaultLayoutComponent implements OnInit {
  public navItems;
  user;
  ROL_ADMINISTRADOR = 1;
  ROL_ASESOR = 2;

  constructor(private authService: AuthService) {}

  async ngOnInit() {
    this.user = await this.authService.obtenerUsuarioLoggeado();
    if (this.user.rol.id == this.ROL_ADMINISTRADOR)
      this.navItems = navItemsAdmin;
    else this.navItems = navItems;
    console.log(this.user);
  }
}
