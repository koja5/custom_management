import { Component, OnInit } from "@angular/core";
import { ReqeustDemoAccount } from "src/app/models/request-demo-account";
import { DynamicService } from "src/app/service/dynamic.service";
import { HelpService } from "src/app/service/help.service";

@Component({
  selector: "app-request-demo",
  templateUrl: "./request-demo.component.html",
  styleUrls: ["./request-demo.component.scss"],
})
export class RequestDemoComponent implements OnInit {
  public language: any;
  public data = new ReqeustDemoAccount();
  public required = false;
  public success = false;

  constructor(
    private callApi: DynamicService,
    private helpService: HelpService
  ) {}

  ngOnInit(): void {
    this.language = this.helpService.getLanguageForLanding();
  }

  sendReqestForDemoAccount() {
    this.required = false;
    this.success = false;
    if (
      !this.data.name ||
      !this.data.email ||
      !this.data.phone ||
      !this.data.nameOfKindergarden ||
      !this.data.countOfChildrens
    ) {
      this.required = true;
    } else {
      this.callApi
        .callApiPost("/api/sendReqestForDemoAccountFull", this.data)
        .subscribe((data) => {
          if (data) {
            this.success = true;
            this.data = new ReqeustDemoAccount();
          }
        });
    }
  }

  sendEventForChangeLanguage(event: any) {
    this.language = this.helpService.getLanguageForLanding();
  }
}
