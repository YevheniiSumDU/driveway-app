import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { throwError } from 'rxjs';
import { Register } from './register';
import { AuthService } from '../../services/auth/auth.service';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);

    await TestBed.configureTestingModule({
      imports: [Register, ReactiveFormsModule],
      providers: [{ provide: AuthService, useValue: authServiceSpy }, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with empty values', () => {
      expect(component.registerForm.value).toEqual({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
    });

    it('should initialize state properties', () => {
      expect(component.isLoading).toBeFalse();
      expect(component.errorMessage).toBe('');
    });
  });

  describe('Form Validation', () => {
    describe('First Name Validation', () => {
      it('should mark first name as invalid when empty', () => {
        const firstNameControl = component.firstName;
        firstNameControl?.setValue('');
        firstNameControl?.markAsTouched();

        expect(firstNameControl?.invalid).toBeTrue();
        expect(firstNameControl?.errors?.['required']).toBeTruthy();
      });

      it('should mark first name as invalid when less than 2 characters', () => {
        const firstNameControl = component.firstName;
        firstNameControl?.setValue('A');
        firstNameControl?.markAsTouched();

        expect(firstNameControl?.invalid).toBeTrue();
        expect(firstNameControl?.errors?.['minlength']).toBeTruthy();
      });

      it('should mark first name as valid with 2 or more characters', () => {
        const firstNameControl = component.firstName;
        firstNameControl?.setValue('John');
        firstNameControl?.markAsTouched();

        expect(firstNameControl?.valid).toBeTrue();
      });
    });

    describe('Last Name Validation', () => {
      it('should mark last name as invalid when empty', () => {
        const lastNameControl = component.lastName;
        lastNameControl?.setValue('');
        lastNameControl?.markAsTouched();

        expect(lastNameControl?.invalid).toBeTrue();
        expect(lastNameControl?.errors?.['required']).toBeTruthy();
      });

      it('should mark last name as invalid when less than 2 characters', () => {
        const lastNameControl = component.lastName;
        lastNameControl?.setValue('D');
        lastNameControl?.markAsTouched();

        expect(lastNameControl?.invalid).toBeTrue();
        expect(lastNameControl?.errors?.['minlength']).toBeTruthy();
      });

      it('should mark last name as valid with 2 or more characters', () => {
        const lastNameControl = component.lastName;
        lastNameControl?.setValue('Doe');
        lastNameControl?.markAsTouched();

        expect(lastNameControl?.valid).toBeTrue();
      });
    });

    describe('Email Validation', () => {
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
    });

    describe('Password Validation', () => {
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
    });

    describe('Password Match Validation', () => {
      it('should mark confirm password as invalid when passwords do not match', () => {
        component.registerForm.patchValue({
          password: 'password123',
          confirmPassword: 'differentpassword',
        });
        component.confirmPassword?.markAsTouched();

        expect(component.confirmPassword?.invalid).toBeTrue();
        expect(component.confirmPassword?.errors?.['passwordMismatch']).toBeTruthy();
      });

      it('should mark confirm password as valid when passwords match', () => {
        component.registerForm.patchValue({
          password: 'password123',
          confirmPassword: 'password123',
        });
        component.confirmPassword?.markAsTouched();

        expect(component.confirmPassword?.valid).toBeTrue();
      });
    });

    it('should mark form as invalid when any field is invalid', () => {
      component.registerForm.patchValue({
        firstName: 'J',
        lastName: 'D',
        email: 'invalid-email',
        password: '123',
        confirmPassword: '456',
      });

      expect(component.registerForm.invalid).toBeTrue();
    });

    it('should mark form as valid when all fields are valid and passwords match', () => {
      component.registerForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });

      expect(component.registerForm.valid).toBeTrue();
    });
  });

  describe('Password Match Validator', () => {
    it('should return passwordMismatch error when passwords do not match', () => {
      const form = component.registerForm;
      form.patchValue({
        password: 'password123',
        confirmPassword: 'different',
      });

      const result = component['passwordMatchValidator'](form);

      expect(result).toEqual({ passwordMismatch: true });
      expect(component.confirmPassword?.errors?.['passwordMismatch']).toBeTruthy();
    });

    it('should return null when passwords match', () => {
      const form = component.registerForm;
      form.patchValue({
        password: 'password123',
        confirmPassword: 'password123',
      });

      const result = component['passwordMatchValidator'](form);

      expect(result).toBeNull();
      expect(component.confirmPassword?.errors).toBeNull();
    });

    it('should handle null controls gracefully', () => {
      const mockControl = {
        get: (_name: string) => null,
      } as AbstractControl;

      const result = component['passwordMatchValidator'](mockControl);

      expect(result).toBeNull();
    });
  });

  describe('Form Submission', () => {
    const validFormData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    };

    beforeEach(() => {
      component.registerForm.patchValue(validFormData);
    });

    it('should handle registration error with server message', () => {
      const errorResponse = { error: { message: 'Email already exists' } };
      authService.register.and.returnValue(throwError(() => errorResponse));

      component.onSubmit();

      expect(component.errorMessage).toBe('Email already exists');
      expect(component.isLoading).toBeFalse();
    });

    it('should handle registration error with fallback message', () => {
      const errorResponse = new Error('Network error');
      authService.register.and.returnValue(throwError(() => errorResponse));

      component.onSubmit();

      expect(component.errorMessage).toBe('Network error');
      expect(component.isLoading).toBeFalse();
    });

    it('should handle registration error with default message', () => {
      const errorResponse = {};
      authService.register.and.returnValue(throwError(() => errorResponse));

      component.onSubmit();

      expect(component.errorMessage).toBe('Registration failed. Please try again.');
      expect(component.isLoading).toBeFalse();
    });

    it('should not submit when form is invalid', () => {
      component.registerForm.patchValue({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
      });

      component.onSubmit();

      expect(authService.register).not.toHaveBeenCalled();
    });
  });

  describe('Template Integration', () => {
    it('should disable submit button when form is invalid', () => {
      component.registerForm.patchValue({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
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
      expect(submitButton.textContent).toContain('Creating Account...');
    });

    it('should show error message when errorMessage is set', () => {
      component.errorMessage = 'Test error message';
      fixture.detectChanges();

      const errorElement = fixture.nativeElement.querySelector('.alert-error');
      expect(errorElement).toBeTruthy();
      expect(errorElement.textContent).toContain('Test error message');
    });

    it('should show password mismatch error', () => {
      component.registerForm.patchValue({
        password: 'password123',
        confirmPassword: 'different',
      });
      component.confirmPassword?.markAsTouched();
      fixture.detectChanges();

      const errorElements = fixture.nativeElement.querySelectorAll('.error-message');
      expect(errorElements.length).toBeGreaterThan(0);
    });
  });
});
