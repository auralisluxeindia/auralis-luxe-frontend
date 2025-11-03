import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ProductService } from '../../core/services/product.service';
import { MatChipInput, MatChipGrid, MatChipRow } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    MatTooltipModule,
    MatMenuModule,
    MatChipGrid,
    MatChipRow
  ],
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.scss']
})
export class ProductManagementComponent implements OnInit {
  currentDialogRef: MatDialogRef<any> | null = null;
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



  products: any[] = [];
  productsTotal = 0;
  productsPage = 1;
  productsLimit = 12;
  allPagesLoaded = false;
  productsLoading = false;
  productsQuery = '';
  productsCategoryFilter: string | null = null;
  productsSort: 'created_desc' | 'price_asc' | 'price_desc' = 'created_desc';

  // Create product form fields
  productForm: any = {
    title: '',
    description: '',
    price: null,
    category_id: null,
    sub_category_id: null,
    carats: null,
    gross_weight: null,
    design_code: '',
    purity: '',
    color: '',
    main_image_url: '',
    images: [] as string[]
  };

  // product image upload (create)
  productSelectedFiles: File[] = [];
  productPreviewUrls: string[] = [];

  // Edit product dialog
  @ViewChild('editProductDialog') editProductDialog!: TemplateRef<any>;
  editProduct: any = null;
  editSelectedFiles: File[] = [];
  editPreviewUrls: string[] = [];

  // bulk upload file input ref
  @ViewChild('bulkUploadInput') bulkUploadInput!: any;

  // dragging state reused
  dragging = false;

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
    this.loadProducts();
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
    const dialogRef = this.dialog.open(this.editCategoryDialog, {
      panelClass: 'edit-category-dialog',
      width: '600px',
      height: '90vh',
    });
    this.currentDialogRef = dialogRef;
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

scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}





  // -------------------------------
  // Products: load, search, sort, pagination
  // -------------------------------
  loadProducts(reset = true) {
  if (this.productsLoading) return;
  this.productsLoading = true;

  if (reset) {
    this.productsPage = 1;
    this.products = [];
    this.allPagesLoaded = false; 
  }

  const params: any = {
    page: this.productsPage,
    limit: this.productsLimit,
  };

  if (this.productsQuery) params.q = this.productsQuery;
  if (this.productsCategoryFilter) params.category = this.productsCategoryFilter;
  if (this.productsSort === 'price_asc') params.sort = 'price_asc';
  if (this.productsSort === 'price_desc') params.sort = 'price_desc';

  this.service.listProducts(params).subscribe({
    next: (res: any) => {
      const newProducts = res.products || [];

      this.products = reset
        ? newProducts
        : [...this.products, ...newProducts];

      this.productsTotal = res.total || this.products.length;

      if (newProducts.length < this.productsLimit) {
        this.allPagesLoaded = true;
      }

      this.productsLoading = false;

      if (reset) {
        this.snackBar.open('Products loaded.', 'Close', { duration: 1500 });
      }
    },
    error: (err) => {
      console.error('List Products Error:', err);
      this.productsLoading = false;
      this.snackBar.open('Failed to load products.', 'Close', { duration: 3000 });
    },
  });
}

loadMoreProducts() {
  if (this.productsLoading || this.allPagesLoaded) return;

  this.productsPage += 1;
  this.loadProducts(false);
}

 searchDebounceTimer: any = null;

onSearchInput() {
  clearTimeout(this.searchDebounceTimer);
  this.searchDebounceTimer = setTimeout(() => {
    this.onSearchProducts();
  }, 500);
}

onSearchProducts() {
  this.loadProducts(true);
}


  onSortChange() {
    this.loadProducts(true);
  }

  onCategoryFilterChange() {
    this.loadProducts(true);
  }

  selectedSubcategories: any[] = [];

onCategoryChange(event: any) {
  const selectedCategoryId = Number(event.target.value);
  const category = this.categories.find((c: any) => c.id === selectedCategoryId);
  this.selectedSubcategories = category?.subcategories || [];
  this.productForm.sub_category_id = null; // reset if category changes
}

  // -------------------------------
  // Create product: image handling and create call
  // -------------------------------
  onProductFilesSelected(event: any) {
    const files: FileList = event.target.files;
    this.addProductFiles(Array.from(files));
    event.target.value = '';
  }

  onProductDrop(event: DragEvent) {
    event.preventDefault();
    this.dragging = false;
    const file = event.dataTransfer?.files;
    if (file && file.length) this.addProductFiles(Array.from(file));
  }

  addProductFiles(files: File[]) {
    // limit to 8
    const allowed = files.slice(0, 8 - this.productSelectedFiles.length);
    for (const f of allowed) {
      if (!f.type.startsWith('image/')) {
        this.snackBar.open('Only image files are allowed.', 'Close', { duration: 2500 });
        continue;
      }
      this.productSelectedFiles.push(f);
      const reader = new FileReader();
      reader.onload = (e: any) => this.productPreviewUrls.push(e.target.result);
      reader.readAsDataURL(f);
    }
  }

  removeProductPreview(index: number) {
    this.productPreviewUrls.splice(index, 1);
    this.productSelectedFiles.splice(index, 1);
  }

  clearProductForm() {
    this.productForm = {
      title: '',
      description: '',
      price: null,
      category_id: null,
      sub_category_id: null,
      carats: null,
      gross_weight: null,
      design_code: '',
      purity: '',
      color: '',
      main_image_url: '',
      images: []
    };
    this.productSelectedFiles = [];
    this.productPreviewUrls = [];
  }

 isCreating = false;

createProduct() {
  if (!this.productForm.title || !this.productForm.price || !this.productForm.category_id) {
    this.snackBar.open('Title, price and category are required.', 'Close', { duration: 3000 });
    return;
  }

  this.isCreating = true;

  const fd = new FormData();
  fd.append('title', this.productForm.title);
  fd.append('description', this.productForm.description || '');
  fd.append('price', String(this.productForm.price));
  fd.append('category_id', String(this.productForm.category_id));
  if (this.productForm.sub_category_id) fd.append('sub_category_id', String(this.productForm.sub_category_id));
  if (this.productForm.carats) fd.append('carats', String(this.productForm.carats));
  if (this.productForm.gross_weight) fd.append('gross_weight', String(this.productForm.gross_weight));
  fd.append('design_code', this.productForm.design_code || '');
  fd.append('purity', this.productForm.purity || '');
  fd.append('color', this.productForm.color || '');

  for (let i = 0; i < this.productSelectedFiles.length && i < 8; i++) {
    fd.append('images', this.productSelectedFiles[i], this.productSelectedFiles[i].name);
  }

  this.service.createProduct(fd).subscribe({
    next: (res: any) => {
      this.snackBar.open('Product created successfully.', 'Close', { duration: 2500 });
      this.clearProductForm();
      this.loadProducts(true);
      this.isCreating = false;
    },
    error: (err) => {
      console.error('Create Product Error:', err);
      this.snackBar.open('Failed to create product.', 'Close', { duration: 3000 });
      this.isCreating = false;
    }
  });
}


  // -------------------------------
  // Edit product dialog
  // -------------------------------
  openEditProductDialog(product: any) {
    // shallow copy
    this.editProduct = { ...product, images: Array.isArray(product.images) ? [...product.images] : [] };
    this.editSelectedFiles = [];
    this.editPreviewUrls = [];
    this.dialog.open(this.editProductDialog, { width: '900px', panelClass: 'edit-product-dialog' });
  }

  onEditFilesSelected(event: any) {
    const files: FileList = event.target.files;
    this.addEditFiles(Array.from(files));
    event.target.value = '';
  }

  onEditDrop(event: DragEvent) {
    event.preventDefault();
    this.dragging = false;
    const file = event.dataTransfer?.files;
    if (file && file.length) this.addEditFiles(Array.from(file));
  }

  addEditFiles(files: File[]) {
    // limit to 8 total (server)
    const allowed = files.slice(0, 8 - (this.editSelectedFiles.length + (this.editProduct.images?.length || 0)));
    for (const f of allowed) {
      if (!f.type.startsWith('image/')) {
        this.snackBar.open('Only image files are allowed.', 'Close', { duration: 2500 });
        continue;
      }
      this.editSelectedFiles.push(f);
      const reader = new FileReader();
      reader.onload = (e: any) => this.editPreviewUrls.push(e.target.result);
      reader.readAsDataURL(f);
    }
  }

  removeEditPreview(index: number) {
    this.editPreviewUrls.splice(index, 1);
    this.editSelectedFiles.splice(index, 1);
  }

  removeExistingImageFromEdit(index: number) {
    if (!this.editProduct || !this.editProduct.images) return;
    this.editProduct.images.splice(index, 1);
  }

 updateProduct(): void {
  if (!this.editProduct.title || !this.editProduct.price || !this.editProduct.category_id) {
    this.snackBar.open('Title, price and category are required.', 'Close', { duration: 3000 });
    return;
  }

  const fd = new FormData();
  fd.append('title', this.editProduct.title);
  fd.append('description', this.editProduct.description || '');
  fd.append('price', String(this.editProduct.price));
  fd.append('category_id', String(this.editProduct.category_id));

  if (this.editProduct.sub_category_id) {
    fd.append('sub_category_id', String(this.editProduct.sub_category_id));
  }
  if (this.editProduct.carats) {
    fd.append('carats', String(this.editProduct.carats));
  }
  if (this.editProduct.gross_weight) {
    fd.append('gross_weight', String(this.editProduct.gross_weight));
  }

  fd.append('design_code', this.editProduct.design_code || '');
  fd.append('purity', this.editProduct.purity || '');
  fd.append('color', this.editProduct.color || '');
  fd.append('main_image_url', this.editProduct.main_image_url || '');

  if (this.editSelectedFiles && this.editSelectedFiles.length) {
    for (let i = 0; i < Math.min(this.editSelectedFiles.length, 8); i++) {
      fd.append('images', this.editSelectedFiles[i], this.editSelectedFiles[i].name);
    }
  }

  this.service.updateProduct(this.editProduct.id, fd).subscribe({
    next: () => {
      this.dialog.closeAll(); // ✅ closes the dialog safely
      this.snackBar.open('Product updated successfully.', 'Close', { duration: 2500 });
      this.loadProducts(true);
    },
    error: (err) => {
      console.error('Update Product Error:', err);
      this.snackBar.open('Failed to update product.', 'Close', { duration: 3000 });
    },
  });
}


  // -------------------------------
  // Delete product
  // -------------------------------
  deleteProduct(id: number) {
    if (!confirm('Delete this product and its images?')) return;
    this.service.deleteProduct(id).subscribe({
      next: (res: any) => {
        this.snackBar.open('Product deleted successfully.', 'Close', { duration: 2500 });
        this.loadProducts(true);
      },
      error: (err) => {
        console.error('Delete Product Error:', err);
        this.snackBar.open('Failed to delete product.', 'Close', { duration: 3000 });
      }
    });
  }

  // -------------------------------
  // Bulk upload / download CSV
  // -------------------------------
  downloadBulkCsv() {
    // ask backend for a CSV template endpoint or generate client side minimal template
    const csvHeader = [
      'title', 'description', 'price', 'category_id', 'sub_category_id',
      'carats', 'gross_weight', 'design_code', 'purity', 'color'
    ];
    const csv = csvHeader.join(',') + '\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_products_template.csv';
    a.click();
    URL.revokeObjectURL(url);
    this.snackBar.open('CSV template downloaded.', 'Close', { duration: 2000 });
  }

  onBulkCsvSelected(event: any) {
    const file: File = event.target.files?.[0];
    if (!file) return;
    // You can send file to backend for parsing and processing. Backend endpoint expected: POST /products/bulk (not provided)
    const fd = new FormData();
    fd.append('file', file);
    // if your ProductService has bulkUpload method, call it here; otherwise show message
    if (typeof this.service.bulkUploadProducts === 'function') {
      this.service.bulkUploadProducts(fd).subscribe({
        next: (res: any) => {
          this.snackBar.open('Bulk upload submitted.', 'Close', { duration: 2500 });
          this.loadProducts(true);
        },
        error: (err) => {
          console.error('Bulk upload error:', err);
          this.snackBar.open('Bulk upload failed.', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.snackBar.open('Bulk upload endpoint not implemented in ProductService.', 'Close', { duration: 3500 });
    }
    event.target.value = '';
  }
getTimeAgo(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

onTableScroll(event: any) {
  const element = event.target;
  const bottom =
    element.scrollHeight - element.scrollTop <= element.clientHeight + 50;

  if (bottom && !this.productsLoading && !this.allPagesLoaded) {
    this.loadMoreProducts();
  }
}

}
