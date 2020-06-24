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
    console.log(window.location.pathname.split('/'));
    this.currentTab = window.location.pathname.split('/')[3];
  }

  changeTab(tab) {
    this.currentTab = tab;
  }

}
