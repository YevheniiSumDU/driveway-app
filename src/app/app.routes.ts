import { Routes } from '@angular/router';
import { ItemsList } from './shared/components/items-list/items-list';
import { ItemDetailsComponent } from './shared/components/item-details/item-details';

export const routes: Routes = [
  { path: 'items', component: ItemsList },
  { path: 'items/:id', component: ItemDetailsComponent },
  { path: '', redirectTo: '/items', pathMatch: 'full' },
  { path: '**', redirectTo: '/items' },
];
