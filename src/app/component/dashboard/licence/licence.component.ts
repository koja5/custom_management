import { Component, OnInit } from "@angular/core";
import { HelpService } from "src/app/service/help.service";
import { LicenceService } from "src/app/service/licence.service";

@Component({
  selector: "app-licence",
  templateUrl: "./licence.component.html",
  styleUrls: ["./licence.component.scss"],
})
export class LicenceComponent implements OnInit {
  public language: any;
  public licence: any;
  public diffDate: number;

  constructor(
    private helpService: HelpService,
    private licenceService: LicenceService
  ) {}

  ngOnInit() {
    this.language = this.helpService.getLanguage();
    this.getLicence();
  }

  getLicence() {
    this.licenceService
      .getStatusLicence(this.helpService.getSuperadmin())
      .subscribe((data: any) => {
        if (data && data.length) {
          this.licence = data[0];
          this.diffDate = this.calculateDiff(this.licence.expiration_date);
        }
      });
  }

  calculateDiff(data) {
    let date = new Date(data);
    let currentDate = new Date();

    let days = Math.floor(
      (date.getTime() - currentDate.getTime()) / 1000 / 60 / 60 / 24
    );
    return days;
  }
}
