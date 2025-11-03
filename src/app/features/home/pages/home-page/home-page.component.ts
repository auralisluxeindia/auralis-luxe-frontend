import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { HomeService } from '../../../../core/services/home.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EcomService } from '../../../../core/services/ecom.service';


@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, CarouselModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent {
    @ViewChild('quickViewDialog') quickViewDialog!: TemplateRef<any>;

      slides = [
    {
      img: '../../../../../assets/images/slider-images/intro.webp',
      title: 'Shine Bright with Our New Collection',
      subtitle: 'Explore elegant designs for every occasion.',
    },
    {
      img: '../../../../../assets/images/slider-images/offer.jpg',
      title: 'Crafted with Perfection',
      subtitle: 'Discover premium jewelry at unbeatable prices.',
    },
    {
      img: '../../../../../assets/images/slider-images/easy-buy.jpg',
      title: 'Luxury Meets Simplicity',
      subtitle: 'Redefine your style today.',
    },
  ];

  wishlistSet = new Set<number>();
  wishlistCount = 0;
cartItems: any[] = [];
cartCount = 0;

  carouselOptions: OwlOptions = {
    loop: true,
    autoplay: true,
    autoplayTimeout: 4000,
    autoplayHoverPause: true,
    items: 1,
    dots: true,
    nav: true,
    navText: [
      '<span class="material-icons text-3xl text-white">chevron_left</span>',
      '<span class="material-icons text-3xl text-white">chevron_right</span>'
    ],
    animateIn: 'fadeIn',
    animateOut: 'fadeOut',
    smartSpeed: 800,
  };
  onSlideClick(slide: any) {
    console.log('Clicked:', slide.link);
  }

  categories: any[] = [];
  products: any[] = [];
  selectedCategory: any = null;
  loading = true;
  trendingProducts: any[] = [];
   testimonials = [
    {
      quote:
        'Absolutely stunning jewelry! The quality and craftsmanship exceeded my expectations.',
      name: 'Aarav Sharma',
      position: 'Verified Customer',
      image: 'assets/images/testimonials/user1.jpg',
    },
    {
      quote:
        'Loved the packaging and design. Delivery was fast, and the ring fits perfectly!',
      name: 'Riya Kapoor',
      position: 'Jewelry Enthusiast',
      image: 'assets/images/testimonials/user2.jpg',
    },
    {
      quote:
        'A seamless online shopping experience. The collection is elegant and classy.',
      name: 'Sneha Patel',
      position: 'Fashion Blogger',
      image: 'assets/images/testimonials/user3.jpg',
    },
  ];

  currentTestimonial = 0;
  interval: any;

  loadingTrending = false;
  selectedProduct: any = null;
  selectedImageIndex = 0;
  zoomActive = false;
  zoomBgPos = '50% 50%';
  dialogRef?: MatDialogRef<any>;

  imageIndexMap: Record<number, number> = {};
  hoverIntervalMap: Map<number, any> = new Map();
newArrivals: any[] = [];
loadingNewArrivals = true;


   constructor(private homeService: HomeService, private dialog: MatDialog, private ecomService: EcomService) {}

  ngOnInit() {
    this.loadBanners();
    this.loadCart();
    this.loadCategories();
    this.loadNewArrivals();
    this.loadTrending();
     this.interval = setInterval(() => {
      this.currentTestimonial =
        (this.currentTestimonial + 1) % this.testimonials.length;
    }, 4000);
    this.ecomService.getWishlist().subscribe({
      next: (res: any) => {
        const items = res.items || [];
        this.wishlistSet = new Set(items.map((i: any) => i.id));
        this.ecomService.updateWishlistCount(items.length);
      },
      error: err => console.error('Error loading wishlist', err)
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  loadBanners() {
    this.homeService.getBanners().subscribe({
      next: (res: any) => (this.slides = res || []),
      error: () => console.error('Failed to load banners'),
    });
  }

  loadCategories() {
    this.loading = true;
    this.homeService.getCategories().subscribe({
      next: (res: any) => {
        this.categories = res.categories || [];
        if (this.categories.length > 0) {
          this.selectCategory(this.categories[0]);
        } else {
          this.loading = false;
        }
      },
      error: () => (this.loading = false),
    });
  }

  selectCategory(cat: any) {
    this.selectedCategory = cat;
    this.loading = true;
    this.homeService.getProductsByCategory(cat.name).subscribe({
      next: (res: any) => {
        this.products = res.products || [];
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  getImage(img?: string) {
    return img || '/assets/images/fallback.jpg';
  }


// get current image url for display
getCurrentImage(p: any): string {
  const idx = this.getCurrentImageIndex(p);
  return p?.images && p.images.length ? p.images[idx] : (p?.main_image_url || '/assets/images/fallback-product.jpg');
}

getCurrentImageIndex(p: any): number {
  if (!p || !p.id) return 0;
  const idx = this.imageIndexMap[p.id];
  if (typeof idx === 'number') return idx;
  // default 0
  this.imageIndexMap[p.id] = 0;
  return 0;
}

// set a specific image index (for thumbnail click)
setImageIndex(p: any, index: number) {
  if (!p || !p.id) return;
  const max = (p.images?.length || 1) - 1;
  this.imageIndexMap[p.id] = Math.max(0, Math.min(index, max));
}

// start rotating images on hover
startImageRotation(p: any, intervalMs = 800) {
  if (!p || !p.id || !p.images || p.images.length <= 1) return;
  // prevent duplicate interval
  if (this.hoverIntervalMap.has(p.id)) return;
  let i = this.getCurrentImageIndex(p);
  const id = setInterval(() => {
    i = (i + 1) % p.images.length;
    this.imageIndexMap[p.id] = i;
  }, intervalMs);
  this.hoverIntervalMap.set(p.id, id);
}

stopImageRotation(p: any, resetToFirst = true) {
  if (!p || !p.id) return;
  const id = this.hoverIntervalMap.get(p.id);
  if (id) {
    clearInterval(id);
    this.hoverIntervalMap.delete(p.id);
  }
  if (resetToFirst) {
    this.imageIndexMap[p.id] = 0;
  }
}

  toggleWishlist(p: any): void {
    if (!p || !p.id) return;

    if (this.wishlistSet.has(p.id)) {
      this.wishlistSet.delete(p.id);
      this.ecomService.removeFromWishlist(p.id).subscribe({
        next: () => {
          this.ecomService.updateWishlistCount(this.wishlistSet.size);
        },
        error: err => console.error('Error removing from wishlist', err)
      });
    } else {
      this.wishlistSet.add(p.id);
      this.ecomService.addToWishlist(p.id).subscribe({
        next: () => {
          this.ecomService.updateWishlistCount(this.wishlistSet.size);
        },
        error: err => console.error('Error adding to wishlist', err)
      });
    }
  }




isInWishlist(p: any): boolean {
  return !!(p && p.id && this.wishlistSet.has(p.id));
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


loadCart() {
  this.ecomService.getCart().subscribe({
    next: (res: any) => {
      this.cartItems = res.items || [];
      this.cartCount = this.cartItems.length;
    },
    error: (err) => console.error('Cart load failed', err),
  });
}

isInCart(productId: number): boolean {
  return this.cartItems.some((item) => item.product_id === productId);
}

toggleCart(p: any, event: MouseEvent) {
  event.stopPropagation();
  if (this.isInCart(p.id)) {
    this.ecomService.removeFromCart(p.id).subscribe({
      next: () => {
        this.cartItems = this.cartItems.filter((item) => item.product_id !== p.id);
        this.cartCount = this.cartItems.length;
      },
      error: (err) => console.error('Remove cart error', err),
    });
  } else {
    // add
    this.ecomService.addToCart(p.id).subscribe({
      next: () => {
        this.cartItems.push({ product_id: p.id });
        this.cartCount = this.cartItems.length;
      },
      error: (err) => console.error('Add cart error', err),
    });
  }
}
buyNow(p: any) {
  console.log('Buy now:', p.id);
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

  loadNewArrivals() {
  this.loadingNewArrivals = true;
  this.homeService.getNewArrivals(12).subscribe({
    next: (res: any) => {
      this.newArrivals = res.products || res;
      this.loadingNewArrivals = false;
    },
    error: (err) => {
      console.error('New arrivals error:', err);
      this.loadingNewArrivals = false;
    },
  });
}

 loadTrending() {
    this.loadingTrending = true;
    this.homeService.getTrendingProducts().subscribe({
      next: (res) => {
        this.trendingProducts = res.items || [];
        this.loadingTrending = false;
      },
      error: () => (this.loadingTrending = false),
    });
  }

 
}