import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private baseUrl = 'http://localhost:5000/api/products';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('azl_token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  // Categories
  getCategories() {
    return this.http
      .get(`${this.baseUrl}/available-categories`, this.getAuthHeaders())
      .pipe(catchError(err => throwError(() => err)));
  }

  createCategory(data: any) {
    return this.http
      .post(`${this.baseUrl}/available-categories`, data, this.getAuthHeaders())
      .pipe(catchError(err => throwError(() => err)));
  }

  updateCategory(id: number, data: any) {
    return this.http
      .put(`${this.baseUrl}/edit-category/${id}`, data, this.getAuthHeaders())
      .pipe(catchError(err => throwError(() => err)));
  }

  deleteCategory(id: number) {
    return this.http
      .delete(`${this.baseUrl}/delete-category/${id}`, this.getAuthHeaders())
      .pipe(catchError(err => throwError(() => err)));
  }

  uploadCategoryImage(formData: FormData) {
    return this.http.post(
      `${this.baseUrl}/upload-category-image`,
      formData,
      this.getAuthHeaders()
    );
  }

  // Products
  listProducts(params: any) {
    return this.http.get(this.baseUrl + '/', {
      params,
      ...this.getAuthHeaders()
    });
  }

  createProduct(formData: FormData) {
    return this.http.post(this.baseUrl + '/', formData, this.getAuthHeaders());
  }

  updateProduct(id: number, formData: FormData) {
    return this.http.put(
      this.baseUrl + `/${id}`,
      formData,
      this.getAuthHeaders()
    );
  }

  deleteProduct(id: number) {
    return this.http.delete(
      this.baseUrl + `/${id}`,
      this.getAuthHeaders()
    );
  }

bulkUploadProducts(formData: FormData) {
  return this.http.post(`${this.baseUrl}/bulk-upload`, formData, this.getAuthHeaders());
}

}
