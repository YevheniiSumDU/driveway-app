import { Routes } from '@angular/router';
import { ItemsList } from './shared/components/items-list/items-list';
import { ItemDetails } from './shared/components/item-details/item-details';
import { ItemForm } from './shared/components/item-form/item-form';
import { Login } from './shared/components/login/login';
import { Register } from './shared/components/register/register';
import { AuthGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: 'items', component: ItemsList },
  { path: 'items/new', component: ItemForm, canActivate: [AuthGuard] },
  { path: 'items/:id', component: ItemDetails },
  { path: 'items/:id/edit', component: ItemForm, canActivate: [AuthGuard] },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: '', redirectTo: '/items', pathMatch: 'full' },
  { path: '**', redirectTo: '/items' },
];
