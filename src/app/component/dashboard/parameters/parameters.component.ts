import { Component, OnInit } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { FormGuardData } from "src/app/models/formGuard-data";
import { HelpService } from "src/app/service/help.service";

@Component({
  selector: "app-parameters",
  templateUrl: "./parameters.component.html",
  styleUrls: ["./parameters.component.scss"],
})
export class ParametersComponent implements OnInit, FormGuardData {
  public currentTab = "complaint";
  public language: any;
  showDialog = false;
  isFormDirty: boolean = false;
  isDataSaved$ = new Subject<boolean>();

  constructor(private helpService: HelpService) {}

  ngOnInit() {
    this.currentTab = window.location.pathname.split("/")[3];
    this.language = this.helpService.getLanguage();
    this.helpService.setTitleForBrowserTab(this.language.parameters);
  }

  changeTab(tab) {
    this.currentTab = tab;
  }

  getIsFormDirty(event: boolean): void {
    this.isFormDirty = event;
  }

  receiveConfirm(event: boolean): void {
    if (event) {
      this.isFormDirty = false;
    }
    this.showDialog = false;
    this.isDataSaved$.next(event);
  }

  openConfirmModal(): void {
    this.showDialog = true;
  }
}
