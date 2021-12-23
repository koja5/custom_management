import { Component, Input, OnInit } from "@angular/core";
import { SmsFormModel } from "src/app/models/sms-form-model";
import { HelpService } from "src/app/service/help.service";
import { SendSmsService } from "src/app/service/send-sms.service";

@Component({
  selector: "app-dynamic-send-sms",
  templateUrl: "./dynamic-send-sms.component.html",
  styleUrls: ["./dynamic-send-sms.component.scss"],
})
export class DynamicSendSmsComponent implements OnInit {
  @Input() data: any;
  @Input() buttonTitle: string;
  @Input() buttonClass: string;
  @Input() buttonIcon: string;
  public smsFormModel = new SmsFormModel();
  public language: any;

  constructor(
    private service: SendSmsService,
    private helpService: HelpService
  ) {}

  ngOnInit() {
    this.language = this.helpService.getLanguage();
  }

  onClick(event) {
    this.service.sendSMSMessage(this.data).subscribe((data) => {
      if (data) {
        if (data["message"] === "buy_sms") {
          this.helpService.warningToastr("", this.language.needToBuySms);
        } else {
          this.helpService.successToastr(
            "",
            this.language.successSendSMSMessageText
          );
        }
      } else {
        this.helpService.errorToastr("", this.language.errorSendSMSMessageText);
      }
    });
  }
}
