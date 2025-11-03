import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ProductService } from '../../core/services/product.service';
import { MatChipInput, MatChipGrid, MatChipRow } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
    MatSnackBarModule,
    MatChipInput,
    MatChipGrid,
    MatChipRow
  ],
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.scss']
})
export class ProductManagementComponent implements OnInit {
  categories: any[] = [];

  newCategory = {
    name: '',
    description: '',
    image_url: '',
    subcategories: [] as string[],
  };

  activeTab: 'categories' | 'products' = 'categories';
  currentUser: any = null;
  userPermissions: string[] = [];

  readonly separatorKeys = [ENTER, COMMA] as const;

  constructor(
    private service: ProductService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    const userData = localStorage.getItem('azl_user');
    if (userData) {
      this.currentUser = JSON.parse(userData);
      this.userPermissions = this.currentUser?.permissions || [];
    }
    this.loadCategories();
  }

  hasPermission(perm: string): boolean {
    if (this.currentUser?.role === 'super_admin') return true;
    return this.userPermissions.includes(perm);
  }

  loadCategories() {
    this.service.getCategories().subscribe({
      next: (res: any) => {
        this.categories = res.categories || [];
        this.snackBar.open('Categories loaded successfully.', 'Close', { duration: 2000 });
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.snackBar.open('Failed to load categories.', 'Close', { duration: 3000 });
      },
    });
  }

  addSubcategoryFromChip(event: any) {
    const value = (event.value || '').trim();
    if (value && !this.newCategory.subcategories.includes(value)) {
      this.newCategory.subcategories.push(value);
      this.snackBar.open(`Subcategory "${value}" added.`, 'Close', { duration: 2000 });
    }
    if (event.input) event.input.value = '';
  }

  removeSubcategory(sub: string) {
    this.newCategory.subcategories = this.newCategory.subcategories.filter((s) => s !== sub);
    this.snackBar.open(`Subcategory "${sub}" removed.`, 'Close', { duration: 2000 });
  }

  createCategory() {
    if (!this.newCategory.name.trim()) {
      this.snackBar.open('Category name is required.', 'Close', { duration: 2500 });
      return;
    }

    this.service.createCategory(this.newCategory).subscribe({
      next: () => {
        this.newCategory = { name: '', description: '', image_url: '', subcategories: [] };
        this.previewUrl = null;
        this.loadCategories();
        this.snackBar.open('Category created successfully.', 'Close', { duration: 2500 });
      },
      error: (err) => {
        console.error('Create Category Error:', err);
        this.snackBar.open('Failed to create category.', 'Close', { duration: 3000 });
      },
    });
  }

  deleteCategory(id: number) {
    if (confirm('Delete this category and its subcategories?')) {
      this.service.deleteCategory(id).subscribe({
        next: () => {
          this.loadCategories();
          this.snackBar.open('Category deleted successfully.', 'Close', { duration: 2500 });
        },
        error: (err) => {
          console.error('Delete Category Error:', err);
          this.snackBar.open('Failed to delete category.', 'Close', { duration: 3000 });
        },
      });
    }
  }

  dragging = false;
  previewUrl: string | null = null;
  selectedFile: File | null = null;
  selectedFileName: string | null = null;

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragging = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) this.handleFile(file);
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) this.handleFile(file);
  }

  handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      this.snackBar.open("Please upload an image file.", "Close", { duration: 2500 });
      return;
    }

    this.selectedFile = file;
    this.selectedFileName = file.name;

    const reader = new FileReader();
    reader.onload = (e: any) => (this.previewUrl = e.target.result);
    reader.readAsDataURL(file);

    this.uploadImageToR2(file);
  }

  uploadImageToR2(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    this.service.uploadCategoryImage(formData).subscribe({
      next: (res: any) => {
        if (res?.image_url) {
          this.newCategory.image_url = res.image_url;
          this.snackBar.open("Image uploaded successfully.", "Close", { duration: 2500 });
        } else {
          this.snackBar.open("No image URL returned from server.", "Close", { duration: 3000 });
        }
      },
      error: (err) => {
        console.error("Image upload error:", err);
        this.snackBar.open("Failed to upload image.", "Close", { duration: 3000 });
      },
    });
  }

  removeImage(event: Event) {
    event.stopPropagation();
    this.previewUrl = null;
    this.selectedFile = null;
    this.selectedFileName = null;
    this.newCategory.image_url = '';
    this.snackBar.open("Image removed.", "Close", { duration: 2000 });
  }

  @ViewChild('editCategoryDialog') editCategoryDialog!: TemplateRef<any>;

  editCategory: any = { id: null, name: '', description: '', image_url: '', subcategories: [] };
  editPreviewUrl: string | null = null;
  editSelectedFile: File | null = null;
  editSelectedFileName: string | null = null;

  openEditDialog(cat: any) {
    this.editCategory = {
      id: cat.id,
      name: cat.name,
      description: cat.description,
      image_url: cat.image_url || '',
      subcategories: Array.isArray(cat.subcategories)
        ? cat.subcategories.map((s: any) => s.name)
        : [],
    };

    this.editPreviewUrl = cat.image_url || null;
    this.dialog.open(this.editCategoryDialog, {
      panelClass: 'edit-category-dialog',
      width: '600px',
      height: '90vh',
    });
  }

  addEditSubcategory(event: any) {
    const value = event.target.value.trim();
    if (value && !this.editCategory.subcategories.includes(value)) {
      this.editCategory.subcategories.push(value);
      this.snackBar.open(`Subcategory "${value}" added.`, 'Close', { duration: 2000 });
    }
    event.target.value = '';
  }

  removeEditSubcategory(sub: string) {
    this.editCategory.subcategories = this.editCategory.subcategories.filter((s: string) => s !== sub);
    this.snackBar.open(`Subcategory "${sub}" removed.`, 'Close', { duration: 2000 });
  }

  onEditFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) this.handleEditFile(file);
  }

  onEditDrop(event: DragEvent) {
    event.preventDefault();
    this.dragging = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) this.handleEditFile(file);
  }

  handleEditFile(file: File) {
    if (!file.type.startsWith("image/")) {
      this.snackBar.open("Please upload an image file.", "Close", { duration: 2500 });
      return;
    }

    this.editSelectedFile = file;
    this.editSelectedFileName = file.name;

    const reader = new FileReader();
    reader.onload = (e: any) => (this.editPreviewUrl = e.target.result);
    reader.readAsDataURL(file);

    this.uploadEditImageToR2(file);
  }

  uploadEditImageToR2(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    this.service.uploadCategoryImage(formData).subscribe({
      next: (res: any) => {
        if (res?.image_url) {
          this.editCategory.image_url = res.image_url;
          this.snackBar.open("Image updated successfully.", "Close", { duration: 2500 });
        } else {
          this.snackBar.open("No image URL returned from server.", "Close", { duration: 3000 });
        }
      },
      error: (err) => {
        console.error("Edit image upload error:", err);
        this.snackBar.open("Failed to upload image.", "Close", { duration: 3000 });
      },
    });
  }

  removeEditImage(event: Event) {
    event.stopPropagation();
    this.editPreviewUrl = null;
    this.editSelectedFile = null;
    this.editSelectedFileName = null;
    this.editCategory.image_url = '';
    this.snackBar.open("Image removed.", "Close", { duration: 2000 });
  }

  updateCategory(dialogRef: any) {
    if (!this.editCategory.name.trim()) {
      this.snackBar.open('Category name is required.', 'Close', { duration: 2500 });
      return;
    }

    this.service.updateCategory(this.editCategory.id, this.editCategory).subscribe({
      next: () => {
        dialogRef.close();
        this.loadCategories();
        this.snackBar.open('Category updated successfully.', 'Close', { duration: 2500 });
      },
      error: (err) => {
        console.error('Update Category Error:', err);
        this.snackBar.open('Failed to update category.', 'Close', { duration: 3000 });
      },
    });
  }
}
