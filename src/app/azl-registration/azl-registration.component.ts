import { Component, EnvironmentInjector, Injectable, NgZone, OnInit, inject, signal, computed, effect, OnDestroy, CreateEffectOptions } from '@angular/core';
import { trigger, state, style, transition, animate, AnimationEvent } from '@angular/animations';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { runInInjectionContext } from '@angular/core';
import { AzlAuthenticationService } from '../core/services/azl-authentication.service'
import { MatSnackBar } from '@angular/material/snack-bar';

import { HttpClient, HttpClientModule, HttpErrorResponse } from "@angular/common/http";
import { Subscription, timer } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { RzmOtpInputModule } from '../shared/components/rzm-otp-input/rzm-otp-input.module';

@Component({
  selector: 'app-azl-registration',
  standalone: true,
  imports: [
    CommonModule, HttpClientModule,
      MatInputModule,
      MatButtonModule,
      MatFormFieldModule,
      FormsModule,
      ReactiveFormsModule,
      MatStepperModule,
      MatTooltipModule,
      RzmOtpInputModule
  ],
  templateUrl: './azl-registration.component.html',
  styleUrl: './azl-registration.component.scss'
})
export class AzlRegistrationComponent {
texts: string[] = [
  'Discover Timeless Jewellery',
  'Explore Luxury Collections',
  'Get Personalised Recommendations',
  'Design Your Own Piece',
  'Custom Jewellery Builder',
  'Exclusive Bridal Collection',
  'Gold, Diamond & Platinum Sets',
  'Certified Gemstone Selector',
  'Find Your Perfect Ring Size',
  'Track Your Orders Seamlessly',
  'Jewellery Care & Maintenance',
  'Curated Gifts for Loved Ones',
  'Luxury Reimagined by Auralis Luxe',
  'Shop by Occasion',
  'Limited Edition Pieces',
  'Smart Price Insights',
  'Discover Trends in Fine Jewellery',
  'Handcrafted with Precision',
  'Ethically Sourced Materials',
  'Your Jewellery Concierge',
  'Experience the Art of Luxury',
  'Refine Your Elegance with Auralis Luxe'
];

registrationForm!: FormGroup;
 boxes: any[] = [
  { image_path: '../../assets/images/login-cataloge/jewellery-1.webp', alt: 'Caelum', routeLink: '/business/1' },
  { image_path: '../../assets/images/login-cataloge/jewellery-2.webp', alt: 'Pictor', routeLink: '/business/2' },
  { image_path: '../../assets/images/login-cataloge/jewellery-3.webp', alt: 'Alpha', routeLink: '/business/3' },
  { image_path: '../../assets/images/login-cataloge/jewellery-4.webp', alt: 'Polaris', routeLink: '/business/4' },
  { image_path: '../../assets/images/login-cataloge/jewellery-5.webp', alt: 'Titan', routeLink: '/business/5' },
  { image_path: '../../assets/images/login-cataloge/jewellery-6.webp', alt: 'Orion', routeLink: '/business/6' },
  { image_path: '../../assets/images/login-cataloge/jewellery-7.webp', alt: 'Vega', routeLink: '/business/7' },
  { image_path: '../../assets/images/login-cataloge/jewellery-8.webp', alt: 'Electra', routeLink: '/business/8' },
  { image_path: '../../assets/images/login-cataloge/jewellery-9.webp', alt: 'Andromeda', routeLink: '/business/9' },
  { image_path: '../../assets/images/login-cataloge/jewellery-10.webp', alt: 'Pandora', routeLink: '/business/10' },
  { image_path: '../../assets/images/login-cataloge/jewellery-11.webp', alt: 'Sirius', routeLink: '/business/11' },
  { image_path: '../../assets/images/login-cataloge/jewellery-12.webp', alt: 'Vulcan', routeLink: '/business/12' },
  { image_path: '../../assets/images/login-cataloge/jewellery-13.webp', alt: 'Gemini', routeLink: '/business/13' },
  { image_path: '../../assets/images/login-cataloge/jewellery-14.webp', alt: 'Taurus', routeLink: '/business/14' },
  { image_path: '../../assets/images/login-cataloge/jewellery-15.webp', alt: 'Ursa', routeLink: '/business/15' },
  { image_path: '../../assets/images/login-cataloge/jewellery-16.webp', alt: 'Whirlpool', routeLink: '/business/16' },
  { image_path: '../../assets/images/login-cataloge/jewellery-17.webp', alt: 'Jupiter', routeLink: '/business/17' },
  { image_path: '../../assets/images/login-cataloge/jewellery-18.webp', alt: 'Pinwheel', routeLink: '/business/18' },
  { image_path: '../../assets/images/login-cataloge/jewellery-19.webp', alt: 'Scorpius', routeLink: '/business/19' },
  { image_path: '../../assets/images/login-cataloge/jewellery-20.webp', alt: 'Neptune', routeLink: '/business/20' },
  { image_path: '../../assets/images/login-cataloge/jewellery-21.webp', alt: 'Draco', routeLink: '/business/21' },
  { image_path: '../../assets/images/login-cataloge/jewellery-22.webp', alt: 'Mira', routeLink: '/business/22' },
  { image_path: '../../assets/images/login-cataloge/jewellery-23.webp', alt: 'Pinwheel', routeLink: '/business/18', comingSoon: true }, // https://www.figma.com/design/He2BoJegF7QK3ao1pRLA3H/%2B60-Resume%2FCV-Templates-(Community)?node-id=301-12418&t=ZKSilX5HozrorAZJ-0
  { image_path: '../../assets/images/login-cataloge/jewellery-24.webp', alt: 'Scorpius', routeLink: '/business/19', comingSoon: true }, // https://www.figma.com/design/He2BoJegF7QK3ao1pRLA3H/%2B60-Resume%2FCV-Templates-(Community)?node-id=301-14663&t=ZKSilX5HozrorAZJ-0
  { image_path: '../../assets/images/login-cataloge/jewellery-25.webp', alt: 'Neptune', routeLink: '/business/20', comingSoon: true }, // https://www.figma.com/design/PumtVV2XRH1YmYRJo7bqHN/6-%2B-Stunning-ATS-Friendly-Resumes-%F0%9F%93%9C-(Community)?node-id=1-615&t=Aqu8bKRg8zqS6QAq-0
  { image_path: '../../assets/images/login-cataloge/jewellery-26.webp', alt: 'Draco', routeLink: '/business/21', comingSoon: true },
  { image_path: '../../assets/images/login-cataloge/jewellery-27.webp', alt: 'Pollux', routeLink: '/business/22', comingSoon: true },
  { image_path: '../../assets/images/login-cataloge/jewellery-28.webp', alt: 'Alcor', routeLink: '/business/22', comingSoon: true },
  { image_path: '../../assets/images/login-cataloge/jewellery-29.webp', alt: 'Mizar', routeLink: '/business/22', comingSoon: true },
  { image_path: '../../assets/images/login-cataloge/jewellery-30.webp', alt: 'Carina', routeLink: '/business/22', comingSoon: true },
    
];

  private timerInterval: ReturnType<typeof setInterval> | null = null;
  repeats = Array(10).fill(0);
  starIndexes = [0, 1, 2, 3, 4];
  currentText = signal(this.texts[0]);
  currentIndex = signal(0);
  currentState = signal('visible');
  loginForm!: FormGroup;
  formState: string = 'in';
  showOtpSection: boolean = false; 
  reactivateOtpValues:string = "";
  otp: string = "";
  loading: boolean = false;
  isForgotPasswordScreen: boolean = false;
  resetPasswordForm!: FormGroup;
  showOtpContainer = signal(false);
  seconds = signal(30);
  timer = computed(() => this.formatTime(this.seconds()));
  isTimerRunning = signal(false);

  constructor(
    private ngZone: NgZone,
    private _formBuilder: FormBuilder,
    private injector: EnvironmentInjector,
    private _azlAuth: AzlAuthenticationService,
    private http: HttpClient,
    private _route: Router,
    private _snackbar: MatSnackBar,
    private route: ActivatedRoute

    ) {
      this.loginForm = this._formBuilder.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(16)]]
      });
      this.registrationForm = this._formBuilder.group({
      full_name: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(16)]],
      confirm_password: ['']
    });
      
      effect(() => {
        if (this.showOtpContainer()) {
          this.startTimer();
        } else {
          this.stopTimer();
        }
      }, {
        allowSignalWrites: true
      });
    }
adminInviteMode = false;
  inviteToken = '';
ngOnInit(): void {
  this.route.queryParams.subscribe((params) => {
      const token = params['token'];
      if (token) {
        this.adminInviteMode = true;
        this.inviteToken = token;

        // Hide normal signup fields when invite link is used
        this.registrationForm.removeControl('full_name');
        this.registrationForm.removeControl('email');
        this.registrationForm.addControl(
          'confirm_password',
          this._formBuilder.control('', [Validators.required])
        );
      }
    });
  this.ngZone.runOutsideAngular(() => {
    setInterval(() => {
      this.ngZone.run(() => this.changeText());
    }, 2000);
  });
}





  changeText() {
    this.currentState.set('hidden');
  }
  animationFinished(event: AnimationEvent) {
    if (event.fromState === 'visible' && event.toState === 'hidden') {
      this.currentIndex.update((index) => (index + 1) % this.texts.length);
      this.currentText.set(this.texts[this.currentIndex()]);
      this.currentState.set('visible');
    }
  }
  slideinForgotPasswordScreen() {
    this.formState = 'out';
    setTimeout(() => {
      this.isForgotPasswordScreen = true;
      this.formState = 'in';
    }, 600);
  }
  slideinLoginScreen() {
    this.formState = 'out';
    setTimeout(() => {
      this.isForgotPasswordScreen = false;
      this.formState = 'in';
    }, 600);
  }
  
  signOut(): void {
    // this._socialAuth.signOut();
  }


  throttleTimeout: any;
throttleRemaining: number = 0;
cooldown: number = 0;

onSubmit() {
    if (this.adminInviteMode) {
      this.handleAdminInviteSignup();
    } else {
      this.handleNormalSignup();
    }
  }

  private handleAdminInviteSignup() {
    const password = this.registrationForm.get('password')?.value;
    const confirm = this.registrationForm.get('confirm_password')?.value;

    if (password !== confirm) {
      this._snackbar.open('Passwords do not match.', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;
    this._azlAuth
      .completeAdminSignup({ token: this.inviteToken, password })
      .subscribe({
        next: (res) => {
          this._snackbar.open('Admin signup successful! Redirecting...', 'Close', { duration: 3000 });
          setTimeout(() => this._route.navigate(['/login']), 1500);
        },
        error: (err) => {
          this.loading = false;
          console.error('Signup Error:', err);
          this._snackbar.open(err.error?.message || 'Something went wrong', 'Close', { duration: 3000 });
        }
      });
  }

  private handleNormalSignup() {
  if (this.registrationForm.invalid || this.loading || this.cooldown > 0) return;

  this.loading = true;
  const payload = this.registrationForm.value;

  this._azlAuth.signupUser(payload).subscribe({
    next: (res: any) => {
      this.loading = false;

      if (res?.message?.includes('OTP sent') || res?.message?.includes('OTP resent')) {
        this._snackbar.open(res.message, 'Close', {
          duration: 4000,
          panelClass: ['snackbar-success'],
          verticalPosition: 'top'
        });
        this.slideToOtpSection();
      }

      else if (res?.status === 429 || res?.status_code === 429 || res?.message?.includes('Too many')) {
        const retryAfter = this.extractSeconds(res?.message) || 60;
        this.startCooldown(retryAfter);
        this._snackbar.open(
          res?.message || `Too many attempts. Try again in ${retryAfter}s.`,
          'Close',
          { duration: 4000, panelClass: ['snackbar-warning'], verticalPosition: 'top' }
        );
      }

      else {
        this._snackbar.open(
          res?.message || 'Unexpected response from server.',
          'Close',
          { duration: 4000, panelClass: ['snackbar-error'], verticalPosition: 'top' }
        );
      }
    },
    error: (err) => {
      this.loading = false;
      const msg = err?.error?.message || 'Signup failed. Please try again later.';

      if (err?.status === 429) {
        const retryAfter = this.extractSeconds(msg) || 60;
        this.startCooldown(retryAfter);
        this._snackbar.open(
          msg,
          'Close',
          { duration: 4000, panelClass: ['snackbar-warning'], verticalPosition: 'top' }
        );
      } else {
        this._snackbar.open(
          msg,
          'Close',
          { duration: 4000, panelClass: ['snackbar-error'], verticalPosition: 'top' }
        );
      }
    }
  });
  }






startCooldown(seconds: number) {
  this.cooldown = seconds;

  this.cooldownInterval = setInterval(() => {
    if (this.cooldown > 0) {
      this.cooldown--;
    } else {
      clearInterval(this.cooldownInterval);
    }
  }, 1000);
}


private extractSeconds(message: string): number | null {
  const match = message?.match(/(\d+)\s*seconds?/i);
  return match ? parseInt(match[1], 10) : null;
}


  slideToOtpSection() {
    this.formState = 'out';
    setTimeout(() => {
      this.showOtpSection = true;
      this.formState = 'in';
    }, 600);
  }

onSubmittingOTP() {
  if (this.registrationForm.invalid || !this.otp?.trim() || this.loading) return;

  this.loading = true;
  const email = this.registrationForm.value.email?.trim();

  this._azlAuth.verifyOTP(this.otp.trim(), email).subscribe({
    next: (res: any) => {
      this.loading = false;

      if (res?.message?.includes('verified') || res?.token) {
        this._snackbar.open(
          res?.message || 'OTP verified successfully!',
          'Close',
          { duration: 4000, panelClass: ['snackbar-success'], verticalPosition: 'top' }
        );

        localStorage.setItem('azl_token', res?.token);
        this._azlAuth.setUser(res.user);

        this._route.navigate(['/dashboard']);
        return;
      }

      if (res?.status === 429 || res?.message?.includes('Too many')) {
        const retryAfter = this.extractSeconds(res?.message) || 60;
        this.startCooldown(retryAfter);
        this._snackbar.open(
          res?.message || `Too many attempts. Try again in ${retryAfter}s.`,
          'Close',
          { duration: 4000, panelClass: ['snackbar-warning'], verticalPosition: 'top' }
        );
        return;
      }

      this._snackbar.open(
        res?.message || 'Invalid or expired OTP. Please try again.',
        'Close',
        { duration: 4000, panelClass: ['snackbar-error'], verticalPosition: 'top' }
      );
    },

    error: (err) => {
      this.loading = false;
      const msg = err?.error?.message || 'OTP verification failed. Please try again later.';

      if (err?.status === 429) {
        const retryAfter = this.extractSeconds(msg) || 60;
        this.startCooldown(retryAfter);
        this._snackbar.open(
          msg,
          'Close',
          { duration: 4000, panelClass: ['snackbar-warning'], verticalPosition: 'top' }
        );
        return;
      }

      this._snackbar.open(
        msg,
        'Close',
        { duration: 4000, panelClass: ['snackbar-error'], verticalPosition: 'top' }
      );
    }
  });
}


private showOTPError(errorObj: any) {
  const message = errorObj?.message || 'Failed to verify OTP.';
  if (errorObj?.errors) {
    let fieldErrors = '';
    Object.keys(errorObj.errors).forEach((field) => {
      const msgs = errorObj.errors[field];
      fieldErrors += `${field}: ${msgs.join(', ')}\n`;
    });
    this._snackbar.open('Error', fieldErrors.trim());
    return;
  }
  if (message.toLowerCase().includes('invalid otp')) {
    this._snackbar.open('Error', 'Invalid OTP. Please enter a valid OTP.');
  } else if (message.toLowerCase().includes('otp expired')) {
    this._snackbar.open('Error', 'OTP expired. Please request a new OTP.');
  } else if (message.toLowerCase().includes('password is required')) {
    this._snackbar.open('Error', 'Password is required.');
  } else if (message.toLowerCase().includes('name is required')) {
    this._snackbar.open('Error', 'Name is required.');
  } else {
    this._snackbar.open('Error', message);
  }
}

getErrorMessage(field: string): string {
  const control = this.registrationForm.get(field);
  if (control!.hasError('required')) {
    return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
  } else if (control!.hasError('email')) {
    return 'Invalid email';
  } else if (control!.hasError('minlength')) {
    return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${control!.errors!['minlength'].requiredLength} characters long`;
  } else if (control!.hasError('maxlength')) {
    return `${field.charAt(0).toUpperCase() + field.slice(1)} must be no more than ${control!.errors!['maxlength'].requiredLength} characters long`;
  }
  return '';
}

startThrottleCountdown() {
  if (this.throttleTimeout) {
    clearInterval(this.throttleTimeout);
  }

  this.throttleTimeout = setInterval(() => {
    if (this.throttleRemaining > 0) {
      this.throttleRemaining--;
    } else {
      clearInterval(this.throttleTimeout);
      this.throttleTimeout = null;
    }
  }, 1000);
}

  goToForgotPassword(){
    this.slideinForgotPasswordScreen()
  }
cooldownInterval: any;

onResetPassword() {
  if (this.resetPasswordForm.invalid || this.cooldown) return;

  this.loading = true;
  const email = this.resetPasswordForm.value.email;

  this._azlAuth.requestPasswordReset(email).subscribe({
    next: (response: any) => {
      this.loading = false;

      if (response.status === 'success') {
        this.showOtpContainer.set(true);
        this._snackbar.open(
          response.message || 'OTP sent to your email.',
          'Close',
          { duration: 4000, panelClass: ['snackbar-success'], verticalPosition: 'top' }
        );
      } 
      else if (response.status === 'fail' && response.status_code === 429) {
        this.handleCooldown(response.message);
      } 
      else {
        this._snackbar.open(
          response.message || 'Unexpected error. Please try again later.',
          'Close',
          { duration: 4000, panelClass: ['snackbar-error'], verticalPosition: 'top' }
        );
      }
    },
    error: (error) => {
      this.loading = false;
      const errMsg =
        error?.message || 'Something went wrong. Please try again later.';

      if (error?.status_code === 429) {
        this.handleCooldown(errMsg);
      }

      this._snackbar.open(
        errMsg,
        'Close',
        { duration: 4000, panelClass: ['snackbar-error'], verticalPosition: 'top' }
      );
    }
  });
}

private handleCooldown(message: string) {
  const match = message.match(/(\d+)\s*seconds?/i);
  this.cooldown = match ? parseInt(match[1], 10) : 60;

  if (this.cooldownInterval) clearInterval(this.cooldownInterval);

  this.cooldownInterval = setInterval(() => {
    if (this.cooldown > 0) {
      this.cooldown--;
    } else {
      clearInterval(this.cooldownInterval);
    }
  }, 1000);

  this._snackbar.open(
    message || 'Too many attempts. Please wait before retrying.',
    'Close',
    { duration: 4000, panelClass: ['snackbar-error'], verticalPosition: 'top' }
  );
}



  handleFillEvent(evt: string) {
    this.otp = evt;
    if (this.otp.length === 6) {
        //console.log(this.otp)
    }
  }
  startTimer() {
    this.isTimerRunning.set(true);
    this.timerInterval = setInterval(() => {
      this.seconds.update((s) => s - 1);
      if (this.seconds() === 0) {
        this.stopTimer();
      }
    }, 1000);
  }

  stopTimer() {
    this.isTimerRunning.set(false);
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${this.pad(minutes)}:${this.pad(remainingSeconds)}`;
  }

  pad(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }
  handleResetFormSubmit() {
    if (this.showOtpContainer()) {
      this.onVerifyAndResetPassword();
    } else {
      this.onResetPassword();
    }
  }


onVerifyAndResetPassword() {
  if (this.resetPasswordForm.invalid || this.cooldown) return;

  const email = this.resetPasswordForm.value.email;
  const new_password = this.resetPasswordForm.value.new_password;
  const otp = this.otp?.trim();

  if (!otp) {
    this._snackbar.open(
      'Please enter the OTP sent to your email.',
      'Close',
      { duration: 4000, panelClass: ['snackbar-warning'], verticalPosition: 'top' }
    );
    return;
  }

  this.loading = true;

  this._azlAuth.resetPassword(email, otp, new_password).subscribe({
    next: (res: any) => {
      this.loading = false;

      if (res?.status === 'success' || res?.message?.includes('successful')) {
        this._snackbar.open(
          res?.message || 'Password reset successful!',
          'Close',
          { duration: 4000, panelClass: ['snackbar-success'], verticalPosition: 'top' }
        );

        this.resetPasswordForm.reset();
        this.otp = '';
        this.showOtpContainer.set(false);
      } 
      else if (res?.status_code === 429) {
        this.handleCooldown(res?.message || 'Too many attempts. Please wait before retrying.');
      } 
      else {
        this._snackbar.open(
          res?.message || 'Unexpected response from server.',
          'Close',
          { duration: 4000, panelClass: ['snackbar-error'], verticalPosition: 'top' }
        );
      }
    },
    error: (error) => {
      this.loading = false;
      const errData = error?.error || {};
      const errMsg = errData?.message || 'Something went wrong. Please try again later.';

      if (error?.status === 429 || errData?.status_code === 429) {
        this.handleCooldown(errMsg);
      }

      this._snackbar.open(
        errMsg,
        'Close',
        { duration: 4000, panelClass: ['snackbar-error'], verticalPosition: 'top' }
      );
    },
  });
}


}
