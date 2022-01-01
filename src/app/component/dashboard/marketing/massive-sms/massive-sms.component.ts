import { Component, OnInit, ViewChild } from "@angular/core";
import { Modal } from "ngx-modal";
import { DynamicFormsComponent } from "src/app/component/dynamic-elements/dynamic-forms/dynamic-forms.component";
import { DynamicService } from "src/app/service/dynamic.service";
import { HelpService } from "src/app/service/help.service";

@Component({
  selector: "app-massive-sms",
  templateUrl: "./massive-sms.component.html",
  styleUrls: ["./massive-sms.component.scss"],
})
export class MassiveSmsComponent implements OnInit {
  @ViewChild(DynamicFormsComponent) form: DynamicFormsComponent;
  @ViewChild("recipients") recipients: Modal;
  public configField: any;
  public language: any;
  public superadmin: string;
  public loading = true;
  public data: any;
  public changeData: any;
  public showDialog = false;
  public allRecipients: any;

  constructor(
    private helpService: HelpService,
    private dynamicService: DynamicService
  ) {}

  ngOnInit() {
    this.language = this.helpService.getLanguage();
    this.superadmin = this.helpService.getSuperadmin();
    this.initialization();
  }

  initialization() {
    this.dynamicService
      .getConfiguration("administarator", "massive-sms")
      .subscribe((config) => {
        this.configField = config;
        this.loading = false;
      });
  }

  submitEmitter(event) {
    this.allRecipients = null;
    this.changeData = event;
    this.changeData.superadmin = this.helpService.getSuperadmin();
    this.getFilteredRecipients();
    this.recipients.open();
  }

  getFilteredRecipients() {
    this.dynamicService
      .callApiPost("/api/getFilteredRecipients", this.changeData)
      .subscribe((data) => {
        this.allRecipients = data;
      });
  }

  sendSms(event) {
    this.dynamicService
      .callApiPost("/api/sendMassiveSMS", this.changeData)
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
    this.recipients.close();
  }
}
