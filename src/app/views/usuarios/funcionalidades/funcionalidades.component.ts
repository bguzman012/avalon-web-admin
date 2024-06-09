import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-funcionalidades',
  templateUrl: './funcionalidades.component.html',
  styleUrls: ['./funcionalidades.component.scss'],
})
export class FuncionalidadesComponent implements OnInit {
  title = 'Funcionalidades del Menú';

  funcionalidades = [
    { title: 'Clientes', icon: 'pi pi-users', description: 'Gestión de clientes.' },
    { title: 'Vendedores', icon: 'pi pi-user', description: 'Gestión de vendedores.' },
    { title: 'Productos', icon: 'pi pi-box', description: 'Gestión de productos.' },
    // Agrega más elementos si es necesario
  ];
  constructor(private router: Router) {}

  ngOnInit(): void {}

  redirigirMenu(redireccion){
    this.router.navigate([`/usuarios/${redireccion}`]);
  }
}
