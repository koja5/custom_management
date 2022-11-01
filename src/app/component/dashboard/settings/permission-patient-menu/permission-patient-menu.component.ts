import { Component, OnInit, ViewChild } from "@angular/core";
import { Subject } from "rxjs-compat";
import { DynamicFormsComponent } from "src/app/component/dynamic-elements/dynamic-forms/dynamic-forms.component";
import { FormGuardData } from "src/app/models/formGuard-data";
import { AccountService } from "src/app/service/account.service";
import { DynamicService } from "src/app/service/dynamic.service";
import { HelpService } from "src/app/service/help.service";
import { MongoService } from "src/app/service/mongo.service";

@Component({
  selector: "app-permission-patient-menu",
  templateUrl: "./permission-patient-menu.component.html",
  styleUrls: ["./permission-patient-menu.component.scss"],
})
export class PermissionPatientMenuComponent implements OnInit, FormGuardData {
  @ViewChild(DynamicFormsComponent) form: DynamicFormsComponent;
  public configField: any;
  public language: any;
  public superadmin: string;
  public loading = true;
  public data: any;
  public changeData: any;
  public showDialog = false;
  isFormDirty: boolean = false;
  isDataSaved$: Subject<boolean> = new Subject<boolean>();
  showDialogExit: boolean = false;

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

  getValue(event: any): void {
    if (
      this.configField[0].value == event.myCalendar &&
      this.configField[1].value == event.myComplaint &&
      this.configField[2].value == event.myDocument &&
      this.configField[3].value == event.myTherapy
    ) {
      this.isFormDirty = false;
    }else {
      this.isFormDirty = true;
    }
  }

  receiveConfirmExit(event: boolean): void {
    if (event) {
      this.isFormDirty = false;
    }
    this.showDialogExit = false;
    this.isDataSaved$.next(event);
  }

  openConfirmModal(): void {
    this.showDialogExit = true;
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
      if (data && data[this.configField[i].field]) {
        this.configField[i].value = data[this.configField[i].field];
      } else {
        this.configField[i].value = false;
      }
    }
  }

  submitEmitter(event) {
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
        this.isFormDirty = false;
    }
    this.showDialog = false;
  }
}
