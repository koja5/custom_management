import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { DashboardComponent } from "./dashboard.component";
import { ParametersComponent } from "./parameters/parameters.component";
import { ParameterItemComponent } from "./parameters/parameter-item/parameter-item.component";
import { StatisticComponent } from "./statistic/statistic.component";
import { VaucherComponent } from "./vaucher/vaucher.component";
import { UsersComponent } from "./users/users.component";
import { StoreComponent } from "./store/store.component";
import { ProfileComponent } from "./profile/profile.component";
import { CustomersComponent } from "./customers/customers.component";
import { TranslationComponent } from "./translation/translation.component";
import { EditTranslationComponent } from "./translation/edit-translation/edit-translation.component";
import { CustomGridComponent } from "./custom-grid/custom-grid.component";
import { WorkTimeColorsComponent } from "./parameters/work-time-colors/work-time-colors.component";
import { UserDetailsComponent } from "./users/user-details/user-details.component";
import { TaskComponent } from "./task/task.component";
import { SettingsComponent } from "./settings/settings.component";
import { EventCategoryComponent } from "./parameters/event-category/event-category.component";
import { TodoComponent } from "./administrator/todo/todo.component";
import { DynamicSchedulerComponent } from "../dynamic-elements/dynamic-scheduler/dynamic-scheduler.component";
import { MyComplaintComponent } from "./patient/my-complaint/my-complaint.component";
import { MyTherapyComponent } from "./patient/my-therapy/my-therapy.component";
import { MyDocumentComponent } from "./patient/my-document/my-document.component";
import { AccountComponent } from "./settings/account/account.component";
import { ChangePasswordComponent } from "./settings/change-password/change-password.component";
import { PermissionPatientMenuComponent } from "./settings/permission-patient-menu/permission-patient-menu.component";
import { ReservationsComponent } from "./reservations/reservations.component";
import { RemindersComponent } from "./settings/reminders/reminders.component";

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
        children: [
          { path: "", redirectTo: "account", pathMatch: "full" },
          { path: "account", component: AccountComponent },
          {
            path: "change-password",
            component: ChangePasswordComponent,
          },
          {
            path: "permission-patient-menu",
            component: PermissionPatientMenuComponent,
          },
          {
            path: "reminders",
            component: RemindersComponent,
          },
        ],
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
      { path: "reservations", component: ReservationsComponent }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRouting {}
