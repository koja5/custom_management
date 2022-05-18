import { Component, OnInit, ViewChild } from "@angular/core";
import { DynamicFormsComponent } from "src/app/component/dynamic-elements/dynamic-forms/dynamic-forms.component";
import { DynamicService } from "src/app/service/dynamic.service";
import { HelpService } from "src/app/service/help.service";
import { RemindersService } from "src/app/service/reminders.service";

@Component({
  selector: "app-reminders",
  templateUrl: "./reminders.component.html",
  styleUrls: ["./reminders.component.scss"],
})
export class RemindersComponent implements OnInit {
  @ViewChild(DynamicFormsComponent) form: DynamicFormsComponent;
  public configField: any;
  public language: any;
  public superadmin: string;
  public loading = true;
  public data: any;
  public changeData: any;
  public showDialog = false;

  constructor(
    private service: RemindersService,
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
      .getConfiguration("settings/permission", "reminders")
      .subscribe((config) => {
        this.configField = config;
        this.getData();
      });
  }

  getData() {
    this.service.getReminderSettings(this.superadmin).subscribe((data) => {
      if (data && data["length"]) {
        this.data = data[0];
      }
      this.packValue(this.data);
      this.loading = false;
    });
  }

  packValue(data) {
    this.loading = false;
    for (let i = 0; i < this.configField.length; i++) {
      if (data && data[this.configField[i].field]) {
        this.configField[i].value = true;
      } else {
        this.configField[i].value = false;
      }
    }
  }

  submitEmitter(event) {
    console.log(event);
    this.changeData = event;
    this.showDialog = true;
  }

  receiveConfirm(event) {
    if (event) {
      this.changeData.superadmin = this.superadmin;
      this.service.setReminderSettings(this.changeData).subscribe((data) => {
        console.log(data);
        if (data) {
          this.helpService.successToastr(
            "",
            this.language.successChangeReminderSettingsText
          );
        } else {
          this.helpService.errorToastr(
            "",
            this.language.errorChangeReminderSettingsText
          );
        }
      });
    }
    this.showDialog = false;
  }
}
