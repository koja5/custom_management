import { Component, OnInit } from "@angular/core";
import { HelpService } from "src/app/service/help.service";

@Component({
  selector: "app-access-forbidden",
  templateUrl: "./access-forbidden.component.html",
  styleUrls: ["./access-forbidden.component.scss"],
})
export class AccessForbiddenComponent implements OnInit {
  public language: any;

  constructor(private helpService: HelpService) {}

  ngOnInit() {
    this.language = this.helpService.getLanguage();
  }
}
