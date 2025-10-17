import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';
import { ApiResponse } from '../interfaces/api.interface';
import { AuthResponse, LoginRequest, RegisterRequest } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<ApiResponse<AuthResponse>>('/auth/login', credentials).pipe(
      map((response) => {
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || 'Login failed');
        }
      }),
      tap((authResponse: AuthResponse) => {
        this.setToken(authResponse.accessToken);
        this.setUser(authResponse.user);
        this.isAuthenticatedSubject.next(true);
        this.currentUserSubject.next(authResponse.user);
      })
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<ApiResponse<AuthResponse>>('/auth/register', userData).pipe(
      map((response) => {
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || 'Registration failed');
        }
      }),
      tap((authResponse: AuthResponse) => {
        this.setToken(authResponse.accessToken);
        this.setUser(authResponse.user);
        this.isAuthenticatedSubject.next(true);
        this.currentUserSubject.next(authResponse.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private getStoredUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }
}
