import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CarPropertyPipe } from '../../pipes/car-property.pipe';
import { ActivatedRoute } from '@angular/router';
import { Car } from '../../models/car.model';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-item-details',
  standalone: true,
  imports: [CommonModule, RouterModule, CarPropertyPipe],
  templateUrl: './item-details.html',
  styleUrl: './item-details.scss',
})
export class ItemDetailsComponent implements OnInit {
  car?: Car;
  currentImageIndex: number = 0;
  currentImage: string = '';

  thumbnailStartIndex: number = 0;
  maxVisibleThumbnails: number = 5;
  visibleThumbnails: string[] = [];
  showThumbnailNavLeft: boolean = false;
  showThumbnailNavRight: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.dataService.getCarById(id).subscribe((car) => {
      this.car = car;
      this.initializeCarousel();
    });
  }

  initializeCarousel() {
    if (this.car) {
      if (this.car.gallery && this.car.gallery.length > 0) {
        this.currentImage = this.car.gallery[0];
        this.updateVisibleThumbnails();
      } else if (this.car.imageUrl) {
        this.currentImage = this.car.imageUrl;
      } else {
        this.currentImage = 'assets/images/no-car-image.png';
      }
      this.currentImageIndex = 0;
    }
  }

  nextImage() {
    if (this.car?.gallery) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.car.gallery.length;
      this.currentImage = this.car.gallery[this.currentImageIndex];
      this.ensureCurrentImageVisible();
    }
  }

  previousImage() {
    if (this.car?.gallery) {
      this.currentImageIndex =
        this.currentImageIndex === 0 ? this.car.gallery.length - 1 : this.currentImageIndex - 1;
      this.currentImage = this.car.gallery[this.currentImageIndex];
      this.ensureCurrentImageVisible();
    }
  }

  selectImage(index: number) {
    if (this.car?.gallery) {
      this.currentImageIndex = index;
      this.currentImage = this.car.gallery[index];
      this.ensureCurrentImageVisible();
    }
  }

  nextThumbnails() {
    if (this.car?.gallery) {
      this.thumbnailStartIndex += this.maxVisibleThumbnails;
      this.updateVisibleThumbnails();
    }
  }

  previousThumbnails() {
    if (this.car?.gallery) {
      this.thumbnailStartIndex = Math.max(0, this.thumbnailStartIndex - this.maxVisibleThumbnails);
      this.updateVisibleThumbnails();
    }
  }

  updateVisibleThumbnails() {
    if (this.car?.gallery) {
      this.visibleThumbnails = this.car.gallery.slice(
        this.thumbnailStartIndex,
        this.thumbnailStartIndex + this.maxVisibleThumbnails
      );

      this.showThumbnailNavLeft = this.thumbnailStartIndex > 0;
      this.showThumbnailNavRight =
        this.thumbnailStartIndex + this.maxVisibleThumbnails < this.car.gallery.length;
    }
  }

  ensureCurrentImageVisible() {
    if (this.car?.gallery) {
      if (
        this.currentImageIndex < this.thumbnailStartIndex ||
        this.currentImageIndex >= this.thumbnailStartIndex + this.maxVisibleThumbnails
      ) {
        this.thumbnailStartIndex =
          Math.floor(this.currentImageIndex / this.maxVisibleThumbnails) *
          this.maxVisibleThumbnails;
        this.updateVisibleThumbnails();
      }
    }
  }

  goBack() {
    this.router.navigate(['/cars']);
  }

  shareCar() {
    if (navigator.share) {
      navigator.share({
        title: `${this.car?.brand} ${this.car?.model}`,
        text: `Check out this ${this.car?.brand} ${this.car?.model} for $${this.car?.price}!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  }

  handleImageError(event: any) {
    event.target.src = 'assets/images/no-car-image.png';
  }

  getColorValue(colorName: string): string {
    const exactColorMap: { [key: string]: string } = {
      'crystal white': '#ffffff',
      'midnight black': '#000000',
      'metallic silver': '#c0c0c0',
      'electric blue': '#2563eb',
      'jet black': '#000000',
      'alpine white': '#ffffff',
      'mineral gray': '#6b7280',
      'red multi-coat': '#dc2626',
      'pearl white': '#f8fafc',
      'solid black': '#000000',
      'deep blue metallic': '#1e40af',
      'iridium silver': '#c0c0c0',
      'obsidian black': '#000000',
      'polar white': '#ffffff',
      'sky blue mica': '#0ea5e9',
      'crystal white pearl': '#f8fafc',
      'meteor gray mica': '#6b7280',
    };

    const lowerColorName = colorName.toLowerCase();

    if (exactColorMap[lowerColorName]) {
      return exactColorMap[lowerColorName];
    }

    const basicColorMap: { [key: string]: string } = {
      red: '#dc2626',
      blue: '#2563eb',
      green: '#16a34a',
      black: '#000000',
      white: '#ffffff',
      silver: '#c0c0c0',
      gray: '#6b7280',
      grey: '#6b7280',
      yellow: '#eab308',
      orange: '#ea580c',
      purple: '#9333ea',
      brown: '#92400e',
    };

    for (const [basicColor, hex] of Object.entries(basicColorMap)) {
      if (lowerColorName.includes(basicColor)) {
        return hex;
      }
    }

    return '#6b7280';
  }
}
