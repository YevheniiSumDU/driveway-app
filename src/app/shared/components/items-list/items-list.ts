import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Car } from '../../models/car.model';
import { DataService } from '../../services/data.service';
import { ItemCard } from '../item-card/item-card';

@Component({
  selector: 'app-items-list',
  imports: [CommonModule, FormsModule, ItemCard],
  templateUrl: './items-list.html',
  styleUrl: './items-list.scss',
})
export class ItemsList implements OnInit {
  searchQuery = '';
  cars: Car[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.cars = this.dataService.getItems();
  }

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
