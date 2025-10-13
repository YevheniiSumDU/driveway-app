export interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  color: string;
  price: number;
  imageUrl?: string;
  gallery?: string[];
  mileage?: number;
  fuelType?: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
  transmission?: string;
  engine?: string;
  description?: string;
  features?: string[];
  bodyType?: 'Sedan' | 'SUV' | 'Hatchback' | 'Coupe' | 'Convertible' | 'Wagon' | 'Van' | 'Truck';
  doors?: number;
  seats?: number;
  drivetrain?: 'FWD' | 'RWD' | 'AWD';
  colorOptions?: string[];
  fuelConsumption?: number;
  co2Emission?: number;
  warranty?: string;
  isNew?: boolean;
  horsepower?: number;
  acceleration?: number;
}
