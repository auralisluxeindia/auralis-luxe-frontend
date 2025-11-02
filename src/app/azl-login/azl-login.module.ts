import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AzlLoginRoutingModule } from './azl-login-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RzmOtpInputModule } from '../shared/components/rzm-otp-input/rzm-otp-input.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AzlLoginRoutingModule,
    HttpClientModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatTooltipModule,
    RzmOtpInputModule
  ]
})
export class AzlLoginModule { }
