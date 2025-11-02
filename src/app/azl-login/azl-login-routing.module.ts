import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AzlLoginComponent } from './azl-login.component';
const routes: Routes = [
  {
    path: '',
    component: AzlLoginComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AzlLoginRoutingModule { }
