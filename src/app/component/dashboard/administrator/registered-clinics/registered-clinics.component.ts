import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-registered-clinics',
  templateUrl: './registered-clinics.component.html',
  styleUrls: ['./registered-clinics.component.scss']
})
export class RegisteredClinicsComponent implements OnInit {

  public path = 'grid';
  public name = 'registered-clinics';

  constructor() { }

  ngOnInit() {
  }

}
