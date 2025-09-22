import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ItemsList } from '../shared/components/items-list/items-list';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, ItemsList],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  appName = 'DriveWay';
}
