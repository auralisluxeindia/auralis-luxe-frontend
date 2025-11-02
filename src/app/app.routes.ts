import { Routes } from '@angular/router';
import { HomePageComponent } from './features/home/pages/home-page/home-page.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./azl-login/azl-login.module').then((m) => m.AzlLoginModule),
  },
  {
    path: 'registration',
    loadChildren: () =>
      import('./azl-registration/azl-registration.module').then(
        (m) => m.AzlRegistrationModule
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];