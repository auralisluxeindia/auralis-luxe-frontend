import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AdminManagementService } from '../../core/services/admin-management.service';

@Component({
  selector: 'app-admin-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './admin-management.component.html',
  styleUrls: ['./admin-management.component.scss']
})
export class AdminManagementComponent implements OnInit {
  adminForm!: FormGroup;
  admins: any[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';

  permissionsList = [
    'create_categories',
    'edit_categories',
    'delete_categories',
    'create_products',
    'edit_products',
    'delete_products',
    'bulk_upload',
    'generate_reports',
  ];

  @ViewChild('deleteDialog') deleteDialog!: TemplateRef<any>;
  selectedAdminToDelete: any = null;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminManagementService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.initForm();
    this.fetchAdmins();
  }

  initForm() {
    this.adminForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      permissions: this.fb.array([])
    });
  }

  onCheckboxChange(event: any) {
    const permissions = this.adminForm.get('permissions') as FormArray;
    if (event.checked) {
      permissions.push(this.fb.control(event.source.value));
    } else {
      const index = permissions.controls.findIndex(x => x.value === event.source.value);
      permissions.removeAt(index);
    }
  }

  inviteAdmin() {
    if (this.adminForm.invalid) {
      this.errorMessage = 'Please fill all required fields.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.adminService.inviteAdmin(this.adminForm.value).subscribe({
      next: (res: any) => {
        this.successMessage = res?.message || 'Admin invited successfully!';
        this.adminForm.reset();
        (this.adminForm.get('permissions') as FormArray).clear();
        this.fetchAdmins();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = err?.error?.message || 'Something went wrong.';
        this.loading = false;
      }
    });
  }

  fetchAdmins() {
    this.adminService.listAdmins().subscribe({
      next: (res: any) => {
        this.admins = res.admins || [];
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load admins.';
      }
    });
  }

  openDeleteDialog(admin: any) {
    this.selectedAdminToDelete = admin;
    this.dialog.open(this.deleteDialog);
  }

  confirmDelete() {
    if (!this.selectedAdminToDelete) return;
    const id = this.selectedAdminToDelete.id;

    this.adminService.removeAdmin(id).subscribe({
      next: () => {
        this.dialog.closeAll();
        this.fetchAdmins();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Error deleting admin.';
      }
    });
  }
}
