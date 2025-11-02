import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RzmOtpInputRoutingModule } from './rzm-otp-input-routing.module';
import { RzmOtpInputComponent } from './rzm-otp-input.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    RzmOtpInputComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RzmOtpInputRoutingModule
  ],
  exports:[
    RzmOtpInputComponent
  ]
})
export class RzmOtpInputModule { }
