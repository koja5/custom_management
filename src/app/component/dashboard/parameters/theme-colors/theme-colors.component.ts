import { Component, OnInit } from "@angular/core";
import { ColorPickerEventArgs } from "@syncfusion/ej2-angular-inputs";
import { ToastrService } from "ngx-toastr";
import { HelpService } from "src/app/service/help.service";
import { ServiceHelperService } from "src/app/service/service-helper.service";
import { ThemeColorsService } from "src/app/service/theme-color.service";

interface Theme {
  id?: number;
  color: string;
  superadmin: number;
}

@Component({
  selector: "app-theme-colors",
  templateUrl: "./theme-colors.component.html",
  styleUrls: ["./theme-colors.component.scss"],
})
export class ThemeColorsComponent implements OnInit {
  colorValue: string;
  themeData: any;
  language: any;
  loading = true;

  constructor(
    private themeColorsService: ThemeColorsService,
    private serviceHelper: ServiceHelperService,
    private toastr: ToastrService,
    private helpService: HelpService
  ) {}

  ngOnInit() {
    this.language = JSON.parse(localStorage.getItem("language"));

    this.getThemeColor();
  }

  // function to handle the ColorPicker change event
  change(args: ColorPickerEventArgs): void {
    this.colorValue = args.currentValue.hex;
    this.themeData = {
      ...this.themeData,
      color: args.currentValue.hex,
      superadmin: localStorage.getItem("superadmin"),
    };
    this.themeData.color = args.currentValue.hex;
  }

  saveTheme() {
    if (this.themeData.id) {
      this.updateThemeColors();
    } else {
      this.createThemeColors();
    }
  }

  getThemeColor() {
    this.loading = true;

    this.themeColorsService
      .getThemeColors(localStorage.getItem("superadmin"))
      .subscribe((data: Theme[]) => {
        if (data.length === 0) {
          this.colorValue = getComputedStyle(document.documentElement)
            .getPropertyValue("--theme-color")
            .trim();
        } else {
          this.colorValue = data[0].color;
          this.themeData = data[0];
          this.themeColorsService.setThemeColors(data[0]);
        }
        this.helpService.setLocalStorage("themeColors", JSON.stringify(data));

        this.loading = false;
      });
  }

  createThemeColors() {
    this.loading = true;
    this.themeColorsService
      .createThemeColors(this.themeData)
      .subscribe((data) => {
        this.getThemeColor();
        if (data) {
          this.toastr.success(
            this.language.successTitle,
            this.language.successThemeSaved,
            { timeOut: 7000, positionClass: "toast-bottom-right" }
          );
        } else {
          this.toastr.error(
            this.language.errorTitle,
            this.language.errorTextAdd,
            { timeOut: 7000, positionClass: "toast-bottom-right" }
          );
        }
        this.loading = false;
      });
  }

  updateThemeColors() {
    this.loading = true;
    let data = {
      color: this.colorValue,
      superadmin: localStorage.getItem("superadmin"),
    };
    this.themeColorsService
      .updateThemeColors(this.themeData)

      .subscribe((data) => {
        if (data) {
          this.getThemeColor();
          this.toastr.success(
            this.language.successTitle,
            this.language.successThemeEdit,
            { timeOut: 7000, positionClass: "toast-bottom-right" }
          );
        } else {
          this.toastr.error(
            this.language.errorTitle,
            this.language.errorTextEdit,
            { timeOut: 7000, positionClass: "toast-bottom-right" }
          );
        }
      });
    this.loading = false;
  }
}
