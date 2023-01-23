import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { MaterialDesignFrameworkModule } from 'angular6-json-schema-form';

import { MatCardModule, MatToolbarModule } from "@angular/material";
import {
  GridModule,
  ExcelModule,
  PDFModule,
} from "@progress/kendo-angular-grid";
import { FormsModule } from "@angular/forms";
import { InputsModule } from "@progress/kendo-angular-inputs";
import { DateInputsModule } from "@progress/kendo-angular-dateinputs";
import { DropDownsModule } from "@progress/kendo-angular-dropdowns";
import { IntlModule } from "@progress/kendo-angular-intl";
import { DialogModule } from "@progress/kendo-angular-dialog";
import { DialogsModule } from "@progress/kendo-angular-dialog";
import { ButtonsModule } from "@progress/kendo-angular-buttons";
import {
  PerfectScrollbarModule,
  PERFECT_SCROLLBAR_CONFIG,
  PerfectScrollbarConfigInterface,
} from "ngx-perfect-scrollbar";
import { ModalModule } from "ngx-modal";
import { SplitterModule, LayoutModule } from "@progress/kendo-angular-layout";
import { ParametersRouting } from './parameters-routing';
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
};
import { SharedComponentsModule } from "src/app/shared/shared-components.module";

@NgModule({
  imports: [
    CommonModule,
    ParametersRouting,
    MatCardModule,
    MatToolbarModule,
    GridModule,
    FormsModule,
    InputsModule,
    IntlModule,
    DropDownsModule,
    DialogModule,
    ExcelModule,
    PDFModule,
    DialogsModule,
    DateInputsModule,
    ButtonsModule,
    MaterialDesignFrameworkModule,
    PerfectScrollbarModule,
    ModalModule,
    LayoutModule,
    SplitterModule,
    SharedComponentsModule
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    },
  ],
  declarations: [],
})
export class ParametersModule { }
