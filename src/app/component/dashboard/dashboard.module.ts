import { ChooseHolidayComponent } from './parameters/choose-holiday/choose-holiday.component';
import { ToolbarModule } from '@syncfusion/ej2-angular-navigations';
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
import { ThemeColorsComponent } from "./parameters/theme-colors/theme-colors.component"
import { EventCategoryComponent } from "./parameters/event-category/event-category.component";
import { EditTranslationComponent } from "./translation/edit-translation/edit-translation.component";
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
import { SharedEmailModule } from "../shared-module/shared-email-module";
import { SharedSMSModule } from "../shared-module/shared-sms-module";
import { SystemErrorComponent } from "./administrator/system-logs/system-error/system-error.component";
import { SystemInfoComponent } from "./administrator/system-logs/system-info/system-info.component";
import { SystemWarnComponent } from "./administrator/system-logs/system-warn/system-warn.component";
import { AvailableAreaCodeComponent } from "./administrator/available-area-code/available-area-code.component";
import { TemplateAccountComponent } from "./administrator/template-account/template-account.component";
import { MailReminderComponent } from "./parameters/mail-reminder/mail-reminder.component";
import { SmsReminderComponent } from "./parameters/sms-reminder/sms-reminder.component";
import { MailConfirmArrivalComponent } from "./parameters/mail-parameters/mail-confirm-arrival/mail-confirm-arrival.component";
import { MailPatientFormRegistrationComponent } from "./parameters/mail-parameters/mail-patient-form-registration/mail-patient-form-registration.component";
import { MailPatientCreatedAccountComponent } from "./parameters/mail-parameters/mail-patient-created-account/mail-patient-created-account.component";
import { MailApproveReservationComponent } from "./parameters/mail-parameters/mail-approve-reservation/mail-approve-reservation.component";
import { MailDenyReservationComponent } from "./parameters/mail-parameters/mail-deny-reservation/mail-deny-reservation.component";
import { ChangeSuperadminProfileComponent } from "./parameters/change-superadmin-profile/change-superadmin-profile.component";
import { PermissionPatientMenuComponent } from "./settings/permission-patient-menu/permission-patient-menu.component";
import { EventCategoryStatisticComponent } from "./parameters/event-category-statistic/event-category-statistic.component";
import { UserAccessComponent } from "./parameters/user-access/user-access.component";
import { SmsCountComponent } from "./administrator/sms-count/sms-count.component";
import { MassiveEmailComponent } from "./marketing/massive-email/massive-email.component";
import { MassiveSmsComponent } from "./marketing/massive-sms/massive-sms.component";
import { MailMassiveEmailComponent } from "./parameters/mail-parameters/mail-massive-email/mail-massive-email.component";
import { SmsMassiveComponent } from "./parameters/sms-massive/sms-massive.component";
import { AddHolidayComponent } from "./administrator/add-holiday/add-holiday.component";
import { MailMultipleRecepientComponent } from './parameters/mail-parameters/mail-multiple-recepient/mail-multiple-recepient.component';
import {
  AgendaService,
  DayService,
  MonthAgendaService,
  MonthService,
  ScheduleModule,
  WeekService,
  WorkWeekService,
} from "@syncfusion/ej2-angular-schedule";
import { InvoiceComponent } from './invoice/invoice.component';
import { SmsBirthdayCongratulationComponent } from './parameters/sms-birthday-congratulation/sms-birthday-congratulation.component';
import { MailBirthdayCongratulationComponent } from './parameters/mail-birthday-congratulation/mail-birthday-congratulation.component';
import { MailPatientCreatedAccountViaFormComponent } from './parameters/mail-parameters/mail-patient-created-account-via-form/mail-patient-created-account-via-form.component';
import { ColorPickerModule } from '@syncfusion/ej2-angular-inputs';
import { HelpComponent } from './administrator/help/help.component';
import { TopicCardComponent } from './administrator/help/topic-card/topic-card.component';
import { MatFormFieldModule, MatInputModule } from "@angular/material";
import { ListFaqComponent } from './administrator/help/list-faq/list-faq.component';
import { MassiveUnsubscribeComponent } from './marketing/massive-unsubscribe/massive-unsubscribe.component';
import { RegisteredClinicsComponent } from './administrator/registered-clinics/registered-clinics.component';
import { RegisteredClinicDetailComponent } from './administrator/registered-clinics/registered-clinic-detail/registered-clinic-detail.component';
import { SharedComponentsModule } from 'src/app/shared/shared-components.module';
import { LastMinuteEventConfirmationComponent } from './customers/last-minute-event-confirmation/last-minute-event-confirmation.component';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { LicenceComponent } from './licence/licence.component';
import { MailResetPasswordComponent } from './parameters/mail-reset-password/mail-reset-password.component';

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
    ThemeColorsComponent,
    EventCategoryStatisticComponent,
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
    MailConfirmArrivalComponent,
    MailPatientFormRegistrationComponent,
    MailPatientCreatedAccountComponent,
    MailPatientCreatedAccountViaFormComponent,
    MailApproveReservationComponent,
    MailDenyReservationComponent,
    MailResetPasswordComponent,
    SmsReminderComponent,
    ChangeSuperadminProfileComponent,
    PermissionPatientMenuComponent,
    UserAccessComponent,
    SmsCountComponent,
    MassiveEmailComponent,
    MassiveSmsComponent,
    MailMassiveEmailComponent,
    SmsMassiveComponent,
    AddHolidayComponent,
    ChooseHolidayComponent,
    InvoiceComponent,
    SmsBirthdayCongratulationComponent,
    MailBirthdayCongratulationComponent,
    HelpComponent,
    TopicCardComponent,
    ListFaqComponent,
    RegisteredClinicsComponent,
    RegisteredClinicDetailComponent,
    MassiveUnsubscribeComponent,
    LicenceComponent,
    LastMinuteEventConfirmationComponent,
    MailMultipleRecepientComponent,
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
    ScheduleModule,
    ToolbarModule,
    ColorPickerModule,
    MatFormFieldModule,
    MatInputModule,
    SharedComponentsModule,
    DatePickerModule
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    },
    DayService,
    WeekService,
    WorkWeekService,
    MonthService,
    AgendaService,
    MonthAgendaService,
  ],
})
export class DashboardModule {}
