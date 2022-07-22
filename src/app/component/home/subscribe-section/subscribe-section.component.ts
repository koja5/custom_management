import { Component, Input, OnInit } from "@angular/core";
import { DynamicService } from "src/app/service/dynamic.service";
import { HelpService } from "src/app/service/help.service";

@Component({
  selector: "app-subscribe-section",
  templateUrl: "./subscribe-section.component.html",
  styleUrls: ["./subscribe-section.component.scss"],
})
export class SubscribeSectionComponent implements OnInit {
  @Input() language: any;
  public email!: string;

  constructor(
    private callApi: DynamicService,
    private helpService: HelpService
  ) {}

  ngOnInit(): void {}

  sendForDemoAccount() {
    console.log(this.email);
    const body = {
      email: this.email,
    };
    this.callApi
      .callApiPost("api/sendRequestForDemoAccount", body)
      .subscribe((data) => {
        this.helpService.successToastr(
          this.language.successExecutedActionTitle,
          this.language.successExecutedActionText
        );
      });
  }
}
