import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-my-complaint',
  templateUrl: './my-complaint.component.html',
  styleUrls: ['./my-complaint.component.scss']
})
export class MyComplaintComponent implements OnInit {

  public path = 'grid';
  public name = 'my-complaint';

  constructor() { }

  ngOnInit() {
  }

}
