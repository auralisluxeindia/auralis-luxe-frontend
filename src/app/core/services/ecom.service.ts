import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EcomService {


  private apiUrl = environment.apiUrl + '/ecom'; 
  private wishlistCountSubject = new BehaviorSubject<number>(0);
  wishlistCount$ = this.wishlistCountSubject.asObservable();

   private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  constructor(private http: HttpClient) {}

    private getAuthHeaders() {
      const token = localStorage.getItem('azl_token');
      return {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`
        })
      };
    }

  recordProductView(product_id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/product/view`, { product_id });
  }

 addToWishlist(product_id: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/wishlist`,
      { product_id },
      this.getAuthHeaders()
    );
  }

  removeFromWishlist(product_id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/wishlist`,
      {
        body: { product_id },
        ...this.getAuthHeaders()
      }
    );
  }

  getWishlist(): Observable<any> {
    return this.http.get(`${this.apiUrl}/wishlist`, this.getAuthHeaders());
  }

  updateWishlistCount(count: number): void {
    this.wishlistCountSubject.next(count);
  }

  addToCart(product_id: number, quantity: number = 1): Observable<any> {
    return this.http.post(`${this.apiUrl}/cart`, { product_id, quantity }, this.getAuthHeaders())
      .pipe(
        tap(() => {
          this.getCart().subscribe();
        })
      );
  }

  updateCartItem(product_id: number, quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/cart`, { product_id, quantity }, this.getAuthHeaders());
  }

  removeFromCart(productId: number) {
  return this.http.delete(`${this.apiUrl}/cart`, { body: { product_id: productId } });
}


  removeCartItem(product_id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cart`, { 
      ...this.getAuthHeaders(),
      body: { product_id }
    });
  }

  getCart(): Observable<any> {
    return this.http.get(`${this.apiUrl}/cart`, this.getAuthHeaders())
      .pipe(
        tap((res: any) => {
          const count = res?.items?.length || 0;
          this.cartCountSubject.next(count);
        })
      );
  }

  updateCartCount(count: number) {
    this.cartCountSubject.next(count);
  }
}