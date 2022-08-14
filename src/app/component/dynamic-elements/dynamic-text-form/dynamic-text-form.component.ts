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

  constructor(private helpService: HelpService) {}

  ngOnInit(): void {
    const selectionLanguage = this.helpService.getSelectionLanguage();
    this.initializeLanguage(selectionLanguage);
  }

  initializeLanguage(selectionLanguage: any) {
    this.helpService
      .getLanguageFromFolder(this.type, selectionLanguage)
      .subscribe((data) => {
        this.language = data;
      });
  }

  changeLanguage(event: string) {
    this.initializeLanguage(event);
  }
}
