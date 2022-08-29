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
  public data: any;
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
    if (this.helpService.getLocalStorage("accountLanguage")) {
      this.value = this.helpService.getLocalStorage("accountLanguage");
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
      .subscribe((data) => {
        console.log(data);
        this.data = data;
        this.translateTextValue();
      });
    // if (this.helpService.getLocalStorage("demoAccountLanguage")) {
    //   this.dynamicService.callApiGet("/api/getAllTranslationForDemoAccount", this.helpService.getLocalStorage("demoAccountLanguage")).subscribe(
    //     data => {
    //       this.data = data;
    //       this.translateTextValue();
    //     }
    //   )
    // } else {
    //   this.dynamicService
    //     .callApiGet("/api/getTranslation", this.helpService.getLocalStorage("demoAccountLanguage"))
    //     .subscribe((data) => {
    //       console.log(data);
    //       this.data = data;
    //       this.translateTextValue();
    //     });
    // }
  }

  translateTextValue() {
    const languageConfig = JSON.parse(
      this.helpService.getLocalStorage("language")
    );
    if (languageConfig) {
      for (let i = 0; i < this.data.length; i++) {
        for (let j = 0; j < languageConfig["languages"].length; j++) {
          if (
            this.data[i].countryCode ===
            languageConfig["languages"][j].countryCode
          ) {
            this.data[i].language = languageConfig["languages"][j].language;
            break;
          }
        }
      }
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
