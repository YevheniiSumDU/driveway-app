import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, shareReplay } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Car } from '../models/car.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private carsSubject = new BehaviorSubject<Car[]>([]);
  private allCars: Car[] = [];
  private cars$: Observable<Car[]>;

  constructor(private http: HttpClient) {
    this.cars$ = this.http.get<Car[]>('/cars').pipe(
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
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;

      switch (error.status) {
        case 0:
          errorMessage = 'Unable to connect to server. Please check if json-server is running.';
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
    return this.http.get<Car>(`/cars/${id}`).pipe(catchError(this.handleError));
  }

  addCar(car: Omit<Car, 'id'>): Observable<Car> {
    return this.http.post<Car>('/cars', car).pipe(
      tap((newCar) => {
        this.allCars = [...this.allCars, newCar];
        this.carsSubject.next(this.allCars);
      }),
      catchError(this.handleError)
    );
  }

  updateCar(updatedCar: Car): Observable<Car> {
    return this.http.put<Car>(`/cars/${updatedCar.id}`, updatedCar).pipe(
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
    return this.http.delete<void>(`/cars/${id}`).pipe(
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
