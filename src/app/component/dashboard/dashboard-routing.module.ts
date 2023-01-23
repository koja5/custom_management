import { AddHolidayComponent } from "./administrator/add-holiday/add-holiday.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { DashboardComponent } from "./dashboard.component";
import { ParametersComponent } from "./parameters/parameters.component";
import { StatisticComponent } from "./statistic/statistic.component";
import { VaucherComponent } from "./vaucher/vaucher.component";
import { UsersComponent } from "./users/users.component";
import { StoreComponent } from "./store/store.component";
import { ProfileComponent } from "./profile/profile.component";
import { CustomersComponent } from "./customers/customers.component";
import { TranslationComponent } from "./translation/translation.component";
import { EditTranslationComponent } from "./translation/edit-translation/edit-translation.component";
import { WorkTimeColorsComponent } from "./parameters/work-time-colors/work-time-colors.component";
import { UserDetailsComponent } from "./users/user-details/user-details.component";
import { SettingsComponent } from "./settings/settings.component";
import { EventCategoryComponent } from "./parameters/event-category/event-category.component";
import { TodoComponent } from "./administrator/todo/todo.component";
import { DynamicSchedulerComponent } from "../dynamic-elements/dynamic-scheduler/dynamic-scheduler.component";
import { MyComplaintComponent } from "./patient/my-complaint/my-complaint.component";
import { MyTherapyComponent } from "./patient/my-therapy/my-therapy.component";
import { MyDocumentComponent } from "./patient/my-document/my-document.component";
import { ReservationsComponent } from "./reservations/reservations.component";
import { RemindersComponent } from "./settings/reminders/reminders.component";
import { SystemErrorComponent } from "./administrator/system-logs/system-error/system-error.component";
import { SystemInfoComponent } from "./administrator/system-logs/system-info/system-info.component";
import { SystemWarnComponent } from "./administrator/system-logs/system-warn/system-warn.component";
import { AvailableAreaCodeComponent } from "./administrator/available-area-code/available-area-code.component";
import { TemplateAccountComponent } from "./administrator/template-account/template-account.component";
import { MailReminderComponent } from "./parameters/mail-reminder/mail-reminder.component";
import { SmsReminderComponent } from "./parameters/sms-reminder/sms-reminder.component";
import { MailConfirmArrivalComponent } from "./parameters/mail-parameters/mail-confirm-arrival/mail-confirm-arrival.component";
import { MailPatientFormRegistrationComponent } from "./parameters/mail-parameters/mail-patient-form-registration/mail-patient-form-registration.component";
import { MailApproveReservationComponent } from "./parameters/mail-parameters/mail-approve-reservation/mail-approve-reservation.component";
import { MailDenyReservationComponent } from "./parameters/mail-parameters/mail-deny-reservation/mail-deny-reservation.component";
import { MailPatientCreatedAccountComponent } from "./parameters/mail-parameters/mail-patient-created-account/mail-patient-created-account.component";
import { ChangeSuperadminProfileComponent } from "./parameters/change-superadmin-profile/change-superadmin-profile.component";
import { PermissionPatientMenuComponent } from "./settings/permission-patient-menu/permission-patient-menu.component";
import { EventCategoryStatisticComponent } from "./parameters/event-category-statistic/event-category-statistic.component";
import { UserAccessComponent } from "./parameters/user-access/user-access.component";
import { SmsCountComponent } from "./administrator/sms-count/sms-count.component";
import { MassiveSmsComponent } from "./marketing/massive-sms/massive-sms.component";
import { MassiveEmailComponent } from "./marketing/massive-email/massive-email.component";
import { MailMassiveEmailComponent } from "./parameters/mail-parameters/mail-massive-email/mail-massive-email.component";
import { SmsMassiveComponent } from "./parameters/sms-massive/sms-massive.component";
import { InvoiceComponent } from "./invoice/invoice.component";
import { SmsBirthdayCongratulationComponent } from "./parameters/sms-birthday-congratulation/sms-birthday-congratulation.component";
import { MailBirthdayCongratulationComponent } from "./parameters/mail-birthday-congratulation/mail-birthday-congratulation.component";
import { MailPatientCreatedAccountViaFormComponent } from "./parameters/mail-parameters/mail-patient-created-account-via-form/mail-patient-created-account-via-form.component";
import { ThemeColorsComponent } from "./parameters/theme-colors/theme-colors.component";
import { HelpComponent } from "./administrator/help/help.component";
import { ListFaqComponent } from "./administrator/help/list-faq/list-faq.component";

import { ChooseHolidayComponent } from "./parameters/choose-holiday/choose-holiday.component";
import { FormGuard } from "src/app/service/form-guard/formGuard";
import { RegisteredClinicsComponent } from "./administrator/registered-clinics/registered-clinics.component";
import { RegisteredClinicDetailComponent } from "./administrator/registered-clinics/registered-clinic-detail/registered-clinic-detail.component";
import { LastMinuteEventConfirmationComponent } from "./customers/last-minute-event-confirmation/last-minute-event-confirmation.component";
import { LicenceComponent } from "./licence/licence.component";
import { MailMultipleRecepientComponent } from "./parameters/mail-parameters/mail-multiple-recepient/mail-multiple-recepient.component";
import { MailResetPasswordComponent } from "./parameters/mail-reset-password/mail-reset-password.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full",
  },
  {
    path: "home",
    component: DashboardComponent,
    children: [
      { path: "", redirectTo: "task", pathMatch: "full" },
      /*{ path: "calendar", component: TaskComponent },*/
      { path: "task", component: DynamicSchedulerComponent },
      { path: "task/:storeId", component: DynamicSchedulerComponent },
      { path: "users", component: UsersComponent },
      {
        path: "user-details/:id",
        component: UserDetailsComponent,
      },
      { path: "store", component: StoreComponent },
      { path: "profile", component: ProfileComponent },
      {
        path: "customers",
        children: [
          { path: "", component: CustomersComponent },
          {
            path: "last-minute-event",
            component: LastMinuteEventConfirmationComponent,
          },
        ],
      },
      { path: "invoice", component: InvoiceComponent },
      {
        path: "parameters",
        component: ParametersComponent,
      },
      { path: "statistic", component: StatisticComponent },
      { path: "vaucher", component: VaucherComponent },
      {
        path: "settings",
        component: SettingsComponent,
        loadChildren: "./settings/settings.module#SettingsModule",
      },
      {
        path: "complaint",
        canDeactivate: [FormGuard],

        component: ParametersComponent,
      },
      {
        path: "therapy",
        canDeactivate: [FormGuard],
        component: ParametersComponent,
      },
      {
        path: "treatment",
        canDeactivate: [FormGuard],
        component: ParametersComponent,
      },
      {
        path: "recommendation",
        canDeactivate: [FormGuard],
        component: ParametersComponent,
      },
      {
        path: "relationship",
        canDeactivate: [FormGuard],
        component: ParametersComponent,
      },
      {
        path: "social",
        canDeactivate: [FormGuard],
        component: ParametersComponent,
      },
      {
        path: "doctor",
        canDeactivate: [FormGuard],
        component: ParametersComponent,
      },
      {
        path: "doctors",
        canDeactivate: [FormGuard],
        component: ParametersComponent,
      },
      {
        path: "vat_tax",
        canDeactivate: [FormGuard],
        component: ParametersComponent,
      },
      {
        path: "CS",
        canDeactivate: [FormGuard],
        component: ParametersComponent,
      },
      {
        path: "state",
        canDeactivate: [FormGuard],
        component: ParametersComponent,
      },

      {
        path: "theme-colors",
        canDeactivate: [FormGuard],
        component: ThemeColorsComponent,
      },
      {
        path: "event-category",
        component: EventCategoryComponent,
      },
      {
        path: "event-category-statistic",
        component: EventCategoryStatisticComponent,
      },
      {
        path: "work-time-colors",
        component: WorkTimeColorsComponent,
      },
      {
        path: "reminders",
        canDeactivate: [FormGuard],
        component: RemindersComponent,
      },
      {
        path: "translation",
        component: TranslationComponent,
      },
      { path: "translation/edit/:id", component: EditTranslationComponent },
      {
        path: "parameters",
        loadChildren: "./parameters/parameters.module#ParametersModule",
      },
      {
        path: "todo",
        component: TodoComponent,
      },
      {
        path: "system-logs",
        children: [
          { path: "", redirectTo: "error", pathMatch: "full" },
          { path: "error", component: SystemErrorComponent },
          {
            path: "info",
            component: SystemInfoComponent,
          },
          {
            path: "warn",
            component: SystemWarnComponent,
          },
        ],
      },
      {
        path: "area-code",
        component: AvailableAreaCodeComponent,
      },
      {
        path: "my-complaint",
        component: MyComplaintComponent,
      },
      {
        path: "my-therapy",
        component: MyTherapyComponent,
      },
      {
        path: "my-document",
        component: MyDocumentComponent,
      },
      { path: "reservations", component: ReservationsComponent },
      { path: "template-account", component: TemplateAccountComponent },
      { path: "add-holiday", component: AddHolidayComponent },
      { path: "define-holidays", component: ChooseHolidayComponent },
      { path: "registered-clinics", component: RegisteredClinicsComponent },
      {
        path: "registered-clinic-detail/:id",
        component: RegisteredClinicDetailComponent,
      },
      {
        path: "mail-reminder",
        canDeactivate: [FormGuard],
        component: MailReminderComponent,
      },
      {
        path: "mail-approve-reservation",
        canDeactivate: [FormGuard],
        component: MailApproveReservationComponent,
      },
      {
        path: "mail-deny-reservation",
        canDeactivate: [FormGuard],
        component: MailDenyReservationComponent,
      },
      {
        path: "mail-confirm-arrival",
        canDeactivate: [FormGuard],
        component: MailConfirmArrivalComponent,
      },
      {
        path: "mail-multiple-recepient",
        canDeactivate: [FormGuard],
        component: MailMultipleRecepientComponent,
      },
      {
        path: "mail-patient-created-account",
        canDeactivate: [FormGuard],
        component: MailPatientCreatedAccountComponent,
      },
      {
        path: "mail-patient-created-account-via-form",
        canDeactivate: [FormGuard],
        component: MailPatientCreatedAccountViaFormComponent,
      },
      {
        path: "mail-patient-form-registration",
        canDeactivate: [FormGuard],
        component: MailPatientFormRegistrationComponent,
      },
      {
        path: "mail-massive",
        canDeactivate: [FormGuard],
        component: MailMassiveEmailComponent,
      },
      {
        path: "mail-reset-password",
        canDeactivate: [FormGuard],
        component: MailResetPasswordComponent,
      },
      {
        path: "sms-reminder",
        canDeactivate: [FormGuard],
        component: SmsReminderComponent,
      },
      {
        path: "sms-massive",
        canDeactivate: [FormGuard],
        component: SmsMassiveComponent,
      },
      {
        path: "change-superadmin-profile",
        canDeactivate: [FormGuard],
        component: ChangeSuperadminProfileComponent,
      },
      {
        path: "permission-patient-menu",
        canDeactivate: [FormGuard],
        component: PermissionPatientMenuComponent,
      },
      {
        path: "user-access",
        component: UserAccessComponent,
      },
      {
        path: "sms-count",
        component: SmsCountComponent,
      },
      {
        path: "massive-sms",
        canDeactivate: [FormGuard],
        component: MassiveSmsComponent,
      },
      {
        path: "massive-email",
        canDeactivate: [FormGuard],
        component: MassiveEmailComponent,
      },
      {
        path: "sms-birthday-congratulation",
        canDeactivate: [FormGuard],
        component: SmsBirthdayCongratulationComponent,
      },
      {
        path: "mail-birthday-congratulation",
        canDeactivate: [FormGuard],
        component: MailBirthdayCongratulationComponent,
      },
      {
        path: "help",
        children: [
          { path: "", component: HelpComponent, pathMatch: "full" },
          { path: "faq/:id", component: ListFaqComponent },
        ],
      },
      {
        path: "licence",
        component: LicenceComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRouting {}
