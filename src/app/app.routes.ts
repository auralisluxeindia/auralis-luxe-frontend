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
    path: 'dashboard',
    loadChildren: () =>
      import('./azl-post-login/azl-post-login.module').then(
        (m) => m.AzlPostLoginModule
      ),
  },
  {
  path: 'search',
  loadComponent: () => import('./features/search-results/search-results.component').then(m => m.SearchResultsComponent)
},
{
  path: ':category',
  loadComponent: () => import('./features/search-results/search-results.component').then(m => m.SearchResultsComponent)
},
{
  path: ':category/:sub',
  loadComponent: () => import('./features/search-results/search-results.component').then(m => m.SearchResultsComponent)
},
  {
    path: '**',
    redirectTo: '',
  },

];