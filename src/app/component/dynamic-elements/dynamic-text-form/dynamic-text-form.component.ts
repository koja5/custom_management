import { Component, Input, OnInit } from "@angular/core";
import { HelpService } from "src/app/service/help.service";

@Component({
  selector: "app-dynamic-text-form",
  templateUrl: "./dynamic-text-form.component.html",
  styleUrls: ["./dynamic-text-form.component.scss"],
})
export class DynamicTextFormComponent implements OnInit {
  @Input() type!: string;
  public language: any;
  public landingLanguage: any;

  constructor(private helpService: HelpService) {}

  ngOnInit(): void {
    if (this.helpService.getSelectionLanguage()) {
      this.initializeLanguage(this.helpService.getSelectionLanguage());
    } else {
      const selectedLanguageCode = this.helpService.getSelectionLanguageCode();
      this.helpService.getAllLangs().subscribe((data: any) => {
        for (let i = 0; i < data.length; i++) {
          for (let j = 0; j < data[i].similarCode.length; j++) {
            if (data[i].similarCode[j] === selectedLanguageCode) {
              this.initializeLanguage(data[i].name);
              break;
            }
          }
        }
      });
    }
    this.helpService.getRealLanguageName().subscribe((selectionLanguage) => {
      this.initializeLanguage(selectionLanguage);
    });
  }

  initializeLanguage(selectionLanguage: any) {
    this.helpService
      .getLanguageFromFolder(this.type, selectionLanguage)
      .subscribe((data) => {
        this.language = data;
      });
    this.landingLanguage = this.helpService.getLanguageForLanding();
  }

  changeLanguage(event: string) {
    this.initializeLanguage(event);
  }

  sendEventForChangeLanguage(event: any) {
    const selectionLanguage = this.helpService.getSelectionLanguage();
    this.initializeLanguage(selectionLanguage);
  }
}
