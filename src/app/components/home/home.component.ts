import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { concatMapTo, map } from 'rxjs/operators';
import { Car } from 'src/app/models/car';
import { CarService } from 'src/app/services/car.service';

@Component({
  selector: 'cars-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  cars: Car[] = [];
  carForm: FormGroup;
  formBtn: string = 'Add +';
  editCarId = 0;

  constructor(
    private carsSvc: CarService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.refreshCars();
    this.resetForm();
  }

  resetForm() {
    this.carForm = this.fb.group({
      make: '',
      model: '',
      year: 2000,
      color: '',
      price: 0,
    });
    this.formBtn = 'Add +';
    if (this.editCarId !== 0) this.editCarId = 0;
  }

  doSubmitForm() {
    console.log(this.carForm.value);
    this.editCarId === 0
      ? this.refreshCars(this.carsSvc.append(this.carForm.value))
      : this.refreshCars(this.carsSvc.replace({id: this.editCarId, ...this.carForm.value}));
    this.resetForm();
  }

  refreshCars(mutate?: Observable<any>) {
    const pipes = [
      concatMapTo(this.carsSvc.all()),
      map( (cars: Car[]) => cars.slice(0, 99)),
    ];

    (mutate || of(null))
      .pipe(...pipes as [])
      .subscribe(cars => { this.cars = cars; }, err => {
        console.log(err);
        this.cars = [];
      }, () => {
        this.editCarId = 0;
      });
  }

  doEdit(car: Car) {
    this.doLog('edit', car);
    this.editCarId = car.id;
    this.formBtn = `Save Car: ${car.id}`;
    let tCar: Car = {
      make: car.make,
      model: car.model,
      year: car.year,
      color: car.color,
      price: car.price
    };
    this.carForm.setValue(tCar);
  }

  doDelete(car: Car) {
    this.doLog('delete', car);
    this.refreshCars(this.carsSvc.delete(car.id));
  }

  doLog(act: string, car: Car) {
    console.log(`${act.toUpperCase()} id:${car.id} make:${car.make} model:${car.model}`);
  }

}
