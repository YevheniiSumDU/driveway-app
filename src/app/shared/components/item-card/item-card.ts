import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Car } from '../../models/car.model';

@Component({
  selector: 'app-item-card',
  imports: [CommonModule, RouterModule],
  templateUrl: './item-card.html',
  styleUrl: './item-card.scss',
})
export class ItemCard {
  @Input() car!: Car;
  @Output() selectCar = new EventEmitter<Car>();

  onSelect() {
    this.selectCar.emit(this.car);
  }
}
