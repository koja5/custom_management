import { Component, OnInit, ViewChild } from "@angular/core";
import { Modal } from "ngx-modal";
import { DynamicFormsComponent } from "src/app/component/dynamic-elements/dynamic-forms/dynamic-forms.component";
import { DynamicService } from "src/app/service/dynamic.service";
import { HelpService } from "src/app/service/help.service";

@Component({
  selector: "app-massive-email",
  templateUrl: "./massive-email.component.html",
  styleUrls: ["./massive-email.component.scss"],
})
export class MassiveEmailComponent implements OnInit {
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
      .getConfiguration("administarator", "massive-email")
      .subscribe((config) => {
        this.configField = config;
        this.loading = false;
      });
  }

  submitEmitter(event) {
    this.changeData = event;
    this.changeData.superadmin = this.helpService.getSuperadmin();
    this.changeData.mode = "mail";
    this.changeData.language = this.language;
    this.getFilteredRecipients();
    this.recipients.open();
  }

  getFilteredRecipients() {
    this.allRecipients = null;
    this.dynamicService
      .callApiPost("/api/getFilteredRecipients", this.changeData)
      .subscribe((data) => {
        console.log(data);
        if (data && data["length"] > 0) {
          this.allRecipients = data;
        } else {
          this.recipients.close();
          this.helpService.warningToastr(
            "",
            this.language.needToConfigurationParams
          );
        }
      });
  }

  sendMails() {
    this.dynamicService
      .callApiPost("/api/sendMassiveEmail", this.changeData)
      .subscribe((data) => {
        this.helpService.successToastr(
          this.language.successExecutedActionTitle,
          this.language.successExecutedActionText
        );
        this.recipients.close();
      });
  }
}
