import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-my-therapy',
  templateUrl: './my-therapy.component.html',
  styleUrls: ['./my-therapy.component.scss']
})
export class MyTherapyComponent implements OnInit {

  public path = 'grid';
  public name = 'my-therapy';

  constructor() { }

  ngOnInit() {
  }

}
