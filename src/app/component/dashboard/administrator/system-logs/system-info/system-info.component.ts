import { Component, OnInit } from '@angular/core';
import { SystemLogsService } from 'src/app/service/system-logs.service';

@Component({
  selector: 'app-system-info',
  templateUrl: './system-info.component.html',
  styleUrls: ['./system-info.component.scss']
})
export class SystemInfoComponent implements OnInit {

  public path = 'grid/logs';
  public name = 'info';
  constructor() {}

  ngOnInit() {
  }


}
