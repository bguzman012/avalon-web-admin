import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CitasMedicasComponent } from './citas-medicas/citas-medicas.component';
import { AddCitasMedicasComponent } from './add-citas-medicas/add-citas-medicas.component';
// import { ClientesMembresiasComponent } from './clientes-membresias/clientes-membresias.component';

const routes: Routes = [
  {
    path: '',
    data: {
      breadcrumb: 'Citas Médicas'
    },
    children: [
      {
        path: '',
        data: {
          breadcrumb: null
        },
        component: CitasMedicasComponent,
      },
      {
        path: 'detalle-cita-medica',
        data: {
          breadcrumb: 'Detalle Cita Médica'
        },
        children: [
          {
            path: '',
            data: {
              breadcrumb: null
            },
            component: AddCitasMedicasComponent,
          },
        ]
      }
    ]
  }
];

// const routes: Routes = [
//   {
//     path: '#',
//     component: CentrosMedicosComponent,
//     data: {
//       title: 'Aseguradoras',
//       breadcrumb: 'Aseguradoras'
//     }
//   }
// ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CitasMedicasRoutingModule {
}
