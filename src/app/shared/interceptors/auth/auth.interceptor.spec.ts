import { TestBed } from '@angular/core/testing';
import {
  HttpRequest,
  HttpEvent,
  HttpResponse,
  HttpHeaders,
  HttpHandlerFn,
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../../services/auth/auth.service';

describe('AuthInterceptor', () => {
  let authService: jasmine.SpyObj<AuthService>;

  const mockHandler: HttpHandlerFn = (
    req: HttpRequest<unknown>
  ): Observable<HttpEvent<unknown>> => {
    return of(new HttpResponse({ status: 200, headers: req.headers }));
  };

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken']);

    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authServiceSpy }],
    });

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should be created', () => {
    expect(authInterceptor).toBeTruthy();
  });

  it('should add Authorization header when token is present', (done) => {
    const token = 'mock-jwt-token';
    authService.getToken.and.returnValue(token);

    const request = new HttpRequest('GET', '/api/cars');

    TestBed.runInInjectionContext(() => {
      authInterceptor(request, mockHandler).subscribe((event) => {
        if (event instanceof HttpResponse) {
          expect(event.headers.get('Authorization')).toBe(`Bearer ${token}`);
          done();
        }
      });
    });
  });

  it('should not add Authorization header when token is null', (done) => {
    authService.getToken.and.returnValue(null);

    const request = new HttpRequest('GET', '/api/cars');

    const testHandler: HttpHandlerFn = (req: HttpRequest<unknown>) => {
      expect(req.headers.has('Authorization')).toBeFalse();
      return of(new HttpResponse({ status: 200 }));
    };

    TestBed.runInInjectionContext(() => {
      authInterceptor(request, testHandler).subscribe(() => done());
    });
  });

  it('should not add Authorization header when token is empty string', (done) => {
    authService.getToken.and.returnValue('');

    const request = new HttpRequest('GET', '/api/cars');

    const testHandler: HttpHandlerFn = (req: HttpRequest<unknown>) => {
      expect(req.headers.has('Authorization')).toBeFalse();
      return of(new HttpResponse({ status: 200 }));
    };

    TestBed.runInInjectionContext(() => {
      authInterceptor(request, testHandler).subscribe(() => done());
    });
  });

  it('should handle different HTTP methods with token', (done) => {
    const token = 'mock-jwt-token';
    authService.getToken.and.returnValue(token);

    const request = new HttpRequest('POST', '/api/cars', { name: 'Test Car' });

    const testHandler: HttpHandlerFn = (req: HttpRequest<unknown>) => {
      expect(req.headers.get('Authorization')).toBe(`Bearer ${token}`);
      expect(req.method).toBe('POST');
      expect(req.body).toEqual({ name: 'Test Car' });
      return of(new HttpResponse({ status: 200 }));
    };

    TestBed.runInInjectionContext(() => {
      authInterceptor(request, testHandler).subscribe(() => done());
    });
  });

  it('should work with requests that already have Authorization header', (done) => {
    const token = 'mock-jwt-token';
    authService.getToken.and.returnValue(token);

    const request = new HttpRequest('GET', '/api/cars', null, {
      headers: new HttpHeaders({ Authorization: 'Bearer existing-token' }),
    });

    const testHandler: HttpHandlerFn = (req: HttpRequest<unknown>) => {
      expect(req.headers.get('Authorization')).toBe(`Bearer ${token}`);
      return of(new HttpResponse({ status: 200 }));
    };

    TestBed.runInInjectionContext(() => {
      authInterceptor(request, testHandler).subscribe(() => done());
    });
  });
});
