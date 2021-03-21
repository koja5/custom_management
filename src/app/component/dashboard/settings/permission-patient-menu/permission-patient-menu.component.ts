import { Component, OnInit, ViewChild } from "@angular/core";
import { DynamicFormsComponent } from "src/app/component/dynamic-elements/dynamic-forms/dynamic-forms.component";
import { AccountService } from "src/app/service/account.service";
import { DynamicService } from "src/app/service/dynamic.service";
import { HelpService } from "src/app/service/help.service";
import { MongoService } from "src/app/service/mongo.service";

@Component({
  selector: "app-permission-patient-menu",
  templateUrl: "./permission-patient-menu.component.html",
  styleUrls: ["./permission-patient-menu.component.scss"],
})
export class PermissionPatientMenuComponent implements OnInit {
  @ViewChild(DynamicFormsComponent) form: DynamicFormsComponent;
  public configField: any;
  public language: any;
  public superadmin: string;
  public loading = true;
  public data: any;
  public changeData: any;
  public showDialog = false;

  constructor(
    private service: AccountService,
    private helpService: HelpService,
    private dynamicService: DynamicService,
    private mongoService: MongoService
  ) {}

  ngOnInit() {
    this.language = this.helpService.getLanguage();
    this.superadmin = this.helpService.getSuperadmin();
    this.initialization();
  }

  initialization() {
    this.dynamicService
      .getConfiguration("settings/permission", "permission-patient-menu")
      .subscribe((config) => {
        this.configField = config;
        this.getData();
      });
  }

  getData() {
    this.mongoService
      .getPermissionForPatientNavigation(this.superadmin)
      .subscribe((data) => {
        this.data = data;
        this.packValue(data);
        this.loading = false;
      });
  }

  packValue(data) {
    this.loading = false;
    for (let i = 0; i < this.configField.length; i++) {
      if (data[this.configField[i].field]) {
        this.configField[i].value = data[this.configField[i].field];
      } else {
        this.configField[i].value = false;
      }
    }
  }

  submitEmitter(event) {
    console.log(event);
    this.changeData = event;
    this.showDialog = true;
  }

  receiveConfirm(event) {
    if (event) {
      this.changeData.clinic = this.superadmin;
      this.mongoService
        .createOrUpdatePermissionPatientMenu(this.changeData)
        .subscribe((data) => {
          if (data) {
            this.helpService.successToastr(
              this.language.permissionPatientMenuSuccessUpdateText,
              ""
            );
          } else {
            this.helpService.errorToastr(
              this.language.permissionPatientMenuErrorUpdateText,
              ""
            );
          }
        });
    }
    this.showDialog = false;
  }
}
