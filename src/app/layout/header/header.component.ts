import { Component, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { AzlAuthenticationService } from '../../core/services/azl-authentication.service';
import { EcomService } from '../../core/services/ecom.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule, MatMenuModule, MatButtonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnDestroy {
  searchQuery = '';
  placeholderSuggestions = [
    'Shop for Earrings',
    'Shop for Necklaces',
    'Find the best gift for anniversary',
    'Shop Pendants',
    'Explore New Arrivals'
  ];
  placeholderIndex = 0;
  placeholder = this.placeholderSuggestions[this.placeholderIndex];
  private placeholderTimer!: ReturnType<typeof setInterval>;

  mobileMenuOpen = false;
  searchFocused = false;
  suggestionOpen = false;

  openMega: string | null = null;
wishlistItems: any[] = [];
  wishlistCount = 0;
  isWishlistOpen = false;
  loadingWishlist = false;
  cartCount = 0;

  private userSub!: Subscription;
  private subs = new Subscription();


  constructor(private router: Router, private _azlAuth: AzlAuthenticationService, private ecomService: EcomService) {
    this.startPlaceholderRotation();
      this.ecomService.wishlistCount$.subscribe(count => {
      this.wishlistCount = count;
    });
        this.subs.add(this.ecomService.wishlistCount$.subscribe(c => this.wishlistCount = c));

        this.ecomService.wishlistCount$.subscribe(count => (this.wishlistCount = count));
  }

  ngOnInit() {
    this.userSub = this._azlAuth.currentUser$.subscribe(user => {
      this.user = user;
    });
    this.ecomService.getCart().subscribe();
    this.ecomService.cartCount$.subscribe(count => this.cartCount = count);
    
  }

  toggleWishlistPanel(): void {
    if (this.isWishlistOpen) {
      this.closeWishlistPanel();
      return;
    }
    this.openWishlistPanel();
  }

  openWishlistPanel(): void {
    this.isWishlistOpen = true;
    this.loadWishlist();
  }

closeWishlistPanel(): void {
    this.isWishlistOpen = false;
  }

  loadWishlist(): void {
    this.loadingWishlist = true;
    this.ecomService.getWishlist().subscribe({
      next: (res: any) => {
        this.wishlistItems = (res.items || []).map((x: any) => this.normalizeWishlistItem(x));
        this.loadingWishlist = false;
        // ensure header counter consistent with server
        this.ecomService.updateWishlistCount(this.wishlistItems.length);
      },
      error: (err) => {
        console.error('Failed to load wishlist', err);
        this.loadingWishlist = false;
      }
    });
  }

  normalizeWishlistItem(item: any) {
    // fix types and provide fallback fields
    return {
      ...item,
      price: item.price ?? '0.00',
      images: Array.isArray(item.images) ? item.images : (item.images ? [item.images] : []),
      main_image_url: item.main_image_url || (item.images && item.images[0]) || null,
      added_at: item.added_at || item.created_at || new Date().toISOString()
    };
  }

  addToCart(item: any): void {
    // placeholder - integrate your cart service here
    console.log('Add to cart:', item.id, item.title);
    // optionally call API and remove from wishlist after adding
  }

  removeFromWishlist(item: any): void {
    if (!item?.id) return;
    this.ecomService.removeFromWishlist(item.id).subscribe({
      next: () => {
        this.wishlistItems = this.wishlistItems.filter(i => i.id !== item.id);
        const newCount = Math.max(this.wishlistCount - 1, 0);
        this.ecomService.updateWishlistCount(newCount);
      },
      error: (err) => console.error('Failed to remove wishlist item', err)
    });
  }

  moveAllToCart(): void {
    // naive: iterate, add to cart then remove; better: batch API if you have it
    for (const it of [...this.wishlistItems]) {
      this.addToCart(it);
      this.removeFromWishlist(it);
    }
  }

  clearWishlist(): void {
    // if you have API for clearing wishlist use it, else delete one-by-one
    for (const it of [...this.wishlistItems]) {
      this.removeFromWishlist(it);
    }
  }

  // small helper - relative time display
  timeAgo(date: string | number): string {
    if (!date) return '';
    const d = new Date(date);
    const now = Date.now();
    const sec = Math.floor((now - d.getTime()) / 1000);
    if (sec < 60) return `${sec}s`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h`;
    const days = Math.floor(hr / 24);
    if (days < 7) return `${days}d`;
    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `${weeks}w`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo`;
    const years = Math.floor(days / 365);
    return `${years}y`;
  }

  openWishlistPage(): void {
    // route to wishlist page if implemented
    // this.router.navigate(['/wishlist']);
    console.log('Open full wishlist page');
  }

 
  startPlaceholderRotation() {
    this.placeholderTimer = setInterval(() => {
      this.placeholderIndex = (this.placeholderIndex + 1) % this.placeholderSuggestions.length;
      this.placeholder = this.placeholderSuggestions[this.placeholderIndex];
    }, 3000);
  }

  stopPlaceholderRotation() {
    clearInterval(this.placeholderTimer);
  }

  onSearchFocus() {
    this.searchFocused = true;
    this.suggestionOpen = !!this.searchQuery;
    this.stopPlaceholderRotation();
  }

  onSearchBlur() {
    setTimeout(() => {
      this.searchFocused = false;
      this.suggestionOpen = false;
      this.startPlaceholderRotation();
    }, 200);
  }

  onSearchInput() {
    this.suggestionOpen = this.searchQuery.length > 0;
  }

  chooseSuggestion(s: string) {
    this.searchQuery = s;
    this.suggestionOpen = false;
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  openMegaMenu(key: string | null) {
    this.openMega = key;
  }

  closeMegaMenu() {
    this.openMega = null;
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape() {
    this.mobileMenuOpen = false;
    this.openMega = null;
    this.suggestionOpen = false;
  }

  ngOnDestroy(): void {
        this.subs.unsubscribe();
    this.stopPlaceholderRotation();
    this.userSub?.unsubscribe();
  }

  startVoiceSearch() {
  if (!('webkitSpeechRecognition' in window)) {
    alert('Voice recognition not supported in this browser.');
    return;
  }

  const recognition = new (window as any).webkitSpeechRecognition();
  recognition.lang = 'en-IN';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    console.log('Listening...');
  };

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    console.log('User said:', transcript);
    this.searchQuery = transcript;
  };

  recognition.onerror = (event: any) => {
    console.error('Speech error:', event.error);
  };

  recognition.start();
}
isMenuOpen = false;
  user = JSON.parse(localStorage.getItem('azl_user') || 'null');


  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  goTo(path: string) {
    console.log('Navigating to:', path);
    this.router.navigate([path]);
    this.isMenuOpen = false;
  }

  logout() {
    localStorage.removeItem('azl_token');
    localStorage.removeItem('azl_user');
    this.isMenuOpen = false;
    this.router.navigate(['/login']);
  }
  handleAccountClick() {
  if (!this.user || !this.user?.email) {
    this.router.navigate(['/login']);
    return;
  }

  this.isMenuOpen = !this.isMenuOpen;
}

onSearch() {
    const query = this.searchQuery.trim();
    if (query) {
      this.router.navigate(['/search-results'], { queryParams: { q: query } });
    }
  }
  
}