import { Component, OnInit } from "@angular/core";
import { ColorPickerEventArgs } from "@syncfusion/ej2-angular-inputs";
import { ToastrService } from "ngx-toastr";
import { Subject } from "rxjs";
import { FormGuardData } from "src/app/models/formGuard-data";
import { HelpService } from "src/app/service/help.service";
import { ServiceHelperService } from "src/app/service/service-helper.service";
import { ThemeColorsService } from "src/app/service/theme-color.service";

interface Theme {
  id?: number;
  color?: string;
  fontColor?: string;
  selectedColor?: string;
  groupColor?: string;
  navbarColor?: string;
  navbarFontColor?: string;
  superadmin: number;
}

@Component({
  selector: "app-theme-colors",
  templateUrl: "./theme-colors.component.html",
  styleUrls: ["./theme-colors.component.scss"],
})
export class ThemeColorsComponent implements OnInit, FormGuardData {
  sidebarBackgroundColorValue: string;
  sidebarFontColorValue: string;
  sidebarGroupColorValue: string;
  sidebarSelectedColorValue: string;
  navbarBackgroundColorValue: string;
  navbarFontColorValue: string;
  themeData: any;
  language: any;
  loading = true;
  isFormDirty: boolean = false;
  isDataSaved$: Subject<boolean> = new Subject<boolean>();
  showDialog: boolean = false;
  public colorTypes = {
    sidebarBackgroundColor: 'Sidebar Background Color',
    sidebarFontColor: 'Sidebar Font Color',
    sidebarGroupColor: 'Sidebar Group Color',
    sidebarSelectedColor: 'Sidebar Selected Color',
    navbarBackgroundColor: 'Navbar Background Color',
    navbarFontColor: 'Navbar Font Color',
  }

  constructor(
    private themeColorsService: ThemeColorsService,
    private serviceHelper: ServiceHelperService,
    private toastr: ToastrService,
    private helpService: HelpService
  ) {}

  ngOnInit() {
    this.language = JSON.parse(localStorage.getItem("language"));

    this.getThemeColors();
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

  // function to handle the ColorPicker change event
  changeColor(value: ColorPickerEventArgs, type: string): void {
    this.isFormDirty = true;
    if (type === this.colorTypes.sidebarBackgroundColor) {
      this.sidebarBackgroundColorValue = value.currentValue.hex;
    }
    if (type === this.colorTypes.sidebarFontColor) {
      this.sidebarFontColorValue = value.currentValue.hex;
    }
    if (type === this.colorTypes.sidebarGroupColor) {
      this.sidebarGroupColorValue = value.currentValue.hex;
    }
    if (type === this.colorTypes.sidebarSelectedColor) {
      this.sidebarSelectedColorValue = value.currentValue.hex;
    }
    if (type === this.colorTypes.navbarBackgroundColor) {
      this.navbarBackgroundColorValue = value.currentValue.hex;
    }
    if (type === this.colorTypes.navbarFontColor) {
      this.navbarFontColorValue = value.currentValue.hex;
    }
    
    this.themeData = {
      ...this.themeData,
      color: this.sidebarBackgroundColorValue,
      fontColor: this.sidebarFontColorValue,
      groupColor: this.sidebarGroupColorValue,
      selectedColor: this.sidebarSelectedColorValue,
      navbarColor: this.navbarBackgroundColorValue,
      navbarFontColor: this.navbarFontColorValue,
      superadmin: localStorage.getItem("superadmin"),
    };
  }

  saveTheme() {
    this.isFormDirty = false;
    if (this.themeData.id) {
      this.updateThemeColors();
    } else {
      this.createThemeColors();
    }
  }

  resetToDefaultColors() {
    this.isFormDirty = false;
    this.themeData = {
      ...this.themeData,
      color: '#091467',
      fontColor: '#e3e3e3',
      groupColor: '#8f96ad',
      selectedColor: '#01a9e9',
      navbarColor: '#fff',
      navbarFontColor: '#333',
      superadmin: localStorage.getItem("superadmin"),
    }
    this.updateThemeColors();
  }

  getThemeColors() {
    this.loading = true;

    this.themeColorsService
      .getThemeColors(localStorage.getItem("superadmin"))
      .subscribe((data: Theme[]) => {
        if (!data.length) {
          this.sidebarBackgroundColorValue = getComputedStyle(document.documentElement)
            .getPropertyValue("--theme-color")
            .trim();
          this.sidebarFontColorValue = getComputedStyle(document.documentElement)
          .getPropertyValue("--sidebar-font-color")
          .trim();
          this.sidebarSelectedColorValue = getComputedStyle(document.documentElement)
          .getPropertyValue("--sidebar-selected-color")
          .trim();
          this.sidebarGroupColorValue = getComputedStyle(document.documentElement)
          .getPropertyValue("--sidebar-group-color")
          .trim();
          this.navbarBackgroundColorValue = getComputedStyle(document.documentElement)
          .getPropertyValue("--navbar-background-color")
          .trim();
          this.navbarFontColorValue = getComputedStyle(document.documentElement)
          .getPropertyValue("--navbar-font-color")
          .trim();
        } else {
          this.sidebarBackgroundColorValue = data[0].color;
          this.sidebarFontColorValue = data[0].fontColor;
          this.sidebarSelectedColorValue = data[0].selectedColor;
          this.sidebarGroupColorValue = data[0].groupColor;
          this.navbarBackgroundColorValue = data[0].navbarColor;
          this.navbarFontColorValue = data[0].navbarFontColor;
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
        this.getThemeColors();
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
    this.themeColorsService
      .updateThemeColors(this.themeData)
      .subscribe((data) => {
        if (data) {
          this.getThemeColors();
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
