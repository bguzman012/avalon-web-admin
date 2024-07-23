import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DefaultLayoutComponent } from './containers';
import { Page404Component } from './views/pages/page404/page404.component';
import { Page500Component } from './views/pages/page500/page500.component';
import { LoginComponent } from './views/pages/login/login.component';
import { RegisterComponent } from './views/pages/register/register.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    data: {
      title: 'Home'
    },
    children: [
      // {
      //   path: 'dashboard',
      //   loadChildren: () =>
      //     import('./views/dashboard/dashboard.module').then((m) => m.DashboardModule)
      // },
      // {
      //   path: 'theme',
      //   loadChildren: () =>
      //     import('./views/theme/theme.module').then((m) => m.ThemeModule)
      // },
      {
        path: 'usuarios',
        loadChildren: () =>
          import('./views/usuarios/usuarios.module').then((m) => m.UsuariosModule)
      },
      {
        path: 'brokers',
        loadChildren: () =>
          import('./views/brokers/brokers.module').then((m) => m.BrokersModule)
      },
      {
        path: 'membresias',
        loadChildren: () =>
          import('./views/membresias/membresias.module').then((m) => m.MembresiasModule)
      },
      {
        path: 'asesores',
        loadChildren: () =>
          import('./views/asesores/asesores.module').then((m) => m.AsesoresModule)
      },
      {
        path: 'clientes',
        loadChildren: () =>
          import('./views/clientes/clientes.module').then((m) => m.ClientesModule)
      },
      {
        path: 'aseguradoras',
        loadChildren: () =>
          import('./views/aseguradoras/aseguradoras.module').then((m) => m.AseguradorasModule)
      },
      {
        path: 'reclamaciones',
        loadChildren: () =>
          import('./views/reclamaciones/reclamaciones.module').then((m) => m.ReclamacionesModule)
      },
      {
        path: 'citas-medicas',
        loadChildren: () =>
          import('./views/citas-medicas/citas-medicas.module').then((m) => m.CitasMedicasModule)
      },{
        path: 'emergencias',
        loadChildren: () =>
          import('./views/emergencias/emergencias.module').then((m) => m.EmergenciasModule)
      },{
        path: 'preguntas',
        loadChildren: () =>
          import('./views/arbol-preguntas/arbol-preguntas.module').then((m) => m.PreguntasModule)
      },
      // {
      //   path: 'aseguradoras',
      //   loadChildren: () =>
      //     import('./views/aseguradoras/aseguradoras.module').then((m) => m.AseguradorasModule)
      // },
      {
        path: 'notificaciones',
        loadChildren: () =>
          import('./views/notificaciones/notificaciones.module').then((m) => m.NotificacionesModule)
      },

      // {
      //   path: 'base',
      //   loadChildren: () =>
      //     import('./views/base/base.module').then((m) => m.BaseModule)
      // },
      // {
      //   path: 'buttons',
      //   loadChildren: () =>
      //     import('./views/buttons/buttons.module').then((m) => m.ButtonsModule)
      // },
      // {
      //   path: 'forms',
      //   loadChildren: () =>
      //     import('./views/forms/forms.module').then((m) => m.CoreUIFormsModule)
      // },
      // {
      //   path: 'charts',
      //   loadChildren: () =>
      //     import('./views/charts/charts.module').then((m) => m.ChartsModule)
      // },
      // {
      //   path: 'icons',
      //   loadChildren: () =>
      //     import('./views/icons/icons.module').then((m) => m.IconsModule)
      // },
      // {
      //   path: 'notifications',
      //   loadChildren: () =>
      //     import('./views/notifications/notifications.module').then((m) => m.NotificationsModule)
      // },
      // {
      //   path: 'widgets',
      //   loadChildren: () =>
      //     import('./views/widgets/widgets.module').then((m) => m.WidgetsModule)
      // },
      {
        path: 'pages',
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
  },
  {
    path: 'register',
    component: RegisterComponent,
    data: {
      title: 'Register Page'
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
