import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-event-category-statistic',
  templateUrl: './event-category-statistic.component.html',
  styleUrls: ['./event-category-statistic.component.scss']
})
export class EventCategoryStatisticComponent implements OnInit {

  public path = 'parameters';
  public name = 'event-category-statistic';

  constructor() { }

  ngOnInit() {
  }

}
