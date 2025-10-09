import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Car } from '../../models/car.model';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-item-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './item-form.html',
  styleUrl: './item-form.scss',
})
export class ItemForm implements OnInit {
  carForm: FormGroup;
  isEditMode = false;
  carId: number | null = null;
  currentYear = new Date().getFullYear();

  brands = [
    'Toyota',
    'BMW',
    'Tesla',
    'Mercedes-Benz',
    'Mazda',
    'Audi',
    'Honda',
    'Ford',
    'Volkswagen',
    'Hyundai',
  ];
  fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
  transmissions = ['Manual', 'Automatic'];
  bodyTypes = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Wagon', 'Van', 'Truck'];
  drivetrains = ['FWD', 'RWD', 'AWD'];
  colors = [
    'White',
    'Black',
    'Silver',
    'Gray',
    'Red',
    'Blue',
    'Green',
    'Yellow',
    'Orange',
    'Purple',
    'Brown',
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService
  ) {
    this.carForm = this.createForm();
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.carId = +params['id'];
        this.loadCarData(this.carId);
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      // Basic Information
      brand: ['', [Validators.required]],
      model: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      year: [
        this.currentYear,
        [Validators.required, Validators.min(1990), Validators.max(this.currentYear + 1)],
      ],
      color: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(0), Validators.max(10000000)]],

      // Technical Specifications
      mileage: ['', [Validators.min(0), Validators.max(1000000)]],
      fuelType: [''],
      transmission: [''],
      engine: ['', [Validators.maxLength(100)]],
      horsepower: ['', [Validators.min(0), Validators.max(5000)]],
      acceleration: ['', [Validators.min(0), Validators.max(60)]],
      bodyType: [''],
      doors: ['', [Validators.min(1), Validators.max(10)]],
      seats: ['', [Validators.min(1), Validators.max(20)]],
      drivetrain: [''],
      fuelConsumption: ['', [Validators.min(0), Validators.max(50)]],
      co2Emission: ['', [Validators.min(0), Validators.max(1000)]],

      // Additional Information
      description: ['', [Validators.maxLength(1000)]],
      warranty: ['', [Validators.maxLength(200)]],
      imageUrl: [
        '',
        [Validators.pattern('(https?://.+|assets/images/.+\\.(png|jpg|jpeg|gif|webp))')],
      ],
      isNew: [false],

      // Arrays
      features: this.fb.array([]),
      colorOptions: this.fb.array([]),
      gallery: this.fb.array([]),
    });
  }

  get features(): FormArray {
    return this.carForm.get('features') as FormArray;
  }

  get colorOptions(): FormArray {
    return this.carForm.get('colorOptions') as FormArray;
  }

  get gallery(): FormArray {
    return this.carForm.get('gallery') as FormArray;
  }

  addFeature(feature = '') {
    this.features.push(this.fb.control(feature, [Validators.maxLength(100)]));
  }

  removeFeature(index: number) {
    this.features.removeAt(index);
  }

  addColorOption(color = '') {
    this.colorOptions.push(this.fb.control(color, [Validators.maxLength(30)]));
  }

  removeColorOption(index: number) {
    this.colorOptions.removeAt(index);
  }

  addGalleryImage(url = '') {
    this.gallery.push(
      this.fb.control(url, [
        Validators.pattern('(https?://.+|assets/images/.+\\.(png|jpg|jpeg|gif|webp))'),
      ])
    );
  }

  removeGalleryImage(index: number) {
    this.gallery.removeAt(index);
  }

  loadCarData(id: number) {
    this.dataService.getCarById(id).subscribe((car) => {
      if (car) {
        this.features.clear();
        this.colorOptions.clear();
        this.gallery.clear();

        this.carForm.patchValue({
          brand: car.brand,
          model: car.model,
          year: car.year,
          color: car.color,
          price: car.price,
          mileage: car.mileage,
          fuelType: car.fuelType,
          transmission: car.transmission,
          engine: car.engine,
          bodyType: car.bodyType,
          doors: car.doors,
          seats: car.seats,
          drivetrain: car.drivetrain,
          fuelConsumption: car.fuelConsumption,
          co2Emission: car.co2Emission,
          description: car.description,
          warranty: car.warranty,
          imageUrl: car.imageUrl,
          isNew: car.year >= 2023,
          horsepower: car.horsepower,
          acceleration: car.acceleration,
        });

        if (car.features) {
          car.features.forEach((feature) => {
            const control = this.fb.control(feature, [
              Validators.required,
              Validators.maxLength(100),
            ]);
            this.features.push(control);
          });
        }

        if (car.colorOptions) {
          car.colorOptions.forEach((color) => {
            const control = this.fb.control(color, [Validators.required, Validators.maxLength(30)]);
            this.colorOptions.push(control);
          });
        }

        if (car.gallery) {
          car.gallery.forEach((image) => {
            const control = this.fb.control(image, [
              Validators.pattern('(https?://.+|assets/images/.+\\.(png|jpg|jpeg|gif|webp))'),
            ]);
            this.gallery.push(control);
          });
        }

        this.carForm.markAsPristine();
        this.carForm.markAsUntouched();
      }
    });
  }

  onSubmit() {
    if (this.carForm.valid) {
      const formValue = this.carForm.value;

      const car: Car = {
        id: this.isEditMode ? this.carId! : 0,
        brand: formValue.brand,
        model: formValue.model,
        year: formValue.year,
        color: formValue.color,
        price: formValue.price,
        imageUrl: formValue.imageUrl || undefined,
        gallery: formValue.gallery || [],
        mileage: formValue.mileage || undefined,
        fuelType: (formValue.fuelType as any) || undefined,
        transmission: (formValue.transmission as any) || undefined,
        engine: formValue.engine || undefined,
        description: formValue.description || undefined,
        features: formValue.features || [],
        bodyType: (formValue.bodyType as any) || undefined,
        doors: formValue.doors || undefined,
        seats: formValue.seats || undefined,
        drivetrain: (formValue.drivetrain as any) || undefined,
        colorOptions: formValue.colorOptions || [],
        fuelConsumption: formValue.fuelConsumption || undefined,
        co2Emission: formValue.co2Emission || undefined,
        warranty: formValue.warranty || undefined,
        isNew: formValue.isNew,
        horsepower: formValue.horsepower || undefined,
        acceleration: formValue.acceleration || undefined,
      };

      if (this.isEditMode) {
        this.dataService.updateCar(car).subscribe({
          next: (updatedCar) => {
            console.log('Car updated:', updatedCar);
            alert('Car updated successfully!');
            this.router.navigate(['/items']);
          },
          error: (error) => {
            console.error('Error updating car:', error);
            alert('Error updating car. Please try again.');
          },
        });
      } else {
        this.dataService.addCar(car).subscribe({
          next: (newCar) => {
            console.log('Car added:', newCar);
            alert('Car added successfully!');
            this.router.navigate(['/items']);
          },
          error: (error) => {
            console.error('Error adding car:', error);
            alert('Error adding car. Please try again.');
          },
        });
      }
    } else {
      this.markFormGroupTouched(this.carForm);
      alert('Please fix the form errors before submitting.');
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach((arrayControl) => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  onCancel() {
    this.router.navigate(['/items']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.carForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.carForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['minlength'])
        return `Minimum length is ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['maxlength'])
        return `Maximum length is ${field.errors['maxlength'].requiredLength} characters`;
      if (field.errors['min']) return `Minimum value is ${field.errors['min'].min}`;
      if (field.errors['max']) return `Maximum value is ${field.errors['max'].max}`;
      if (field.errors['pattern']) {
        if (fieldName === 'imageUrl' || fieldName.includes('gallery')) {
          return 'Please enter a valid URL (http://, https://) or local asset path (assets/images/...)';
        }
        return 'Invalid format';
      }
    }
    return '';
  }

  getArrayItemError(arrayName: string, index: number): string {
    const array = this.carForm.get(arrayName) as FormArray;
    const control = array.at(index);
    if (control?.errors) {
      if (control.errors['required']) return 'This field is required';
      if (control.errors['maxlength'])
        return `Maximum length is ${control.errors['maxlength'].requiredLength} characters`;
      if (control.errors['pattern']) {
        return 'Please enter a valid URL starting with http:// or https://';
      }
    }
    return '';
  }

  isArrayItemInvalid(arrayName: string, index: number): boolean {
    const array = this.carForm.get(arrayName) as FormArray;
    const control = array.at(index);
    return !!(control && control.invalid && control.touched);
  }
}
