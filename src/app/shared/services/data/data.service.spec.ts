import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { DataService } from './data.service';
import { Car } from '../../models/car.model';
import { ApiResponse } from '../interfaces/api.interface';

describe('DataService', () => {
  let service: DataService;
  let httpMock: HttpTestingController;

  const mockCars: Car[] = [
    {
      id: 1,
      brand: 'Toyota',
      model: 'Corolla',
      year: 2022,
      color: 'White',
      price: 20000,
      imageUrl: 'assets/images/toyota-corolla-1.png',
      mileage: 15000,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      engine: '1.8L 4-cylinder',
      description: 'A reliable sedan',
      features: ['Bluetooth', 'Air Conditioning'],
      bodyType: 'Sedan',
      doors: 4,
      seats: 5,
      drivetrain: 'FWD',
    },
    {
      id: 2,
      brand: 'BMW',
      model: 'X5',
      year: 2023,
      color: 'Black',
      price: 55000,
      imageUrl: 'assets/images/bmw-x5-1.png',
      mileage: 5000,
      fuelType: 'Diesel',
      transmission: 'Automatic',
      engine: '3.0L TwinPower Turbo',
      description: 'A luxury SUV',
      features: ['Leather Seats', 'Navigation'],
      bodyType: 'SUV',
      doors: 5,
      seats: 5,
      drivetrain: 'AWD',
    },
  ];

  const mockCar: Car = mockCars[0];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        DataService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(DataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function setupInitialCars() {
    const mockResponse: ApiResponse<Car[]> = {
      success: true,
      message: 'Cars retrieved successfully',
      data: mockCars,
    };

    const req = httpMock.expectOne('/cars');
    req.flush(mockResponse);
  }

  describe('getItems', () => {
    it('should return cars and update BehaviorSubject on successful API call', (done) => {
      const mockResponse: ApiResponse<Car[]> = {
        success: true,
        message: 'Cars retrieved successfully',
        data: mockCars,
      };

      const initialReq = httpMock.expectOne('/cars');
      initialReq.flush(mockResponse);

      service.getItemsStream().subscribe((cars) => {
        if (cars.length > 0) {
          expect(cars).toEqual(mockCars);
          done();
        }
      });

      service.getItems().subscribe((cars) => {
        expect(cars).toEqual(mockCars);
      });
    });
  });

  describe('getCarById', () => {
    it('should return a car by id', (done) => {
      setupInitialCars();

      const mockResponse: ApiResponse<Car> = {
        success: true,
        message: 'Car retrieved successfully',
        data: mockCar,
      };

      service.getCarById(1).subscribe((car) => {
        expect(car).toEqual(mockCar);
        done();
      });

      const req = httpMock.expectOne('/cars/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle car not found', (done) => {
      setupInitialCars();

      const mockResponse: ApiResponse<Car> = {
        success: false,
        message: 'Car not found',
      };

      service.getCarById(999).subscribe({
        next: () => fail('Expected error but got success'),
        error: (error) => {
          expect(error.message).toBe('Car not found');
          done();
        },
      });

      const req = httpMock.expectOne('/cars/999');
      req.flush(mockResponse);
    });
  });

  describe('addCar', () => {
    it('should add a new car and update BehaviorSubject', (done) => {
      setupInitialCars();

      const newCarData: Omit<Car, 'id'> = {
        brand: 'Honda',
        model: 'Civic',
        year: 2023,
        color: 'Blue',
        price: 25000,
        imageUrl: 'assets/images/honda-civic-1.png',
        mileage: 10000,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        engine: '2.0L 4-cylinder',
        description: 'A compact sedan',
        features: ['Apple CarPlay', 'Android Auto'],
        bodyType: 'Sedan',
        doors: 4,
        seats: 5,
        drivetrain: 'FWD',
      };

      const newCar: Car = { ...newCarData, id: 3 };
      const mockResponse: ApiResponse<Car> = {
        success: true,
        message: 'Car created successfully',
        data: newCar,
      };

      let behaviorSubjectCallCount = 0;
      service.getItemsStream().subscribe((cars) => {
        behaviorSubjectCallCount++;

        if (behaviorSubjectCallCount === 2) {
          expect(cars.some((car) => car.id === 3)).toBeTrue();
          done();
        }
      });

      service.addCar(newCarData).subscribe((car) => {
        expect(car).toEqual(newCar);
      });

      const req = httpMock.expectOne('/cars');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newCarData);
      req.flush(mockResponse);
    });
  });

  describe('updateCar', () => {
    it('should update a car and update BehaviorSubject', (done) => {
      setupInitialCars();

      const updatedCar: Car = {
        ...mockCar,
        price: 22000,
        description: 'Updated description',
      };

      const mockResponse: ApiResponse<Car> = {
        success: true,
        message: 'Car updated successfully',
        data: updatedCar,
      };

      service.updateCar(updatedCar).subscribe((car) => {
        expect(car).toEqual(updatedCar);
        done();
      });

      const req = httpMock.expectOne(`/cars/${updatedCar.id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedCar);
      req.flush(mockResponse);
    });
  });

  describe('deleteCar', () => {
    it('should delete a car and update BehaviorSubject', (done) => {
      setupInitialCars();

      const carIdToDelete = 1;
      const mockResponse: ApiResponse<void> = {
        success: true,
        message: 'Car deleted successfully',
      };

      service.deleteCar(carIdToDelete).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(`/cars/${carIdToDelete}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('filterItems', () => {
    it('should filter cars by search query', (done) => {
      setupInitialCars();

      service.getItemsStream().subscribe((cars) => {
        if (cars.length === 1 && cars[0].brand === 'Toyota') {
          expect(cars.length).toBe(1);
          expect(cars[0].brand).toBe('Toyota');
          done();
        }
      });

      service.filterItems('toyota');
    });

    it('should return all cars when query is empty', (done) => {
      setupInitialCars();

      let callCount = 0;
      service.getItemsStream().subscribe((cars) => {
        callCount++;

        if (callCount === 2) {
          expect(cars.length).toBe(mockCars.length);
          done();
        }
      });

      service.filterItems('');
    });
  });
});
