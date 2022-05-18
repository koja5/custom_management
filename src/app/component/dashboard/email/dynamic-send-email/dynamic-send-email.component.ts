import { Component, Input, OnInit } from "@angular/core";
import { ReminderEmailFormModel } from "src/app/models/reminder-email-form-model";
import { HelpService } from "src/app/service/help.service";
import { PackLanguageService } from "src/app/service/pack-language.service";
import { SendEmailService } from "src/app/service/send-email.service";

@Component({
  selector: "app-dynamic-send-email",
  templateUrl: "./dynamic-send-email.component.html",
  styleUrls: ["./dynamic-send-email.component.scss"],
})
export class DynamicSendEmailComponent implements OnInit {
  @Input() data: any;
  @Input() buttonTitle: string;
  @Input() buttonClass: string;
  @Input() buttonIcon: string;
  public language: any;
  public emailFormModel = new ReminderEmailFormModel();
  public showDialog = false;

  constructor(
    private service: SendEmailService,
    private helpService: HelpService,
    private packLanguage: PackLanguageService
  ) {}

  ngOnInit() {
    this.language = this.helpService.getLanguage();
  }

  receiveConfirm(event) {
    if (event) {
      this.onClick();
    }
    this.showDialog = false;
  }

  onClick() {
    this.emailFormModel = {
      email: this.data.email,
      date: this.data.date,
      start: this.data.start,
      end: this.data.end,
      shortname: this.data.shortname,
      storename: this.data.storename,
      storeId: this.data.storeId,
      therapy: this.data.therapy,
      doctor: this.data.doctor,
      month: this.data.month,
      day: this.data.day,
      taskId: this.data.taskId,
      language: this.packLanguage.getLanguageForSendReminderViaEmail(),
      id: this.data.id,
      countryCode: this.data.countryCode,
    };
    this.service
      .sendReminderViaEmailManual(this.emailFormModel)
      .subscribe((data) => {
        if (data) {
          if (data["message"] === "need_config") {
            this.helpService.warningToastr(
              "",
              this.language.needToConfigurationParams
            );
          } else {
            this.helpService.successToastr(
              "",
              this.language.successSendEmailMessageText
            );
          }
        } else {
          this.helpService.errorToastr(
            "",
            this.language.errorSendEmailMessageText
          );
        }
      });
  }
}
