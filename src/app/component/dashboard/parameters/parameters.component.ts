import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-parameters',
  templateUrl: './parameters.component.html',
  styleUrls: ['./parameters.component.scss']
})
export class ParametersComponent implements OnInit {

  public currentTab = 'complaint';

  constructor() { }

  ngOnInit() {
  }

  changeTab(tab) {
    this.currentTab = tab;
  }

}
