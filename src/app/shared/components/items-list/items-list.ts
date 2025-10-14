import { Component, OnInit } from '@angular/core';
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
export class ItemsList implements OnInit {
  searchQuery = '';
  cars$: Observable<Car[]>;
  isLoading = true;
  error: string | null = null;

  constructor(private dataService: DataService) {
    this.cars$ = this.dataService.getItemsStream();
  }

  ngOnInit() {
    this.dataService.getItems().subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.message;
      },
    });
  }

  onSearchChange() {
    this.dataService.filterItems(this.searchQuery);
  }

  retryLoading() {
    this.isLoading = true;
    this.error = null;
    this.dataService.getItems().subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.message;
      },
    });
  }
}
