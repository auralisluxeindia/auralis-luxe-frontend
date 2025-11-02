import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AzlPostLoginComponent } from './azl-post-login.component';
import { AdminManagementComponent } from './admin-management/admin-management.component';
import { AdminRoleGuard } from '../core/guards/admin-role.guard';

const routes: Routes = [
  {
    path: '',
    component: AzlPostLoginComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'admin-management', 
        component: AdminManagementComponent, 
        canActivate: [AdminRoleGuard]  // ✅ Protect route
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AzlPostLoginRoutingModule {}