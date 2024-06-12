import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth-service';

@Component({
  selector: 'app-funcionalidades',
  templateUrl: './funcionalidades.component.html',
  styleUrls: ['./funcionalidades.component.scss'],
})
export class FuncionalidadesComponent implements OnInit {
  title = 'Funcionalidades del Menú';
  ROL_ADMINISTRADOR = 1
  ROL_ASESOR = 2
  user

  funcionalidades = [
    { title: 'Clientes', icon: 'pi pi-users', description: 'Gestión de clientes.' },
    { title: 'Vendedores', icon: 'pi pi-user', description: 'Gestión de vendedores.' },
    { title: 'Productos', icon: 'pi pi-box', description: 'Gestión de productos.' },
    // Agrega más elementos si es necesario
  ];
  constructor(private router: Router, private authService: AuthService) {}

  async ngOnInit() {
    this.user = await this.authService.obtenerUsuarioLoggeado()
    console.log(this.user)
        
  }

  redirigirMenu(redireccion){
    this.router.navigate([`/usuarios/${redireccion}`]);
  }
}
