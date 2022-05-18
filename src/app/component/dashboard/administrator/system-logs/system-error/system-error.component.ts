import { Component, OnInit } from "@angular/core";
import { SystemLogsService } from "src/app/service/system-logs.service";

@Component({
  selector: "app-system-error",
  templateUrl: "./system-error.component.html",
  styleUrls: ["./system-error.component.scss"],
})
export class SystemErrorComponent implements OnInit {
  public path = 'grid/logs';
  public name = 'error';
  constructor() {}

  ngOnInit() {
  }
}
