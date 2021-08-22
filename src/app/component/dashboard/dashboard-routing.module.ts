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
      { path: "customers", component: CustomersComponent },
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
        component: ParametersComponent,
      },
      { path: "therapy", component: ParametersComponent },
      {
        path: "treatment",
        component: ParametersComponent,
      },
      {
        path: "recommendation",
        component: ParametersComponent,
      },
      {
        path: "relationship",
        component: ParametersComponent,
      },
      { path: "social", component: ParametersComponent },
      { path: "doctor", component: ParametersComponent },
      { path: "doctors", component: ParametersComponent },
      { path: "vat_tax", component: ParametersComponent },
      { path: "CS", component: ParametersComponent },
      { path: "state", component: ParametersComponent },
      {
        path: "event-category",
        component: EventCategoryComponent,
      },
      {
        path: "work-time-colors",
        component: WorkTimeColorsComponent,
      },
      {
        path: "reminders",
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
          }
        ],
      },
      {
        path: "area-code",
        component: AvailableAreaCodeComponent
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
      { path: "template-account", component: TemplateAccountComponent }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRouting {}
