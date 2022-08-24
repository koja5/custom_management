import { Component, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { FormGuardData } from "src/app/models/formGuard-data";
import { DynamicService } from "src/app/service/dynamic.service";
import { HelpService } from "src/app/service/help.service";
import { ParameterItemService } from "src/app/service/parameter-item.service";

@Component({
  selector: "app-change-superadmin-profile",
  templateUrl: "./change-superadmin-profile.component.html",
  styleUrls: ["./change-superadmin-profile.component.scss"],
})
export class ChangeSuperadminProfileComponent implements OnInit, FormGuardData {
  public path = "parameters";
  public file = "change-superadmin-profile";
  public loading = true;
  public type: number;
  public id: number;
  public data: any;
  public changeData: any;
  public showDialog = false;
  public configField: any;
  public language: any;
  isFormDirty: boolean = false;
  isDataSaved$: Subject<boolean> = new Subject<boolean>();
  showDialogExit: boolean = false;


  constructor(
    private service: ParameterItemService,
    private helpService: HelpService,
    private dynamicService: DynamicService
  ) { }

  ngOnInit() {
    this.language = this.helpService.getLanguage();
    this.initialization();
  }

  isDataSavedChange(event: boolean) {
    this.isDataSaved$.next(event);
  }

  openConfirmModal(): void {
    this.showDialogExit = true;
  }

  changeFormDirty(event) {
    this.isFormDirty = event
  }

  changeShowDialogExit(event) {
    this.showDialogExit = event;
  }

  initialization() {
    this.dynamicService
      .getConfiguration(this.path, this.file)
      .subscribe((config) => {
        this.configField = config;
        this.getData(this.helpService.getSuperadmin());
      });
  }

  getData(id) {
    this.service.getSuperadminProfile(id).subscribe((data) => {
      this.data = data;
      if (data && data["length"] > 0) {
        this.configField = this.helpService.packValueForParameters(
          this.configField,
          data
        );
      }
      this.loading = false;
    });
  }

  submitEmitter(event) {
    this.changeData = event;
    this.showDialog = true;
    this.isFormDirty = false;
  }

  receiveConfirm(event) {
    if (event) {
      this.changeData['id'] = this.data[0].id;
      this.service.updateSuperadminProfile(this.changeData).subscribe((data) => {
        if (data) {
          this.helpService.successToastr(
            this.language.successExecutedActionTitle,
            this.language.successExecutedActionText
          );
        } else {
          this.helpService.errorToastr(
            this.language.errorExecutedActionTitle,
            this.language.errorExecutedActionText
          );
        }
      });
      this.isFormDirty = false;
    }

    this.showDialog = false;
  }
}
