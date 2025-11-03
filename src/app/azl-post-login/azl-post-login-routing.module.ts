import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AzlPostLoginComponent } from './azl-post-login.component';
import { AdminManagementComponent } from './admin-management/admin-management.component';
import { ProductManagementComponent } from './product-management/product-management.component';
import { AdminRoleGuard } from '../core/guards/admin-role.guard';
import { MyCartComponent } from './my-cart/my-cart.component';
import { MyProfileComponent } from './my-profile/my-profile.component';

const routes: Routes = [
  {
    path: '',
    component: AzlPostLoginComponent,
    children: [
      // ✅ redirect /dashboard → /dashboard/profile
      { path: '', redirectTo: 'profile', pathMatch: 'full' },

      {
        path: 'profile',
        component: MyProfileComponent,
        canActivate: [AdminRoleGuard],
      },
      {
        path: 'my-cart',
        component: MyCartComponent,
        canActivate: [AdminRoleGuard],
      },
      {
        path: 'admin-management',
        component: AdminManagementComponent,
        canActivate: [AdminRoleGuard],
      },
      {
        path: 'product-management',
        component: ProductManagementComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AzlPostLoginRoutingModule {}
