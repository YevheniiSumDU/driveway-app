import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../../services/auth/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let isAuthenticatedSubject: BehaviorSubject<boolean>;

  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = { url: '/protected-route' } as RouterStateSnapshot;

  beforeEach(() => {
    isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      isAuthenticated$: isAuthenticatedSubject.asObservable(),
    });

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('when user is authenticated', () => {
    beforeEach(() => {
      isAuthenticatedSubject.next(true);
    });

    it('should allow access to protected route', (done) => {
      guard.canActivate(mockRoute, mockState).subscribe((result: boolean) => {
        expect(result).toBeTrue();
        expect(router.navigate).not.toHaveBeenCalled();
        done();
      });
    });
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      isAuthenticatedSubject.next(false);
    });

    it('should redirect to login page with return URL', (done) => {
      guard.canActivate(mockRoute, mockState).subscribe((result: boolean) => {
        expect(result).toBeFalse();
        expect(router.navigate).toHaveBeenCalledWith(['/login'], {
          queryParams: { returnUrl: '/protected-route' },
        });
        done();
      });
    });

    it('should preserve different return URLs', (done) => {
      const differentState = { url: '/another-protected-route' } as RouterStateSnapshot;

      guard.canActivate(mockRoute, differentState).subscribe((result: boolean) => {
        expect(result).toBeFalse();
        expect(router.navigate).toHaveBeenCalledWith(['/login'], {
          queryParams: { returnUrl: '/another-protected-route' },
        });
        done();
      });
    });
  });

  describe('authentication state changes', () => {
    it('should handle authentication state becoming true', (done) => {
      isAuthenticatedSubject.next(false);

      guard.canActivate(mockRoute, mockState).subscribe((result: boolean) => {
        expect(result).toBeFalse();
        expect(router.navigate).toHaveBeenCalledWith(['/login'], {
          queryParams: { returnUrl: '/protected-route' },
        });
        done();
      });
    });

    it('should handle authentication state becoming false', (done) => {
      isAuthenticatedSubject.next(true);

      guard.canActivate(mockRoute, mockState).subscribe((result: boolean) => {
        expect(result).toBeTrue();
        expect(router.navigate).not.toHaveBeenCalled();
        done();
      });
    });
  });

  describe('edge cases', () => {
    it('should handle root path as return URL', (done) => {
      const rootState = { url: '/' } as RouterStateSnapshot;
      isAuthenticatedSubject.next(false);

      guard.canActivate(mockRoute, rootState).subscribe((result: boolean) => {
        expect(result).toBeFalse();
        expect(router.navigate).toHaveBeenCalledWith(['/login'], {
          queryParams: { returnUrl: '/' },
        });
        done();
      });
    });

    it('should handle empty URL', (done) => {
      const emptyState = { url: '' } as RouterStateSnapshot;
      isAuthenticatedSubject.next(false);

      guard.canActivate(mockRoute, emptyState).subscribe((result: boolean) => {
        expect(result).toBeFalse();
        expect(router.navigate).toHaveBeenCalledWith(['/login'], {
          queryParams: { returnUrl: '' },
        });
        done();
      });
    });

    it('should handle URL with query parameters', (done) => {
      const queryState = { url: '/protected?param=value' } as RouterStateSnapshot;
      isAuthenticatedSubject.next(false);

      guard.canActivate(mockRoute, queryState).subscribe((result: boolean) => {
        expect(result).toBeFalse();
        expect(router.navigate).toHaveBeenCalledWith(['/login'], {
          queryParams: { returnUrl: '/protected?param=value' },
        });
        done();
      });
    });
  });
});
