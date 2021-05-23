import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Modal } from 'ngx-modal';
import { HelpService } from 'src/app/service/help.service';
import { SendSmsService } from 'src/app/service/send-sms.service';

@Component({
  selector: 'app-send-sms',
  templateUrl: './send-sms.component.html',
  styleUrls: ['./send-sms.component.scss']
})
export class SendSmsComponent implements OnInit {

  @Input() phoneNumber: string;
  @ViewChild("dialogSendSMSForm") dialogSendSMSForm: Modal;
  public language: any;
  public message: any;
  public showDialog = false;

  constructor(private service: SendSmsService, private helpService: HelpService) { }

  ngOnInit() {
    this.language = this.helpService.getLanguage();
    this.fixPhoneNumberFormat();
  }

  fixPhoneNumberFormat() {
    this.phoneNumber = this.phoneNumber.replace("/", "");
    this.phoneNumber = this.phoneNumber.replace("-", "");
    return this.phoneNumber;
  }

  sendSMSMessage(sms) {
    const data = {
      number: this.phoneNumber,
      message: this.message
    };
    this.service.sendSMSMessage(data).subscribe(data => {
      console.log(data);
      // this.dialogSendSMSForm = false;
      this.message = '';
      this.dialogSendSMSForm.close();
      if(data) {
        this.helpService.successToastr('', this.language.successSendSMSMessageText);
      } else {
        this.helpService.errorToastr('', this.language.errorSendSMSMessageText);
      }
    });
  }

}
