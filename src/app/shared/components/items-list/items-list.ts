import { Component } from '@angular/core';
import { Car } from '../../models/car.model';
import { ItemCard } from '../item-card/item-card';

@Component({
  selector: 'app-items-list',
  imports: [ItemCard],
  templateUrl: './items-list.html',
  styleUrl: './items-list.scss',
})
export class ItemsList {
  cars: Car[] = [
    { id: 1, brand: 'Toyota', model: 'Corolla', year: 2022, color: 'White', price: 20000 },
    { id: 2, brand: 'BMW', model: 'X5', year: 2023, color: 'Black', price: 55000 },
    { id: 3, brand: 'Tesla', model: 'Model 3', year: 2021, color: 'Red', price: 45000 },
    { id: 4, brand: 'Mercedes', model: 'C-Class', year: 2020, color: 'Silver', price: 40000 },
  ];
}
