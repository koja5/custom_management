import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { HelpService } from "src/app/service/help.service";
import { FieldConfig } from "../../models/field-config";
import { Query } from "@syncfusion/ej2-data";
import { checkIfInputValid } from "../../../../../shared/utils";

@Component({
  selector: "app-multiselect",
  templateUrl: "./multiselect.component.html",
  styleUrls: ["./multiselect.component.scss"],
})
export class MultiselectComponent implements OnInit {
  constructor(private helpService: HelpService) {}
  config: FieldConfig;
  group: FormGroup;
  public language: any;
  public selectedValues: string[] = [];

  public data: any;

  public query: Query = new Query().from("entries");
  checkIfInputValid = checkIfInputValid;

  ngOnInit() {
    console.log(this.group);
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
    if (!this.config.allowCustom && this.config.request.type === "GET") {
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
    this.helpService
      .getApiRequest(
        this.config.request.api,
        this.config.request.fields && this.config.request.fields.length > 0
          ? this.helpService.packParametarGet(
              this.config.data,
              this.config.request.fields
            )
          : this.helpService.packRequestValueFromParameters(
              this.config.request.parameters
            )
      )
      .subscribe((data) => {
        if (this.config.request.root) {
          this.data = data[this.config.request.root];
        } else {
          this.data = data;
        }
      });
  }

  onFiltering(event) {}

  onValueChange(event) {
    this.selectedValues = event;
  }

}
