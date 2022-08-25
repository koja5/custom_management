import { Component, OnInit, ViewChild } from "@angular/core";
import { DynamicFormsComponent } from "src/app/component/dynamic-elements/dynamic-forms/dynamic-forms.component";
import { UserType } from "src/app/component/enum/user-type";
import { AccountService } from "src/app/service/account.service";
import { DynamicService } from "src/app/service/dynamic.service";
import { HelpService } from "src/app/service/help.service";

@Component({
  selector: "app-account",
  templateUrl: "./account.component.html",
  styleUrls: ["./account.component.scss"],
})
export class AccountComponent implements OnInit {
  @ViewChild(DynamicFormsComponent) form: DynamicFormsComponent;
  public userType = UserType;
  public loading = true;
  public type: number;
  public id: number;
  public data: any;
  public changeData: any;
  public showDialog = false;
  public configField: any;
  public language: any;

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
      .getConfiguration("settings/account", "owner")
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
          this.packValue(data);
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
          this.packValue(data);
        }
      });
    } else if (type === this.userType.patient) {
      this.service.getCustomerWithId(id).subscribe((data) => {
        if (data && data["length"] > 0) {
          this.data = data[0];
          this.packValue(data);
        }
      });
    }
  }

  packValue(data) {
    this.loading = false;
    for (let i = 0; i < this.configField.length; i++) {
      this.configField[i].value = data[0][this.configField[i].field];
    }
  }

  submitEmitter(event) {
    this.changeData = event;
    this.showDialog = true;
  }

  receiveConfirm(event) {
    if (event) {
      this.changeData.id = this.data.id;
      if (this.type === this.userType.owner) {
        this.service.updateSuperadmin(this.changeData).subscribe((data) => {
          if (data) {
            this.helpService.successToastr(
              this.language.accountSuccessUpdatedAccountTitle,
              this.language.accountSuccessUpdatedAccountText
            );
          } else {
            this.helpService.errorToastr(
              this.language.accountErrorUpdatedAccountTitle,
              this.language.accountErrorUpdatedAccountText
            );
          }
        });
      } else if (
        this.type === this.userType.admin ||
        this.type === this.userType.manager ||
        this.type === this.userType.employee
      ) {
        this.service.updateUser(this.changeData).subscribe((data) => {
          if (data) {
            this.helpService.successToastr(
              this.language.accountSuccessUpdatedAccountTitle,
              this.language.accountSuccessUpdatedAccountText
            );
          } else {
            this.helpService.errorToastr(
              this.language.accountErrorUpdatedAccountTitle,
              this.language.accountErrorUpdatedAccountText
            );
          }
        });
      } else if (this.type === this.userType.patient) {
        this.service.updatePatient(this.changeData).subscribe((data) => {
          if (data) {
            this.helpService.successToastr(
              this.language.accountSuccessUpdatedAccountTitle,
              this.language.accountSuccessUpdatedAccountText
            );
          } else {
            this.helpService.errorToastr(
              this.language.accountErrorUpdatedAccountTitle,
              this.language.accountErrorUpdatedAccountText
            );
          }
        });
      }
    }
    this.showDialog = false;
  }
}
