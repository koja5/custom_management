import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { HelpService } from "src/app/service/help.service";
import { FieldConfig } from "../../models/field-config";
import { checkIfInputValid } from "../../../../../shared/utils";

@Component({
  selector: "app-textarea",
  templateUrl: "./textarea.component.html",
  styleUrls: ["./textarea.component.scss"],
})
export class TextareaComponent implements OnInit {
  config: FieldConfig;
  group: FormGroup;
  public value: string;

  public language: any;
  checkIfInputValid = checkIfInputValid;

  constructor(private helpService: HelpService) {}

  ngOnInit() {
    this.language = this.helpService.getLanguage();
    this.value = this.group.value[this.config.field];
  }
}
