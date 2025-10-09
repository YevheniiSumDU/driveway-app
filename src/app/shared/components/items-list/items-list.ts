import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ItemCard } from '../item-card/item-card';
import { Car } from '../../models/car.model';
import { DataService } from '../../services/data.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-items-list',
  imports: [CommonModule, FormsModule, RouterModule, ItemCard],
  templateUrl: './items-list.html',
  styleUrl: './items-list.scss',
})
export class ItemsList {
  searchQuery = '';
  cars$: Observable<Car[]>;

  constructor(private dataService: DataService) {
    this.cars$ = this.dataService.getItemsStream();
  }

  onSearchChange() {
    this.dataService.filterItems(this.searchQuery);
  }
}
