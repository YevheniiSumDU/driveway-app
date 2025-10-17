import { TestBed } from '@angular/core/testing';
import {
  HttpRequest,
  HttpEvent,
  HttpResponse,
  HttpHandlerFn,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { baseUrlInterceptor } from './base-url.interceptor';

describe('BaseUrlInterceptor', () => {
  let interceptor: typeof baseUrlInterceptor;

  const mockHandler: HttpHandlerFn = (
    req: HttpRequest<unknown>
  ): Observable<HttpEvent<unknown>> => {
    return of(new HttpResponse({ status: 200, url: req.url }));
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    interceptor = baseUrlInterceptor;
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should prepend base URL to relative API requests', (done) => {
    const request = new HttpRequest('GET', '/api/cars');

    interceptor(request, mockHandler).subscribe((event) => {
      if (event instanceof HttpResponse) {
        expect(event.url).toBe('http://localhost:3001/api/cars');
        done();
      }
    });
  });

  it('should not modify absolute URL requests', (done) => {
    const request = new HttpRequest('GET', 'https://api.example.com/cars');

    interceptor(request, mockHandler).subscribe((event) => {
      if (event instanceof HttpResponse) {
        expect(event.url).toBe('https://api.example.com/cars');
        done();
      }
    });
  });

  it('should not modify asset requests', (done) => {
    const request = new HttpRequest('GET', 'assets/images/car.jpg');

    interceptor(request, mockHandler).subscribe((event) => {
      if (event instanceof HttpResponse) {
        expect(event.url).toBe('assets/images/car.jpg');
        done();
      }
    });
  });

  it('should handle different HTTP methods', (done) => {
    const request = new HttpRequest('POST', '/api/cars', { name: 'Test Car' });

    interceptor(request, mockHandler).subscribe((event) => {
      if (event instanceof HttpResponse) {
        expect(event.url).toBe('http://localhost:3001/api/cars');
        done();
      }
    });
  });

  it('should preserve request body and headers', (done) => {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const request = new HttpRequest('POST', '/api/cars', { name: 'Test Car' }, { headers });

    const testHandler: HttpHandlerFn = (req: HttpRequest<unknown>) => {
      expect(req.url).toBe('http://localhost:3001/api/cars');
      expect(req.body).toEqual({ name: 'Test Car' });
      expect(req.headers.get('Content-Type')).toBe('application/json');
      return of(new HttpResponse({ status: 200 }));
    };

    interceptor(request, testHandler).subscribe(() => done());
  });

  it('should handle requests with query parameters', (done) => {
    const request = new HttpRequest('GET', '/api/cars?page=1&limit=10');

    interceptor(request, mockHandler).subscribe((event) => {
      if (event instanceof HttpResponse) {
        expect(event.url).toBe('http://localhost:3001/api/cars?page=1&limit=10');
        done();
      }
    });
  });

  it('should handle empty path requests', (done) => {
    const request = new HttpRequest('GET', '');

    interceptor(request, mockHandler).subscribe((event) => {
      if (event instanceof HttpResponse) {
        expect(event.url).toBe('http://localhost:3001');
        done();
      }
    });
  });

  it('should handle root path requests', (done) => {
    const request = new HttpRequest('GET', '/');

    interceptor(request, mockHandler).subscribe((event) => {
      if (event instanceof HttpResponse) {
        expect(event.url).toBe('http://localhost:3001/');
        done();
      }
    });
  });
});
