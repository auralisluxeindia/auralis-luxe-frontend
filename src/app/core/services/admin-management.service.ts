import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminManagementService {
  private baseUrl = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('azl_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

  inviteAdmin(data: any) {
    return this.http
      .post(`${this.baseUrl}/invite`, data, { headers: this.getAuthHeaders() })
      .pipe(
        catchError((err) => {
          console.error('Invite Admin Error:', err);
          return throwError(() => err);
        })
      );
  }

  listAdmins() {
    return this.http
      .get(`${this.baseUrl}/admin-list`, { headers: this.getAuthHeaders() })
      .pipe(
        catchError((err) => {
          console.error('List Admin Error:', err);
          return throwError(() => err);
        })
      );
  }

  removeAdmin(id: number) {
    return this.http
      .delete(`${this.baseUrl}/remove-admin/${id}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((err) => {
          console.error('Remove Admin Error:', err);
          return throwError(() => err);
        })
      );
  }
}