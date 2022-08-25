import { Component, OnInit, ViewChild } from "@angular/core";
import { DynamicFormsComponent } from "src/app/component/dynamic-elements/dynamic-forms/dynamic-forms.component";
import { UserType } from "src/app/component/enum/user-type";
import { AccountService } from "src/app/service/account.service";
import { DynamicService } from "src/app/service/dynamic.service";
import { HelpService } from "src/app/service/help.service";
import * as sha1 from "sha1";

@Component({
  selector: "app-change-password",
  templateUrl: "./change-password.component.html",
  styleUrls: ["./change-password.component.scss"],
})
export class ChangePasswordComponent implements OnInit {
  @ViewChild(DynamicFormsComponent) form: DynamicFormsComponent;
  public userType = UserType;
  public language: any;
  public configField: any;
  public type: number;
  public id: number;
  public showDialog = false;
  public data: any;
  public changeData: any;

  constructor(
    private service: AccountService,
    private helpService: HelpService,
    private dynamicService: DynamicService
  ) {}

  ngOnInit() {
    this.language = this.helpService.getLanguage();
    this.initialization();
  }

  initialization() {
    this.type = this.helpService.getType();
    this.id = this.helpService.getMe();

    this.dynamicService
      .getConfiguration("settings/change-password", "change-password")
      .subscribe((config) => {
        this.configField = config;
        this.getData(this.type, this.id);
      });
  }

  getData(type, id) {
    if (type === this.userType.owner) {
      this.service.getSuperadmin(id).subscribe((data) => {
        if (data && data["length"] > 0) {
          this.data = data[0];
        }
      });
    } else if (
      type === this.userType.admin ||
      type === this.userType.manager ||
      type === this.userType.employee
    ) {
      this.service.getUser(id).subscribe((data) => {
        if (data && data["length"] > 0) {
          this.data = data[0];
        }
      });
    } else if (type === this.userType.patient) {
      this.service.getCustomerWithId(id).subscribe((data) => {
        if (data && data["length"] > 0) {
          this.data = data[0];
        }
      });
    }
  }

  submitEmitter(event) {
    this.changeData = event;
    this.showDialog = true;
  }

  resetValue() {
    console.log(this.configField);
    for (let i = 0; i < this.configField.length; i++) {
      this.configField[i].value = "";
    }
  }

  receiveConfirm(event) {
    if (event) {
      if (
        this.checkOldPassword(this.data.password, this.changeData.oldPassword)
      ) {
        if (
          this.checkNewPassword(
            this.changeData.newPassword,
            this.changeData.repeteNewPassword
          )
        ) {
          this.changePassword();
        }
      }
    }

    this.showDialog = false;
  }

  checkOldPassword(currentPassword, inputCurrentPassword) {
    if (
      !inputCurrentPassword ||
      currentPassword !== sha1(inputCurrentPassword)
    ) {
      this.helpService.errorToastr(
        this.language.changePasswordErrorNotEqualCurrentTitle,
        this.language.changePasswordErrorNotEqualCurrentText
      );
      return false;
    }
    return true;
  }

  checkNewPassword(newPassword, repeteNewPassword) {
    if (!newPassword || !repeteNewPassword) {
      this.helpService.errorToastr(
        this.language.changePasswordErrorRequiredInputTitle,
        this.language.changePasswordErrorRequiredInputText
      );
      return false;
    } else if (newPassword !== repeteNewPassword) {
      this.helpService.errorToastr(
        this.language.changePasswordErrorNotEqualTitle,
        this.language.changePasswordErrorNotEqualText
      );
      return false;
    }
    return true;
  }

  changePassword() {
    this.changeData.id = this.data.id;
    if (this.type === this.userType.owner) {
      this.service
        .updatePasswordForSuperadmin(this.changeData)
        .subscribe((data) => {
          this.checkValidResponse(data);
        });
    } else if (
      this.type === this.userType.admin ||
      this.type === this.userType.manager ||
      this.type === this.userType.employee
    ) {
      this.service.updatePasswordForUser(this.changeData).subscribe((data) => {
        this.checkValidResponse(data);
      });
    } else if (this.type === this.userType.patient) {
      this.service
        .updatePasswordForPatient(this.changeData)
        .subscribe((data) => {
          this.checkValidResponse(data);
        });
    }
  }

  checkValidResponse(data) {
    if (data) {
      this.helpService.successToastr(
        this.language.changePasswordSuccessUpdatedPasswordTitle,
        this.language.changePasswordSuccessUpdatedPasswordText
      );
    } else {
      this.helpService.errorToastr(
        this.language.changePasswordErrorUpdatedPasswordTitle,
        this.language.changePasswordErrorUpdatedPasswordText
      );
    }
  }
}
