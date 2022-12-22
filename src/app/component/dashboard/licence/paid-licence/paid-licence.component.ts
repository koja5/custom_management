import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-paid-licence',
  templateUrl: './paid-licence.component.html',
  styleUrls: ['./paid-licence.component.scss']
})
export class PaidLicenceComponent implements OnInit {
  
  @Input() license: any;

  constructor() { }

  ngOnInit() {
  }

}
