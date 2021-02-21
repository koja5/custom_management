import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { HelpService } from "src/app/service/help.service";
import { Field } from "../../models/field";
import { FieldConfig } from "../../models/field-config";
import {
  Query,
  DataManager,
  ODataV4Adaptor,
  ReturnOption,
} from "@syncfusion/ej2-data";

@Component({
  selector: "app-dropdown",
  templateUrl: "./dropdown.component.html",
  styleUrls: ["./dropdown.component.scss"],
})
export class DropdownComponent implements OnInit, Field {
  constructor(private helpService: HelpService) {}
  config: FieldConfig;
  group: FormGroup;

  public data: any;

  public query: Query = new Query().from("entries");

  ngOnInit() {
    if(this.config.data['translation']) {
      this.data = this.helpService.getLanguage()[this.config.data['translation']['property']]
      this.config.field = this.config.data['translation']['fields'];
    } else {
      this.initialization();
    }
  }

  initialization() {
    if (this.config.request.type === "POST") {
    } else {
      this.getApiRequest();
    }

    /*new DataManager({
      url: "https://api.publicapis.org",
      adaptor: new ODataV4Adaptor(),
      crossDomain: true,
    })
      .executeQuery(new Query().from("entries"))
      .then((e: ReturnOption) => {
        console.log(e);
        this.data = e['result']["entries"];
      });*/
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
        this.helpService.packParametarGet(
          this.config.data,
          this.config.request.fields
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

  onFiltering(event) {
    
  }
}
