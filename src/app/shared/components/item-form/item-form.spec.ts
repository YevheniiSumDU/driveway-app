import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormArray } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ItemForm } from './item-form';
import { DataService } from '../../services/data/data.service';
import { AuthService } from '../../services/auth/auth.service';
import { Car } from '../../models/car.model';

describe('ItemForm', () => {
  let component: ItemForm;
  let fixture: ComponentFixture<ItemForm>;
  let dataService: jasmine.SpyObj<DataService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: any;

  const mockCar: Car = {
    id: 1,
    brand: 'Toyota',
    model: 'Corolla',
    year: 2023,
    color: 'White',
    price: 25000,
    imageUrl: 'assets/images/toyota-corolla-1.png',
    gallery: ['assets/images/toyota-corolla-1.png', 'assets/images/toyota-corolla-2.png'],
    mileage: 15000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    engine: '1.8L 4-cylinder',
    description: 'A reliable family car',
    features: ['Sunroof', 'Navigation', 'Leather Seats'],
    bodyType: 'Sedan',
    doors: 4,
    seats: 5,
    drivetrain: 'FWD',
    colorOptions: ['White', 'Black', 'Silver'],
    fuelConsumption: 6.5,
    co2Emission: 150,
    warranty: '3 years / 60,000 km',
    isNew: true,
    horsepower: 150,
    acceleration: 8.5,
  };

  beforeEach(async () => {
    const dataServiceSpy = jasmine.createSpyObj('DataService', [
      'addCar',
      'updateCar',
      'getCarById',
    ]);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      isAuthenticated$: of(true),
    });

    await TestBed.configureTestingModule({
      imports: [ItemForm, ReactiveFormsModule],
      providers: [
        { provide: DataService, useValue: dataServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ActivatedRoute, useValue: { params: of({}) } },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemForm);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(ActivatedRoute);
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form in create mode by default', () => {
      expect(component.isEditMode).toBeFalse();
      expect(component.carId).toBeNull();
    });

    it('should initialize with current year', () => {
      expect(component.currentYear).toBe(new Date().getFullYear());
    });
  });

  describe('Form Initialization', () => {
    it('should create form with all controls', () => {
      expect(component.carForm).toBeTruthy();
      expect(component.carForm.contains('brand')).toBeTrue();
      expect(component.carForm.contains('model')).toBeTrue();
      expect(component.carForm.contains('year')).toBeTrue();
      expect(component.carForm.contains('price')).toBeTrue();
      expect(component.carForm.contains('features')).toBeTrue();
      expect(component.carForm.contains('colorOptions')).toBeTrue();
      expect(component.carForm.contains('gallery')).toBeTrue();
    });

    it('should initialize form arrays as empty', () => {
      expect(component.features.length).toBe(0);
      expect(component.colorOptions.length).toBe(0);
      expect(component.gallery.length).toBe(0);
    });

    it('should set year to current year by default', () => {
      expect(component.carForm.get('year')?.value).toBe(component.currentYear);
    });

    it('should set isNew to false by default', () => {
      expect(component.carForm.get('isNew')?.value).toBeFalse();
    });
  });

  describe('Form Validation', () => {
    it('should mark required fields as invalid when empty', () => {
      const requiredFields = ['brand', 'model', 'year', 'color', 'price'];

      requiredFields.forEach((field) => {
        const control = component.carForm.get(field);
        control?.setValue('');
        expect(control?.valid).toBeFalse();
        expect(control?.errors?.['required']).toBeTruthy();
      });
    });

    it('should validate year range', () => {
      const yearControl = component.carForm.get('year');

      yearControl?.setValue(1989);
      expect(yearControl?.errors?.['min']).toBeTruthy();

      yearControl?.setValue(component.currentYear + 2);
      expect(yearControl?.errors?.['max']).toBeTruthy();

      yearControl?.setValue(2023);
      expect(yearControl?.valid).toBeTrue();
    });

    it('should validate price range', () => {
      const priceControl = component.carForm.get('price');

      priceControl?.setValue(-1);
      expect(priceControl?.errors?.['min']).toBeTruthy();

      priceControl?.setValue(10000001);
      expect(priceControl?.errors?.['max']).toBeTruthy();

      priceControl?.setValue(25000);
      expect(priceControl?.valid).toBeTrue();
    });

    it('should validate image URL pattern', () => {
      const imageUrlControl = component.carForm.get('imageUrl');

      imageUrlControl?.setValue('invalid-url');
      expect(imageUrlControl?.errors?.['pattern']).toBeTruthy();

      imageUrlControl?.setValue('assets/images/toyota-corolla-1.png');
      expect(imageUrlControl?.valid).toBeTrue();

      imageUrlControl?.setValue('assets/images/car.png');
      expect(imageUrlControl?.valid).toBeTrue();
    });
  });

  describe('Form Array Operations', () => {
    it('should add feature to features array', () => {
      component.addFeature('Test Feature');
      expect(component.features.length).toBe(1);
      expect(component.features.at(0).value).toBe('Test Feature');
    });

    it('should remove feature from features array', () => {
      component.addFeature('Feature 1');
      component.addFeature('Feature 2');
      expect(component.features.length).toBe(2);

      component.removeFeature(0);
      expect(component.features.length).toBe(1);
      expect(component.features.at(0).value).toBe('Feature 2');
    });

    it('should add color option to colorOptions array', () => {
      component.addColorOption('Red');
      expect(component.colorOptions.length).toBe(1);
      expect(component.colorOptions.at(0).value).toBe('Red');
    });

    it('should add gallery image to gallery array', () => {
      component.addGalleryImage('assets/images/toyota-corolla-1.png');
      expect(component.gallery.length).toBe(1);
      expect(component.gallery.at(0).value).toBe('assets/images/toyota-corolla-1.png');
    });

    it('should validate gallery image URL pattern', () => {
      component.addGalleryImage('invalid-url');
      expect(component.gallery.at(0).errors?.['pattern']).toBeTruthy();
    });
  });

  describe('Edit Mode', () => {
    beforeEach(() => {
      const activatedRoute = TestBed.inject(ActivatedRoute);
      (activatedRoute.params as any) = of({ id: '1' });
      dataService.getCarById.and.returnValue(of(mockCar));

      fixture = TestBed.createComponent(ItemForm);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should set edit mode when ID parameter is present', () => {
      expect(component.isEditMode).toBeTrue();
      expect(component.carId).toBe(1);
    });

    it('should load car data when in edit mode', () => {
      expect(dataService.getCarById).toHaveBeenCalledWith(1);
    });

    it('should populate form with car data', () => {
      expect(component.carForm.get('brand')?.value).toBe(mockCar.brand);
      expect(component.carForm.get('model')?.value).toBe(mockCar.model);
      expect(component.carForm.get('year')?.value).toBe(mockCar.year);
      expect(component.carForm.get('price')?.value).toBe(mockCar.price);
    });

    it('should populate form arrays with car data', () => {
      expect(component.features.length).toBe(mockCar.features!.length);
      expect(component.colorOptions.length).toBe(mockCar.colorOptions!.length);
      expect(component.gallery.length).toBe(mockCar.gallery!.length);
    });

    it('should mark form as pristine after loading data', () => {
      expect(component.carForm.pristine).toBeTrue();
      expect(component.carForm.untouched).toBeTrue();
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      component.carForm.patchValue({
        brand: 'Toyota',
        model: 'Corolla',
        year: 2023,
        color: 'White',
        price: 25000,
      });
    });

    it('should call addCar when in create mode', () => {
      dataService.addCar.and.returnValue(of(mockCar));
      const navigateSpy = spyOn(component['router'], 'navigate');

      component.onSubmit();

      expect(dataService.addCar).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['/items']);
    });

    it('should call updateCar when in edit mode', () => {
      component.isEditMode = true;
      component.carId = 1;
      dataService.updateCar.and.returnValue(of(mockCar));
      const navigateSpy = spyOn(component['router'], 'navigate');

      component.onSubmit();

      expect(dataService.updateCar).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['/items']);
    });

    it('should handle addCar error', () => {
      dataService.addCar.and.returnValue(throwError(() => new Error('API Error')));
      const alertSpy = spyOn(window, 'alert');

      component.onSubmit();

      expect(alertSpy).toHaveBeenCalledWith('Error adding car. Please try again.');
    });

    it('should handle updateCar error', () => {
      component.isEditMode = true;
      component.carId = 1;
      dataService.updateCar.and.returnValue(throwError(() => new Error('API Error')));
      const alertSpy = spyOn(window, 'alert');

      component.onSubmit();

      expect(alertSpy).toHaveBeenCalledWith('Error updating car. Please try again.');
    });

    it('should not submit invalid form', () => {
      component.carForm.patchValue({ brand: '' });
      const alertSpy = spyOn(window, 'alert');

      component.onSubmit();

      expect(dataService.addCar).not.toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('Please fix the form errors before submitting.');
    });

    it('should mark all fields as touched when submitting invalid form', () => {
      component.carForm.patchValue({ brand: '' });
      const markFormGroupTouchedSpy = spyOn(component, 'markFormGroupTouched');

      component.onSubmit();

      expect(markFormGroupTouchedSpy).toHaveBeenCalledWith(component.carForm);
    });
  });

  describe('Utility Methods', () => {
    it('should check if field is invalid', () => {
      const brandControl = component.carForm.get('brand');
      brandControl?.setValue('');
      brandControl?.markAsTouched();

      expect(component.isFieldInvalid('brand')).toBeTrue();
    });

    it('should get field error message', () => {
      const brandControl = component.carForm.get('brand');
      brandControl?.setValue('');
      brandControl?.markAsTouched();

      expect(component.getFieldError('brand')).toBe('This field is required');
    });

    it('should get array item error message', () => {
      component.addFeature('a'.repeat(101));
      const featureControl = component.features.at(0);
      featureControl.markAsTouched();

      expect(component.getArrayItemError('features', 0)).toContain('Maximum length is');
    });

    it('should mark form group as touched', () => {
      const formGroup = component.carForm;
      component.markFormGroupTouched(formGroup);

      expect(formGroup.touched).toBeTrue();
      Object.keys(formGroup.controls).forEach((key) => {
        const control = formGroup.get(key);
        if (control instanceof FormArray) {
          control.controls.forEach((arrayControl) => {
            expect(arrayControl.touched).toBeTrue();
          });
        } else {
          expect(control?.touched).toBeTrue();
        }
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to items on cancel', () => {
      const navigateSpy = spyOn(component['router'], 'navigate');

      component.onCancel();

      expect(navigateSpy).toHaveBeenCalledWith(['/items']);
    });
  });

  describe('Dropdown Options', () => {
    it('should have predefined brands', () => {
      expect(component.brands.length).toBeGreaterThan(0);
      expect(component.brands).toContain('Toyota');
      expect(component.brands).toContain('BMW');
    });

    it('should have predefined fuel types', () => {
      expect(component.fuelTypes).toContain('Petrol');
      expect(component.fuelTypes).toContain('Electric');
    });

    it('should have predefined colors', () => {
      expect(component.colors.length).toBeGreaterThan(0);
      expect(component.colors).toContain('White');
      expect(component.colors).toContain('Black');
    });
  });
});
