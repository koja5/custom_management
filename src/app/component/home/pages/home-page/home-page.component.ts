import { Component, HostListener, OnInit } from "@angular/core";
import { HelpService } from "src/app/service/help.service";
import { LoginService } from "src/app/service/login.service";

@Component({
  selector: "app-home-page",
  templateUrl: "./home-page.component.html",
  styleUrls: ["./home-page.component.scss"],
})
export class HomePageComponent implements OnInit {
  public isMobile = false;
  public language: any;

  constructor(
    private helpService: HelpService,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.isMobile = this.helpService.checkMobileDevice();
    this.initializationLanguage();
  }

  @HostListener("window:resize", ["$event"])
  onResize() {
    this.isMobile = this.helpService.checkMobileDevice();
  }

  sendEventForChangeLanguage(event: any) {
    this.language = this.helpService.getLanguageForLanding();
  }

  initializationLanguage() {
    this.loginService.checkCountryLocation().subscribe(
      (data: any) => {
        if (data.countryCode !== this.helpService.getSelectionLangauge()) {
          this.helpService.getAllLangs().subscribe((langs) => {
            this.setLanguageByLocation(data.countryCode, langs);
          });
        } else {
          this.language = this.helpService.getLanguageForLanding();
        }
      },
      (error: any) => {
        this.getLanguageByCode("english", "EN");
      }
    );
  }

  setLanguageByLocation(code: any, langs: any) {
    for (let i = 0; i < langs.length; i++) {
      for (let j = 0; j < langs[i].similarCode.length; j++) {
        if (langs[i].similarCode[j] === code) {
          this.getLanguageByCode(langs[i].name, code);
          break;
        }
      }
    }
  }

  getLanguageByCode(language: string, code: string) {
    this.loginService.getLanguageForLanding(language).subscribe((data) => {
      this.helpService.setLanguageForLanding(data);
      this.helpService.setSelectionLanguage(code);
      this.language = this.helpService.getLanguageForLanding();
    });
  }
}
