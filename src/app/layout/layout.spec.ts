import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { Layout } from './layout';
import { AuthService } from '../shared/services/auth/auth.service';

describe('Layout', () => {
  let component: Layout;
  let fixture: ComponentFixture<Layout>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'isLoggedIn',
      'getCurrentUser',
      'logout',
    ]);

    await TestBed.configureTestingModule({
      imports: [Layout],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        provideRouter([]),
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Layout);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct app name', () => {
    expect(component.appName).toBe('DriveWay');
  });

  describe('when user is logged in', () => {
    beforeEach(() => {
      authService.isLoggedIn.and.returnValue(true);
      authService.getCurrentUser.and.returnValue({
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      });
      fixture.detectChanges();
    });

    it('should display user greeting and logout button', () => {
      const greeting = fixture.debugElement.query(By.css('.user-greeting'));
      const logoutButton = fixture.debugElement.query(By.css('.logout-btn'));

      expect(greeting).toBeTruthy();
      expect(greeting.nativeElement.textContent).toContain('Welcome, John!');
      expect(logoutButton).toBeTruthy();
      expect(logoutButton.nativeElement.textContent).toContain('Logout');
    });

    it('should not display auth links', () => {
      const authLinks = fixture.debugElement.query(By.css('.auth-links'));
      expect(authLinks).toBeFalsy();
    });

    it('should call logout when logout button is clicked', () => {
      const logoutButton = fixture.debugElement.query(By.css('.logout-btn'));
      logoutButton.triggerEventHandler('click', null);

      expect(authService.logout).toHaveBeenCalled();
    });
  });

  describe('when user is not logged in', () => {
    beforeEach(() => {
      authService.isLoggedIn.and.returnValue(false);
      authService.getCurrentUser.and.returnValue(null);
      fixture.detectChanges();
    });

    it('should display auth links', () => {
      const authLinks = fixture.debugElement.query(By.css('.auth-links'));
      const loginLink = fixture.debugElement.query(By.css('.auth-link[routerLink="/login"]'));
      const registerLink = fixture.debugElement.query(
        By.css('.register-link[routerLink="/register"]')
      );

      expect(authLinks).toBeTruthy();
      expect(loginLink).toBeTruthy();
      expect(loginLink.nativeElement.textContent).toContain('Login');
      expect(registerLink).toBeTruthy();
      expect(registerLink.nativeElement.textContent).toContain('Sign Up');
    });

    it('should not display user menu', () => {
      const userMenu = fixture.debugElement.query(By.css('.user-menu'));
      expect(userMenu).toBeFalsy();
    });
  });

  describe('header structure', () => {
    beforeEach(() => {
      authService.isLoggedIn.and.returnValue(false);
      fixture.detectChanges();
    });

    it('should have logo with correct app name', () => {
      const logo = fixture.debugElement.query(By.css('.logo'));
      const logoLink = fixture.debugElement.query(By.css('.logo-link'));

      expect(logo).toBeTruthy();
      expect(logo.nativeElement.textContent).toBe('DriveWay');
      expect(logoLink).toBeTruthy();
      expect(logoLink.attributes['routerLink']).toBe('/');
    });

    it('should have main content area', () => {
      const main = fixture.debugElement.query(By.css('main'));
      const routerOutlet = fixture.debugElement.query(By.css('router-outlet'));

      expect(main).toBeTruthy();
      expect(routerOutlet).toBeTruthy();
    });

    it('should have footer with copyright', () => {
      const footer = fixture.debugElement.query(By.css('.footer'));
      const copyright = fixture.debugElement.query(By.css('.footer p'));

      expect(footer).toBeTruthy();
      expect(copyright).toBeTruthy();
      expect(copyright.nativeElement.textContent).toContain('2025 DriveWay');
    });
  });
});
