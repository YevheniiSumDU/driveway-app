import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { of, BehaviorSubject } from 'rxjs';
import { ItemsList } from './items-list';
import { ItemCard } from '../item-card/item-card';
import { Car } from '../../models/car.model';
import { DataService } from '../../services/data/data.service';
import { AuthService } from '../../services/auth/auth.service';

describe('ItemsList and ItemCard Integration', () => {
  let itemsListFixture: ComponentFixture<ItemsList>;
  let itemsListComponent: ItemsList;
  let dataService: jasmine.SpyObj<DataService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  const mockCars: Car[] = [
    {
      id: 1,
      brand: 'Toyota',
      model: 'Camry',
      year: 2023,
      color: 'Red',
      price: 35000,
      imageUrl: 'assets/images/toyota-camry.jpg',
      description: 'A reliable sedan with great fuel efficiency',
      mileage: 15000,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      features: ['Sunroof', 'Navigation', 'Leather Seats'],
      isNew: true,
    },
    {
      id: 2,
      brand: 'Honda',
      model: 'Civic',
      year: 2022,
      color: 'Blue',
      price: 28000,
      imageUrl: 'assets/images/honda-civic.jpg',
      description: 'Sporty compact car with excellent handling',
      mileage: 25000,
      fuelType: 'Petrol',
      transmission: 'Manual',
      features: ['Apple CarPlay', 'Backup Camera'],
      isNew: false,
    },
    {
      id: 3,
      brand: 'Tesla',
      model: 'Model 3',
      year: 2024,
      color: 'White',
      price: 45000,
      imageUrl: 'assets/images/tesla-model3.jpg',
      description: 'Electric vehicle with autopilot',
      mileage: 5000,
      fuelType: 'Electric',
      transmission: 'Automatic',
      features: ['Autopilot', 'Premium Sound System', 'Glass Roof'],
      isNew: true,
    },
  ];

  let carsSubject: BehaviorSubject<Car[]>;

  beforeEach(async () => {
    const dataServiceSpy = jasmine.createSpyObj('DataService', [
      'getItems',
      'filterItems',
      'getItemsStream',
      'getCarById',
      'addCar',
      'updateCar',
      'deleteCar',
    ]);

    const authServiceSpy = jasmine.createSpyObj(
      'AuthService',
      ['login', 'register', 'logout', 'getToken'],
      {
        isAuthenticated$: of(true),
      }
    );

    carsSubject = new BehaviorSubject<Car[]>(mockCars);

    dataServiceSpy.getItems.and.returnValue(of(mockCars));
    dataServiceSpy.filterItems.and.callFake((query: string) => {
      const filteredCars = mockCars.filter(
        (car) =>
          car.brand.toLowerCase().includes(query.toLowerCase()) ||
          car.model.toLowerCase().includes(query.toLowerCase())
      );
      carsSubject.next(filteredCars);
      return of(filteredCars);
    });
    dataServiceSpy.getItemsStream.and.returnValue(carsSubject.asObservable());
    dataServiceSpy.getCarById.and.callFake((id: number) =>
      of(mockCars.find((car) => car.id === id))
    );

    await TestBed.configureTestingModule({
      imports: [ItemsList, ItemCard],
      providers: [
        { provide: DataService, useValue: dataServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    itemsListFixture = TestBed.createComponent(ItemsList);
    itemsListComponent = itemsListFixture.componentInstance;
    dataService = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);

    itemsListFixture.detectChanges();
  });

  describe('Component Rendering Integration', () => {
    it('should render correct number of ItemCard components', () => {
      const itemCards = itemsListFixture.debugElement.queryAll(By.directive(ItemCard));
      expect(itemCards.length).toBe(mockCars.length);
    });

    it('should pass correct car data to each ItemCard', () => {
      const itemCards = itemsListFixture.debugElement.queryAll(By.directive(ItemCard));

      itemCards.forEach((cardDebugElement, index) => {
        const itemCardComponent = cardDebugElement.componentInstance as ItemCard;
        expect(itemCardComponent.car).toEqual(mockCars[index]);
      });
    });

    it('should update ItemCard components when data changes', () => {
      const newCar: Car = {
        id: 4,
        brand: 'Ford',
        model: 'Mustang',
        year: 2023,
        color: 'Yellow',
        price: 55000,
        isNew: true,
      };

      const updatedCars = [...mockCars, newCar];
      carsSubject.next(updatedCars);
      itemsListFixture.detectChanges();

      const itemCards = itemsListFixture.debugElement.queryAll(By.directive(ItemCard));
      expect(itemCards.length).toBe(updatedCars.length);

      const lastCard = itemCards[itemCards.length - 1].componentInstance as ItemCard;
      expect(lastCard.car).toEqual(newCar);
    });
  });

  describe('Search Filter Integration', () => {
    it('should filter ItemCard components based on search query', () => {
      // Initial state - all cards should be visible
      let itemCards = itemsListFixture.debugElement.queryAll(By.directive(ItemCard));
      expect(itemCards.length).toBe(3);

      // Search for 'Toyota'
      itemsListComponent.searchQuery = 'Toyota';
      itemsListComponent.onSearchChange();
      itemsListFixture.detectChanges();

      itemCards = itemsListFixture.debugElement.queryAll(By.directive(ItemCard));
      expect(itemCards.length).toBe(1);
      expect(itemCards[0].componentInstance.car.brand).toBe('Toyota');

      // Search for 'Honda'
      itemsListComponent.searchQuery = 'Honda';
      itemsListComponent.onSearchChange();
      itemsListFixture.detectChanges();

      itemCards = itemsListFixture.debugElement.queryAll(By.directive(ItemCard));
      expect(itemCards.length).toBe(1);
      expect(itemCards[0].componentInstance.car.brand).toBe('Honda');

      // Search for non-existent brand
      itemsListComponent.searchQuery = 'BMW';
      itemsListComponent.onSearchChange();
      itemsListFixture.detectChanges();

      itemCards = itemsListFixture.debugElement.queryAll(By.directive(ItemCard));
      expect(itemCards.length).toBe(0);
    });

    it('should show no results message when search returns empty', () => {
      itemsListComponent.searchQuery = 'NonexistentBrand';
      itemsListComponent.onSearchChange();
      itemsListFixture.detectChanges();

      const noResultsElement = itemsListFixture.nativeElement.querySelector('.no-results-wrapper');
      expect(noResultsElement).toBeTruthy();
      expect(noResultsElement.textContent).toContain('No cars found');
    });

    it('should restore all ItemCard components when search is cleared', () => {
      // First filter
      itemsListComponent.searchQuery = 'Toyota';
      itemsListComponent.onSearchChange();
      itemsListFixture.detectChanges();

      let itemCards = itemsListFixture.debugElement.queryAll(By.directive(ItemCard));
      expect(itemCards.length).toBe(1);

      // Clear search
      itemsListComponent.searchQuery = '';
      itemsListComponent.onSearchChange();
      itemsListFixture.detectChanges();

      itemCards = itemsListFixture.debugElement.queryAll(By.directive(ItemCard));
      expect(itemCards.length).toBe(3);
    });
  });

  describe('Template Integration and Data Flow', () => {
    it('should handle empty car list state', () => {
      carsSubject.next([]);
      itemsListFixture.detectChanges();

      const itemCards = itemsListFixture.debugElement.queryAll(By.directive(ItemCard));
      expect(itemCards.length).toBe(0);

      const noResultsElement = itemsListFixture.nativeElement.querySelector('.no-results-wrapper');
      expect(noResultsElement).toBeTruthy();
    });

    it('should maintain component hierarchy and structure', () => {
      const itemsListElement = itemsListFixture.nativeElement.querySelector('.items-list-wrapper');
      expect(itemsListElement).toBeTruthy();

      const itemsListContainer = itemsListFixture.nativeElement.querySelector('.items-list');
      expect(itemsListContainer).toBeTruthy();

      const itemCards = itemsListContainer.querySelectorAll('app-item-card');
      expect(itemCards.length).toBe(mockCars.length);
    });
  });

  describe('Authentication Integration', () => {
    it('should show add car button when user is authenticated', () => {
      const addButton = itemsListFixture.nativeElement.querySelector('.btn-add-car');
      expect(addButton).toBeTruthy();
      expect(addButton.textContent).toContain('Add New Car');
    });

    it('should hide add car button when user is not authenticated', async () => {
      // Reconfigure with unauthenticated user
      TestBed.resetTestingModule();

      const dataServiceSpy = jasmine.createSpyObj('DataService', [
        'getItems',
        'filterItems',
        'getItemsStream',
      ]);
      const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
        isAuthenticated$: of(false),
      });

      dataServiceSpy.getItems.and.returnValue(of(mockCars));
      dataServiceSpy.filterItems.and.returnValue(of(mockCars));
      dataServiceSpy.getItemsStream.and.returnValue(carsSubject.asObservable());

      await TestBed.configureTestingModule({
        imports: [ItemsList, ItemCard],
        providers: [
          { provide: DataService, useValue: dataServiceSpy },
          { provide: AuthService, useValue: authServiceSpy },
          provideRouter([]),
          provideHttpClient(),
          provideHttpClientTesting(),
        ],
      }).compileComponents();

      itemsListFixture = TestBed.createComponent(ItemsList);
      itemsListComponent = itemsListFixture.componentInstance;
      itemsListFixture.detectChanges();

      const addButton = itemsListFixture.nativeElement.querySelector('.btn-add-car');
      expect(addButton).toBeFalsy();
    });
  });

  describe('Error Handling Integration', () => {
    it('should display error state and allow retry', () => {
      const errorMessage = 'Failed to load cars';
      itemsListComponent.error = errorMessage;
      itemsListComponent.isLoading = false;
      itemsListFixture.detectChanges();

      const errorElement = itemsListFixture.nativeElement.querySelector('.error-wrapper');
      expect(errorElement).toBeTruthy();
      expect(errorElement.textContent).toContain(errorMessage);

      const retryButton = itemsListFixture.nativeElement.querySelector('.retry-button');
      expect(retryButton).toBeTruthy();

      // Test retry functionality
      const retrySpy = spyOn(itemsListComponent, 'retryLoading');
      retryButton.click();
      expect(retrySpy).toHaveBeenCalled();
    });

    it('should not display ItemCards when in error state', () => {
      itemsListComponent.error = 'Test error';
      itemsListComponent.isLoading = false;
      itemsListFixture.detectChanges();

      const itemCards = itemsListFixture.debugElement.queryAll(By.directive(ItemCard));
      expect(itemCards.length).toBe(0);

      const errorElement = itemsListFixture.nativeElement.querySelector('.error-wrapper');
      expect(errorElement).toBeTruthy();
    });
  });

  describe('Loading State Integration', () => {
    it('should show loading state without ItemCards during initial load', () => {
      itemsListComponent.isLoading = true;
      itemsListFixture.detectChanges();

      const loadingElement = itemsListFixture.nativeElement.querySelector('.loading-wrapper');
      expect(loadingElement).toBeTruthy();

      const itemCards = itemsListFixture.debugElement.queryAll(By.directive(ItemCard));
      expect(itemCards.length).toBe(0);
    });

    it('should hide loading state and show ItemCards when data is loaded', () => {
      itemsListComponent.isLoading = false;
      itemsListFixture.detectChanges();

      const loadingElement = itemsListFixture.nativeElement.querySelector('.loading-wrapper');
      expect(loadingElement).toBeFalsy();

      const itemCards = itemsListFixture.debugElement.queryAll(By.directive(ItemCard));
      expect(itemCards.length).toBeGreaterThan(0);
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large number of ItemCard components efficiently', () => {
      const largeCarList = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        brand: `Brand${i}`,
        model: `Model${i}`,
        year: 2020 + (i % 5),
        color: 'Red',
        price: 20000 + i * 1000,
        isNew: i % 2 === 0,
      }));

      carsSubject.next(largeCarList);
      itemsListFixture.detectChanges();

      const itemCards = itemsListFixture.debugElement.queryAll(By.directive(ItemCard));
      expect(itemCards.length).toBe(50);
    });

    it('should handle cars with missing optional properties', () => {
      const carsWithMissingData: Car[] = [
        {
          id: 1,
          brand: 'TestBrand',
          model: 'TestModel',
          year: 2023,
          color: 'Black',
          price: 30000,
          // Missing optional properties
        },
      ];

      carsSubject.next(carsWithMissingData);
      itemsListFixture.detectChanges();

      const itemCards = itemsListFixture.debugElement.queryAll(By.directive(ItemCard));
      expect(itemCards.length).toBe(1);

      const itemCardComponent = itemCards[0].componentInstance as ItemCard;
      expect(itemCardComponent.car.description).toBeUndefined();
      expect(itemCardComponent.car.imageUrl).toBeUndefined();
    });

    it('should maintain data consistency after multiple operations', () => {
      // Initial state
      let itemCards = itemsListFixture.debugElement.queryAll(By.directive(ItemCard));
      expect(itemCards.length).toBe(3);

      // Filter
      itemsListComponent.searchQuery = 't'; // Should match Toyota and Tesla
      itemsListComponent.onSearchChange();
      itemsListFixture.detectChanges();

      itemCards = itemsListFixture.debugElement.queryAll(By.directive(ItemCard));
      expect(itemCards.length).toBe(2);

      // Clear filter
      itemsListComponent.searchQuery = '';
      itemsListComponent.onSearchChange();
      itemsListFixture.detectChanges();

      itemCards = itemsListFixture.debugElement.queryAll(By.directive(ItemCard));
      expect(itemCards.length).toBe(3);

      // Verify data integrity
      itemCards.forEach((cardDebugElement, index) => {
        const itemCardComponent = cardDebugElement.componentInstance as ItemCard;
        expect(itemCardComponent.car).toEqual(mockCars[index]);
      });
    });
  });

  describe('Event Propagation', () => {
    it('should handle search input changes and propagate to ItemCards', () => {
      const searchInput = itemsListFixture.nativeElement.querySelector('#search');
      expect(searchInput).toBeTruthy();

      // Simulate user input
      searchInput.value = 'Tesla';
      searchInput.dispatchEvent(new Event('input'));
      itemsListFixture.detectChanges();

      expect(itemsListComponent.searchQuery).toBe('Tesla');
      expect(dataService.filterItems).toHaveBeenCalledWith('Tesla');

      const itemCards = itemsListFixture.debugElement.queryAll(By.directive(ItemCard));
      expect(itemCards.length).toBe(1);
      expect(itemCards[0].componentInstance.car.brand).toBe('Tesla');
    });
  });
});
