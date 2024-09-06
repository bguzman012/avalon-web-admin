import {NgModule, OnInit} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {DefaultLayoutComponent} from './containers';
import {Page404Component} from './views/pages/page404/page404.component';
import {Page500Component} from './views/pages/page500/page500.component';
import {LoginComponent} from './views/pages/login/login.component';
import {RegisterComponent} from './views/pages/register/register.component';
import {ChangePasswordComponent} from "./views/pages/change-password/change-password.component";
import {AuthGuard} from "./auth.guard";

const routes: Routes = [
  {
    path: '',
    component: DefaultLayoutComponent,
    data: {
      title: 'Home'
    },
    children: [
      {
        path: 'edit-personal-info',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./views/usuarios/usuarios.module').then((m) => m.UsuariosModule)
      },
      {
        path: 'brokers',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./views/brokers/brokers.module').then((m) => m.BrokersModule)
      },
      {
        path: 'membresias',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./views/membresias/membresias.module').then((m) => m.MembresiasModule)
      },
      {
        path: 'asesores',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./views/asesores/asesores.module').then((m) => m.AsesoresModule)
      },
      {
        path: 'clientes',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./views/clientes/clientes.module').then((m) => m.ClientesModule)
      },
      {
        path: 'aseguradoras',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./views/aseguradoras/aseguradoras.module').then((m) => m.AseguradorasModule)
      },
      {
        path: 'centros-medicos',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./views/centros-medicos/centro-medicos.module').then((m) => m.CentroMedicosModule)
      },{
        path: 'empresas',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./views/empresas/empresas.module').then((m) => m.EmpresasModule)
      }, {
        path: 'medicos',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./views/medicos/medicos.module').then((m) => m.MedicosModule)
      },
      {
        path: 'audits',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./views/audits/audits.module').then((m) => m.AuditsModule)
      },
      {
        path: 'reclamaciones',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./views/reclamaciones/reclamaciones.module').then((m) => m.ReclamacionesModule)
      },
      {
        path: 'citas-medicas',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./views/citas-medicas/citas-medicas.module').then((m) => m.CitasMedicasModule)
      }, {
        path: 'emergencias',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./views/emergencias/emergencias.module').then((m) => m.EmergenciasModule)
      }, {
        path: 'preguntas',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./views/arbol-preguntas/arbol-preguntas.module').then((m) => m.PreguntasModule)
      },
      {
        path: 'metodos-pago',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./views/metodos-pago/metodos-pago.module').then((m) => m.MetodosPagoModule)
      },
      {
        path: 'casos',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./views/casos/casos.module').then((m) => m.CasosModule)
      },
      // {
      //   path: 'aseguradoras',
      //   loadChildren: () =>
      //     import('./views/aseguradoras/aseguradoras.module').then((m) => m.AseguradorasModule)
      // },
      {
        path: 'reportes',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./views/reportes/reportes.module').then((m) => m.ReportesModule)
      },{
        path: 'migraciones',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./views/migraciones/migraciones.module').then((m) => m.MigracionesModule)
      },
      {
        path: 'notificaciones',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./views/notificaciones/notificaciones.module').then((m) => m.NotificacionesModule)
      },
      {
        path: 'pages',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./views/pages/pages.module').then((m) => m.PagesModule)
      },
    ]
  },
  {
    path: '404',
    component: Page404Component,
    data: {
      title: 'Page 404'
    }
  },
  {
    path: '500',
    component: Page500Component,
    data: {
      title: 'Page 500'
    }
  },
  {
    path: 'login',
    component: LoginComponent,
    data: {
      title: 'Login Page'
    }
  }, {
    path: 'change-password',
    component: ChangePasswordComponent,
    data: {
      title: 'Cambiar contraseña'
    }
  },
  {path: '**', redirectTo: 'dashboard'}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'top',
      anchorScrolling: 'enabled',
      initialNavigation: 'enabledBlocking'
      // relativeLinkResolution: 'legacy'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
