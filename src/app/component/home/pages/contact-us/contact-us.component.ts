import { Component, OnInit } from "@angular/core";
import { ReqeustDemoAccount } from "src/app/models/request-demo-account";
import { DynamicService } from "src/app/service/dynamic.service";
import { HelpService } from "src/app/service/help.service";

@Component({
  selector: "app-contact-us",
  templateUrl: "./contact-us.component.html",
  styleUrls: ["./contact-us.component.scss"],
})
export class ContactUsComponent implements OnInit {
  public form = new ReqeustDemoAccount();
  public status = -1;
  public language: any;

  constructor(
    private callApi: DynamicService,
    private helpService: HelpService
  ) {}

  ngOnInit(): void {
    this.language = this.helpService.getLanguageForLanding();
  }

  submitForm() {
    this.status = -1;
    if (
      !this.form.firstname ||
      !this.form.phone ||
      !this.form.email ||
      !this.form.message
    ) {
      this.status = 0;
    } else {
      this.callApi
        .callApiPost("/api/sendFromContactForm", this.form)
        .subscribe((data) => {
          if (data) {
            this.status = 1;
            this.form = new ReqeustDemoAccount();
          } else {
            this.status = 0;
          }
        });
    }
  }

  sendEventForChangeLanguage(event: any) {
    this.language = this.helpService.getLanguageForLanding();
  }
}
