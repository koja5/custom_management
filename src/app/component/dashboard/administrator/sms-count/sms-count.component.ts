import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-sms-count",
  templateUrl: "./sms-count.component.html",
  styleUrls: ["./sms-count.component.scss"],
})
export class SmsCountComponent implements OnInit {
  public path = "grid";
  public name = "sms-count";

  constructor() {}

  ngOnInit() {}
}
