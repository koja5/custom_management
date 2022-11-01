import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { HelpService } from "src/app/service/help.service";
import { Field } from "../../models/field";
import { FieldConfig } from "../../models/field-config";
import { checkIfInputValid } from "../../../../../shared/utils";

@Component({
  selector: "app-text-box",
  templateUrl: "./textbox.component.html",
  styleUrls: ["./textbox.component.scss"],
})
export class TextboxComponent implements OnInit, Field {
  config: FieldConfig;
  group: FormGroup;
  public language: any;
  checkIfInputValid = checkIfInputValid;

  constructor(private helpService: HelpService) {

  }

  ngOnInit() {
    this.language = this.helpService.getLanguage();
  }
}
