import { Component, OnInit, ViewChild } from "@angular/core";
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
  public configField: any;
  public language: any;
  public superadmin: string;
  public loading = true;
  public data: any;
  public changeData: any;
  public showDialog = false;

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
    console.log(event);
    this.changeData = event;
    this.showDialog = true;
  }

  receiveConfirm(event) {
    if (event) {
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
    }
    this.showDialog = false;
  }
}
