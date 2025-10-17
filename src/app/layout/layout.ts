import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../shared/services/auth/auth.service';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  appName = 'DriveWay';
  authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}
