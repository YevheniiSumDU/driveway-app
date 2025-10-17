import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { throwError } from 'rxjs';
import { Login } from './login';
import { AuthService } from '../../services/auth/auth.service';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [Login, ReactiveFormsModule],
      providers: [{ provide: AuthService, useValue: authServiceSpy }, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with empty values', () => {
      expect(component.loginForm.value).toEqual({
        email: '',
        password: '',
      });
    });

    it('should initialize state properties', () => {
      expect(component.isLoading).toBeFalse();
      expect(component.errorMessage).toBe('');
    });
  });

  describe('Form Validation', () => {
    it('should mark email as invalid when empty', () => {
      const emailControl = component.email;
      emailControl?.setValue('');
      emailControl?.markAsTouched();

      expect(emailControl?.invalid).toBeTrue();
      expect(emailControl?.errors?.['required']).toBeTruthy();
    });

    it('should mark email as invalid with invalid format', () => {
      const emailControl = component.email;
      emailControl?.setValue('invalid-email');
      emailControl?.markAsTouched();

      expect(emailControl?.invalid).toBeTrue();
      expect(emailControl?.errors?.['email']).toBeTruthy();
    });

    it('should mark email as valid with correct format', () => {
      const emailControl = component.email;
      emailControl?.setValue('test@example.com');
      emailControl?.markAsTouched();

      expect(emailControl?.valid).toBeTrue();
    });

    it('should mark password as invalid when empty', () => {
      const passwordControl = component.password;
      passwordControl?.setValue('');
      passwordControl?.markAsTouched();

      expect(passwordControl?.invalid).toBeTrue();
      expect(passwordControl?.errors?.['required']).toBeTruthy();
    });

    it('should mark password as invalid when less than 6 characters', () => {
      const passwordControl = component.password;
      passwordControl?.setValue('12345');
      passwordControl?.markAsTouched();

      expect(passwordControl?.invalid).toBeTrue();
      expect(passwordControl?.errors?.['minlength']).toBeTruthy();
    });

    it('should mark password as valid with 6 or more characters', () => {
      const passwordControl = component.password;
      passwordControl?.setValue('123456');
      passwordControl?.markAsTouched();

      expect(passwordControl?.valid).toBeTrue();
    });

    it('should mark form as invalid when any field is invalid', () => {
      component.loginForm.patchValue({
        email: 'invalid-email',
        password: '123',
      });

      expect(component.loginForm.invalid).toBeTrue();
    });

    it('should mark form as valid when all fields are valid', () => {
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(component.loginForm.valid).toBeTrue();
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle login error with server message', () => {
      const errorResponse = { error: { message: 'Invalid credentials' } };
      authService.login.and.returnValue(throwError(() => errorResponse));

      component.onSubmit();

      expect(component.errorMessage).toBe('Invalid credentials');
      expect(component.isLoading).toBeFalse();
    });

    it('should handle login error with fallback message', () => {
      const errorResponse = new Error('Network error');
      authService.login.and.returnValue(throwError(() => errorResponse));

      component.onSubmit();

      expect(component.errorMessage).toBe('Network error');
      expect(component.isLoading).toBeFalse();
    });

    it('should handle login error with default message', () => {
      const errorResponse = {};
      authService.login.and.returnValue(throwError(() => errorResponse));

      component.onSubmit();

      expect(component.errorMessage).toBe('Login failed. Please try again.');
      expect(component.isLoading).toBeFalse();
    });

    it('should not submit when form is invalid', () => {
      component.loginForm.patchValue({
        email: '',
        password: '',
      });

      component.onSubmit();

      expect(authService.login).not.toHaveBeenCalled();
    });
  });

  describe('Template Integration', () => {
    it('should disable submit button when form is invalid', () => {
      component.loginForm.patchValue({
        email: '',
        password: '',
      });
      fixture.detectChanges();

      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton.disabled).toBeTrue();
    });

    it('should disable submit button when loading', () => {
      component.isLoading = true;
      fixture.detectChanges();

      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton.disabled).toBeTrue();
    });

    it('should show loading text when isLoading is true', () => {
      component.isLoading = true;
      fixture.detectChanges();

      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton.textContent).toContain('Signing In...');
    });

    it('should show error message when errorMessage is set', () => {
      component.errorMessage = 'Test error message';
      fixture.detectChanges();

      const errorElement = fixture.nativeElement.querySelector('.alert-error');
      expect(errorElement).toBeTruthy();
      expect(errorElement.textContent).toContain('Test error message');
    });

    it('should show email validation errors', () => {
      const emailControl = component.email;
      emailControl?.setValue('');
      emailControl?.markAsTouched();
      fixture.detectChanges();

      const errorElements = fixture.nativeElement.querySelectorAll('.error-message');
      expect(errorElements.length).toBeGreaterThan(0);
    });

    it('should show password validation errors', () => {
      const passwordControl = component.password;
      passwordControl?.setValue('123');
      passwordControl?.markAsTouched();
      fixture.detectChanges();

      const errorElements = fixture.nativeElement.querySelectorAll('.error-message');
      expect(errorElements.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility and UX', () => {
    it('should have proper input labels and placeholders', () => {
      fixture.detectChanges();

      const emailInput = fixture.nativeElement.querySelector('#email');
      const passwordInput = fixture.nativeElement.querySelector('#password');

      expect(emailInput.placeholder).toContain('Enter your email');
      expect(passwordInput.placeholder).toContain('Enter your password');
    });

    it('should have autocomplete attributes set to off', () => {
      fixture.detectChanges();

      const emailInput = fixture.nativeElement.querySelector('#email');
      const passwordInput = fixture.nativeElement.querySelector('#password');

      expect(emailInput.getAttribute('autocomplete')).toBe('off');
      expect(passwordInput.getAttribute('autocomplete')).toBe('off');
    });
  });
});
