import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { HelpService } from "src/app/service/help.service";
import { Field } from "../../models/field";
import { FieldConfig } from "../../models/field-config";
import { Query } from "@syncfusion/ej2-data";
import { checkIfInputValid } from "../../../../../shared/utils";

@Component({
  selector: "app-dropdown",
  templateUrl: "./dropdown.component.html",
  styleUrls: ["./dropdown.component.scss"],
})
export class DropdownComponent implements OnInit, Field {
  constructor(private helpService: HelpService) {}
  config: FieldConfig;
  group: FormGroup;
  public language: any;

  public data: any;

  public query: Query = new Query().from("entries");
  checkIfInputValid = checkIfInputValid;

  ngOnInit() {
    this.language = this.helpService.getLanguage();
    if (this.config.data && this.config.data["translation"]) {
      this.data =
        this.helpService.getLanguage()[
          this.config.data["translation"]["property"]
        ];
      this.config.field = this.config.data["translation"]["fields"];
    } else {
      this.initialization();
    }
  }

  initialization() {
    if (this.config.request.type === "POST") {
    } else {
      this.getApiRequest();
    }
  }

  postApiRequest() {
    this.helpService.postApiRequest(
      this.config.request.api,
      this.helpService.packParametarPost(
        this.config.data,
        this.config.request.fields
      )
    );
  }

  getApiRequest() {
    let params: any;
    if (this.config.data && this.config.request.fields) {
      params = this.helpService.packParametarGet(
        this.config.data,
        this.config.request.fields
      );
    }
    if (this.config.request.parameters) {
      params = this.helpService.packRequestValueFromParameters(
        this.config.request.parameters
      );
    }
    this.helpService
      .getApiRequest(this.config.request.api, params)
      .subscribe((data) => {
        if (this.config.request.root) {
          this.data = data[this.config.request.root];
        } else {
          this.data = data;
        }
      });
  }

  onFiltering(event) {}
}
