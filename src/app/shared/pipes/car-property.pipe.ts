import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'carProperty',
  standalone: true,
})
export class CarPropertyPipe implements PipeTransform {
  transform(value: any, propertyType: string, maxLength?: number): any {
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }

    switch (propertyType) {
      case 'description':
        return this.formatDescription(value, maxLength);

      case 'price':
        return this.formatPrice(value);

      case 'mileage':
        return this.formatMileage(value);

      case 'engine':
        return this.formatEngine(value);

      case 'warranty':
        return this.formatWarranty(value);

      case 'fuelConsumption':
        return this.formatFuelConsumption(value);

      case 'year':
        return this.formatYear(value);

      case 'shortText':
        return this.formatShortText(value, maxLength);

      default:
        return value;
    }
  }

  private formatDescription(description: string, maxLength: number = 150): string {
    if (description.length <= maxLength) {
      return description;
    }

    const truncated = description.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > 0) {
      return truncated.substring(0, lastSpace) + '...';
    }

    return truncated + '...';
  }

  private formatPrice(price: number): string {
    if (price >= 1_000_000) {
      return `$${(price / 1_000_000).toLocaleString(undefined, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })}M`;
    } else if (price >= 10_000) {
      return `$${(price / 1_000).toFixed(0)}K`;
    }
    return `$${price.toLocaleString()}`;
  }

  private formatMileage(mileage: number): string {
    if (mileage >= 100000) {
      return `${(mileage / 1000).toFixed(0)}K km`;
    }
    return `${mileage.toLocaleString()} km`;
  }

  private formatEngine(engine: string): string {
    return engine
      .replace(/\bI4\b/g, 'Inline-4')
      .replace(/\bI6\b/g, 'Inline-6')
      .replace(/\bV6\b/g, 'V6')
      .replace(/\bV8\b/g, 'V8')
      .replace(/\bTurbo\b/gi, 'Turbo')
      .replace(/\bElectric Motor\b/gi, 'Electric');
  }

  private formatWarranty(warranty: string): string {
    if (
      warranty.toLowerCase().includes('no warranty') ||
      warranty.toLowerCase().includes('as-is')
    ) {
      return 'No warranty';
    }

    const yearsMatch = warranty.match(/(\d+)\s*year/);
    const kmMatch = warranty.match(/(\d+[,.]?\d*)\s*km/);

    if (yearsMatch && kmMatch) {
      return `${yearsMatch[1]} years / ${kmMatch[1]} km`;
    }

    return warranty;
  }

  private formatFuelConsumption(consumption: number): string {
    if (consumption === 0) {
      return 'Electric';
    }
    return `${consumption} L/100km`;
  }

  private formatYear(year: number): string {
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;

    if (age === 0) return 'Brand New';
    if (age === 1) return '1 year old';
    return `${age} years old`;
  }

  private formatShortText(text: string, maxLength: number = 30): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  }
}
