import { Component, OnInit, ViewChild } from "@angular/core";
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
      this.dynamicService.callApiPost('/api/sendMassiveEmail', this.changeData).subscribe(
        data => {

        }
      );
    }
    this.showDialog = false;
  }
}
