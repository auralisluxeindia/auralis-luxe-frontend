import { Component, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EcomService } from '../../core/services/ecom.service';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, MatMenuModule, MatIconModule],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.scss'
})
export class SearchResultsComponent implements OnInit {
      @ViewChild('quickViewDialog') quickViewDialog!: TemplateRef<any>;

  products: any[] = [];
  totalResults = 0;
  selectedProduct: any = null;
    selectedImageIndex = 0;
    zoomActive = false;
    zoomBgPos = '50% 50%';
    dialogRef?: MatDialogRef<any>;
  query = '';
  category = '';
  sub = '';
  sort = 'recent';
  limit = 12;
  offset = 0;
  loading = false;
  hasMore = true;

  // 🖼️ Image rotation
  private imageIntervals = new Map<number, any>();

  // 🛒 Simple wishlist/cart simulation (replace later with service)
  wishlist: number[] = [];
  cart: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private ecomService: EcomService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(() => {
      this.category = this.route.snapshot.params['category'] || '';
      this.sub = this.route.snapshot.params['sub'] || '';
      this.query = this.route.snapshot.queryParamMap.get('q') || '';
      this.resetAndFetch();
    });
    
  }

  resetAndFetch() {
    this.products = [];
    this.offset = 0;
    this.hasMore = true;
    this.fetchProducts();
  }

  fetchProducts() {
    if (this.loading || !this.hasMore) return;
    this.loading = true;

    this.productService
      .listProducts({
        q: this.query,
        category: this.category,
        sub: this.sub,
        limit: this.limit,
        offset: this.offset,
        sort: this.sort
      })
      .subscribe({
        next: (res: any) => {
          const newItems = res.products || res.items || [];
          this.totalResults = res.total || newItems.length;
          this.products.push(...newItems);
          this.hasMore = newItems.length === this.limit;
          this.offset += this.limit;
          this.loading = false;
        },
        error: () => (this.loading = false)
      });
  }

  // 🧭 Sorting handler
  onSortChange(type: string) {
    this.sort = type;
    this.resetAndFetch();
  }

  // ♾️ Infinite scroll
  @HostListener('window:scroll', [])
  onScroll(): void {
    const bottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
    if (bottom) this.fetchProducts();
  }

  // 🖼️ Image rotation logic
  startImageRotation(product: any) {
    if (!product.images?.length) return;
    let index = product.currentImageIndex || 0;
    const interval = setInterval(() => {
      index = (index + 1) % product.images.length;
      product.currentImageIndex = index;
    }, 1500);
    this.imageIntervals.set(product.id, interval);
  }

  stopImageRotation(product: any) {
    const interval = this.imageIntervals.get(product.id);
    if (interval) {
      clearInterval(interval);
      this.imageIntervals.delete(product.id);
    }
  }

  getCurrentImage(product: any): string {
    if (product.images?.length) return product.images[product.currentImageIndex || 0];
    return 'assets/images/placeholder.jpg';
  }

  getCurrentImageIndex(product: any): number {
    return product.currentImageIndex || 0;
  }

  setImageIndex(product: any, index: number) {
    product.currentImageIndex = index;
  }

  // ❤️ Wishlist
  toggleWishlist(p: any) {
    const i = this.wishlist.indexOf(p.id);
    if (i > -1) this.wishlist.splice(i, 1);
    else this.wishlist.push(p.id);
  }

  isInWishlist(p: any): boolean {
    return this.wishlist.includes(p.id);
  }

  // 🛒 Cart
  toggleCart(p: any, event: Event) {
    event.stopPropagation();
    const i = this.cart.indexOf(p.id);
    if (i > -1) this.cart.splice(i, 1);
    else this.cart.push(p.id);
  }

  isInCart(id: number): boolean {
    return this.cart.includes(id);
  }
  openQuickView(p: any): void {
    this.selectedProduct = p;
    this.selectedImageIndex = 0;
    this.ecomService.recordProductView(p.id).subscribe({
      next: (res) => console.log('View recorded:', res),
      error: (err) => console.error('Error recording view:', err),
    });
    this.dialogRef = this.dialog.open(this.quickViewDialog, {
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'quick-view-dialog-panel',
      autoFocus: false
    });
  }

  buyNow(p: any) {
  console.log('Buy now:', p.id);
}

 
addToCart(p: any): void {
  this.ecomService.addToCart(p.id, 1).subscribe({
    next: () => {
      console.log('Added to cart successfully!');
    },
    error: (err) => {
      console.error('Error adding to cart:', err);
    }
  });
}

  closeQuickView(): void {
    if (this.dialogRef) this.dialogRef.close();
    this.dialogRef = undefined;
    this.selectedProduct = null;
    this.zoomActive = false;
  }

  selectQuickImage(index: number) {
    this.selectedImageIndex = index;
  }

  onZoomEnter(e: MouseEvent) {
    this.zoomActive = true;
    this.onZoomMove(e);
  }

  onZoomLeave() {
    this.zoomActive = false;
  }

  onZoomMove(e: MouseEvent) {
    if (!this.zoomActive) return;
    const el = (e.currentTarget as HTMLElement);
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    this.zoomBgPos = `${x}% ${y}%`;
  }

  getQuickImageUrl(): string {
    return (this.selectedProduct?.images && this.selectedProduct.images[this.selectedImageIndex]) ||
      this.selectedProduct?.main_image_url ||
      '/assets/images/fallback-product.jpg';
  }

}