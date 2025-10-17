import { CarPropertyPipe } from './car-property.pipe';

describe('CarPropertyPipe', () => {
  let pipe: CarPropertyPipe;

  beforeEach(() => {
    pipe = new CarPropertyPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('Default behavior', () => {
    it('should return "N/A" for null values', () => {
      expect(pipe.transform(null, 'description')).toBe('N/A');
    });

    it('should return "N/A" for undefined values', () => {
      expect(pipe.transform(undefined, 'price')).toBe('N/A');
    });

    it('should return "N/A" for empty string values', () => {
      expect(pipe.transform('', 'year')).toBe('N/A');
    });

    it('should return original value for unknown property types', () => {
      const value = 'Some unknown value';
      expect(pipe.transform(value, 'unknownType')).toBe(value);
    });
  });

  describe('Description formatting', () => {
    const longDescription =
      'This is a very long car description that should be truncated because it exceeds the maximum allowed length for display in the card component.';

    it('should return full description when under max length', () => {
      const shortDescription = 'This is a short description.';
      expect(pipe.transform(shortDescription, 'description', 50)).toBe(shortDescription);
    });

    it('should truncate description when over max length', () => {
      const result = pipe.transform(longDescription, 'description', 50);
      expect(result.length).toBeLessThanOrEqual(53); // Account for ellipsis
      expect(result).toContain('...');
    });

    it('should truncate at word boundary when possible', () => {
      const result = pipe.transform(longDescription, 'description', 40);
      expect(result).toContain('...');
      expect(result.endsWith('...')).toBeTrue();
    });

    it('should use default max length when not provided', () => {
      const result = pipe.transform(longDescription, 'description');
      expect(result.length).toBeLessThanOrEqual(153); // Default 150 + ellipsis
    });
  });

  describe('Price formatting', () => {
    it('should format small prices normally', () => {
      expect(pipe.transform(500, 'price')).toBe('$500');
      expect(pipe.transform(2500, 'price')).toBe('$2,500');
    });

    it('should format prices in thousands', () => {
      expect(pipe.transform(15000, 'price')).toBe('$15K');
      expect(pipe.transform(85000, 'price')).toBe('$85K');
    });

    it('should format prices in millions', () => {
      expect(pipe.transform(1500000, 'price')).toBe('$1.5M');
      expect(pipe.transform(2500000, 'price')).toBe('$2.5M');
    });

    it('should handle very large prices', () => {
      expect(pipe.transform(5000000, 'price')).toBe('$5.0M');
    });
  });

  describe('Mileage formatting', () => {
    it('should format low mileage normally', () => {
      expect(pipe.transform(5000, 'mileage')).toBe('5,000 km');
      expect(pipe.transform(15000, 'mileage')).toBe('15,000 km');
    });

    it('should format high mileage in thousands', () => {
      expect(pipe.transform(100000, 'mileage')).toBe('100K km');
      expect(pipe.transform(250000, 'mileage')).toBe('250K km');
    });

    it('should handle very high mileage', () => {
      expect(pipe.transform(500000, 'mileage')).toBe('500K km');
    });
  });

  describe('Engine formatting', () => {
    it('should expand engine abbreviations', () => {
      expect(pipe.transform('2.0L I4 Turbo', 'engine')).toBe('2.0L Inline-4 Turbo');
      expect(pipe.transform('3.0L V6', 'engine')).toBe('3.0L V6');
      expect(pipe.transform('5.0L V8', 'engine')).toBe('5.0L V8');
    });

    it('should handle electric motors', () => {
      expect(pipe.transform('Electric Motor', 'engine')).toBe('Electric');
      expect(pipe.transform('electric motor', 'engine')).toBe('Electric');
    });

    it('should preserve non-abbreviated engine descriptions', () => {
      const engine = '2.5L Hybrid Powertrain';
      expect(pipe.transform(engine, 'engine')).toBe(engine);
    });
  });

  describe('Warranty formatting', () => {
    it('should format "no warranty" cases', () => {
      expect(pipe.transform('No warranty', 'warranty')).toBe('No warranty');
      expect(pipe.transform('As-is condition', 'warranty')).toBe('No warranty');
      expect(pipe.transform('AS-IS', 'warranty')).toBe('No warranty');
    });

    it('should extract years and kilometers from warranty string', () => {
      expect(pipe.transform('3 years / 100,000 km', 'warranty')).toBe('3 years / 100,000 km');
      expect(pipe.transform('5 year 160000 km warranty', 'warranty')).toBe('5 years / 160000 km');
    });

    it('should return original string if pattern not matched', () => {
      const warranty = 'Manufacturer warranty applies';
      expect(pipe.transform(warranty, 'warranty')).toBe(warranty);
    });
  });

  describe('Fuel consumption formatting', () => {
    it('should format electric vehicles', () => {
      expect(pipe.transform(0, 'fuelConsumption')).toBe('Electric');
    });

    it('should format fuel consumption for petrol/diesel vehicles', () => {
      expect(pipe.transform(8.5, 'fuelConsumption')).toBe('8.5 L/100km');
      expect(pipe.transform(12.2, 'fuelConsumption')).toBe('12.2 L/100km');
    });
  });

  describe('Year formatting', () => {
    beforeEach(() => {
      // Mock the current year for consistent testing
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date('2025-01-01'));
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should format current year as "Brand New"', () => {
      expect(pipe.transform(2025, 'year')).toBe('Brand New');
    });

    it('should format 1 year old correctly', () => {
      expect(pipe.transform(2024, 'year')).toBe('1 year old');
    });

    it('should format recent years (2-5 years)', () => {
      expect(pipe.transform(2023, 'year')).toBe('2 years old');
      expect(pipe.transform(2021, 'year')).toBe('4 years old');
    });

    it('should format older years', () => {
      expect(pipe.transform(2019, 'year')).toBe('6 years old');
      expect(pipe.transform(2011, 'year')).toBe('14 years old');
    });
  });

  describe('Short text formatting', () => {
    const longText = 'This is a very long text that needs to be shortened for display purposes.';

    it('should return full text when under max length', () => {
      const shortText = 'Short text';
      expect(pipe.transform(shortText, 'shortText', 20)).toBe(shortText);
    });

    it('should truncate text when over max length', () => {
      const result = pipe.transform(longText, 'shortText', 25);
      expect(result.length).toBe(28); // 25 chars + '...'
      expect(result).toContain('...');
    });

    it('should use default max length when not provided', () => {
      const result = pipe.transform(longText, 'shortText');
      expect(result.length).toBe(33); // Default 30 + '...'
    });
  });

  describe('Edge cases', () => {
    it('should handle zero values appropriately', () => {
      expect(pipe.transform(0, 'price')).toBe('$0');
      expect(pipe.transform(0, 'mileage')).toBe('0 km');
    });

    it('should handle negative values', () => {
      expect(pipe.transform(-1000, 'price')).toBe('$-1,000');
      expect(pipe.transform(-5000, 'mileage')).toBe('-5,000 km');
    });

    it('should handle very large numbers', () => {
      expect(pipe.transform(999999999, 'price')).toBe('$1,000.0M');
    });

    it('should handle special characters in text', () => {
      const textWithSpecialChars = 'Description with <html> & special "characters"';
      expect(pipe.transform(textWithSpecialChars, 'description', 20)).toContain('...');
    });
  });

  describe('Integration tests', () => {
    it('should handle multiple transformations correctly', () => {
      const carData = {
        description: 'A luxury sedan with premium features and excellent fuel economy',
        price: 45000,
        mileage: 15000,
        engine: '3.0L V6 Turbo',
        warranty: '4 years / 100000 km',
        fuelConsumption: 9.5,
        year: 2024,
      };

      expect(pipe.transform(carData.description, 'description', 40)).toContain('...');
      expect(pipe.transform(carData.price, 'price')).toBe('$45K');
      expect(pipe.transform(carData.mileage, 'mileage')).toBe('15,000 km');
      expect(pipe.transform(carData.engine, 'engine')).toBe('3.0L V6 Turbo');
      expect(pipe.transform(carData.warranty, 'warranty')).toBe('4 years / 100000 km');
      expect(pipe.transform(carData.fuelConsumption, 'fuelConsumption')).toBe('9.5 L/100km');
      expect(pipe.transform(carData.year, 'year')).toBe('1 year old');
    });
  });
});
