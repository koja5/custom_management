import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { BaseDateComponent } from "../dashboard/task/base-date/base-date.component";

import { ButtonsModule } from "@progress/kendo-angular-buttons";
import { InputsModule } from "@progress/kendo-angular-inputs";
import { LayoutModule } from "@progress/kendo-angular-layout";
import { DateInputsModule } from "@progress/kendo-angular-dateinputs";
import { DropDownsModule } from "@progress/kendo-angular-dropdowns";
import { IntlModule } from "@progress/kendo-angular-intl";
import { DialogModule } from "@progress/kendo-angular-dialog";
import { DialogsModule } from "@progress/kendo-angular-dialog";
import { ModalModule } from "ngx-modal";
import { FileUploadModule } from "ng2-file-upload";
import { SendSmsComponent } from "../dashboard/sms/send-sms/send-sms.component";
import { SendEmailComponent } from "../dashboard/email/send-email/send-email.component";
import {
  GridModule,
  ExcelModule,
  PDFModule,
} from "@progress/kendo-angular-grid";

@NgModule({
  declarations: [BaseDateComponent, SendSmsComponent, SendEmailComponent],
  exports: [BaseDateComponent],
  imports: [
    CommonModule,
    ButtonsModule,
    InputsModule,
    LayoutModule,
    FormsModule,
    DateInputsModule,
    DropDownsModule,
    IntlModule,
    DialogModule,
    DialogsModule,
    GridModule,
    ModalModule,
    FileUploadModule,
    ExcelModule,
    PDFModule
  ],
  providers: [],
  bootstrap: [],
})
export class BaseDateSharedModule { }
