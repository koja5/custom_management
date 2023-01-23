import { Component, OnInit, ViewChild } from "@angular/core";
import { Subject } from "rxjs";
import { DynamicFormsComponent } from "src/app/component/dynamic-elements/dynamic-forms/dynamic-forms.component";
import { FormGuardData } from "src/app/models/formGuard-data";
import { MailReminderModel } from "src/app/models/mail-reminder-model";
import { DynamicService } from "src/app/service/dynamic.service";
import { HelpService } from "src/app/service/help.service";
import { ParameterItemService } from "src/app/service/parameter-item.service";

@Component({
  selector: "app-mail-reset-password",
  templateUrl: "./mail-reset-password.component.html",
  styleUrls: ["./mail-reset-password.component.scss"],
})
export class MailResetPasswordComponent implements OnInit {
  @ViewChild(DynamicFormsComponent) form: DynamicFormsComponent;
  public path = "";
  public file = "mail-reset-password";
  public mailReminderData = new MailReminderModel();
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
  ) {}

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
    this.isFormDirty = event;
  }

  changeShowDialogExit(event) {
    this.showDialogExit = event;
  }

  initialization() {
    this.id = this.helpService.getMe();

    this.dynamicService
      .getConfiguration("parameters", "mail-reset-password")
      .subscribe((config) => {
        this.configField = config;
        this.getData(this.id);
      });
  }

  getData(id) {
    this.service.getMailResetPassword(id).subscribe((data) => {
      this.data = data;
      if (data && data["length"] > 0) {
        this.packValue(data);
      }
      this.loading = false;
    });
  }

  packValue(data) {
    for (let i = 0; i < this.configField.length; i++) {
      this.configField[i].value = this.helpService.convertValue(
        data[0][this.configField[i].field],
        this.configField[i].type
      );
    }
  }

  submitEmitter(event) {
    this.changeData = event;
    this.showDialog = true;
  }

  receiveConfirm(event) {
    if (event) {
      this.changeData["superadmin"] = this.helpService.getMe();
      if (this.data && this.data.length) {
        this.service
          .updateMailResetPassword(this.changeData)
          .subscribe((data) => {
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
      } else {
        this.data = [this.changeData];
        this.service
          .createMailResetPassword(this.changeData)
          .subscribe((data) => {
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
      }
      this.isFormDirty = false;
    }
    this.showDialog = false;
  }
}
