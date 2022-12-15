import { Component, OnInit } from "@angular/core";
import { HelpService } from "src/app/service/help.service";
import { LoginService } from "src/app/service/login.service";

@Component({
  selector: "app-right-of-withdrawal",
  templateUrl: "./right-of-withdrawal.component.html",
  styleUrls: ["./right-of-withdrawal.component.scss"],
})
export class RightOfWithdrawalComponent implements OnInit {
  public language: any;
  constructor(
    private helpService: HelpService,
    private service: LoginService
  ) {}

  ngOnInit() {
    if (this.helpService.getLanguage()) {
      this.language = this.helpService.getLanguage();
    } else {
      this.service
        .getTranslationByCountryCode(
          this.helpService.getSelectionLanguageCode()
            ? this.helpService.getSelectionLanguageCode()
            : this.helpService.getSelectionLanguage()
        )
        .subscribe((language) => {
          if (language !== null) {
            this.language = language["config"];
          }
        });
    }
  }
}
