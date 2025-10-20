import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthResponse, LoginRequest, RegisterRequest } from '../interfaces/auth.interface';
import { ApiResponse } from '../interfaces/api.interface';
import { User } from '../../models/user.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
  };

  const mockAuthResponse: AuthResponse = {
    accessToken: 'mock-jwt-token',
    user: mockUser,
  };

  const mockLoginRequest: LoginRequest = {
    email: 'test@example.com',
    password: 'password123',
  };

  const mockRegisterRequest: RegisterRequest = {
    email: 'newuser@example.com',
    password: 'password123',
    firstName: 'Jane',
    lastName: 'Smith',
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        AuthService,
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
          },
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('login', () => {
    it('should login successfully and store token/user', (done) => {
      const mockResponse: ApiResponse<AuthResponse> = {
        success: true,
        message: 'Login successful',
        data: mockAuthResponse,
      };

      service.login(mockLoginRequest).subscribe((response) => {
        expect(response).toEqual(mockAuthResponse);

        // Verify token and user are stored
        expect(localStorage.getItem('auth_token')).toBe('mock-jwt-token');
        expect(localStorage.getItem('user_data')).toBe(JSON.stringify(mockUser));

        // Verify authentication state is updated
        expect(service.isLoggedIn()).toBeTrue();
        expect(service.getCurrentUser()).toEqual(mockUser);

        done();
      });

      const req = httpMock.expectOne('/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockLoginRequest);
      req.flush(mockResponse);
    });

    it('should handle login failure', (done) => {
      const mockErrorResponse: ApiResponse<AuthResponse> = {
        success: false,
        message: 'Invalid credentials',
      };

      service.login(mockLoginRequest).subscribe({
        next: () => fail('Expected error but got success'),
        error: (error) => {
          expect(error.message).toBe('Invalid credentials');

          expect(localStorage.getItem('auth_token')).toBeNull();
          expect(localStorage.getItem('user_data')).toBeNull();

          expect(service.isLoggedIn()).toBeFalse();
          expect(service.getCurrentUser()).toBeNull();

          done();
        },
      });

      const req = httpMock.expectOne('/auth/login');
      req.flush(mockErrorResponse);
    });

    it('should handle HTTP error during login', (done) => {
      service.login(mockLoginRequest).subscribe({
        next: () => fail('Expected error but got success'),
        error: (error) => {
          expect(error.message).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne('/auth/login');
      req.error(new ProgressEvent('Network error'), { status: 500 });
    });
  });

  describe('register', () => {
    it('should register successfully and store token/user', (done) => {
      const newUserAuthResponse: AuthResponse = {
        accessToken: 'mock-jwt-token-new',
        user: {
          id: 2,
          email: 'newuser@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
        },
      };

      const mockResponse: ApiResponse<AuthResponse> = {
        success: true,
        message: 'Registration successful',
        data: newUserAuthResponse,
      };

      service.register(mockRegisterRequest).subscribe((response) => {
        expect(response).toEqual(newUserAuthResponse);

        expect(localStorage.getItem('auth_token')).toBe('mock-jwt-token-new');
        expect(localStorage.getItem('user_data')).toBe(JSON.stringify(newUserAuthResponse.user));

        expect(service.isLoggedIn()).toBeTrue();
        expect(service.getCurrentUser()).toEqual(newUserAuthResponse.user);

        done();
      });

      const req = httpMock.expectOne('/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRegisterRequest);
      req.flush(mockResponse);
    });

    it('should handle registration failure', (done) => {
      const mockErrorResponse: ApiResponse<AuthResponse> = {
        success: false,
        message: 'Email already exists',
      };

      service.register(mockRegisterRequest).subscribe({
        next: () => fail('Expected error but got success'),
        error: (error) => {
          expect(error.message).toBe('Email already exists');

          expect(localStorage.getItem('auth_token')).toBeNull();
          expect(localStorage.getItem('user_data')).toBeNull();

          expect(service.isLoggedIn()).toBeFalse();

          done();
        },
      });

      const req = httpMock.expectOne('/auth/register');
      req.flush(mockErrorResponse);
    });
  });

  describe('logout', () => {
    it('should clear storage and update authentication state', () => {
      localStorage.setItem('auth_token', 'mock-token');
      localStorage.setItem('user_data', JSON.stringify(mockUser));

      (service as any).isAuthenticatedSubject.next(true);
      (service as any).currentUserSubject.next(mockUser);

      expect(service.isLoggedIn()).toBeTrue();
      expect(service.getCurrentUser()).toEqual(mockUser);

      service.logout();

      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('user_data')).toBeNull();

      expect(service.isLoggedIn()).toBeFalse();
      expect(service.getCurrentUser()).toBeNull();

      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('authentication state', () => {
    it('should return false when no token is stored', () => {
      expect(service.isLoggedIn()).toBeFalse();
      expect(service.getToken()).toBeNull();
      expect(service.getCurrentUser()).toBeNull();
    });

    it('should return true when token is stored', () => {
      localStorage.setItem('auth_token', 'mock-token');
      localStorage.setItem('user_data', JSON.stringify(mockUser));

      (service as any).isAuthenticatedSubject.next(true);
      (service as any).currentUserSubject.next(mockUser);

      expect(service.isLoggedIn()).toBeTrue();
      expect(service.getToken()).toBe('mock-token');
      expect(service.getCurrentUser()).toEqual(mockUser);
    });

    it('should handle invalid user data in localStorage', () => {
      localStorage.setItem('auth_token', 'mock-token');
      localStorage.setItem('user_data', 'invalid-json');

      (service as any).isAuthenticatedSubject.next(true);
      (service as any).currentUserSubject.next(null);

      expect(service.isLoggedIn()).toBeTrue();
      expect(service.getCurrentUser()).toBeNull();
    });
  });

  describe('observables', () => {
    it('should emit authentication state changes', (done) => {
      const states: boolean[] = [];

      service.isAuthenticated$.subscribe((isAuthenticated) => {
        states.push(isAuthenticated);

        if (states.length === 2) {
          expect(states).toEqual([false, true]);
          done();
        }
      });

      (service as any).isAuthenticatedSubject.next(true);
    });

    it('should emit user changes', (done) => {
      const users: (User | null)[] = [];

      service.currentUser$.subscribe((user) => {
        users.push(user);

        if (users.length === 2) {
          expect(users).toEqual([null, mockUser]);
          done();
        }
      });

      (service as any).currentUserSubject.next(mockUser);
    });
  });
});
