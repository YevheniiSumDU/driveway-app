import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ItemCard } from './item-card';
import { AuthService } from '../../services/auth/auth.service';
import { Car } from '../../models/car.model';

// Mock components for router
@Component({ template: '' })
class MockItemDetailsComponent {}

@Component({ template: '' })
class MockItemFormComponent {}

describe('ItemCard', () => {
  let component: ItemCard;
  let fixture: ComponentFixture<ItemCard>;
  let authService: jasmine.SpyObj<AuthService>;
  let isAuthenticatedSubject: BehaviorSubject<boolean>;

  const mockCar: Car = {
    id: 1,
    brand: 'Toyota',
    model: 'Camry',
    year: 2023,
    color: 'Red',
    price: 35000,
    description: 'A reliable sedan with great fuel efficiency',
    imageUrl: 'assets/images/toyota-corolla-1.png',
  };

  const mockPremiumCar: Car = {
    id: 2,
    brand: 'Mercedes',
    model: 'S-Class',
    year: 2023,
    color: 'Black',
    price: 120000,
    description: 'Luxury sedan with premium features',
    imageUrl: '',
  };

  beforeEach(async () => {
    isAuthenticatedSubject = new BehaviorSubject<boolean>(true);

    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      isAuthenticated$: isAuthenticatedSubject.asObservable(),
    });

    await TestBed.configureTestingModule({
      imports: [ItemCard],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        provideRouter([
          { path: 'items/:id', component: MockItemDetailsComponent },
          { path: 'items/:id/edit', component: MockItemFormComponent },
        ]),
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemCard);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Data Display', () => {
    it('should display car brand and model correctly', () => {
      component.car = mockCar;
      fixture.detectChanges();

      const titleElement = fixture.debugElement.query(By.css('h2'));
      expect(titleElement.nativeElement.textContent).toContain('Toyota Camry');
    });

    it('should display car year, color and price correctly', () => {
      component.car = mockCar;
      fixture.detectChanges();

      const yearElement = fixture.debugElement.query(By.css('p:nth-of-type(1)'));
      const colorElement = fixture.debugElement.query(By.css('p:nth-of-type(2)'));
      const priceElement = fixture.debugElement.query(By.css('p:nth-of-type(3)'));

      expect(yearElement.nativeElement.textContent).toContain('Year:');
      expect(colorElement.nativeElement.textContent).toContain('Color: Red');
      expect(priceElement.nativeElement.textContent).toContain('Price:');
    });

    it('should display description when available', () => {
      component.car = mockCar;
      fixture.detectChanges();

      const descriptionElement = fixture.debugElement.query(By.css('.description-preview'));
      expect(descriptionElement).toBeTruthy();
      expect(descriptionElement.nativeElement.textContent).toContain('A reliable sedan');
    });

    it('should not display description when not available', () => {
      const carWithoutDescription = { ...mockCar, description: '' };
      component.car = carWithoutDescription;
      fixture.detectChanges();

      const descriptionElement = fixture.debugElement.query(By.css('.description-preview'));
      expect(descriptionElement).toBeFalsy();
    });
  });

  describe('Image Handling', () => {
    it('should display car image when imageUrl is provided', () => {
      component.car = mockCar;
      fixture.detectChanges();

      const imgElement = fixture.debugElement.query(By.css('img'));

      expect(imgElement.nativeElement.src).toContain('assets/images/toyota-corolla-1.png');
      expect(imgElement.nativeElement.alt).toBe('Toyota Camry');
    });

    it('should display default image when imageUrl is not provided', () => {
      component.car = mockPremiumCar;
      fixture.detectChanges();

      const imgElement = fixture.debugElement.query(By.css('img'));
      expect(imgElement.nativeElement.src).toContain('assets/images/no-car-image.png');
      expect(imgElement.nativeElement.alt).toBe('No image');
    });
  });

  describe('Premium Styling', () => {
    it('should add premium class when price is over 50000', () => {
      component.car = mockPremiumCar;
      fixture.detectChanges();

      const cardElement = fixture.debugElement.query(By.css('.item-card'));
      expect(cardElement.nativeElement.classList).toContain('premium');
    });

    it('should not add premium class when price is 50000 or less', () => {
      component.car = mockCar;
      fixture.detectChanges();

      const cardElement = fixture.debugElement.query(By.css('.item-card'));
      expect(cardElement.nativeElement.classList).not.toContain('premium');
    });
  });

  describe('NEW Badge', () => {
    it('should display NEW badge when car year is 2022 or newer', () => {
      component.car = mockCar;
      fixture.detectChanges();

      const badgeElement = fixture.debugElement.query(By.css('.new-badge'));
      expect(badgeElement).toBeTruthy();
      expect(badgeElement.nativeElement.textContent).toBe('NEW');
    });

    it('should not display NEW badge when car year is older than 2022', () => {
      const oldCar = { ...mockCar, year: 2021 };
      component.car = oldCar;
      fixture.detectChanges();

      const badgeElement = fixture.debugElement.query(By.css('.new-badge'));
      expect(badgeElement).toBeFalsy();
    });
  });

  describe('Authentication', () => {
    it('should show edit button when user is logged in', () => {
      isAuthenticatedSubject.next(true);
      component.car = mockCar;
      fixture.detectChanges();

      const editButton = fixture.debugElement.query(By.css('.btn-edit'));
      expect(editButton).toBeTruthy();
      expect(editButton.nativeElement.textContent).toContain('Edit');
    });

    it('should not show edit button when user is not logged in', () => {
      isAuthenticatedSubject.next(false);
      component.car = mockCar;
      fixture.detectChanges();

      const editButton = fixture.debugElement.query(By.css('.btn-edit'));
      expect(editButton).toBeFalsy();
    });
  });

  describe('Navigation', () => {
    it('should have view details link with correct route', () => {
      component.car = mockCar;
      fixture.detectChanges();

      const detailsLink = fixture.debugElement.query(By.css('.btn-details'));
      expect(detailsLink).toBeTruthy();

      const href = detailsLink.nativeElement.getAttribute('href');
      expect(href).toBe('/items/1');
    });

    it('should have edit link with correct route when logged in', () => {
      isAuthenticatedSubject.next(true);
      component.car = mockCar;
      fixture.detectChanges();

      const editLink = fixture.debugElement.query(By.css('.btn-edit'));
      expect(editLink).toBeTruthy();

      const href = editLink.nativeElement.getAttribute('href');
      expect(href).toBe('/items/1/edit');
    });
  });

  describe('Event Emission', () => {
    it('should emit selectCar event when onSelect is called', () => {
      component.car = mockCar;
      fixture.detectChanges();

      spyOn(component.selectCar, 'emit');

      component.onSelect();

      expect(component.selectCar.emit).toHaveBeenCalledWith(mockCar);
    });
  });

  describe('Directives', () => {
    it('should have HoverEffectDirective applied', () => {
      component.car = mockCar;
      fixture.detectChanges();

      const cardElement = fixture.debugElement.query(By.css('.item-card'));
      expect(cardElement.attributes['appHoverEffect']).toBeDefined();
    });
  });
});
