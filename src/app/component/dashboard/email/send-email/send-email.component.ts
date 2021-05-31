import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { Modal } from "ngx-modal";
import { HelpService } from "src/app/service/help.service";
import { SendEmailService } from "src/app/service/send-email.service";

@Component({
  selector: "app-send-email",
  templateUrl: "./send-email.component.html",
  styleUrls: ["./send-email.component.scss"],
})
export class SendEmailComponent implements OnInit {
  @Input() email: string;
  @ViewChild("dialogSendEmailForm") dialogSendEmailForm: Modal;
  public language: any;
  public subject: string;
  public content: string;
  public showDialog = false;

  constructor(
    private helpService: HelpService,
    private service: SendEmailService
  ) {}

  ngOnInit() {
    this.language = this.helpService.getLanguage();
  }

  sendEmail() {
    const data = {
      email: this.email,
      subject: this.subject,
      content: this.content,
    };
    this.dialogSendEmailForm.close();
    this.service.sendEmailToPatient(data).subscribe((data) => {
      if(data) {
        this.helpService.successToastr("", this.language.successSendEmailMessageText);
      } else {
        this.helpService.errorToastr("", this.language.errorSendEmailMessageText);
      }
    });
  }
}
