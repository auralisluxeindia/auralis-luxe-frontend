import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RzmOtpInputComponent } from './rzm-otp-input.component';

const routes: Routes = [
  {
    path: '', component: RzmOtpInputComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RzmOtpInputRoutingModule { }
