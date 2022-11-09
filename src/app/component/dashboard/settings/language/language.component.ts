import { Component, OnInit } from "@angular/core";
import { DynamicService } from "src/app/service/dynamic.service";
import { HelpService } from "src/app/service/help.service";
import { MessageService } from "src/app/service/message.service";

@Component({
  selector: "app-language",
  templateUrl: "./language.component.html",
  styleUrls: ["./language.component.scss"],
})
export class LanguageComponent implements OnInit {
  private activeLanguages: any[] = [];
  public fields: Object = {
    text: "language",
    value: "countryCode",
  };
  public height: string = "400px";
  public value: any;
  public loading = false;
  public language: any;
  public selectedLanguage: any;

  constructor(
    private helpService: HelpService,
    private dynamicService: DynamicService,
    private message: MessageService
  ) {
    this.language = this.helpService.getLanguage();
  }

  ngOnInit() {
    this.checkDefaultLanguage();
    this.getAllLanguages();
  }

  checkDefaultLanguage() {
    var accountLanguage = this.helpService.getLocalStorage("accountLanguage");
    if (accountLanguage) {
      this.value = accountLanguage;
    } else {
      this.value = "US";
    }
  }

  getAllLanguages() {
    this.loading = true;
    this.dynamicService
      .callApiGet(
        "/api/getAllTranslationsByDemoAccount",
        this.helpService.getLocalStorage("demoAccountLanguage")
      )
      .subscribe((data: any[]) => {
        console.log(data);
        if(data) {
          this.activeLanguages = data.filter(l => l.active === true)
        }
        this.translateTextValue();
      });
  }

  translateTextValue() {
    const languageConfig = JSON.parse(
      this.helpService.getLocalStorage("language")
    );
    
    if (languageConfig && languageConfig["languages"] && languageConfig["languages"].length) {
      var languagesTranslationsArr: any[] = languageConfig["languages"]
      this.activeLanguages.forEach(activeLanguage => {
        var languageTranslationObj = 
          languagesTranslationsArr.find(
            t => t.countryCode == activeLanguage.countryCode
          );
        if(languageTranslationObj) {
          activeLanguage.language = languageTranslationObj.language;
        }
      });
    }
    this.loading = false;
  }

  changeLanguageEvent(event: any) {
    this.selectedLanguage = event.itemData;
  }

  saveLanguageConfig() {
    if (this.selectedLanguage) {
      this.loading = true;
      this.helpService.setLocalStorage(
        "accountLanguage",
        this.selectedLanguage.countryCode
      );
      this.helpService.setLocalStorage(
        "language",
        JSON.stringify(this.selectedLanguage.config)
      );
      const data = {
        user_id: this.helpService.getMe(),
        countryCode: this.selectedLanguage.countryCode,
      };
      this.dynamicService
        .callApiPost("/api/setLanguageForUser", data)
        .subscribe((data) => {
          if (data) {
            this.language = this.selectedLanguage.config;
            this.message.sendNewLanguage();
            this.helpService.successToastr(
              "",
              this.language.successChangeLanguageText
            );

            this.translateTextValue();
          } else {
            this.helpService.errorToastr(
              "",
              this.language.errorChangeLanguageText
            );
          }
          this.loading = false;
        });
    }
  }
}
