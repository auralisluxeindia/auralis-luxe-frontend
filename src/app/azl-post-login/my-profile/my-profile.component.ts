import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ProductService } from '../../core/services/product.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.scss',
})
export class MyProfileComponent implements OnInit {
  profileForm!: FormGroup;
  user: any;
  analytics: any;
  loading = false;
  saving = false;

  constructor(private fb: FormBuilder, private productService: ProductService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      full_name: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      phone: [''],
      address: [''],
      city: [''],
      state: [''],
      country: [''],
    });

    this.fetchUserDetails();
  }

  fetchUserDetails() {
    this.loading = true;
    this.productService.getUserDetails().subscribe({
      next: (res: any) => {
        this.user = res.user;
        this.analytics = res.analytics;
        this.profileForm.patchValue({
          full_name: res.user.full_name,
          email: res.user.email,
          phone: res.user.phone,
          address: res.user.address,
          city: res.user.city,
          state: res.user.state,
          country: res.user.country,
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
        this.loading = false;
      },
    });
  }

  saveProfile() {
    if (this.profileForm.invalid) return;
    this.saving = true;

    this.productService.updateUserProfile(this.profileForm.getRawValue()).subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open('Profile updated successfully!', 'Close', { duration: 2500 });
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.saving = false;
      },
    });
  }
}
