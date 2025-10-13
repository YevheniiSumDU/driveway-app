import { Routes } from '@angular/router';
import { ItemsList } from './shared/components/items-list/items-list';
import { ItemDetailsComponent } from './shared/components/item-details/item-details';
import { ItemForm } from './shared/components/item-form/item-form';

export const routes: Routes = [
  { path: 'items', component: ItemsList },
  { path: 'items/new', component: ItemForm },
  { path: 'items/:id', component: ItemDetailsComponent },
  { path: 'items/:id/edit', component: ItemForm },
  { path: '', redirectTo: '/items', pathMatch: 'full' },
  { path: '**', redirectTo: '/items' },
];
