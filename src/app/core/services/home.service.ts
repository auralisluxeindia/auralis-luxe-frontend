import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private baseUrl = environment.apiUrl + '/products';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/available-categories`);
  }

getProductsByCategory(categoryId: number, limit = 6): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/?category=${categoryId}&limit=${limit}`
    );
  }

  getNewArrivals(limit: number = 12) {
  return this.http.get(`${this.baseUrl}/?limit=${limit}&order=desc`);
}

getTrendingProducts(limit: number = 12): Observable<any> {
    return this.http.get(`${this.baseUrl}/trending?limit=${limit}`);
  }

  getBanners(): Observable<any> {
    return this.http.get(`${this.baseUrl}/banners`);
  }
}