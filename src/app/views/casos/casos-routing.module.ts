import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {CasosComponent} from "./casos/casos.component";
import {AddCasosComponent} from "./add-casos/add-casos.component";
import {AddCitasMedicasComponent} from "../citas-medicas/add-citas-medicas/add-citas-medicas.component";
import {AddEmergenciasComponent} from "../emergencias/add-emergencias/add-emergencias.component";
import {AddReclamacionesComponent} from "../reclamaciones/add-reclamaciones/add-reclamaciones.component";

const routes: Routes = [
  {
    path: '',
    data: {
      breadcrumb: 'Casos'
    },
    children: [
      {
        path: '',
        data: {
          breadcrumb: null
        },
        component: CasosComponent,
       },
      {
        path: 'detalle-caso',
        data: {
          breadcrumb: 'Detalle Caso'
        },
        children: [
          {
            path: '',
            data: {
              breadcrumb: null
            },
            component: AddCasosComponent,
          },
          {
            path: 'detalle-cita-medica',
            data: {
              breadcrumb: 'Detalle Cita'
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
          },
          {
            path: 'detalle-emergencia',
            data: {
              breadcrumb: 'Detalle Emergencia'
            },
            children: [
              {
                path: '',
                data: {
                  breadcrumb: null
                },
                component: AddEmergenciasComponent,
              },
            ]
          },
          {
            path: 'detalle-reclamacion',
            data: {
              breadcrumb: 'Detalle Reembolso'
            },
            children: [
              {
                path: '',
                data: {
                  breadcrumb: null
                },
                component: AddReclamacionesComponent,
              },
            ]
          }
        ]
      }
      // {
      //   path: 'beneficios',
      //   data: {
      //     breadcrumb: 'Beneficios'
      //   },
      //   children: [
      //     {
      //       path: '',
      //       data: {
      //         breadcrumb: null
      //       },
      //       component: BeneficiosComponent,
      //     },
      //   ]
      // },
      // {
      //   path: 'clientes',
      //   data: {
      //     breadcrumb: 'Clientes'
      //   },
      //   children: [
      //     {
      //       path: '',
      //       data: {
      //         breadcrumb: null
      //       },
      //       component: MedCentrosMedicosAseguradorasComponent,
      //     },
      //   ]
      // }
    ]
  }
];

// const routes: Routes = [
//   {
//     path: '#',
//     component: MetodosPagoComponent,
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
export class CasosRoutingModule {
}
