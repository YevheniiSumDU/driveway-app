import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Car } from '../../models/car.model';

@Component({
  selector: 'app-item-card',
  imports: [CommonModule],
  templateUrl: './item-card.html',
  styleUrl: './item-card.scss',
})
export class ItemCard {
  @Input() car!: Car;
}
