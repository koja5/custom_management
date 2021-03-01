import { Component, OnInit } from "@angular/core";
import { HelpService } from "src/app/service/help.service";

@Component({
  selector: "app-patient-form-success",
  templateUrl: "./patient-form-success.component.html",
  styleUrls: ["./patient-form-success.component.scss"],
})
export class PatientFormSuccessComponent implements OnInit {
  public language: any;

  constructor(private helpService: HelpService) {}

  ngOnInit() {
    this.language = this.helpService.getLanguage();
  }
}
