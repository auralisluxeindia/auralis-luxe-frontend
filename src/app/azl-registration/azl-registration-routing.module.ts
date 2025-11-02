import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AzlRegistrationComponent } from './azl-registration.component';
const routes: Routes = [
  {
    path: '',
    component: AzlRegistrationComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AzlRegistrationRoutingModule { }
