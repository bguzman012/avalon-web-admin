import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductoComponent } from './producto/producto.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Productos'
    },
    children: [
      {
        path: 'productos',
        component: ProductoComponent,
        data: {
          title: 'Producto'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AseguradorasRoutingModule {
}
