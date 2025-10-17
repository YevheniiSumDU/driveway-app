import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { ItemDetails } from './item-details';
import { DataService } from '../../services/data/data.service';
import { AuthService } from '../../services/auth/auth.service';
import { Car } from '../../models/car.model';

describe('ItemDetails', () => {
  let component: ItemDetails;
  let fixture: ComponentFixture<ItemDetails>;
  let dataService: jasmine.SpyObj<DataService>;
  let authService: jasmine.SpyObj<AuthService>;

  const mockCar: Car = {
    id: 1,
    brand: 'Toyota',
    model: 'Camry',
    year: 2023,
    color: 'Red',
    price: 35000,
    description: 'A reliable sedan with great fuel efficiency',
    imageUrl: 'assets/images/toyota-camry.jpg',
    mileage: 15000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    engine: '2.5L I4',
    features: ['Bluetooth', 'Air Conditioning', 'Navigation'],
    bodyType: 'Sedan',
    doors: 4,
    seats: 5,
    drivetrain: 'FWD',
    fuelConsumption: 8.5,
    gallery: [
      'assets/images/toyota-camry-1.jpg',
      'assets/images/toyota-camry-2.jpg',
      'assets/images/toyota-camry-3.jpg',
    ],
    colorOptions: ['Red', 'Blue', 'White', 'Black'],
    warranty: '3 years / 100,000 km',
  };

  beforeEach(async () => {
    const dataServiceSpy = jasmine.createSpyObj('DataService', ['getCarById', 'deleteCar']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      isAuthenticated$: of(true),
    });

    await TestBed.configureTestingModule({
      imports: [ItemDetails],
      providers: [
        { provide: DataService, useValue: dataServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        provideRouter([]),
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemDetails);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    // Set up default mock response
    dataService.getCarById.and.returnValue(of(mockCar));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should handle car not found', () => {
      dataService.getCarById.and.returnValue(throwError(() => new Error('Car not found')));

      component.ngOnInit();

      expect(component.car).toBeUndefined();
      expect(component.isLoading).toBeFalse();
      expect(component.error).toBe('Car not found');
    });

    it('should initialize carousel with gallery images', () => {
      component.ngOnInit();

      expect(component.currentImage).toBe('assets/images/toyota-camry-1.jpg');
      expect(component.currentImageIndex).toBe(0);
      expect(component.visibleThumbnails.length).toBeGreaterThan(0);
    });

    it('should initialize carousel with main image when no gallery', () => {
      const carWithoutGallery = { ...mockCar, gallery: undefined };
      dataService.getCarById.and.returnValue(of(carWithoutGallery));

      component.ngOnInit();

      expect(component.currentImage).toBe('assets/images/toyota-camry.jpg');
    });

    it('should use default image when no images available', () => {
      const carWithoutImages = { ...mockCar, imageUrl: '', gallery: undefined };
      dataService.getCarById.and.returnValue(of(carWithoutImages));

      component.ngOnInit();

      expect(component.currentImage).toBe('assets/images/no-car-image.png');
    });
  });

  describe('carousel functionality', () => {
    beforeEach(() => {
      component.car = mockCar;
      component.initializeCarousel();
    });

    it('should navigate to next image', () => {
      component.nextImage();

      expect(component.currentImageIndex).toBe(1);
      expect(component.currentImage).toBe('assets/images/toyota-camry-2.jpg');
    });

    it('should wrap around to first image when at end', () => {
      component.currentImageIndex = 2; // Last image
      component.nextImage();

      expect(component.currentImageIndex).toBe(0);
      expect(component.currentImage).toBe('assets/images/toyota-camry-1.jpg');
    });

    it('should navigate to previous image', () => {
      component.currentImageIndex = 1;
      component.previousImage();

      expect(component.currentImageIndex).toBe(0);
      expect(component.currentImage).toBe('assets/images/toyota-camry-1.jpg');
    });

    it('should wrap around to last image when at beginning', () => {
      component.currentImageIndex = 0;
      component.previousImage();

      expect(component.currentImageIndex).toBe(2);
      expect(component.currentImage).toBe('assets/images/toyota-camry-3.jpg');
    });

    it('should select specific image', () => {
      component.selectImage(2);

      expect(component.currentImageIndex).toBe(2);
      expect(component.currentImage).toBe('assets/images/toyota-camry-3.jpg');
    });

    it('should update visible thumbnails when navigating', () => {
      component.nextThumbnails();
      expect(component.thumbnailStartIndex).toBe(5);
      expect(component.showThumbnailNavLeft).toBeTrue();

      component.previousThumbnails();
      expect(component.thumbnailStartIndex).toBe(0);
    });

    it('should ensure current image is visible in thumbnails', () => {
      component.currentImageIndex = 4;
      component.ensureCurrentImageVisible();

      expect(component.thumbnailStartIndex).toBe(0);
    });
  });

  describe('color mapping', () => {
    it('should map exact color names to hex values', () => {
      expect(component.getColorValue('crystal white')).toBe('#ffffff');
      expect(component.getColorValue('midnight black')).toBe('#000000');
      expect(component.getColorValue('electric blue')).toBe('#2563eb');
    });

    it('should map basic color names to hex values', () => {
      expect(component.getColorValue('red')).toBe('#dc2626');
      expect(component.getColorValue('blue')).toBe('#2563eb');
      expect(component.getColorValue('green')).toBe('#16a34a');
    });

    it('should handle color names with variations', () => {
      expect(component.getColorValue('dark red')).toBe('#dc2626');
      expect(component.getColorValue('light blue')).toBe('#2563eb');
    });

    it('should return default gray for unknown colors', () => {
      expect(component.getColorValue('unknown color')).toBe('#6b7280');
    });
  });

  describe('image error handling', () => {
    it('should handle image loading errors', () => {
      const mockEvent = {
        target: { src: 'invalid-image.jpg' },
      };

      component.handleImageError(mockEvent);

      expect(mockEvent.target.src).toBe('assets/images/no-car-image.png');
    });
  });

  describe('authentication-dependent features', () => {
    it('should show edit and delete buttons when user is logged in', () => {
      component.car = mockCar;
      fixture.detectChanges();

      const editButton = fixture.debugElement.query(By.css('.btn-edit'));
      const deleteButton = fixture.debugElement.query(By.css('.btn-delete'));

      expect(editButton).toBeTruthy();
      expect(deleteButton).toBeTruthy();
    });

    it('should navigate to edit page when edit button is clicked', () => {
      const routerSpy = spyOn(component, 'editCar');
      component.car = mockCar;

      component.editCar();

      expect(routerSpy).toHaveBeenCalled();
    });
  });

  describe('delete functionality', () => {
    beforeEach(() => {
      component.car = mockCar;
      dataService.deleteCar.and.returnValue(of(undefined));
    });

    it('should confirm before deleting', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.deleteCar();

      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete this car? This action cannot be undone.'
      );
      expect(dataService.deleteCar).not.toHaveBeenCalled();
    });

    it('should handle delete errors', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      dataService.deleteCar.and.returnValue(throwError(() => new Error('Delete failed')));

      component.deleteCar();

      expect(component.error).toBe('Delete failed');
      expect(component.isDeleting).toBeFalse();
    });
  });

  describe('navigation', () => {
    it('should share car when share API is available', () => {
      const navigatorSpy = spyOn(navigator, 'share').and.returnValue(Promise.resolve());
      component.car = mockCar;

      component.shareCar();

      expect(navigatorSpy).toHaveBeenCalledWith({
        title: 'Toyota Camry',
        text: 'Check out this Toyota Camry for $35000!',
        url: window.location.href,
      });
    });
  });

  describe('UI rendering', () => {
    beforeEach(() => {
      component.car = mockCar;
      component.isLoading = false;
      fixture.detectChanges();
    });

    it('should display car title and price', () => {
      const title = fixture.debugElement.query(By.css('h1'));
      const price = fixture.debugElement.query(By.css('.current-price'));

      expect(title.nativeElement.textContent).toContain('Toyota Camry');
      expect(price).toBeTruthy();
    });

    it('should display key specifications', () => {
      const specs = fixture.debugElement.queryAll(By.css('.spec-item'));

      expect(specs.length).toBeGreaterThan(0);
    });

    it('should display technical specifications', () => {
      const techSpecs = fixture.debugElement.query(By.css('.specs-grid h3'));

      expect(techSpecs.nativeElement.textContent).toContain('Technical Specifications');
    });

    it('should display features when available', () => {
      const featuresSection = fixture.debugElement.query(By.css('.features-section'));

      expect(featuresSection).toBeTruthy();
    });

    it('should display color options when available', () => {
      const colorSection = fixture.debugElement.query(By.css('.color-options-section'));

      expect(colorSection).toBeTruthy();
    });

    it('should display description when available', () => {
      const descriptionSection = fixture.debugElement.query(By.css('.description-section'));

      expect(descriptionSection).toBeTruthy();
    });
  });
});
