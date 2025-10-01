import { Injectable } from '@angular/core';
import { Car } from '../models/car.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private cars: Car[] = [
    {
      id: 1,
      brand: 'Toyota',
      model: 'Corolla',
      year: 2022,
      color: 'White',
      price: 20000,
      imageUrl: 'assets/images/toyota.png',
    },
    {
      id: 2,
      brand: 'BMW',
      model: 'X5',
      year: 2023,
      color: 'Black',
      price: 55000,
      imageUrl: 'assets/images/bmw.png',
    },
    {
      id: 3,
      brand: 'Tesla',
      model: 'Model 3',
      year: 2021,
      color: 'Red',
      price: 45000,
      imageUrl: 'assets/images/tesla.png',
    },
    {
      id: 4,
      brand: 'Mercedes',
      model: 'C-Class',
      year: 2020,
      color: 'Silver',
      price: 40000,
      imageUrl: 'assets/images/mercedes.png',
    },
    {
      id: 5,
      brand: 'Mazda',
      model: 'CX-5',
      year: 2012,
      color: 'Blue',
      price: 30000,
    },
  ];

  getItems(): Car[] {
    return this.cars;
  }
}
