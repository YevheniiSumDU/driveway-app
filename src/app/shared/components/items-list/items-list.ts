import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemCard } from '../item-card/item-card';
import { Subscription } from 'rxjs';
import { Car } from '../../models/car.model';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-items-list',
  imports: [CommonModule, FormsModule, ItemCard],
  templateUrl: './items-list.html',
  styleUrl: './items-list.scss',
})
export class ItemsList implements OnInit, OnDestroy {
  searchQuery = '';
  cars: Car[] = [];
  private subscription!: Subscription;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.subscription = this.dataService.getItemsStream().subscribe((cars) => {
      this.cars = cars;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onSearchChange() {
    this.dataService.filterItems(this.searchQuery);
  }
}
