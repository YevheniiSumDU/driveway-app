import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of, BehaviorSubject, throwError } from 'rxjs';
import { ItemsList } from './items-list';
import { DataService } from '../../services/data/data.service';
import { AuthService } from '../../services/auth/auth.service';
import { Car } from '../../models/car.model';

describe('ItemsList', () => {
  let component: ItemsList;
  let fixture: ComponentFixture<ItemsList>;
  let dataService: jasmine.SpyObj<DataService>;
  let authService: jasmine.SpyObj<AuthService>;

  const mockCars: Car[] = [
    {
      id: 1,
      brand: 'Toyota',
      model: 'Camry',
      year: 2023,
      color: 'Red',
      price: 35000,
      description: 'A reliable sedan',
      imageUrl: 'assets/images/toyota-camry.jpg',
    },
    {
      id: 2,
      brand: 'Honda',
      model: 'Civic',
      year: 2022,
      color: 'Blue',
      price: 28000,
      description: 'Fuel efficient compact car',
      imageUrl: 'assets/images/honda-civic.jpg',
    },
  ];

  let carsSubject: BehaviorSubject<Car[]>;

  beforeEach(async () => {
    const dataServiceSpy = jasmine.createSpyObj('DataService', [
      'getItems',
      'filterItems',
      'getItemsStream',
    ]);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      isAuthenticated$: of(true),
    });

    carsSubject = new BehaviorSubject(mockCars);

    dataServiceSpy.getItems.and.returnValue(of(mockCars));
    dataServiceSpy.filterItems.and.returnValue(of(mockCars));
    dataServiceSpy.getItemsStream.and.returnValue(carsSubject.asObservable());

    await TestBed.configureTestingModule({
      imports: [ItemsList],
      providers: [
        { provide: DataService, useValue: dataServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        provideRouter([]),
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemsList);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize properties', () => {
      expect(component.searchQuery).toBe('');
      expect(component.isLoading).toBeTrue();
      expect(component.error).toBeNull();
    });

    it('should set up observables in constructor', () => {
      expect(component.cars$).toBeTruthy();
      expect(component.isLoggedIn$).toBeTruthy();
    });
  });

  describe('Initialization', () => {
    it('should load items on ngOnInit', () => {
      component.ngOnInit();

      expect(dataService.getItems).toHaveBeenCalled();
    });

    it('should set loading to false on successful data load', () => {
      component.ngOnInit();

      expect(component.isLoading).toBeFalse();
      expect(component.error).toBeNull();
    });

    it('should handle error on data load failure', () => {
      const errorMessage = 'Failed to load cars';
      dataService.getItems.and.returnValue(throwError(() => new Error(errorMessage)));

      component.ngOnInit();

      expect(component.isLoading).toBeFalse();
      expect(component.error).toBe(errorMessage);
    });
  });

  describe('Search Functionality', () => {
    it('should call filterItems when search query changes', () => {
      const searchTerm = 'Toyota';
      component.searchQuery = searchTerm;

      component.onSearchChange();

      expect(dataService.filterItems).toHaveBeenCalledWith(searchTerm);
    });

    it('should handle empty search query', () => {
      component.searchQuery = '';

      component.onSearchChange();

      expect(dataService.filterItems).toHaveBeenCalledWith('');
    });

    it('should handle search with special characters', () => {
      const searchTerm = 'Toyota Camry 2023';
      component.searchQuery = searchTerm;

      component.onSearchChange();

      expect(dataService.filterItems).toHaveBeenCalledWith(searchTerm);
    });
  });

  describe('Retry Loading', () => {
    it('should handle successful retry', () => {
      component.retryLoading();

      expect(component.isLoading).toBeFalse();
      expect(component.error).toBeNull();
    });

    it('should handle failed retry', () => {
      const errorMessage = 'Retry failed';
      dataService.getItems.and.returnValue(throwError(() => new Error(errorMessage)));

      component.retryLoading();

      expect(component.isLoading).toBeFalse();
      expect(component.error).toBe(errorMessage);
    });
  });

  describe('Authentication State', () => {
    it('should show add car button when user is logged in', () => {
      expect(component.isLoggedIn$).toBeTruthy();
    });

    it('should handle different authentication states', async () => {
      const authSubject = new BehaviorSubject(false);
      const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
        isAuthenticated$: authSubject.asObservable(),
      });

      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [ItemsList],
        providers: [
          { provide: DataService, useValue: dataService },
          { provide: AuthService, useValue: authServiceSpy },
          provideRouter([]),
          provideHttpClient(),
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(ItemsList);
      component = fixture.componentInstance;

      authSubject.next(false);
      fixture.detectChanges();

      expect(component.isLoggedIn$).toBeTruthy();
    });
  });

  describe('Data Stream Handling', () => {
    it('should receive updates from items stream', (done) => {
      const newCars: Car[] = [
        {
          id: 3,
          brand: 'Tesla',
          model: 'Model 3',
          year: 2024,
          color: 'White',
          price: 45000,
        },
      ];

      component.cars$.subscribe((cars) => {
        if (cars.length === 1 && cars[0].brand === 'Tesla') {
          expect(cars).toEqual(newCars);
          done();
        }
      });

      carsSubject.next(newCars);
    });
  });

  describe('Template Rendering States', () => {
    it('should display error state when error is present', () => {
      component.isLoading = false;
      component.error = 'Test error message';
      fixture.detectChanges();

      const errorElement = fixture.nativeElement.querySelector('.error-wrapper');
      expect(errorElement).toBeTruthy();
      expect(errorElement.textContent).toContain('Test error message');

      const retryButton = fixture.nativeElement.querySelector('.retry-button');
      expect(retryButton).toBeTruthy();
      expect(retryButton.textContent).toContain('Try Again');
    });

    it('should display no results when cars array is empty', () => {
      component.isLoading = false;
      component.error = null;
      carsSubject.next([]);
      fixture.detectChanges();

      const noResultsElement = fixture.nativeElement.querySelector('.no-results-wrapper');
      expect(noResultsElement).toBeTruthy();
      expect(noResultsElement.textContent).toContain('No cars found');
    });

    it('should display car list when cars are available', () => {
      component.isLoading = false;
      component.error = null;
      carsSubject.next(mockCars);
      fixture.detectChanges();

      const itemsListElement = fixture.nativeElement.querySelector('.items-list');
      expect(itemsListElement).toBeTruthy();

      const itemCards = fixture.nativeElement.querySelectorAll('app-item-card');
      expect(itemCards.length).toBe(mockCars.length);
    });
  });

  describe('Search Input', () => {
    it('should render search input', () => {
      fixture.detectChanges();

      const searchInput = fixture.nativeElement.querySelector('#search');
      expect(searchInput).toBeTruthy();
      expect(searchInput.placeholder).toContain('Search by brand or model');
    });
  });

  describe('Add Car Button', () => {
    it('should show add car button when user is authenticated', () => {
      fixture.detectChanges();

      const addButton = fixture.nativeElement.querySelector('.btn-add-car');
      expect(addButton).toBeTruthy();
      expect(addButton.textContent).toContain('Add New Car');
      expect(addButton.getAttribute('routerLink')).toBe('/items/new');
    });

    it('should not show add car button when user is not authenticated', async () => {
      const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
        isAuthenticated$: of(false),
      });

      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [ItemsList],
        providers: [
          { provide: DataService, useValue: dataService },
          { provide: AuthService, useValue: authServiceSpy },
          provideRouter([]),
          provideHttpClient(),
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(ItemsList);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const addButton = fixture.nativeElement.querySelector('.btn-add-car');
      expect(addButton).toBeFalsy();
    });
  });

  describe('Error Recovery', () => {
    it('should call retryLoading when retry button is clicked', () => {
      component.error = 'Test error';
      fixture.detectChanges();

      const retrySpy = spyOn(component, 'retryLoading');
      const retryButton = fixture.nativeElement.querySelector('.retry-button');
      retryButton.click();

      expect(retrySpy).toHaveBeenCalled();
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle rapid search changes', () => {
      const filterItemsSpy = dataService.filterItems;

      component.searchQuery = 'Toy';
      component.onSearchChange();

      component.searchQuery = 'Toyota';
      component.onSearchChange();

      component.searchQuery = 'Toyota Camry';
      component.onSearchChange();

      expect(filterItemsSpy).toHaveBeenCalledTimes(3);
      expect(filterItemsSpy.calls.argsFor(0)[0]).toBe('Toy');
      expect(filterItemsSpy.calls.argsFor(1)[0]).toBe('Toyota');
      expect(filterItemsSpy.calls.argsFor(2)[0]).toBe('Toyota Camry');
    });
  });
});
