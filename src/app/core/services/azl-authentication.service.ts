import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AzlAuthenticationService {
  private baseUrl = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, { email, password }).pipe(
      map((response: any) => ({
        status_code: 200,
        ...response,
      })),
      catchError((error: HttpErrorResponse) => {
        const status = error.status;
        let message = 'Login failed. Please try again later.';

        if (status === 400) message = 'Email and password are required.';
        else if (status === 401) message = 'Invalid password.';
        else if (status === 403) message = 'Account not verified. Please verify OTP first.';
        else if (status === 404) message = 'Account not found. Please sign up first.';
        else if (status === 429) message = error.error?.message || 'Too many attempts. Try again later.';
        else if (status === 500) message = 'Server error. Please try again later.';

        return throwError(() => ({
          status_code: status,
          message,
        }));
      })
    );
  }

  requestPasswordReset(email: string): Observable<any> {
  return this.http.post(`${this.baseUrl}/forgot-password`, { email }).pipe(
    map((response: any) => ({
      status: 'success',
      status_code: 200,
      message: response.message || 'Password reset OTP sent successfully.',
    })),
    catchError((error: HttpErrorResponse) => {
      const status = error.status;
      let message = 'Something went wrong. Please try again later.';

      if (status === 400) message = 'Email is required.';
      else if (status === 404) message = 'No account found with this email.';
      else if (status === 429)
        message = error.error?.message || 'Too many attempts. Try again later.';
      else if (status === 500)
        message = 'Server error. Please try again later.';

      return throwError(() => ({
        status: 'fail',
        status_code: status,
        message,
      }));
    })
  );
}
resetPassword(email: string, otp: string, new_password: string) {
  return this.http.post(`${this.baseUrl}/reset-password`, {
    email,
    otp,
    new_password,
  });
}

verifyOTP(otp: string, email: string): Observable<any> {
  const payload = { otp, email };
  return this.http.post(`${this.baseUrl}/verify-otp`, payload).pipe(
    catchError((error) => {
      console.error('Verify OTP API Error:', error);
      return throwError(() => error);
    })
  );
}


signupUser(payload: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/registration`, payload).pipe(
    catchError((error) => {
      console.error('Signup API Error:', error);
      return throwError(() => error);
    })
  );
}

}