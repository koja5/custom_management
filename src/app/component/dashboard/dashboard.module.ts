import { NgModule } from "@angular/core";
import { DashboardRouting } from "./dashboard-routing.module";
import { CommonModule } from "@angular/common";
import { MaterialDesignFrameworkModule } from "angular6-json-schema-form";
import { TranslationComponent } from "./translation/translation.component";

import { MatCardModule, MatToolbarModule } from "@angular/material";
import { CustomGridComponent } from "./custom-grid/custom-grid.component";
import {
  GridModule,
  ExcelModule,
  PDFModule,
} from "@progress/kendo-angular-grid";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { InputsModule } from "@progress/kendo-angular-inputs";
import { DateInputsModule } from "@progress/kendo-angular-dateinputs";
import { DropDownsModule } from "@progress/kendo-angular-dropdowns";
import { IntlModule } from "@progress/kendo-angular-intl";
import { DialogModule } from "@progress/kendo-angular-dialog";
import { DialogsModule } from "@progress/kendo-angular-dialog";
import { ButtonsModule } from "@progress/kendo-angular-buttons";
import { DashboardComponent } from "./dashboard.component";
import {
  PerfectScrollbarModule,
  PERFECT_SCROLLBAR_CONFIG,
  PerfectScrollbarConfigInterface,
} from "ngx-perfect-scrollbar";
import { ModalModule } from "ngx-modal";
import { SplitterModule, LayoutModule } from "@progress/kendo-angular-layout";
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
};
import { ParametersComponent } from "./parameters/parameters.component";
import { ParameterItemComponent } from "./parameters/parameter-item/parameter-item.component";
import { StatisticComponent } from "./statistic/statistic.component";
import { VaucherComponent } from "./vaucher/vaucher.component";
import { UsersComponent } from "./users/users.component";
import { StoreComponent } from "./store/store.component";
import { ProfileComponent } from "./profile/profile.component";
import { CustomersComponent } from "./customers/customers.component";
import { WorkTimeColorsComponent } from "./parameters/work-time-colors/work-time-colors.component";
import { UserDetailsComponent } from "./users/user-details/user-details.component";
import { TaskComponent } from "./task/task.component";
import { SettingsComponent } from "./settings/settings.component";
import { EventCategoryComponent } from "./parameters/event-category/event-category.component";
import { EditTranslationComponent } from "./translation/edit-translation/edit-translation.component";
import { BaseDateComponent } from "./task/base-date/base-date.component";
import { UploadModule } from "@progress/kendo-angular-upload";
import { FileUploadModule } from "ng2-file-upload";
import {
  SchedulerModule,
  PDFModule as SchedulerPDFModule,
} from "@progress/kendo-angular-scheduler";
import { DocumentPreviewComponent } from "./document-preview/document-preview.component";
import { MyNavigationViewComponent } from "./task/my-navigation-view";
import { MyNavigationComponent } from "./task/my-navigation";
import { PdfViewerModule } from "ng2-pdf-viewer";
import { SharedModule } from "src/app/shared.module";
import { TodoComponent } from "./administrator/todo/todo.component";
import { DymanicElementsModule } from "../dynamic-elements/dymanic-elements.module";
import { DialogModule as DialogModuleSyncfusion } from "@syncfusion/ej2-angular-popups";
import { BaseDateSharedModule } from "../shared-module/base-date-module";
import { MyComplaintComponent } from "./patient/my-complaint/my-complaint.component";
import { MyTherapyComponent } from "./patient/my-therapy/my-therapy.component";
import { MyDocumentComponent } from "./patient/my-document/my-document.component";
import { SettingsModule } from "./settings/settings.module";
import { DropDownListModule } from "@syncfusion/ej2-angular-dropdowns";
import { ReservationsComponent } from "./reservations/reservations.component";
import { DynamicSendSmsComponent } from "./sms/dynamic-send-sms/dynamic-send-sms.component";
import { SharedEmailModule } from "../shared-module/shared-email-module";
import { SharedSMSModule } from "../shared-module/shared-sms-module";
import { SystemErrorComponent } from "./administrator/system-logs/system-error/system-error.component";
import { SystemInfoComponent } from "./administrator/system-logs/system-info/system-info.component";
import { SystemWarnComponent } from "./administrator/system-logs/system-warn/system-warn.component";
import { AvailableAreaCodeComponent } from "./administrator/available-area-code/available-area-code.component";
import { TemplateAccountComponent } from './administrator/template-account/template-account.component';
import { MailReminderComponent } from "./parameters/mail-reminder/mail-reminder.component";
import { SmsReminderComponent } from "./parameters/sms-reminder/sms-reminder.component";

@NgModule({
  declarations: [
    DashboardComponent,
    TaskComponent,
    UsersComponent,
    StoreComponent,
    ProfileComponent,
    CustomersComponent,
    DocumentPreviewComponent,
    UserDetailsComponent,
    ParametersComponent,
    ParameterItemComponent,
    MyNavigationComponent,
    MyNavigationViewComponent,
    StatisticComponent,
    VaucherComponent,
    EventCategoryComponent,
    WorkTimeColorsComponent,
    TranslationComponent,
    EditTranslationComponent,
    CustomGridComponent,
    TodoComponent,
    MyComplaintComponent,
    MyTherapyComponent,
    MyDocumentComponent,
    ReservationsComponent,
    SystemErrorComponent,
    SystemInfoComponent,
    SystemWarnComponent,
    AvailableAreaCodeComponent,
    TemplateAccountComponent,
    MailReminderComponent,
    SmsReminderComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DashboardRouting,
    MatCardModule,
    MatToolbarModule,
    GridModule,
    InputsModule,
    IntlModule,
    SchedulerModule,
    SchedulerPDFModule,
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
    UploadModule,
    FileUploadModule,
    PdfViewerModule,
    SharedModule,
    DymanicElementsModule,
    DialogModuleSyncfusion,
    BaseDateSharedModule,
    SettingsModule,
    DropDownListModule,
    SharedEmailModule,
    SharedSMSModule,
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    }
  ],
})
export class DashboardModule {}
