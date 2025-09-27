import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Car } from '../../models/car.model';
import { ItemCard } from '../item-card/item-card';

@Component({
  selector: 'app-items-list',
  imports: [CommonModule, FormsModule, ItemCard],
  templateUrl: './items-list.html',
  styleUrl: './items-list.scss',
})
export class ItemsList {
  searchQuery = '';

  cars: Car[] = [
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

  onCarSelect(car: Car) {
    console.log('Selected car:', car);
  }

  get filteredCars(): Car[] {
    if (!this.searchQuery) return this.cars;
    const q = this.searchQuery.toLowerCase();
    return this.cars.filter(
      (c) => c.brand.toLowerCase().includes(q) || c.model.toLowerCase().includes(q)
    );
  }
}
