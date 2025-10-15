import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, shareReplay } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { ApiResponse } from './interfaces/api.interface';
import { Car } from '../models/car.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private carsSubject = new BehaviorSubject<Car[]>([]);
  private allCars: Car[] = [];
  private cars$: Observable<Car[]>;

  constructor(private http: HttpClient) {
    this.cars$ = this.http.get<ApiResponse<Car[]>>('/cars').pipe(
      map((response) => {
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to load cars');
        }
      }),
      tap((cars) => {
        this.allCars = cars;
        this.carsSubject.next(cars);
      }),
      shareReplay(1),
      catchError(this.handleError)
    );

    this.cars$.subscribe();
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.error && typeof error.error === 'object' && 'message' in error.error) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }

      switch (error.status) {
        case 0:
          errorMessage = 'Unable to connect to server. Please check if the server is running.';
          break;
        case 401:
          errorMessage = 'Authentication required. Please log in.';
          break;
        case 403:
          errorMessage = 'Access forbidden.';
          break;
        case 404:
          errorMessage = 'Requested resource not found.';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
      }
    }

    console.error('HTTP Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  getItems(): Observable<Car[]> {
    return this.cars$;
  }

  getItemsStream(): Observable<Car[]> {
    return this.carsSubject.asObservable();
  }

  getCarById(id: number): Observable<Car> {
    return this.http.get<ApiResponse<Car>>(`/cars/${id}`).pipe(
      map((response) => {
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || 'Car not found');
        }
      }),
      catchError(this.handleError)
    );
  }

  addCar(car: Omit<Car, 'id'>): Observable<Car> {
    return this.http.post<ApiResponse<Car>>('/cars', car).pipe(
      map((response) => {
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to create car');
        }
      }),
      tap((newCar) => {
        this.allCars = [...this.allCars, newCar];
        this.carsSubject.next(this.allCars);
      }),
      catchError(this.handleError)
    );
  }

  updateCar(updatedCar: Car): Observable<Car> {
    return this.http.put<ApiResponse<Car>>(`/cars/${updatedCar.id}`, updatedCar).pipe(
      map((response) => {
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to update car');
        }
      }),
      tap((updated) => {
        const index = this.allCars.findIndex((c) => c.id === updated.id);
        if (index !== -1) {
          this.allCars[index] = updated;
          this.carsSubject.next([...this.allCars]);
        }
      }),
      catchError(this.handleError)
    );
  }

  deleteCar(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`/cars/${id}`).pipe(
      map((response) => {
        if (response.success) {
          return;
        } else {
          throw new Error(response.message || 'Failed to delete car');
        }
      }),
      tap(() => {
        this.allCars = this.allCars.filter((c) => c.id !== id);
        this.carsSubject.next(this.allCars);
      }),
      catchError(this.handleError)
    );
  }

  filterItems(query: string): void {
    if (!query) {
      this.carsSubject.next(this.allCars);
      return;
    }

    const q = query.toLowerCase();
    const filtered = this.allCars.filter(
      (c) => c.brand.toLowerCase().includes(q) || c.model.toLowerCase().includes(q)
    );
    this.carsSubject.next(filtered);
  }
}
