import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-system-warn',
  templateUrl: './system-warn.component.html',
  styleUrls: ['./system-warn.component.scss']
})
export class SystemWarnComponent implements OnInit {

  public path = 'grid/logs';
  public name = 'warn';
  constructor() {}

  ngOnInit() {
  }


}
